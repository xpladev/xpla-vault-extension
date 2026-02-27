import { AccAddress, EvmAddress } from '@xpla/xpla.js';
import { Page } from 'components/layout';
import { TokenBadge } from 'components/token';
import { useBankBalance } from 'data/queries/bank';
import { useTokenBalanceERC20 } from 'data/queries/evm';
import { useTokenItem } from 'data/token';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import { getAmount } from 'utils/coin';

import TxContext from '../TxContext';
import EvmSendForm from './SendForm';

const EvmSendTx = () => {
  const { t } = useTranslation();
  const bankBalance = useBankBalance();

  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  if (!token) throw new Error('Token is not defined');

  const { data: erc20Balance, ...state } = useTokenBalanceERC20(token);
  const tokenItem = useTokenItem(token);

  const symbol = tokenItem?.symbol ?? '';
  const balance = EvmAddress.validate(token)
    ? erc20Balance
    : getAmount(bankBalance, token);

  return (
    <Page
      {...state}
      title={t('Send {{symbol}}', { symbol })}
      extra={<TokenBadge token={token} className="page-title" evm />}
      tx
    >
      <TxContext>
        {tokenItem && balance && (
          <EvmSendForm {...tokenItem} balance={balance} />
        )}
      </TxContext>
    </Page>
  );
};

export default EvmSendTx;
