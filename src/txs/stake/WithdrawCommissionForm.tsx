import { ValAddress } from '@xpla/xpla.js';
import { MsgWithdrawValidatorCommission } from '@xpla/xpla.js';
import { Form, FormArrow, Input } from 'components/form';
import { TokenCard, TokenCardGrid } from 'components/token';
import { useBankBalance } from 'data/queries/bank';
import { useValidatorCommission } from 'data/queries/distribution';
import { useWithdrawAddress } from 'data/queries/distribution';
import { useMemoizedCalcValue } from 'data/queries/oracle';
import { useCurrency } from 'data/settings/Currency';
import { WithTokenItem } from 'data/token';
import { useAddress } from 'data/wallet';
import { useCallback, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { sortCoins } from 'utils/coin';

import Tx, { getInitialGasDenom } from '../Tx';

const WithdrawCommissionForm = () => {
  const { t } = useTranslation();
  const currency = useCurrency();
  const address = useAddress();
  const bankBalance = useBankBalance();
  const calcValue = useMemoizedCalcValue();

  /* tx context */
  const initialGasDenom = getInitialGasDenom(bankBalance);

  /* form */
  const { handleSubmit } = useForm({ mode: 'onChange' });

  /* tx */
  const createTx = useCallback(() => {
    if (!address) return;
    const validatorAddress = ValAddress.fromAccAddress(address);
    const msgs = [new MsgWithdrawValidatorCommission(validatorAddress)];
    return { msgs };
  }, [address]);

  /* fee */
  const estimationTxValues = useMemo(() => ({}), []);

  const tx = {
    initialGasDenom,
    estimationTxValues,
    createTx,
    onSuccess: { label: t('Stake'), path: '/stake' },
  };

  /* render */
  const { data: validatorCommission } = useValidatorCommission();
  const { data: withdrawAddress } = useWithdrawAddress();

  const renderCommission = () => {
    if (!validatorCommission) return null;

    const sorter = (a: CoinData, b: CoinData) =>
      Number(calcValue(b)) - Number(calcValue(a));

    const list = sortCoins(validatorCommission, currency, sorter);

    return (
      <TokenCardGrid maxHeight>
        {list.map((item) => {
          const { amount, denom } = item;
          return (
            <WithTokenItem token={denom} key={denom}>
              {(data) => (
                <TokenCard {...data} amount={amount} value={calcValue(item)} />
              )}
            </WithTokenItem>
          );
        })}
      </TokenCardGrid>
    );
  };

  const renderAddress = () => {
    if (!withdrawAddress) return null;
    return (
      <>
        <FormArrow />
        <Input defaultValue={withdrawAddress} readOnly />
      </>
    );
  };

  return (
    <Tx {...tx}>
      {({ fee, submit }) => (
        <Form onSubmit={handleSubmit(submit.fn)}>
          {renderCommission()}
          {renderAddress()}
          {fee.render()}
          {submit.button}
        </Form>
      )}
    </Tx>
  );
};

export default WithdrawCommissionForm;
