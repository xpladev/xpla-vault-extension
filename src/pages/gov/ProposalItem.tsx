import { ProposalV1 } from '@xpla/xpla.js';
import { FlexColumn } from 'components/layout';
import ProposalVotes from './ProposalVotes';
import ProposalHeader from './ProposalHeader';
import styles from './ProposalItem.module.scss';

interface Props {
  proposal: ProposalV1;
  showVotes: boolean;
}

const ProposalItem = ({ proposal, showVotes }: Props) => {
  const { id, status } = proposal;

  return (
    <FlexColumn gap={36} className={styles.item}>
      <ProposalHeader proposal={proposal} />

      {showVotes &&
      status === ProposalV1.Status.PROPOSAL_STATUS_VOTING_PERIOD ? (
        <ProposalVotes id={id} />
      ) : null}
    </FlexColumn>
  );
};

export default ProposalItem;
