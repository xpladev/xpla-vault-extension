import { useEffect, lazy } from 'react';
import { useRoutes } from 'react-router-dom';
import { useAddress, useNetwork } from 'data/wallet';
import { ErrorBoundary } from 'components/feedback';
import { fallback } from 'app/App';
import InitBankBalance from 'app/InitBankBalance';
import LatestTx from 'app/sections/LatestTx';
import NetworkName from 'app/sections/NetworkName';
import SendTx from 'txs/send/SendTx';
// import SwapTx from 'txs/swap/SwapTx';
import TransferCW721Tx from 'txs/wasm/TransferCW721Tx';
import SignMultisigTxPage from 'pages/multisig/SignMultisigTxPage';
import PostMultisigTxPage from 'pages/multisig/PostMultisigTxPage';
import ActivateTx from 'txs/activate/ActivateTx';
import EvmSendTx from 'txs-evm/send/SendTx';
import EvmTransferERC721Tx from 'txs-evm/nft/TransferCW721Tx';
import {
  clearWalletAddress,
  storeNetwork,
  storeWalletAddress,
} from './storage';
import RequestContainer from './RequestContainer';
import ManageNetworks from './networks/ManageNetworks';
import AddNetworkPage from './networks/AddNetworkPage';
import Auth from './auth/Auth';
import Header from './layouts/Header';
import Logo from './layouts/Logo';
import Settings from './settings/Settings';
import Front from './modules/Front';

const App = () => {
  const network = useNetwork();
  const address = useAddress();

  useEffect(() => {
    storeNetwork(network);
  }, [network]);

  useEffect(() => {
    if (address) storeWalletAddress(address);
    else clearWalletAddress();
  }, [address]);

  const routes = useRoutes([
    { path: '/networks', element: <ManageNetworks /> },
    { path: '/network/new', element: <AddNetworkPage /> },

    /* auth */
    { path: '/auth/*', element: <Auth /> },

    /* default txs */
    { path: '/send', element: <SendTx /> },
    { path: '/nft/transfer', element: <TransferCW721Tx /> },
    { path: '/multisig/sign', element: <SignMultisigTxPage /> },
    { path: '/multisig/post', element: <PostMultisigTxPage /> },

    /* activate */
    { path: '/activate', element: <ActivateTx /> },

    /* evm txs */
    { path: '/evm/send', element: <EvmSendTx /> },
    { path: '/evm/nft/transfer', element: <EvmTransferERC721Tx /> },

    /* 404 */
    { path: '*', element: <Front /> },
  ]);

  return (
    <ErrorBoundary fallback={fallback}>
      <InitBankBalance>
        <RequestContainer>
          <NetworkName />

          <Header>
            <Logo />
            <section>
              <LatestTx />
              <Settings />
            </section>
          </Header>

          <ErrorBoundary fallback={fallback}>{routes}</ErrorBoundary>
        </RequestContainer>
      </InitBankBalance>
    </ErrorBoundary>
  );
};

export default App;
