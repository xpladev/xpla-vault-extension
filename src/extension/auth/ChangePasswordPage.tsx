import ChangePasswordForm from 'auth/modules/manage/ChangePasswordForm';
import { useTranslation } from 'react-i18next';

import ExtensionPage from '../components/ExtensionPage';

const ChangePasswordPage = () => {
  const { t } = useTranslation();

  return (
    <ExtensionPage title={t('Change password')}>
      <ChangePasswordForm />
    </ExtensionPage>
  );
};

export default ChangePasswordPage;
