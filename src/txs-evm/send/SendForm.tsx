import { useCallback, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import PersonIcon from '@mui/icons-material/Person';
import { AccAddress, EvmAddress, EvmSend, EvmSendToken } from '@xpla/xpla.js';
import { isDenom, toAmount, truncate } from '@xpla.kitchen/utils';
import useEvmAddress from 'auth/hooks/useEvmAddress';
import { queryKey } from 'data/query';
import { useBankBalance } from 'data/queries/bank';
import { useTnsAddress } from 'data/external/tns';
import { bech32ToEip55 } from 'utils/evm';
import { TooltipIcon } from 'components/display';
import { Auto, Card, Grid, InlineFlex } from 'components/layout';
import { Form, FormItem, Input, FormWarning } from 'components/form';
import AddressBookList from '../../txs/AddressBook/AddressBookList';
import { getPlaceholder, toInput } from '../../txs/utils';
import validate from '../../txs/validate';
import Tx, { getInitialGasDenom } from '../Tx';

interface TxValues {
  recipient?: string; // EvmAddress | AccAddress
  address?: EvmAddress; // hidden input
  input?: string;
  memo?: string;
}

interface Props extends TokenItem {
  decimals: number;
  balance: Amount;
}

const EvmSendForm = ({ token, decimals, balance }: Props) => {
  const { t } = useTranslation();
  const connectedAddress = useEvmAddress();
  const bankBalance = useBankBalance();

  /* tx context */
  const initialGasDenom = getInitialGasDenom(bankBalance);

  /* form */
  const form = useForm<TxValues>({ mode: 'onChange' });
  const { register, trigger, watch, setValue, setError, handleSubmit } = form;
  const { formState } = form;
  const { errors } = formState;
  const { recipient, input, memo } = watch();
  const amount = toAmount(input, { decimals });

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
    } else if (EvmAddress.validate(recipient)) {
      setValue('address', recipient);
      form.setFocus('input');
    } else if (AccAddress.validate(recipient)) {
      setValue('address', bech32ToEip55(recipient));
      form.setFocus('input');
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
    invalid || (tnsState.isLoading && t('Searching for address...'));

  useEffect(() => {
    if (invalid) setError('recipient', { type: 'invalid', message: invalid });
  }, [invalid, setError]);

  /* tx */
  const createTx = useCallback(
    ({ address, input, isSimul }: TxValues & { isSimul?: boolean }) => {
      if (!connectedAddress) return;
      if (!(address && EvmAddress.validate(address))) return;
      const amount = isSimul ? input || '0' : toAmount(input, { decimals });

      const msgs = isDenom(token)
        ? [new EvmSend(connectedAddress, address, amount + token)]
        : [new EvmSendToken(token, connectedAddress, address, amount)];

      return { msgs };
    },
    [connectedAddress, decimals, token],
  );

  /* fee */
  const estimationTxValues = useMemo(() => {
    const defaultTxValues = {
      address: connectedAddress,
      input: toInput(1, decimals),
      isSimul: false,
    };

    if (recipient && input) {
      if (AccAddress.validate(recipient) || EvmAddress.validate(recipient)) {
        let eip55Address = recipient;
        if (AccAddress.validate(recipient)) {
          eip55Address = bech32ToEip55(recipient);
        }

        return {
          address: eip55Address,
          input: toAmount(input, { decimals }),
          isSimul: true,
        };
      }
    }

    return defaultTxValues;
  }, [connectedAddress, recipient, input, decimals]);

  const onChangeMax = useCallback(
    async (input: string) => {
      setValue('input', input);
      await trigger('input');
    },
    [setValue, trigger],
  );

  const tx = {
    token,
    decimals,
    amount,
    balance,
    initialGasDenom,
    estimationTxValues,
    createTx,
    disabled,
    onChangeMax,
    onSuccess: { label: t('Wallet'), path: '/wallet' },
    queryKeys: EvmAddress.validate(token)
      ? [[queryKey.evm.contractQuery, token, connectedAddress]]
      : undefined,
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
          <Tx {...tx}>
            {({ max, fee, submit }) => (
              <Form onSubmit={handleSubmit(submit.fn)}>
                <Grid gap={4}>
                  {!memo && (
                    <FormWarning>
                      {t('Check if this transaction requires a memo')}
                    </FormWarning>
                  )}
                </Grid>

                <FormItem
                  label={
                    <TooltipIcon
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
                    </TooltipIcon>
                  }
                  extra={renderResolvedAddress()}
                  error={errors.recipient?.message ?? errors.address?.message}
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

                <FormItem
                  label={t('Amount')}
                  extra={max.render()}
                  error={errors.input?.message}
                >
                  <Input
                    {...register('input', {
                      valueAsNumber: false,
                      validate: validate.input(
                        toInput(max.amount, decimals),
                        decimals,
                      ),
                    })}
                    token={token}
                    inputMode="decimal"
                    onFocus={max.reset}
                    placeholder={getPlaceholder(decimals)}
                  />
                </FormItem>

                {/* <FormItem
                  label={`${t('Memo')} (${t('optional')})`}
                  error={errors.memo?.message}
                >
                  <Input
                    {...register('memo', {
                      validate: {
                        size: validate.size(256, 'Memo'),
                        brackets: validate.memo(),
                      },
                    })}
                  />
                </FormItem> */}

                {fee.render()}
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

export default EvmSendForm;
