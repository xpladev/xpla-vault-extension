import DelegationsPromote from 'app/containers/DelegationsPromote';
import { Fetching } from 'components/feedback';
import { Col, Row } from 'components/layout';
import { useRewards } from 'data/queries/distribution';
import { useDelegations, useUnbondings } from 'data/queries/staking';
import { combineState } from 'data/query';

import Delegations from './Delegations';
import Rewards from './Rewards';
import Unbondings from './Unbondings';

const Staked = () => {
  const { data: delegations, ...delegationsState } = useDelegations();
  const { data: unbondings, ...unbondingsState } = useUnbondings();
  const { data: rewards, ...rewardsState } = useRewards();
  const state = combineState(delegationsState, unbondingsState, rewardsState);

  const render = () => {
    if (!(delegations && unbondings && rewards)) return null;

    const staked =
      delegations.length || unbondings.length || rewards.total.toArray().length;

    if (!staked) return <DelegationsPromote horizontal />;

    return (
      <Row>
        <Col>
          <Delegations />
        </Col>

        <Col>
          <Unbondings />
        </Col>

        <Col>
          <Rewards />
        </Col>
      </Row>
    );
  };

  return <Fetching {...state}>{render()}</Fetching>;
};

export default Staked;
