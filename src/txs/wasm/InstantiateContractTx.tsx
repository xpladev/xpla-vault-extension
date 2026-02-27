import { Card, Page } from 'components/layout';
import { useTranslation } from 'react-i18next';

import TxContext from '../TxContext';
import InstantiateContractForm from './InstantiateContractForm';

const InstantiateContractTx = () => {
  const { t } = useTranslation();

  return (
    <Page title={t('Instantiate a code')} small>
      <Card>
        <TxContext>
          <InstantiateContractForm />
        </TxContext>
      </Card>
    </Page>
  );
};

export default InstantiateContractTx;
