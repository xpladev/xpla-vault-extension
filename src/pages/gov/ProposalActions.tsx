import { useTranslation } from 'react-i18next';
import { ProposalV1 } from '@xpla/xpla.js';
import { LinkButton } from 'components/general';

const ProposalActions = ({ proposal }: { proposal: ProposalV1 }) => {
  const { t } = useTranslation();
  const { status } = proposal;

  return status === ProposalV1.Status.PROPOSAL_STATUS_VOTING_PERIOD ? (
    <LinkButton to="./vote" color="primary" size="small">
      {t('Vote')}
    </LinkButton>
  ) : status === ProposalV1.Status.PROPOSAL_STATUS_DEPOSIT_PERIOD ? (
    <LinkButton to="./deposit" color="primary" size="small">
      {t('Deposit')}
    </LinkButton>
  ) : null;
};

export default ProposalActions;
