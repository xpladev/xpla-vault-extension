import ManageNetworksForm from 'auth/networks/ManageNetworksForm';
import { LinkButton } from 'components/general';
import { Grid } from 'components/layout';
import { useTranslation } from 'react-i18next';

import ExtensionPage from '../components/ExtensionPage';

const ManageNetworksPage = () => {
  const { t } = useTranslation();

  return (
    <ExtensionPage title={t('Manage networks')}>
      <Grid gap={20}>
        <ManageNetworksForm />
        <LinkButton to="/network/new" block>
          {t('Add a network')}
        </LinkButton>
      </Grid>
    </ExtensionPage>
  );
};

export default ManageNetworksPage;
