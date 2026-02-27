import ImportWalletKeyForm from 'auth/modules/create/ImportWalletKeyForm';
import { useTranslation } from 'react-i18next';

import ExtensionPage from '../components/ExtensionPage';

const ImportWalletKeyPage = () => {
  const { t } = useTranslation();

  return (
    <ExtensionPage title={t('Import wallet')}>
      <ImportWalletKeyForm />
    </ExtensionPage>
  );
};

export default ImportWalletKeyPage;
