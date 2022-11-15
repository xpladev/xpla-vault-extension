import { useTranslation } from 'react-i18next';
import { WithFetching } from 'components/feedback';
import { Read, TokenIcon } from 'components/token';
import AssetActions from 'pages/wallet/AssetActions';
import styles from './Asset.module.scss';

export interface Props extends TokenItem, QueryState {
  balance?: Amount;
  value?: Value;
}

const Asset = (props: Props) => {
  const { token, icon, symbol, balance, value, ...state } = props;
  const { t } = useTranslation();

  return (
    <article className={styles.asset} key={token}>
      <section className={styles.details}>
        <TokenIcon token={token} icon={icon} size={22} />

        <div>
          <h1 className={styles.symbol}>{symbol}</h1>
          <h2 className={styles.amount}>
            <WithFetching {...state} height={1}>
              {(progress, wrong) => (
                <>
                  {progress}
                  {wrong ? (
                    <span className="danger">
                      {t('Failed to query balance')}
                    </span>
                  ) : (
                    <Read {...props} amount={balance} token="" />
                  )}
                </>
              )}
            </WithFetching>
          </h2>
        </div>
      </section>

      <AssetActions {...props} />
    </article>
  );
};

export default Asset;
