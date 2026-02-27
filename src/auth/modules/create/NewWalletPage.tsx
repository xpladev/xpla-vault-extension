import { Card, Page } from 'components/layout';
import { useTranslation } from 'react-i18next';

import NewWalletForm from './NewWalletForm';

const NewWalletPage = () => {
  const { t } = useTranslation();

  return (
    <Page title={t('New wallet')} small>
      <Card>
        <NewWalletForm />
      </Card>
    </Page>
  );
};

export default NewWalletPage;
