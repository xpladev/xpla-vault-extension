import { Auto } from 'components/layout';
import { PropsWithChildren } from 'react';

import SwitchWallet from '../select/SwitchWallet';

const ConnectedWallet = ({ children }: PropsWithChildren<{}>) => {
  return <Auto columns={[children, <SwitchWallet />]} />;
};

export default ConnectedWallet;
