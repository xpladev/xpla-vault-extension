import { Proposal } from '@xpla/xpla.js';
import { Empty, Fetching } from 'components/feedback';
import { Toggle } from 'components/form';
import { Card, Col } from 'components/layout';
import { useProposals, useProposalStatusItem } from 'data/queries/gov';
import { combineState, useIsClassic } from 'data/query';
import { useXplaAssets } from 'data/Xpla/XplaAssets';
import { reverse } from 'ramda';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import GovernanceParams from './GovernanceParams';
import ProposalItem from './ProposalItem';
import styles from './ProposalsByStatus.module.scss';

const ProposalsByStatus = ({ status }: { status: Proposal.Status }) => {
  const { t } = useTranslation();
  const isClassic = useIsClassic();

  const [showAll, setShowAll] = useState(!isClassic);
  const toggle = () => setShowAll((state) => !state);

  const { data: whitelist, ...whitelistState } = useXplaAssets<number[]>(
    '/station/proposals.json',
  );

  const { data, ...proposalState } = useProposals(status);
  const { label } = useProposalStatusItem(status);

  const state = combineState(whitelistState, proposalState);

  const render = () => {
    if (!(data && whitelist)) return null;

    const proposals =
      status === Proposal.Status.PROPOSAL_STATUS_VOTING_PERIOD && !showAll
        ? data.filter(({ id }) => whitelist.includes(id))
        : data;

    return !proposals.length ? (
      <>
        <Card>
          <Empty>
            {t('No proposals in {{label}} period', {
              label: label.toLowerCase(),
            })}
          </Empty>
        </Card>
        <GovernanceParams />
      </>
    ) : (
      <>
        <section className={styles.list}>
          {reverse(proposals).map((item) => (
            <Card
              to={`/proposal/${item.id}`}
              className={styles.link}
              key={item.id}
            >
              <ProposalItem proposal={item} showVotes={!showAll} />
            </Card>
          ))}
        </section>

        <GovernanceParams />
      </>
    );
  };

  return (
    <Fetching {...state}>
      <Col>
        {isClassic &&
          status === Proposal.Status.PROPOSAL_STATUS_VOTING_PERIOD && (
            <section>
              <Toggle checked={showAll} onChange={toggle}>
                {t('Show all')}
              </Toggle>
            </section>
          )}

        {render()}
      </Col>
    </Fetching>
  );
};

export default ProposalsByStatus;
