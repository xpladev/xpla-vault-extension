import { useTranslation } from 'react-i18next';
import classNames from 'classnames/bind';
import { EvmAddress } from '@xpla/xpla.js';
import { WithFetching } from 'components/feedback';
import { Read, TokenBadge, TokenIcon } from 'components/token';
import AssetActions from 'pages/wallet/AssetActions';
import styles from './Asset.module.scss';

const cx = classNames.bind(styles);

export interface Props extends TokenItem, QueryState {
  balance?: Amount;
  value?: Value;
  erc20?: boolean;
}

const Asset = (props: Props) => {
  const { token, icon, symbol, balance, value, ...state } = props;
  const { t } = useTranslation();

  return (
    <article className={styles.asset} key={token}>
      <section className={styles.details}>
        <TokenIcon token={token} icon={icon} size={22} />

        <div>
          <div className={cx('tag-wrap')}>
            <h1 className={styles.symbol}>{symbol}</h1>
            <TokenBadge
              className={cx('tag')}
              token={token}
              evm={EvmAddress.validate(token)}
            />
          </div>
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
