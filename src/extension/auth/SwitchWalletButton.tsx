import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import { useAuth } from 'auth';
import { ModalButton } from 'components/feedback';
import { useAddress } from 'data/wallet';
import { useTranslation } from 'react-i18next';

import styles from './ConnectedWallet.module.scss';
import SwitchWallet from './SwitchWallet';

const SwitchWalletButton = () => {
  const { t } = useTranslation();
  const address = useAddress();
  const { wallets } = useAuth();

  return wallets.length < 2 ? null : (
    <ModalButton
      title={t('Switch wallet')}
      renderButton={(open) => (
        <button className={styles.button} onClick={open}>
          <AccountBalanceWalletIcon style={{ fontSize: 16 }} />
          {t('Switch wallet')}
        </button>
      )}
      modalKey={address}
      maxHeight
    >
      <SwitchWallet />
    </ModalButton>
  );
};

export default SwitchWalletButton;
