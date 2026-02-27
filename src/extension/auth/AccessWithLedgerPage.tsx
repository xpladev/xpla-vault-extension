import AccessWithLedgerForm from 'auth/ledger/AccessWithLedgerForm';
import { useTranslation } from 'react-i18next';

import ExtensionPage from '../components/ExtensionPage';

const AccessWithLedgerPage = () => {
  const { t } = useTranslation();

  return (
    <ExtensionPage title={t('Access with Ledger')}>
      <AccessWithLedgerForm />
    </ExtensionPage>
  );
};

export default AccessWithLedgerPage;
