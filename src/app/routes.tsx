/* auth */
import Auth from 'auth/modules/Auth';
import AddNetworkPage from 'auth/networks/AddNetworkPage';
import ManageNetworksPage from 'auth/networks/ManageNetworksPage';
import { useIsClassic } from 'data/query';
import Contract from 'pages/contract/Contract';
/* menu */
import Dashboard from 'pages/dashboard/Dashboard';
import Governance from 'pages/gov/Governance';
import ProposalDetails from 'pages/gov/ProposalDetails';
import History from 'pages/history/History';
/* labs */
import Labs from 'pages/labs/Labs';
import PostMultisigTxPage from 'pages/multisig/PostMultisigTxPage';
import SignMultisigTxPage from 'pages/multisig/SignMultisigTxPage';
import NFT from 'pages/nft/NFT';
/* 404 */
import NotFound from 'pages/NotFound';
/* settings */
import Settings from 'pages/Settings';
import Stake from 'pages/stake/Stake';
/* details */
import ValidatorDetails from 'pages/stake/ValidatorDetails';
import Wallet from 'pages/wallet/Wallet';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useRoutes } from 'react-router-dom';
import { ReactComponent as ContractIcon } from 'styles/images/menu/Contract.svg';
import { ReactComponent as GovernanceIcon } from 'styles/images/menu/Governance.svg';
import { ReactComponent as HistoryIcon } from 'styles/images/menu/History.svg';
import { ReactComponent as NFTIcon } from 'styles/images/menu/NFT.svg';
import { ReactComponent as StakeIcon } from 'styles/images/menu/Stake.svg';
import { ReactComponent as WalletIcon } from 'styles/images/menu/Wallet.svg';
import DepositTx from 'txs/gov/DepositTx';
import SubmitProposalTx from 'txs/gov/SubmitProposalTx';
import VoteTx from 'txs/gov/VoteTx';
/* txs */
import SendTx from 'txs/send/SendTx';
import StakeTx from 'txs/stake/StakeTx';
import WithdrawCommissionTx from 'txs/stake/WithdrawCommissionTx';
import WithdrawRewardsTx from 'txs/stake/WithdrawRewardsTx';
import ExecuteContractTx from 'txs/wasm/ExecuteContractTx';
import InstantiateContractTx from 'txs/wasm/InstantiateContractTx';
import MigrateContractTx from 'txs/wasm/MigrateContractTx';
import StoreCodeTx from 'txs/wasm/StoreCodeTx';
import TransferCW721Tx from 'txs/wasm/TransferCW721Tx';
import UpdateAdminContractTx from 'txs/wasm/UpdateAdminContractTx';

const ICON_SIZE = { width: 20, height: 20 };

export const useNav = () => {
  const { t } = useTranslation();
  const isClassic = useIsClassic();

  const menu = [
    {
      path: '/wallet',
      element: <Wallet />,
      title: t('Wallet'),
      icon: <WalletIcon {...ICON_SIZE} />,
    },
    {
      path: '/history',
      element: <History />,
      title: t('History'),
      icon: <HistoryIcon {...ICON_SIZE} />,
    },
    {
      path: '/stake',
      element: <Stake />,
      title: t('Stake'),
      icon: <StakeIcon {...ICON_SIZE} />,
    },
    {
      path: '/gov',
      element: <Governance />,
      title: t('Governance'),
      icon: <GovernanceIcon {...ICON_SIZE} />,
    },
    {
      path: '/nft',
      element: <NFT />,
      title: t('NFT'),
      icon: <NFTIcon {...ICON_SIZE} />,
    },
    {
      path: '/contract',
      element: <Contract />,
      title: t('Contract'),
      icon: <ContractIcon {...ICON_SIZE} />,
    },
  ];

  const routes = [
    { path: '/', element: <Dashboard /> },

    /* pages */
    ...menu,
    { path: '/validator/:address', element: <ValidatorDetails /> },
    { path: '/proposal/:id', element: <ProposalDetails /> },

    /* multisig */
    { path: '/multisig/sign', element: <SignMultisigTxPage /> },
    { path: '/multisig/post', element: <PostMultisigTxPage /> },

    /* txs */
    { path: '/send', element: <SendTx /> },
    { path: '/nft/transfer', element: <TransferCW721Tx /> },
    { path: '/stake/:address', element: <StakeTx /> },
    { path: '/rewards', element: <WithdrawRewardsTx /> },
    { path: '/commission', element: <WithdrawCommissionTx /> },
    { path: '/proposal/new', element: <SubmitProposalTx /> },
    { path: '/proposal/:id/deposit', element: <DepositTx /> },
    { path: '/proposal/:id/vote', element: <VoteTx /> },
    { path: '/contract/instantiate', element: <InstantiateContractTx /> },
    { path: '/contract/store', element: <StoreCodeTx /> },
    { path: '/contract/execute/:contract', element: <ExecuteContractTx /> },
    { path: '/contract/migrate/:contract', element: <MigrateContractTx /> },
    {
      path: '/contract/updateadmin/:contract',
      element: <UpdateAdminContractTx />,
    },

    /* auth */
    { path: '/auth/*', element: <Auth /> },
    { path: '/networks', element: <ManageNetworksPage /> },
    { path: '/network/new', element: <AddNetworkPage /> },
    { path: '/settings', element: <Settings /> },

    /* dev */
    { path: '/labs', element: <Labs /> },

    /* 404 */
    { path: '*', element: <NotFound /> },
  ];

  return { menu, element: useRoutes(routes) };
};

/* helpers */
export const useGoBackOnError = ({ error }: QueryState) => {
  const navigate = useNavigate();
  useEffect(() => {
    if (error) navigate('..', { replace: true });
  }, [error, navigate]);
};
