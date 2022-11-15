import { StrictMode } from 'react';
import { render } from 'react-dom';
import { HashRouter } from 'react-router-dom';
import { ReactQueryDevtools } from 'react-query/devtools';
import { RecoilRoot } from 'recoil';
import { getChainOptions } from '@xpla/wallet-controller';
import { WalletProvider } from '@xpla/wallet-provider';
import 'tippy.js/dist/tippy.css';

import 'config/lang';
import { BRIDGE } from 'config/constants';
import { debug } from 'utils/env';

import 'index.scss';
import ScrollToTop from 'app/ScrollToTop';
import InitNetworks from 'app/InitNetworks';
import InitWallet from 'app/InitWallet';
import InitTheme from 'app/InitTheme';
import App from 'extension/App';

const connectorOpts = { bridge: BRIDGE };

getChainOptions().then((chainOptions) =>
  render(
    <StrictMode>
      <RecoilRoot>
        <HashRouter>
          <ScrollToTop />
          <WalletProvider {...chainOptions} connectorOpts={connectorOpts}>
            <InitNetworks>
              <InitWallet>
                <InitTheme />
                <App />
              </InitWallet>
            </InitNetworks>
          </WalletProvider>
          {debug.query && <ReactQueryDevtools position="bottom-right" />}
        </HashRouter>
      </RecoilRoot>
    </StrictMode>,
    document.getElementById('xpla'),
  ),
);
