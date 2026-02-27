import { Card, Page } from 'components/layout';
import { useTranslation } from 'react-i18next';

import TxContext from '../TxContext';
import StoreCodeForm from './StoreCodeForm';

const StoreCodeTx = () => {
  const { t } = useTranslation();

  return (
    <Page title={t('Upload a wasm file')} small>
      <Card>
        <TxContext>
          <StoreCodeForm />
        </TxContext>
      </Card>
    </Page>
  );
};

export default StoreCodeTx;
