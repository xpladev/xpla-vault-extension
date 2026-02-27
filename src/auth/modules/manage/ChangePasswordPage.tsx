import { Card, Page } from 'components/layout';
import { useTranslation } from 'react-i18next';

import ChangePasswordForm from './ChangePasswordForm';
import ConnectedWallet from './ConnectedWallet';
import GoBack from './GoBack';

const ChangePasswordPage = () => {
  const { t } = useTranslation();

  return (
    <Page title={t('Change password')} extra={<GoBack />}>
      <ConnectedWallet>
        <Card>
          <ChangePasswordForm />
        </Card>
      </ConnectedWallet>
    </Page>
  );
};

export default ChangePasswordPage;
