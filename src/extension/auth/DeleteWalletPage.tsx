import DeleteWalletForm from 'auth/modules/manage/DeleteWalletForm';
import { useTranslation } from 'react-i18next';

import ExtensionPage from '../components/ExtensionPage';

const DeleteWalletPage = () => {
  const { t } = useTranslation();

  return (
    <ExtensionPage title={t('Delete wallet')}>
      <DeleteWalletForm />
    </ExtensionPage>
  );
};

export default DeleteWalletPage;
