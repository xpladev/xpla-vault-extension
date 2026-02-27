import ExportWalletForm from 'auth/modules/manage/ExportWalletForm';
import { useTranslation } from 'react-i18next';

import ExtensionPage from '../components/ExtensionPage';

const ExportWalletPage = () => {
  const { t } = useTranslation();

  return (
    <ExtensionPage title={t('Export wallet')}>
      <ExportWalletForm />
    </ExtensionPage>
  );
};

export default ExportWalletPage;
