import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import { useSetRecoilState } from 'recoil';

import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import * as secp256k1 from '@noble/secp256k1';
import { AccAddress, RawKey } from '@xpla/xpla.js';

import { isWallet, useAuth } from 'auth';
import {
  getDecryptedKey,
  PasswordError,
  testPassword,
} from 'auth/scripts/keystore';
import { useAddress } from 'data/wallet';
import { useXplaAPIURL } from 'data/Xpla/XplaAPI';
import { latestTxState } from 'data/queries/tx';

import { Modal } from 'components/feedback';
import { Card, Grid } from 'components/layout';
import { Form, FormItem, Input, Submit } from 'components/form';

import styles from './ActivateForm.module.scss';
import { Pre } from 'components/general';
import { useNavigate } from 'react-router-dom';

interface TxValues {
  address?: AccAddress; // hidden input
}

const ActivateForm = () => {
  const { t } = useTranslation();
  const [password, setPassword] = useState('');
  const [incorrect, setIncorrect] = useState<string>();
  const [error, setError] = useState<Error>();

  const { wallet } = useAuth();
  const address = useAddress();
  const api = useXplaAPIURL();
  const setLatestTx = useSetRecoilState(latestTxState);

  const form = useForm<TxValues>({ mode: 'onChange' });
  const { register, trigger, watch, setValue, handleSubmit } = form;
  const { formState } = form;
  const { errors } = formState;

  const navigate = useNavigate();

  useEffect(() => {
    if (address) {
      setValue('address', address);
    } else {
      setValue('address', undefined);
    }
  }, [form, address, setValue]);

  const submit = async () => {
    try {
      if (isWallet.single(wallet)) {
        const valid = testPassword({ name: wallet.name, password });
        if (valid) {
          const decyrptedKey = getDecryptedKey({ name: wallet.name, password });

          const randomMsg = [
            0x8a, 0x10, 0x56, 0xe4, 0x0e, 0xc4, 0x01, 0xf7, 0x3e, 0xba, 0x21,
            0xfb, 0x06, 0xac, 0xc3, 0xd4, 0x25, 0x92, 0x63, 0x06, 0xd6, 0x4b,
            0x64, 0xc4, 0x18, 0x1f, 0xb7, 0xd3, 0xe3, 0xa5, 0x5a, 0x57,
          ];
          const msg = Uint8Array.from(randomMsg);
          const key = new RawKey(
            Uint8Array.from(Buffer.from(decyrptedKey, 'hex')),
          );
          const privKey = Uint8Array.from(key.privateKey);
          const pubKey = secp256k1.getPublicKey(privKey);
          const signature = await secp256k1.sign(msg, privKey, { der: false });

          setPassword('');

          const { data } = await axios.post(
            '/v1/vault/new-wallet/',
            {
              app: 'xpla_vault',
              address: key.accAddress,
              pubKey: pubKey.toString(),
              signature: signature.toString(),
            },
            { baseURL: api },
          );

          setLatestTx({
            txhash: data.txhash,
            redirectAfterTx: { label: 'Confirm', path: '/' },
          });
        }
      }
    } catch (err) {
      if (err instanceof PasswordError) {
        setIncorrect(err.message);
        return;
      }

      setError(err as Error);
    }
  };

  const modal = !error
    ? undefined
    : {
        title: t('Error'),
        children: (
          <Pre height={120} normal break>
            {error.message}
          </Pre>
        ),
      };

  const disabled = !!incorrect || !password;

  return (
    <div className={styles.activate}>
      <Card className={styles['activate-message']}>
        <div>
          <h2>Why is activation needed?</h2>
          <p>
            On Cosmos-based chains, wallets aren’t activate without a
            transaction. Press&nbsp;<b>"Activate"</b>&nbsp;and unlock more
            features.&nbsp;
            <u>No fees will be charged.</u>
          </p>
        </div>
      </Card>

      <Card>
        <Form onSubmit={handleSubmit(submit)}>
          <FormItem label={t('Wallet Address')}>
            <div className={styles['activate-address']}>{address}</div>
            <input {...register('address')} readOnly hidden />
          </FormItem>

          <Grid gap={4}>
            <FormItem label={t('Password')} error={incorrect}>
              <Input
                type="password"
                value={password}
                onChange={(e) => {
                  setIncorrect(undefined);
                  setPassword(e.target.value);
                }}
              />
            </FormItem>

            <Submit disabled={disabled}>{t('Activate')}</Submit>
          </Grid>
        </Form>
      </Card>

      {modal && (
        <Modal
          {...modal}
          icon={<ErrorOutlineIcon fontSize="inherit" className="danger" />}
          onRequestClose={() => setError(undefined)}
          isOpen
        />
      )}
    </div>
  );
};

export default ActivateForm;
