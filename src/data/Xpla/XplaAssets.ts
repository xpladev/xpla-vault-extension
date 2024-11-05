import { useQuery } from 'react-query';
import axios, { AxiosError } from 'axios';
import { fromPairs, toPairs } from 'ramda';
import { flatten, groupBy, map, mergeAll, values } from 'ramda';
import { AccAddress } from '@xpla/xpla.js';
import { ASSETS } from 'config/constants';
import shuffle from 'utils/shuffle';
import { queryKey, RefetchOptions } from '../query';
import { useNetworkName } from '../wallet';

const config = { baseURL: ASSETS };

export const useXplaAssets = <T>(path: string, callback?: (data: T) => T) => {
  return useQuery<T, AxiosError>(
    [queryKey.XplaAssets, path],
    async () => {
      const { data } = await axios.get<T>(path, config);
      return callback?.(data) ?? data;
    },
    { ...RefetchOptions.INFINITY },
  );
};

export const useXplaAssetsByNetwork = <T>(
  path: string,
  disabled = false,
  callback?: (data: T) => T,
) => {
  const networkName = useNetworkName();

  return useQuery<T | undefined, AxiosError>(
    [queryKey.XplaAssets, path, networkName],
    async () => {
      const { data } = await axios.get<Record<NetworkName, T>>(path, config);
      if (!data[networkName]) return {} as T;
      return callback?.(data[networkName]) ?? data[networkName];
    },
    { ...RefetchOptions.INFINITY, enabled: !disabled },
  );
};

export const useIBCWhitelist = () => {
  return useXplaAssetsByNetwork<IBCWhitelist>('ibc/tokens.json');
};

export const useCW20Contracts = () => {
  return useXplaAssetsByNetwork<CW20Contracts>('cw20/contracts.json');
};

export const useCW20Whitelist = (disabled = false) => {
  return useXplaAssetsByNetwork<CW20Whitelist>(
    'cw20/tokens.json',
    disabled,
    (data) => sortWhitelistCW20(shuffleByProtocol(data)),
  );
};

export const useCW20Pairs = () => {
  return useXplaAssetsByNetwork<CW20Pairs>('cw20/pairs.dex.json');
};

export const useERC20WhiteList = (disabled = false) => {
  return useXplaAssetsByNetwork<ERC20Whitelist>(
    'erc20/tokens.json',
    disabled,
    (data) => sortWhitelistERC20(shuffleByProtocol(data)),
  );
};

export type ContractNames =
  | 'assertLimitOrder'
  | 'routeswap'
  | 'tnsRegistry'
  | 'tnsReverseRecord';

export type XplaContracts = Record<ContractNames, AccAddress>;
export const useXplaContracts = () => {
  return useXplaAssetsByNetwork<XplaContracts>('contracts.json');
};

export const useCW721Whitelist = () => {
  return useXplaAssetsByNetwork<CW721Whitelist>(
    'cw721/contracts.json',
    undefined,
    shuffleByProtocol,
  );
};

export const useERC721Whitelist = () => {
  return useXplaAssetsByNetwork<ERC721Whitelist>(
    'erc721/contracts.json',
    undefined,
    shuffleByProtocol,
  );
};

interface CW721MarketplaceItem {
  name: string;
  link: string;
}

export const useCW721Marketplace = () => {
  return useXplaAssets<CW721MarketplaceItem[]>('cw721/marketplace.json');
};

export const useERC721Marketplace = () => {
  return useXplaAssets<CW721MarketplaceItem[]>('cw721/marketplace.json');
};

/* helpers */
const sortWhitelistCW20 = (data: CW20Whitelist) => {
  const sorted = toPairs(data).sort(
    ([, a], [, b]) =>
      Number(b.symbol === 'ANC') - Number(a.symbol === 'ANC') ||
      Number(b.protocol === 'Anchor') - Number(a.protocol === 'Anchor') ||
      Number(b.symbol === 'MIR') - Number(a.symbol === 'MIR') ||
      Number(b.protocol === 'Mirror') - Number(a.protocol === 'Mirror'),
  );

  return fromPairs(
    sorted.map(([t, { decimals, ...item }]) => {
      return [t, { ...item, decimals: decimals ?? 6 }];
    }),
  );
};

const sortWhitelistERC20 = (data: ERC20Whitelist) => {
  const sorted = toPairs(data).sort(
    ([, a], [, b]) =>
      Number(b.symbol === 'ANC') - Number(a.symbol === 'ANC') ||
      Number(b.protocol === 'Anchor') - Number(a.protocol === 'Anchor') ||
      Number(b.symbol === 'MIR') - Number(a.symbol === 'MIR') ||
      Number(b.protocol === 'Mirror') - Number(a.protocol === 'Mirror'),
  );

  return fromPairs(
    sorted.map(([t, { decimals, ...item }]) => {
      return [t, { ...item, decimals: decimals ?? 6 }];
    }),
  );
};

export const shuffleByProtocol = <T extends CW20Whitelist | CW721Whitelist>(
  array: T,
) => {
  const shuffledPair = shuffle(
    toPairs(
      groupBy(([, { protocol, name }]) => protocol ?? name, toPairs(array)),
    ),
  );

  return mergeAll(flatten(map(fromPairs, values(fromPairs(shuffledPair)))));
};
