# XPLA Vault Wallet extension

**XPLA Vault Wallet extension** is a browser extension to interact with [XPLA Core](https://github.com/xpladev/xpla).

XPLA Vault Wallet extension allows users to:

- View the balances and values of coins and tokens held in the connected wallet.
- View a list of transactions signed by the connected wallet.
- Send tokens to another XPLA wallet.
- Swap currencies on the XPLA network at the effective exchange rate.

## Building XPLA Vault Wallet extension

This project is built with [Vite](https://vite.dev/). Node.js 20.19.0 or later is required (see `.nvmrc`).

Build XPLA Vault Wallet extension with the following commands:

```
git clone https://github.com/xpladev/xpla-vault-extension.git
cd xpla-vault-extension
nvm use
npm i
npm run build:product
```

Each build command bundles the React app first, then the extension scripts
(`background.js`, `contentScript.js`, `inpage.js`) via webpack.

| Command | Vite mode | Env file |
|---------|-----------|----------|
| `npm run build:dev` | `development` | `.env.development` |
| `npm run build:stage` | `stage` | `.env.stage` |
| `npm run build:product` | `production` | `.env.production` |

The output is written to `/build`. Load that directory as an unpacked extension in Chrome.

To run the dev server on port 9020:

```
npm start
```

> Note: For the Windows operating system, separate the paths by semicolons in the `.env` file.

## Change Events

XPLA Vault Extension은 MetaMask의 `window.ethereum`과 유사하게 지갑 계정 변경 및 네트워크 변경 이벤트를 제공합니다. dApp에서 이 이벤트를 구독하면 사용자가 익스텐션에서 지갑이나 네트워크를 변경했을 때 실시간으로 감지할 수 있습니다.

### 지원 이벤트

| 이벤트 | 페이로드 | 설명 |
|--------|---------|------|
| `accountsChanged` | `string[]` | 지갑 계정이 변경되면 새 주소 배열 전달. 지갑 연결 해제 시 빈 배열 `[]` 전달 |
| `chainChanged` | `string` | 네트워크가 변경되면 새 chainID 전달 (예: `"dimension_37-1"`, `"cube_47-5"`) |

### React Hook 사용 예시

```tsx
import { useEffect, useState } from 'react';

function useXplaEvents() {
  const [account, setAccount] = useState<string | null>(null);
  const [chainId, setChainId] = useState<string | null>(null);

  useEffect(() => {
    if (!window.xpla?.on) return;

    const handleAccountsChanged = (accounts: string[]) => {
      setAccount(accounts[0] ?? null);
    };

    const handleChainChanged = (chainId: string) => {
      setChainId(chainId);
    };

    window.xpla.on('accountsChanged', handleAccountsChanged);
    window.xpla.on('chainChanged', handleChainChanged);

    return () => {
      window.xpla?.off('accountsChanged', handleAccountsChanged);
      window.xpla?.off('chainChanged', handleChainChanged);
    };
  }, []);

  return { account, chainId };
}
```

### 주의사항

- `window.xpla` 객체는 XPLA Vault Extension이 설치된 경우에만 존재합니다.
- 구버전 익스텐션에는 `window.xpla`가 없으므로, 반드시 `window.xpla?.on` 존재 여부를 확인한 후 사용해야 합니다.
- 모바일 지갑(WalletConnect) 등 다른 연결 방식을 사용하는 경우, 이 이벤트는 발생하지 않습니다.
- `chainChanged` 이벤트 수신 시 페이지를 새로고침하거나, 관련 데이터를 다시 조회하는 것을 권장합니다.
