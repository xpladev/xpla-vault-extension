import { useTranslation } from 'react-i18next';
import { Col } from 'components/layout';
import TxContext from 'txs/TxContext';
import { useAuth } from 'auth';
import { useIsWalletEmpty } from 'data/queries/bank';
import ExtensionPage from '../components/ExtensionPage';
import { Grid } from 'components/layout';
import { FormError } from 'components/form';
import SwitchWallet from '../auth/SwitchWallet';
import AddWallet from '../auth/AddWallet';
import ConnectedWallet from '../auth/ConnectedWallet';
import { useRequest } from '../RequestContainer';
import ConfirmConnect from './ConfirmConnect';
import ConfirmTx from './ConfirmTx';
import Assets from './Assets';
import Welcome from './Welcome';
import { Tabs } from 'components/layout';
import NFTAssets from 'pages/nft/NFTAssets';

const Front = () => {
  const { t } = useTranslation();
  const { wallet, wallets } = useAuth();
  const isWalletEmpty = useIsWalletEmpty();
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
    { key: 'wallet', tab: 'Wallet', children: <Assets /> },
    { key: 'nft', tab: 'NFT', children: <NFTAssets /> },
  ];

  return (
    <ExtensionPage header={<ConnectedWallet />}>
      <Grid gap={16}>
        {isWalletEmpty && (
          <FormError>{t('Coins required to post transactions')}</FormError>
        )}

        <Tabs tabs={tabs} type="card" />
      </Grid>
    </ExtensionPage>
  );
};

export default Front;
