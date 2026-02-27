import { toAmount } from '@xpla.kitchen/utils';
import { MsgDeposit } from '@xpla/xpla.js';
import { Form, FormItem, Input } from 'components/form';
import { useBankBalance } from 'data/queries/bank';
import { queryKey } from 'data/query';
import { useAddress } from 'data/wallet';
import useProposalId from 'pages/gov/useProposalId';
import { useCallback, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { getAmount } from 'utils/coin';

import Tx, { getInitialGasDenom } from '../Tx';
import { getPlaceholder, toInput } from '../utils';
import validate from '../validate';

interface TxValues {
  input: string;
}

const DepositForm = () => {
  const { t } = useTranslation();
  const id = useProposalId();
  const address = useAddress();

  const bankBalance = useBankBalance();
  const balance = getAmount(bankBalance, 'axpla');

  /* tx context */
  const initialGasDenom = getInitialGasDenom(bankBalance);

  /* form */
  const form = useForm<TxValues>({ mode: 'onChange' });
  const { register, trigger, watch, setValue, handleSubmit, formState } = form;
  const { errors } = formState;
  const { input } = watch();
  const amount = toAmount(input);

  /* tx */
  const createTx = useCallback(
    ({ input }: TxValues) => {
      if (!address) return;
      const amount = toAmount(input);
      const msgs = [new MsgDeposit(id, address, amount + 'axpla')];
      return { msgs };
    },
    [address, id],
  );

  /* fee */
  const estimationTxValues = useMemo(
    () => ({ input: toInput(balance) }),
    [balance],
  );

  const onChangeMax = useCallback(
    async (input: string) => {
      setValue('input', input);
      await trigger('input');
    },
    [setValue, trigger],
  );

  const token = 'axpla';
  const tx = {
    token,
    amount,
    balance,
    initialGasDenom,
    estimationTxValues,
    createTx,
    onChangeMax,
    onSuccess: {
      label: [t('Proposal'), id].join(' '),
      path: `/proposal/${id}`,
    },
    queryKeys: [[queryKey.gov.deposits, id]],
  };

  return (
    <Tx {...tx}>
      {({ max, fee, submit }) => (
        <Form onSubmit={handleSubmit(submit.fn)}>
          <FormItem
            label={t('Amount')}
            extra={max.render()}
            error={errors.input?.message}
          >
            <Input
              {...register('input', {
                valueAsNumber: false,
                validate: validate.input(toInput(max.amount)),
              })}
              token="axpla"
              onFocus={max.reset}
              inputMode="decimal"
              placeholder={getPlaceholder()}
              autoFocus
            />
          </FormItem>

          {fee.render()}
          {submit.button}
        </Form>
      )}
    </Tx>
  );
};

export default DepositForm;
