import { Card, Page } from 'components/layout';
import { useTranslation } from 'react-i18next';

import TxContext from '../TxContext';
import ExecuteContractForm from './ExecuteContractForm';

const ExecuteContractTx = () => {
  const { t } = useTranslation();

  return (
    <Page title={t('Execute')} small>
      <Card>
        <TxContext>
          <ExecuteContractForm />
        </TxContext>
      </Card>
    </Page>
  );
};

export default ExecuteContractTx;
