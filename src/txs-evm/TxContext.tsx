import { PropsWithChildren } from 'react';
import { useTranslation } from 'react-i18next';
import { Coins } from '@xpla/xpla.js';
import createContext from 'utils/createContext';
import { GasPrices } from 'data/Xpla/XplaAPI';
import { Card } from 'components/layout';
import { ErrorBoundary, Wrong } from 'components/feedback';
import { useTxKey } from './Tx';
import { useGasPrices } from 'data/queries/evm';
import { DEFAULT_GAS_PRICE } from 'config/constants';

export const [useTx, TxProvider] = createContext<{ gasPrices: GasPrices }>(
  'useTx',
);

const TxContext = ({ children }: PropsWithChildren<{}>) => {
  const { t } = useTranslation();
  const txKey = useTxKey();
  // const { data: gasPrices } = useGasPrices();

  /* on error */
  const fallback = () => (
    <Card>
      <Wrong>{t('Transaction is not available at the moment')}</Wrong>
    </Card>
  );

  // If the gas prices doesn't exist, nothing is worth rendering.
  // if (!gasPrices) return null;

  const gasPrices: { [x: string]: string } = {
    axpla: DEFAULT_GAS_PRICE,
  };

  return (
    <TxProvider value={{ gasPrices }} key={txKey}>
      <ErrorBoundary fallback={fallback}>{children}</ErrorBoundary>
    </TxProvider>
  );
};

export default TxContext;
