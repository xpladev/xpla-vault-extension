import { Card, Page } from 'components/layout';
import { useCommunityPool } from 'data/queries/distribution';
import { useDepositParams } from 'data/queries/gov';
import { combineState } from 'data/query';
import { useTranslation } from 'react-i18next';
import { getAmount } from 'utils/coin';

import TxContext from '../TxContext';
import SubmitProposalForm from './SubmitProposalForm';

const SubmitProposalTx = () => {
  const { t } = useTranslation();

  const { data: communityPool, ...communityPoolState } = useCommunityPool();
  const { data: depositParams, ...depositParamsState } = useDepositParams();
  const state = combineState(communityPoolState, depositParamsState);

  const render = () => {
    if (!(communityPool && depositParams)) return null;
    const minDeposit = getAmount(depositParams.min_deposit, 'axpla');
    return (
      <SubmitProposalForm
        communityPool={communityPool}
        minDeposit={minDeposit}
      />
    );
  };

  return (
    <Page {...state} title={t('New proposal')} small>
      <Card>
        <TxContext>{render()}</TxContext>
      </Card>
    </Page>
  );
};

export default SubmitProposalTx;
