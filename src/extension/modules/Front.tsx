import { useAuth } from 'auth';
import TxContext from 'txs/TxContext';
import { Col, Grid, Tabs } from 'components/layout';
import NFTAssets from 'pages/nft/NFTAssets';
import SwitchWallet from '../auth/SwitchWallet';
import AddWallet from '../auth/AddWallet';
import ConnectedWallet from '../auth/ConnectedWallet';
import ExtensionPage from '../components/ExtensionPage';
import { useRequest } from '../RequestContainer';
import ConfirmConnect from './ConfirmConnect';
import ConfirmTx from './ConfirmTx';
import Assets from './Assets';
import Welcome from './Welcome';
import Activate from './Activate';

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
