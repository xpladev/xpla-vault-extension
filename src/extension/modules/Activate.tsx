import { useTranslation } from 'react-i18next';
import classNames from 'classnames/bind';
import { AccountBalanceWallet } from '@mui/icons-material';
import { isWallet, useAuth } from 'auth';
import { useIsGetXPLA } from 'data/queries/bank';
import { ExternalLink, LinkButton } from 'components/general';
import styles from './Activate.module.scss';
import { CEX } from 'config/constants';
import { useAccountInfo } from 'data/queries/auth';

const cx = classNames.bind(styles);

const Activate = () => {
  const { t } = useTranslation();

  const { wallet } = useAuth();
  const isGetXPLA = useIsGetXPLA();

  const { data: accountInfo } = useAccountInfo();

  const render = () => {
    if (!isWallet.single(wallet)) return null;

    if (!accountInfo) {
      return (
        <div className={styles['activate-banner']}>
          <div className={styles['activate-icon']}>
            <AccountBalanceWallet className={styles['icon']} />
          </div>

          <div className={styles['activate-contents']}>
            <h1>Wallet not activated</h1>
            <p>
              Press “Activate” and unlock more features.
              <br />
              No fees will be charged.
            </p>
          </div>

          <LinkButton className={styles['activate-button']} to="/activate">
            {t('Activate')}
          </LinkButton>
        </div>
      );
    }

    return isGetXPLA ? (
      <div className={cx(styles['activate-banner'], styles.activated)}>
        <div className={styles['activate-icon']}>
          <AccountBalanceWallet className={styles['icon']} />
        </div>

        <div className={styles['activate-contents']}>
          <h1>Wallet activated!</h1>
          <p>Don’t have XPLA yet? Get it here!</p>
        </div>

        <ExternalLink className={styles['activate-button']} href={CEX}>
          {t('Get XPLA')}
        </ExternalLink>
      </div>
    ) : null;
  };

  return <>{render()}</>;
};

export default Activate;
