import { useCallback, useMemo } from 'react';
import { atom, useRecoilState } from 'recoil';
import { encode } from 'js-base64';
import {
  CreateEvmTxOptions,
  CreateTxOptions,
  EvmTx,
  Tx,
  isTxError,
} from '@xpla/xpla.js';
import { AccAddress, SignDoc } from '@xpla/xpla.js';
import { MnemonicKey, RawKey, SignatureV2 } from '@xpla/xpla.js';
import { LedgerKey } from '@xpla/ledger-xpla-js';
import BluetoothTransport from '@ledgerhq/hw-transport-web-ble';
import { LEDGER_TRANSPORT_TIMEOUT } from 'config/constants';
import { useChainID } from 'data/wallet';
import { useIsClassic } from 'data/query';
import { useLCDClient } from 'data/queries/lcdClient';
import { useECDClient } from 'data/queries/ecdClient';
import is from '../scripts/is';
import { PasswordError } from '../scripts/keystore';
import { getDecryptedKey, testPassword } from '../scripts/keystore';
import { getWallet, storeWallet } from '../scripts/keystore';
import { clearWallet, lockWallet } from '../scripts/keystore';
import { getStoredWallet, getStoredWallets } from '../scripts/keystore';
import encrypt from '../scripts/encrypt';
import useAvailable from './useAvailable';
import {
  Signature,
  splitSignature,
  arrayify,
  concat,
} from '@ethersproject/bytes';

const walletState = atom({
  key: 'wallet',
  default: getWallet(),
});

const useAuth = () => {
  const isClassic = useIsClassic();
  const lcd = useLCDClient();
  const ecd = useECDClient();
  const available = useAvailable();

  const [wallet, setWallet] = useRecoilState(walletState);
  const wallets = getStoredWallets();

  /* connect */
  const connect = useCallback(
    (name: string) => {
      const storedWallet = getStoredWallet(name);
      const { address, lock } = storedWallet;

      if (lock) throw new Error('Wallet is locked');

      const wallet = is.multisig(storedWallet)
        ? { name, address, multisig: true }
        : { name, address };

      storeWallet(wallet);
      setWallet(wallet);
    },
    [setWallet],
  );

  const connectPreconfigured = useCallback(
    (wallet: PreconfiguredWallet) => {
      storeWallet(wallet);
      setWallet(wallet);
    },
    [setWallet],
  );

  const connectLedger = useCallback(
    (address: AccAddress, index = 0, bluetooth = false) => {
      const wallet = { address, ledger: true as const, index, bluetooth };
      storeWallet(wallet);
      setWallet(wallet);
    },
    [setWallet],
  );

  /* connected */
  const connectedWallet = useMemo(() => {
    if (!is.local(wallet)) return;
    return wallet;
  }, [wallet]);

  const getConnectedWallet = useCallback(() => {
    if (!connectedWallet) throw new Error('Wallet is not defined');
    return connectedWallet;
  }, [connectedWallet]);

  /* disconnected */
  const disconnect = useCallback(() => {
    clearWallet();
    setWallet(undefined);
  }, [setWallet]);

  const lock = useCallback(() => {
    const { name } = getConnectedWallet();
    lockWallet(name);
    disconnect();
  }, [disconnect, getConnectedWallet]);

  /* helpers */
  const getKey = (password: string) => {
    const { name } = getConnectedWallet();
    return getDecryptedKey({ name, password });
  };

  const getLedgerKey = async () => {
    if (!is.ledger(wallet)) throw new Error('Ledger device is not connected');
    const { index, bluetooth } = wallet;
    const transport = bluetooth
      ? await BluetoothTransport.create(LEDGER_TRANSPORT_TIMEOUT)
      : undefined;

    return LedgerKey.create(transport, index);
  };

  /* manage: export */
  const encodeEncryptedWallet = (password: string) => {
    const { name, address } = getConnectedWallet();
    const key = getKey(password);
    const data = { name, address, encrypted_key: encrypt(key, password) };
    return encode(JSON.stringify(data));
  };

  /* form */
  const validatePassword = (password: string) => {
    try {
      const { name } = getConnectedWallet();
      return testPassword({ name, password });
    } catch (error) {
      return 'Incorrect password';
    }
  };

  /* tx */
  const chainID = useChainID();

  const create = async (txOptions: CreateTxOptions) => {
    if (!wallet) throw new Error('Wallet is not defined');
    const { address } = wallet;
    return await lcd.tx.create([{ address }], txOptions);
  };

  const createSignature = async (
    tx: Tx,
    address: AccAddress,
    password = '',
  ) => {
    if (!wallet) throw new Error('Wallet is not defined');

    const accountInfo = await lcd.auth.accountInfo(address);

    const doc = new SignDoc(
      lcd.config.chainID,
      accountInfo.getAccountNumber(),
      accountInfo.getSequenceNumber(),
      tx.auth_info,
      tx.body,
    );

    if (is.ledger(wallet)) {
      const key = await getLedgerKey();
      return await key.createSignatureAmino(doc, isClassic);
    } else {
      const pk = getKey(password);
      if (!pk) throw new PasswordError('Incorrect password');
      const key = new RawKey(Uint8Array.from(Buffer.from(pk, 'hex')));
      return await key.createSignatureAmino(doc, isClassic);
    }
  };

  const sign = async (
    txOptions:
      | (CreateTxOptions & {
          sequence?: number;
          accountNumber?: number;
          signMode?: SignatureV2.SignMode;
        })
      | CreateEvmTxOptions,
    password = '',
    evm = false,
  ) => {
    if (!wallet) throw new Error('Wallet is not defined');

    if (is.ledger(wallet)) {
      const key = await getLedgerKey();
      const wallet = lcd.wallet(key);
      const { account_number: accountNumber, sequence } =
        await wallet.accountNumberAndSequence();
      const signMode = SignatureV2.SignMode.SIGN_MODE_LEGACY_AMINO_JSON;
      const unsignedTx = await create(txOptions as CreateTxOptions);
      const options = { chainID, accountNumber, sequence, signMode };
      return await key.signTx(unsignedTx, options, isClassic);
    } else if (is.preconfigured(wallet)) {
      const key = new MnemonicKey({ mnemonic: wallet.mnemonic });
      return await lcd
        .wallet(key)
        .createAndSignTx(txOptions as CreateTxOptions);
    } else {
      const pk = getKey(password);
      if (!pk) throw new PasswordError('Incorrect password');
      const key = new RawKey(Uint8Array.from(Buffer.from(pk, 'hex')));

      if (evm && txOptions) {
        const wallet = ecd.wallet(key);
        return await wallet.createAndSignTx(txOptions as CreateEvmTxOptions);
      } else {
        const wallet = lcd.wallet(key);

        const options = { ...txOptions } as CreateTxOptions & {
          sequence?: number;
          accountNumber?: number;
          signMode?: SignatureV2.SignMode;
        };

        return await wallet.createAndSignTx(options);
      }
    }
  };

  const signBytes = async (bytes: Buffer, password = '') => {
    if (!wallet) throw new Error('Wallet is not defined');

    if (is.ledger(wallet)) {
      throw new Error('Ledger can not sign arbitrary data');
    } else {
      const pk = getKey(password);
      if (!pk) throw new PasswordError('Incorrect password');
      const key = new RawKey(Uint8Array.from(Buffer.from(pk, 'hex')));
      // const { signature, recid } = key.ecdsaSign(bytes);
      const signature = await key.sign(bytes);
      if (!signature) throw new Error('Signature is undefined');
      return {
        recid: undefined,
        signature: signature.toString('base64'),
        public_key: key.publicKey?.toAmino().value as string,
      };
    }
  };

  const post = async (
    txOptions: CreateTxOptions | CreateEvmTxOptions,
    password = '',
    evm = false,
  ) => {
    if (!wallet) throw new Error('Wallet is not defined');
    const signedTx = await sign(txOptions, password, evm);
    if (evm) {
      const result = await ecd.tx.broadcastSync(signedTx as EvmTx);
      // if (isTxError(result)) throw new Error(result.raw_log);
      return result;
    } else {
      const result = await lcd.tx.broadcastSync(signedTx as Tx);
      if (isTxError(result)) throw new Error(result.raw_log);
      return result;
    }
  };

  return {
    wallet,
    wallets,
    getConnectedWallet,
    getLedgerKey,
    connectedWallet,
    connect,
    connectPreconfigured,
    connectLedger,
    disconnect,
    lock,
    available,
    encodeEncryptedWallet,
    validatePassword,
    createSignature,
    create,
    signBytes,
    sign,
    post,
  };
};

export default useAuth;
