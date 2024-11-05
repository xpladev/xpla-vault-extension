import { useInfiniteQuery, useQuery } from 'react-query';
import { EvmAddress } from '@xpla/xpla.js';
import { queryKey, RefetchOptions } from '../query';
import { useECDClient } from './ecdClient';
import useEvmAddress from 'auth/hooks/useEvmAddress';
import { getIpfsGateway } from './wasm';
import axios from 'axios';

/* erc20 contract info */
export const useContractInfoERC20 = (token: EvmAddress, enabled = true) => {
  const ecd = useECDClient();

  return useQuery(
    [queryKey.evm.contractQuery, token],
    async () => {
      const symbolP = ecd.token.symbol(token);
      const nameP = ecd.token.name(token);
      const decimalsP = ecd.token.decimals(token);
      const totalP = ecd.token.totalSupply(token);

      const [symbol, name, decimals, totalSupply] = await Promise.all([
        symbolP,
        nameP,
        decimalsP,
        totalP,
      ]);

      return {
        symbol,
        name,
        decimals,
        totalSupply: totalSupply.toString(),
      };
    },
    {
      ...RefetchOptions.INFINITY,
      enabled: EvmAddress.validate(token) && enabled,
    },
  );
};

/* token balance */
const useGetTokenBalanceQuery = () => {
  const address = useEvmAddress();
  const ecd = useECDClient();

  return (token: EvmAddress) => ({
    queryKey: [queryKey.evm.contractQuery, token, address],
    queryFn: async () => {
      if (!address) return '0';

      const balance = await ecd.token.balanceOf(token, address);
      return balance.toString();
    },
    ...RefetchOptions.DEFAULT,
    retry: false, // Tokens that are not implemented fail to get the balance.
    enabled: EvmAddress.validate(token),
  });
};

/* erc20 token balance */
export const useTokenBalanceERC20 = (token: EvmAddress) => {
  const getQuery = useGetTokenBalanceQuery();
  return useQuery(getQuery(token));
};

/* erc721 contract info */
export const useContractInfoERC721 = (token: EvmAddress, enabled = true) => {
  const ecd = useECDClient();

  return useQuery(
    [queryKey.evm.contractQuery, token],
    async () => {
      const symbolP = ecd.nft.symbol(token);
      const nameP = ecd.nft.name(token);
      const decimalsP = ecd.nft.decimals(token);
      const totalP = ecd.nft.totalSupply(token);

      const [symbol, name, decimals, totalSupply] = await Promise.all([
        symbolP,
        nameP,
        decimalsP,
        totalP,
      ]);

      return {
        symbol,
        name,
        decimals,
        totalSupply: totalSupply.toString(),
      };
    },
    {
      ...RefetchOptions.INFINITY,
      enabled: EvmAddress.validate(token) && enabled,
    },
  );
};

/* erc721 token id list */
export const useERC721Tokens = (contract: EvmAddress) => {
  const address = useEvmAddress() || '';
  const ecd = useECDClient();

  return useQuery(
    [queryKey.evm.contractQuery, contract, address],
    async () => {
      const result = await ecd.nft.tokens(contract, address);
      return result;
    },
    { ...RefetchOptions.INFINITY, enabled: !!address },
  );
};

export const useERC721InfinityTokens = (contract: EvmAddress) => {
  const address = useEvmAddress() || '';
  const ecd = useECDClient();

  return useInfiniteQuery(
    [queryKey.evm.contractQuery, contract, address],
    async ({ pageParam = undefined }) => {
      const [tokens, pagination] = await ecd.nft.tokens(contract, address, {
        'pagination.key': pageParam,
      });
      return { tokens, pagination };
    },
    {
      getNextPageParam: ({ pagination: { next_key } }) => next_key,
      enabled: !!address,
    },
  );
};

export const useTokenInfoERC721 = (
  contract: EvmAddress,
  token_id: string | number,
) => {
  const ecd = useECDClient();

  return useQuery(
    [queryKey.evm.contractQuery, contract, token_id],
    async () => {
      const tokenURI = await ecd.nft.tokenURI(contract, token_id);

      const uri = getIpfsGateway(tokenURI);

      if (!tokenURI || !uri) return undefined;

      try {
        const { data } = await axios.get(uri);
        const result = {
          extension: {
            ...data,
          },
          token_uri: tokenURI,
        };
        return result;
      } catch {
        return undefined;
      }
    },
    { ...RefetchOptions.INFINITY },
  );
};

/* gas prices */
export const useGasPrices = () => {
  const ecd = useECDClient();

  return useQuery(
    [queryKey.evm.gasPrice],
    async () => {
      const gasPrices = await ecd.tx.getGasPrices();
      return gasPrices;
    },
    {
      ...RefetchOptions.INFINITY,
    },
  );
};
