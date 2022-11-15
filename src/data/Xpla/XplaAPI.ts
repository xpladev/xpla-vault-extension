import { useMemo } from 'react';
import { useQuery } from 'react-query';
import axios, { AxiosError } from 'axios';
import BigNumber from 'bignumber.js';
import { OracleParams, ValAddress } from '@xpla/xpla.js';
import { XplaValidator } from 'types/validator';
import { XplaProposalItem } from 'types/proposal';
import { useNetwork } from 'data/wallet';
import { useOracleParams } from 'data/queries/oracle';
import { useNetworks } from 'app/InitNetworks';
import { queryKey, RefetchOptions } from '../query';

export enum Aggregate {
  PERIODIC = 'periodic',
  CUMULATIVE = 'cumulative',
}

export enum AggregateStakingReturn {
  DAILY = 'daily',
  ANNUALIZED = 'annualized',
}

export enum AggregateWallets {
  TOTAL = 'total',
  NEW = 'new',
  ACTIVE = 'active',
}

export const useXplaAPIURL = (mainnet?: true) => {
  const network = useNetwork();
  const networks = useNetworks();
  return mainnet ? networks['mainnet'].api : network.api;
};

export const useIsXplaAPIAvailable = () => {
  const url = useXplaAPIURL();
  return !!url;
};

export const useXplaAPI = <T>(path: string, params?: object, fallback?: T) => {
  const baseURL = useXplaAPIURL();
  const available = useIsXplaAPIAvailable();
  const shouldFallback = !available && fallback;

  return useQuery<T, AxiosError>(
    [queryKey.XplaAPI, baseURL, path, params],
    async () => {
      if (shouldFallback) return fallback;
      const { data } = await axios.get(path, { baseURL, params });
      return data;
    },
    { ...RefetchOptions.INFINITY, enabled: !!(baseURL || shouldFallback) },
  );
};

/* fee */
export type GasPrices = Record<Denom, Amount>;

export const useGasPrices = () => {
  const current = useXplaAPIURL();
  const mainnet = useXplaAPIURL(true);
  const baseURL = current ?? mainnet;
  const path = '/gas-prices';

  return useQuery(
    [queryKey.XplaAPI, baseURL, path],
    async () => {
      const { data } = await axios.get<GasPrices>(path, { baseURL });
      return data;
    },
    { ...RefetchOptions.INFINITY, enabled: !!baseURL },
  );
};

/* charts */
export enum ChartInterval {
  '1m' = '1m',
  '5m' = '5m',
  '15m' = '15m',
  '30m' = '30m',
  '1h' = '1h',
  '1d' = '1d',
}

export const useXplaPriceChart = (denom: Denom, interval: ChartInterval) => {
  return useXplaAPI<ChartDataItem[]>(`chart/price/${denom}`, { interval });
};

export const useTxVolume = (denom: Denom, type: Aggregate) => {
  return useXplaAPI<ChartDataItem[]>(`chart/tx-volume/${denom}/${type}`);
};

export const useStakingReturn = (type: AggregateStakingReturn) => {
  return useXplaAPI<ChartDataItem[]>(`chart/staking-return/${type}`);
};

export const useTaxRewards = (type: Aggregate) => {
  return useXplaAPI<ChartDataItem[]>(`chart/tax-rewards/${type}`);
};

export const useWallets = (walletsType: AggregateWallets) => {
  return useXplaAPI<ChartDataItem[]>(`chart/wallets/${walletsType}`);
};

export const useSumActiveWallets = () => {
  return useXplaAPI<Record<string, string>>(`chart/wallets/active/sum`);
};

/* validators */
export const useXplaValidators = () => {
  return useXplaAPI<XplaValidator[]>('v1/validators', undefined, []);
};

export const useXplaValidator = (address: ValAddress) => {
  return useXplaAPI<XplaValidator>(`v1/validators/${address}`);
};

export const useXplaProposal = (id: number) => {
  return useXplaAPI<XplaProposalItem[]>(`v1/proposals/${id}`);
};

/* helpers */
export const getCalcVotingPowerRate = (XplaValidators: XplaValidator[]) => {
  const total = BigNumber.sum(
    ...XplaValidators.map(({ voting_power = 0 }) => voting_power),
  ).toString();

  return (address: ValAddress) => {
    const validator = XplaValidators.find(
      ({ operator_address }) => operator_address === address,
    );

    if (!validator) return;
    const { voting_power } = validator;
    return voting_power
      ? new BigNumber(voting_power).div(total).toString()
      : undefined;
  };
};

export const calcSelfDelegation = (validator?: XplaValidator) => {
  if (!validator) return;
  const { self, tokens } = validator;
  return self ? Number(self) / Number(tokens) : undefined;
};

export const getCalcUptime = ({ slash_window }: OracleParams) => {
  return (validator?: XplaValidator) => {
    if (!validator) return;
    const { miss_counter } = validator;
    return miss_counter ? 1 - Number(miss_counter) / slash_window : undefined;
  };
};

export const useVotingPowerRate = (address: ValAddress) => {
  const { data: XplaValidators, ...state } = useXplaValidators();
  const calcRate = useMemo(() => {
    if (!XplaValidators) return;
    return getCalcVotingPowerRate(XplaValidators);
  }, [XplaValidators]);

  const data = useMemo(() => {
    if (!calcRate) return;
    return calcRate(address);
  }, [address, calcRate]);

  return { data, ...state };
};

export const useUptime = (validator: XplaValidator) => {
  const { data: oracleParams, ...state } = useOracleParams();

  const calc = useMemo(() => {
    if (!oracleParams) return;
    return getCalcUptime(oracleParams);
  }, [oracleParams]);

  const data = useMemo(() => {
    if (!calc) return;
    return calc(validator);
  }, [calc, validator]);

  return { data, ...state };
};
