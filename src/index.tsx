import './polyfills'; // Buffer 전역 주입 - 반드시 첫 번째 import
import 'tippy.js/dist/tippy.css';
import 'config/lang';
import 'index.scss';

import { getChainOptions } from '@xpla/wallet-controller';
import { WalletProvider } from '@xpla/wallet-provider';
import InitNetworks from 'app/InitNetworks';
import InitTheme from 'app/InitTheme';
import InitWallet from 'app/InitWallet';
import ScrollToTop from 'app/ScrollToTop';
import { BRIDGE } from 'config/constants';
import App from 'extension/App';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ReactQueryDevtools } from 'react-query/devtools';
import { HashRouter } from 'react-router-dom';
import { RecoilRoot } from 'recoil';
import { debug } from 'utils/env';

const connectorOpts = { bridge: BRIDGE };

getChainOptions().then((chainOptions) => {
  const container = document.getElementById('xpla')!;
  const root = createRoot(container);
  root.render(
    <StrictMode>
      <RecoilRoot>
        <HashRouter
          future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
        >
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
  );
});
