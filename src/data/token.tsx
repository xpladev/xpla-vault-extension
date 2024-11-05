import { ReactNode } from 'react';
import { isDenomIBC, isDenomNative } from '@xpla.kitchen/utils';
import { readDenom, truncate } from '@xpla.kitchen/utils';
import { AccAddress, EvmAddress } from '@xpla/xpla.js';
import { ASSETS } from 'config/constants';
import { useIsClassic } from './query';
import { useIBCBaseDenom } from './queries/ibc';
import { useTokenInfoCW20 } from './queries/wasm';
import { useContractInfoERC20 } from './queries/evm';
import {
  useCustomTokensCW20,
  useCustomTokensERC20,
} from './settings/CustomTokens';
import {
  useCW20Whitelist,
  useERC20WhiteList,
  useIBCWhitelist,
} from './Xpla/XplaAssets';

export const useTokenItem = (token: Token): TokenItem | undefined => {
  const isClassic = useIsClassic();

  /* CW20 */
  const matchToken = (item: TokenItem) => item.token === token;

  // 1. Local storage
  const { list } = useCustomTokensCW20();
  const customTokenItem = list.find(matchToken);

  // 2. Whitelist
  const cw20WhitelistResult = useCW20Whitelist(!!customTokenItem);
  const { data: cw20Whitelist = {} } = cw20WhitelistResult;
  const listedCW20TokenItem = Object.values(cw20Whitelist).find(matchToken);

  // 3. Contract query - token info
  const shouldQueryCW20 = cw20WhitelistResult.isSuccess && !listedCW20TokenItem;
  const tokenInfoResult = useTokenInfoCW20(token, shouldQueryCW20);
  const { data: tokenInfo } = tokenInfoResult;
  const tokenInfoItem = tokenInfo ? { token, ...tokenInfo } : undefined;

  /* IBC */
  // 1. Whitelist
  const { data: ibcWhitelist = {}, ...ibcWhitelistState } = useIBCWhitelist();
  const listedIBCTokenItem = ibcWhitelist[token.replace('ibc/', '')];

  // 2. Query denom trace
  const shouldQueryIBC = ibcWhitelistState.isSuccess && !listedIBCTokenItem;
  const { data: base_denom } = useIBCBaseDenom(token, shouldQueryIBC);

  /* ERC20 */
  // 1. Local storage
  const { list: evmList } = useCustomTokensERC20();
  const erc20TokenItem = evmList.find(matchToken);

  // 2. Whitelist
  const erc20WhitelistResult = useERC20WhiteList(!!erc20TokenItem);
  const { data: erc20Whitelist = {} } = erc20WhitelistResult;
  const listedERC20TokenItem = Object.values(erc20Whitelist).find(matchToken);

  // 3. Contract query - token info
  const shouldQueryERC20 =
    erc20WhitelistResult.isSuccess && !listedERC20TokenItem;
  const erc20InfoResult = useContractInfoERC20(token, shouldQueryERC20);
  const { data: erc20Info } = erc20InfoResult;
  const erc20InfoItem = erc20Info ? { token, ...erc20Info } : undefined;

  if (AccAddress.validate(token)) {
    return customTokenItem ?? listedCW20TokenItem ?? tokenInfoItem;
  }

  if (EvmAddress.validate(token)) {
    return erc20InfoItem ?? listedERC20TokenItem ?? erc20TokenItem;
  }

  if (isDenomIBC(token)) {
    const item = {
      ...listedIBCTokenItem,
      denom: token,
      base_denom: listedIBCTokenItem?.base_denom ?? base_denom,
    };

    return readIBCDenom(item);
  }

  return readNativeDenom(token, isClassic);
};

interface Props {
  token: Token;
  children: (token: TokenItem) => ReactNode;
}

export const WithTokenItem = ({ token, children }: Props) => {
  const tokenItem = useTokenItem(token);
  if (!tokenItem) return null;
  return <>{children(tokenItem)}</>;
};

/* helpers */
export const getIcon = (path: string) => `${ASSETS}/icon/${path}`;

export const readNativeDenom = (
  denom: Denom,
  isClassic?: boolean,
): TokenItem => {
  const symbol = readDenom(denom);
  const symbolClassic = denom === 'axpla' ? 'LUNC' : symbol + 'C';

  const path = `svg/${symbol}.svg`;

  return {
    token: denom,
    symbol: isClassic ? symbolClassic : symbol,
    name: isDenomNative(denom)
      ? `Xpla ${denom.slice(1).toUpperCase()}`
      : undefined,
    icon: getIcon(path),
    decimals: 18,
  };
};

export const readIBCDenom = (item: IBCTokenItem): TokenItem => {
  const { denom, base_denom } = item;
  const symbol =
    item.symbol ?? ((base_denom && readDenom(base_denom)) || base_denom);
  const path = symbol ? `ibc/${symbol}.svg` : 'IBC.svg';

  return {
    token: denom,
    symbol: symbol ?? truncate(denom),
    icon: getIcon(path),
    decimals: item.decimals ?? 6,
  };
};
