import { Auto, Card, Page } from 'components/layout';
import { useProposal } from 'data/queries/gov';
import ProposalHeader from 'pages/gov/ProposalHeader';
import useProposalId from 'pages/gov/useProposalId';
import { useTranslation } from 'react-i18next';

import TxContext from '../TxContext';
import DepositForm from './DepositForm';

const DepositTx = () => {
  const { t } = useTranslation();
  const id = useProposalId();
  const { data: proposal, ...state } = useProposal(id);

  return (
    <Page title={t('Deposit')}>
      <Auto
        columns={[
          <Card>
            <TxContext>
              <DepositForm />
            </TxContext>
          </Card>,
          <Card {...state}>
            {proposal && <ProposalHeader proposal={proposal} />}
          </Card>,
        ]}
      />
    </Page>
  );
};

export default DepositTx;
