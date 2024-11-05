import { useCallback, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import PersonIcon from '@mui/icons-material/Person';
import { AccAddress, EvmAddress } from '@xpla/xpla.js';
import { MsgExecuteContract } from '@xpla/xpla.js';
import { truncate } from '@xpla.kitchen/utils';
import { queryKey } from 'data/query';
import { useAddress } from 'data/wallet';
import { useBankBalance } from 'data/queries/bank';
import { useTnsAddress } from 'data/external/tns';
import { hexToBech32 } from 'utils/evm';
import { Auto, Card, InlineFlex } from 'components/layout';
import { Form, FormItem, Input, FormItemMemo } from 'components/form';
import { TooltipClickIcon } from 'components/display';
import NFTAssetItem from 'pages/nft/NFTAssetItem';
import AddressBookList from '../AddressBook/AddressBookList';
import validate from '../validate';
import Tx, { getInitialGasDenom } from '../Tx';

interface TxValues {
  recipient?: string; // AccAddress | TNS
  address?: AccAddress; // hidden input
  memo?: string;
}

interface Props {
  contract: string;
  id: string;
  balance: Amount;
}

const TransferCW721Form = ({ contract, id, balance }: Props) => {
  const { t } = useTranslation();
  const connectedAddress = useAddress();
  const bankBalance = useBankBalance();

  /* tx context */
  const initialGasDenom = getInitialGasDenom(bankBalance);

  /* form */
  const form = useForm<TxValues>({ mode: 'onChange' });
  const { register, trigger, watch, setValue, setError, handleSubmit } = form;
  const { formState } = form;
  const { errors } = formState;
  const { recipient, memo } = watch();

  const onClickAddressBookItem = async ({ recipient, memo }: AddressBook) => {
    setValue('recipient', recipient);
    setValue('memo', memo);
    await trigger('recipient');
  };

  /* resolve recipient */
  const { data: resolvedAddress, ...tnsState } = useTnsAddress(recipient ?? '');
  useEffect(() => {
    if (!recipient) {
      setValue('address', undefined);
    } else if (AccAddress.validate(recipient)) {
      setValue('address', recipient);
    } else if (EvmAddress.validate(recipient)) {
      setValue('address', hexToBech32('xpla', recipient));
    } else if (resolvedAddress) {
      setValue('address', resolvedAddress);
    } else {
      setValue('address', recipient);
    }
  }, [form, recipient, resolvedAddress, setValue]);

  // validate(tns): not found
  const invalid =
    recipient?.endsWith('.ust') && !tnsState.isLoading && !resolvedAddress
      ? t('Address not found')
      : '';

  const disabled =
    invalid ||
    (tnsState.isLoading && t('Searching for address...')) ||
    (errors && errors.memo?.message && 'Invalid memo');

  useEffect(() => {
    if (invalid) setError('recipient', { type: 'invalid', message: invalid });
  }, [invalid, setError]);

  /* tx */
  const createTx = useCallback(
    ({ address, memo }: TxValues) => {
      if (!connectedAddress) return;
      if (!(address && AccAddress.validate(address))) return;

      const msgs = [
        new MsgExecuteContract(connectedAddress, contract, {
          transfer_nft: { recipient: address, token_id: id },
        }),
      ];

      return { msgs, memo };
    },
    [connectedAddress, contract, id],
  );

  /* fee */
  const estimationTxValues = useMemo(() => {
    const defaultTxValues = {
      address: connectedAddress,
      isSimul: false,
    };

    if (recipient) {
      if (AccAddress.validate(recipient) || EvmAddress.validate(recipient)) {
        let betchAddress = recipient;
        if (EvmAddress.validate(recipient)) {
          betchAddress = hexToBech32('xpla', recipient);
        }

        return {
          address: betchAddress,
          isSimul: true,
        };
      }
    }

    return defaultTxValues;
  }, [connectedAddress, recipient]);

  const tx = {
    balance,
    initialGasDenom,
    estimationTxValues,
    createTx,
    disabled,
    onSuccess: { label: t('NFT'), path: '/nft' },
    queryKeys: [
      [
        queryKey.wasm.contractQuery,
        contract,
        { tokens: { owner: connectedAddress } },
      ],
    ],
  };

  const renderResolvedAddress = () => {
    if (!resolvedAddress) return null;
    return (
      <InlineFlex gap={4} className="success">
        <PersonIcon fontSize="inherit" />
        {truncate(resolvedAddress)}
      </InlineFlex>
    );
  };

  return (
    <Auto
      columns={[
        <Card isFetching={tnsState.isLoading}>
          <NFTAssetItem contract={contract} id={id} tx />

          <Tx {...tx}>
            {({ fee, submit }) => (
              <Form onSubmit={handleSubmit(submit.fn)}>
                <FormItem
                  label={
                    <TooltipClickIcon
                      content={
                        <div>
                          The recipient address can be entered in either
                          <br />
                          XPLA Style (xpla1…) or EVM Style Address (0x…).
                        </div>
                      }
                      placement="top"
                    >
                      {t('Recipient')}
                    </TooltipClickIcon>
                  }
                  extra={renderResolvedAddress()}
                  error={errors.recipient?.message}
                >
                  <Input
                    {...register('recipient', {
                      validate: validate.recipient(),
                    })}
                    placeholder={`Please enter the recipient's address.`}
                    autoFocus
                  />

                  <input {...register('address')} readOnly hidden />
                </FormItem>

                <FormItemMemo
                  label={`${t('Memo')} (${t('optional')})`}
                  error={errors.memo?.message}
                >
                  <Input
                    {...register('memo', {
                      validate: {
                        size: validate.size(256, 'Memo'),
                        brackets: validate.memo(),
                        mnemonic: validate.mnemonic(),
                      },
                    })}
                    placeholder="Remember, everyone can see your 'Memo.'"
                  />
                </FormItemMemo>

                {fee.render()}

                {/* {!memo && (
                  <FormHelp>
                    {t('Check if this transaction requires a memo')}
                  </FormHelp>
                )} */}

                {submit.button}
              </Form>
            )}
          </Tx>
        </Card>,
        <AddressBookList onClick={onClickAddressBookItem} />,
      ]}
    />
  );
};

export default TransferCW721Form;
