import { useTranslation } from 'react-i18next';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import { useAuth } from 'auth';
import { ModalButton } from 'components/feedback';
import AddWallet from './AddWallet';
import styles from './ConnectedWallet.module.scss';
import { useState } from 'react';

const LedgerShowAddressButton = () => {
  const { t } = useTranslation();

  const [loading, setLoading] = useState<boolean>(false);

  const { getLedgerKey } = useAuth();

  return (
    <button
      className={styles.button}
      onClick={async () => {
        try {
          setLoading(true);
          const lk = await getLedgerKey();
          await lk.showAddressAndPubKey();
          setLoading(false);
        } catch {
          setLoading(false);
        }
      }}
      disabled={loading}
    >
      <AddCircleIcon style={{ fontSize: 16 }} />
      {t('Show address')}
    </button>
  );
};

export default LedgerShowAddressButton;
