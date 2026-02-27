import { useAuth } from 'auth';
import { Col, Grid, Tabs } from 'components/layout';
import NFTAssets from 'pages/nft/NFTAssets';
import TxContext from 'txs/TxContext';

import AddWallet from '../auth/AddWallet';
import ConnectedWallet from '../auth/ConnectedWallet';
import SwitchWallet from '../auth/SwitchWallet';
import ExtensionPage from '../components/ExtensionPage';
import { useRequest } from '../RequestContainer';
import Activate from './Activate';
import Assets from './Assets';
import ConfirmConnect from './ConfirmConnect';
import ConfirmTx from './ConfirmTx';
import Welcome from './Welcome';

const Front = () => {
  const { wallet, wallets } = useAuth();
  const { requests } = useRequest();
  const { connect, tx } = requests;

  if (!wallet) {
    return (
      <ExtensionPage>
        <Col>
          {wallets.length ? <SwitchWallet /> : <Welcome />}
          <AddWallet />
        </Col>
      </ExtensionPage>
    );
  }

  if (connect) {
    return <ConfirmConnect {...connect} />;
  }

  if (tx) {
    return (
      <TxContext>
        <ConfirmTx {...tx} />
      </TxContext>
    );
  }

  const tabs = [
    { key: 'wallet', tab: 'Token', children: <Assets /> },
    { key: 'nft', tab: 'NFT', children: <NFTAssets /> },
  ];

  return (
    <ExtensionPage header={<ConnectedWallet />}>
      <Grid gap={16}>
        {/* {isWalletEmpty && (
          <FormHelp>
            <ExternalLink href={CEX}>
              {t('Don’t have XPLA yet? Get it here!')}
            </ExternalLink>
          </FormHelp>
        )} */}

        <Activate />

        <Tabs tabs={tabs} type="card" />
      </Grid>
    </ExtensionPage>
  );
};

export default Front;
