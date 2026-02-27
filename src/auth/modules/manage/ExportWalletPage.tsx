import { Card, Page } from 'components/layout';
import { useTranslation } from 'react-i18next';

import ConnectedWallet from './ConnectedWallet';
import ExportWalletForm from './ExportWalletForm';
import GoBack from './GoBack';

const ExportWalletPage = () => {
  const { t } = useTranslation();

  return (
    <Page title={t('Export wallet')} extra={<GoBack />}>
      <ConnectedWallet>
        <Card>
          <ExportWalletForm />
        </Card>
      </ConnectedWallet>
    </Page>
  );
};

export default ExportWalletPage;
