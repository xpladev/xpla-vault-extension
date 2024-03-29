import { useTranslation } from 'react-i18next';
import ImportWalletForm from 'auth/modules/create/ImportWalletForm';
import ExtensionPage from '../components/ExtensionPage';

const ImportWalletPage = () => {
  const { t } = useTranslation();

  return (
    <ExtensionPage title={t('Import wallet')}>
      <ImportWalletForm />
    </ExtensionPage>
  );
};

export default ImportWalletPage;
