import { ErrorBoundary, Wrong } from 'components/feedback';
import Layout, { Page } from 'components/layout';
import { Actions, Banner, Content, Header, Sidebar } from 'components/layout';
import { getErrorMessage } from 'utils/error';

/* init */
import InitBankBalance from './InitBankBalance';
/* routes */
import { useNav } from './routes';
import Aside from './sections/Aside';
import ConnectWallet from './sections/ConnectWallet';
import DevTools from './sections/DevTools';
/* header */
import IsClassicNetwork from './sections/IsClassicNetwork';
/* extra */
import LatestTx from './sections/LatestTx';
/* sidebar */
import Nav from './sections/Nav';
/* banner */
import NetworkName from './sections/NetworkName';
import Preferences from './sections/Preferences';
import Refresh from './sections/Refresh';
import SelectTheme from './sections/SelectTheme';
import ValidatorButton from './sections/ValidatorButton';

const App = () => {
  const { element: routes } = useNav();

  return (
    <Layout>
      <Banner>
        <NetworkName />
      </Banner>

      <Sidebar>
        <Nav />
        <Aside />
      </Sidebar>

      <Header>
        <IsClassicNetwork />

        <Actions>
          <DevTools />
          <section>
            <Refresh />
            <Preferences />
            <SelectTheme />
          </section>
          <ValidatorButton />
          <ConnectWallet />
        </Actions>
        <LatestTx />
        {/* <LatestEvmTx /> */}
      </Header>

      <Content>
        <ErrorBoundary fallback={fallback}>
          <InitBankBalance>{routes}</InitBankBalance>
        </ErrorBoundary>
      </Content>
    </Layout>
  );
};

export default App;

/* error */
export const fallback = (error: Error) => (
  <Page>
    <Wrong>{getErrorMessage(error)}</Wrong>
  </Page>
);
