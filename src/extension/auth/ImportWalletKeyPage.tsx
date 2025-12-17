import { useTranslation } from 'react-i18next';
import ExtensionPage from '../components/ExtensionPage';
import ImportWalletKeyForm from 'auth/modules/create/ImportWalletKeyForm';

const ImportWalletKeyPage = () => {
  const { t } = useTranslation();

  return (
    <ExtensionPage title={t('Import wallet')}>
      <ImportWalletKeyForm />
    </ExtensionPage>
  );
};

export default ImportWalletKeyPage;
