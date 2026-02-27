import { Card, Page } from 'components/layout';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';

import TxContext from '../TxContext';
import MigrateContractForm from './MigrateContractForm';

const MigrateContractTx = () => {
  const { t } = useTranslation();
  const { contract } = useParams();

  if (!contract) throw new Error('Contract is not defined');

  return (
    <Page title={t('Migrate')} small>
      <Card>
        <TxContext>
          <MigrateContractForm contract={contract} />
        </TxContext>
      </Card>
    </Page>
  );
};

export default MigrateContractTx;
