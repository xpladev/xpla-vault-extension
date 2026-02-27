import { Card, Page } from 'components/layout';
import { useConnectedMoniker } from 'data/queries/distribution';
import { useTranslation } from 'react-i18next';

import TxContext from '../TxContext';
import WithdrawCommissionForm from './WithdrawCommissionForm';

const WithdrawCommissionTx = () => {
  const { t } = useTranslation();
  const moniker = useConnectedMoniker();

  return (
    <Page title={t('Withdraw commission')} small>
      {moniker && (
        <Card title={moniker}>
          <TxContext>
            <WithdrawCommissionForm />
          </TxContext>
        </Card>
      )}
    </Page>
  );
};

export default WithdrawCommissionTx;
