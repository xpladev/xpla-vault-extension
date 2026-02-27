import { Auto, Page } from 'components/layout';

import Coins from './Coins';
import Rewards from './Rewards';
import Tokens from './Tokens';
import Vesting from './Vesting';

const Wallet = () => {
  return (
    <Page title="Wallet">
      <Auto
        columns={[
          <>
            <Coins />
            <Tokens />
            <Vesting />
          </>,
          <>
            <Rewards />
          </>,
        ]}
      />
    </Page>
  );
};

export default Wallet;
