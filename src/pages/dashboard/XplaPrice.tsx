import { useTranslation } from 'react-i18next';
import BigNumber from 'bignumber.js';
import { useCurrency } from 'data/settings/Currency';
import { useMemoizedPrices } from 'data/queries/oracle';
import { Card } from 'components/layout';
import { Read } from 'components/token';
import { ModalButton } from 'components/feedback';
import XplaPriceChart from '../charts/XplaPriceChart';
import DashboardContent from './components/DashboardContent';
import styles from './Dashboard.module.scss';

const XplaPrice = () => {
  const { t } = useTranslation();
  const currency = useCurrency();
  const denom = currency === 'axpla' ? 'axpla' : currency;
  const { data: prices, ...state } = useMemoizedPrices(denom);

  const render = () => {
    if (!prices) return;
    const { axpla: price } = prices;
    return (
      <DashboardContent
        value={
          <Read
            amount={new BigNumber(price).times(1e6).toString()}
            denom={denom}
            auto
          />
        }
        footer={
          <ModalButton
            title={t('XPLA price')}
            renderButton={(open) => (
              <button onClick={open}>{t('Show chart')}</button>
            )}
          >
            <XplaPriceChart />
          </ModalButton>
        }
      />
    );
  };

  return (
    <Card
      {...state}
      title={t('XPLA price')}
      className={styles.price}
      size="small"
    >
      {render()}
    </Card>
  );
};

export default XplaPrice;
