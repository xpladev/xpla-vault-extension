import { useCallback } from 'react';
import BigNumber from 'bignumber.js';
import { fromPairs, zipObj } from 'ramda';
import { Coin, Coins, MsgExecuteContract, MsgSwap } from '@xpla/xpla.js';
import { isDenom, isDenomXpla } from '@xpla.kitchen/utils';
import { isDenomNative, isDenomXplaNative } from '@xpla.kitchen/utils';
import { XPLASWAP_COMMISSION_RATE } from 'config/constants';
import { has, toPrice } from 'utils/num';
import { getAmount, toAsset, toAssetInfo, toTokenItem } from 'utils/coin';
import { toBase64 } from 'utils/data';
import { useAddress } from 'data/wallet';
import { useLCDClient } from 'data/queries/lcdClient';
import { useSwap } from './SwapContext';
import { SwapSpread } from './SingleSwapContext';

/* Call this hook after wrap component around with a SwapContext.
Then, various helper functions will be generated based on the fetched data. */

export enum SwapMode {
  ONCHAIN = 'Market',
  XPLASWAP = 'Xplaswap',
  ASTROPORT = 'Astroport',
  ROUTESWAP = 'Route',
}

export interface SwapAssets {
  offerAsset: Token;
  askAsset: Token;
}

export interface SwapParams extends SwapAssets, Partial<SwapSpread> {
  amount: Amount;
}

/* simulated */
// rate: original ratio
// ratio: simulated ratio
// price: simulated ratio to print considering `decimals`
// belief_price: ratio to 18 decimal points
export interface SimulateResult<T = any> {
  mode: SwapMode;
  query: SwapParams;
  value: Amount;
  ratio: string;
  rate?: string;
  payload: T;
}

export type PayloadOnchain = Amount; // spread
export type PayloadXplaswap = Amount; // fee
export type PayloadRouteswap = string[];

const useSwapUtils = () => {
  const address = useAddress();
  const lcd = useLCDClient();
  const context = useSwap();
  const { exchangeRates, pairs, contracts } = context;

  /* helpers */
  // xplaswap
  const findPair = useCallback(
    (assets: SwapAssets, dex: Dex) => {
      const { offerAsset, askAsset } = assets;
      const pair = Object.entries(pairs).find(([, item]) =>
        [offerAsset, askAsset].every(
          (asset) => dex === item.dex && item.assets.includes(asset),
        ),
      );

      if (!pair) return;

      const [address, item] = pair;
      return { address, ...item };
    },
    [pairs],
  );

  /* determine swap mode */
  const getIsOnchainAvailable = useCallback(
    ({ offerAsset, askAsset }: SwapAssets) => {
      return [offerAsset, askAsset].every(isDenomXplaNative);
    },
    [],
  );

  const getIsXplaswapAvailable = useCallback(
    (assets: SwapAssets) => !!findPair(assets, 'xplaswap'),
    [findPair],
  );

  const getIsAstroportAvailable = useCallback(
    (assets: SwapAssets) => !!findPair(assets, 'astroport'),
    [findPair],
  );

  const getIsRouteswapAvaialble = useCallback(
    (assets: SwapAssets) => {
      if (!contracts) return false;
      if (getIsOnchainAvailable(assets)) return false;
      if (getIsXplaswapAvailable(assets)) return false;

      const r0 =
        getIsOnchainAvailable({ ...assets, askAsset: 'uusd' }) ||
        getIsXplaswapAvailable({ ...assets, askAsset: 'uusd' });

      const r1 =
        getIsOnchainAvailable({ ...assets, offerAsset: 'uusd' }) ||
        getIsXplaswapAvailable({ ...assets, offerAsset: 'uusd' });

      return r0 && r1;
    },
    [contracts, getIsOnchainAvailable, getIsXplaswapAvailable],
  );

  const getAvailableSwapModes = useCallback(
    (assets: Partial<SwapAssets>): SwapMode[] => {
      if (!validateAssets(assets)) return [];

      const functions = {
        [SwapMode.ONCHAIN]: getIsOnchainAvailable,
        [SwapMode.XPLASWAP]: getIsXplaswapAvailable,
        [SwapMode.ASTROPORT]: getIsAstroportAvailable,
        [SwapMode.ROUTESWAP]: getIsRouteswapAvaialble,
      };

      return Object.entries(functions)
        .filter(([, fn]) => fn(assets))
        .map(([key]) => key as SwapMode);
    },
    [
      getIsOnchainAvailable,
      getIsXplaswapAvailable,
      getIsAstroportAvailable,
      getIsRouteswapAvaialble,
    ],
  );

  const getIsSwapAvailable = (assets: Partial<SwapAssets>) =>
    !!getAvailableSwapModes(assets).length;

  /* swap mode for multiple swap */
  const getSwapMode = useCallback(
    (assets: SwapAssets) => {
      const { askAsset } = assets;
      if (isDenomXpla(askAsset)) {
        return getIsXplaswapAvailable(assets)
          ? SwapMode.XPLASWAP
          : SwapMode.ROUTESWAP;
      }

      return SwapMode.ONCHAIN;
    },
    [getIsXplaswapAvailable],
  );

  /* simulate | execute */
  type SimulateFn<T = any> = (params: SwapParams) => Promise<SimulateResult<T>>;
  const getOnchainParams = useCallback(
    ({ amount, offerAsset, askAsset, minimum_receive }: SwapParams) => {
      if (!address) return { msgs: [] };

      const getAssertMessage = () => {
        if (!getAssertRequired({ offerAsset, askAsset })) return;
        if (!(contracts?.assertLimitOrder && minimum_receive)) return;

        return new MsgExecuteContract(address, contracts.assertLimitOrder, {
          assert_limit_order: {
            offer_coin: { denom: offerAsset, amount },
            ask_denom: askAsset,
            minimum_receive,
          },
        });
      };

      const assert = getAssertMessage();
      const offerCoin = new Coin(offerAsset, amount);
      const swap = new MsgSwap(address, offerCoin, askAsset);
      return { msgs: assert ? [assert, swap] : [swap] };
    },
    [address, contracts],
  );

  const simulateOnchain = async (params: SwapParams) => {
    const getRate = (denom: CoinDenom) =>
      isDenomXpla(denom) ? '1' : getAmount(exchangeRates, denom);

    const { amount, offerAsset, askAsset } = params;
    const offerCoin = new Coin(offerAsset, amount);
    const res = await lcd.market.swapRate(offerCoin, askAsset);
    const result = res.amount.toString();

    /* spread */
    const offerRate = getRate(offerAsset);
    const askRate = getRate(askAsset);
    const rate = new BigNumber(offerRate).div(askRate);
    const value = new BigNumber(amount).div(rate);
    const spread = value.minus(result).toString();

    if (!result) throw new Error('Simulation failed');

    const ratio = toPrice(new BigNumber(amount).div(result));

    return {
      mode: SwapMode.ONCHAIN,
      query: params,
      value: result,
      ratio,
      rate: toPrice(rate),
      payload: spread,
    };
  };

  const getXplaswapParams = useCallback(
    (params: SwapParams, dex: Dex) => {
      const { amount, offerAsset, askAsset, belief_price, max_spread } = params;
      const fromNative = isDenom(offerAsset);
      const pair = findPair({ offerAsset, askAsset }, dex);
      const offer_asset = toAsset(offerAsset, amount);

      if (!pair) throw new Error('Pair does not exist');
      const contract = fromNative ? pair.address : offerAsset;

      /* simulate */
      const query = { simulation: { offer_asset } };

      /* execute */
      const swap =
        belief_price && max_spread ? { belief_price, max_spread } : {};
      const executeMsg = fromNative
        ? { swap: { ...swap, offer_asset } }
        : { send: { amount, contract: pair.address, msg: toBase64({ swap }) } };
      const coins = fromNative
        ? new Coins({ [offerAsset]: amount })
        : undefined;
      const msgs = address
        ? [new MsgExecuteContract(address, contract, executeMsg, coins)]
        : [];

      return { pair, simulation: { contract: pair.address, query }, msgs };
    },
    [address, findPair],
  );

  const simulateXplaswap = async (
    params: SwapParams,
    dex: Dex = 'xplaswap',
  ) => {
    const mode = {
      xplaswap: SwapMode.XPLASWAP,
      astroport: SwapMode.ASTROPORT,
    }[dex];

    const query = params;

    const { amount } = params;
    const { pair, simulation } = getXplaswapParams(params, dex);

    if (pair.type === 'stable') {
      const { return_amount: value, commission_amount } =
        await lcd.wasm.contractQuery<{
          return_amount: Amount;
          commission_amount: Amount;
        }>(pair.address, simulation.query);

      const payload = commission_amount;
      const ratio = toPrice(new BigNumber(amount).div(value));
      return { mode, query, value, ratio, payload };
    } else {
      const { assets } = await lcd.wasm.contractQuery<{
        assets: [Asset, Asset];
      }>(simulation.contract, { pool: {} });

      const { pool, rate } = parsePool(params, assets);
      const { return_amount: value, commission_amount } = calcXyk(amount, pool);
      const payload = commission_amount;
      const ratio = toPrice(new BigNumber(amount).div(value));
      return { mode, query, value, ratio, rate, payload };
    }
  };

  const getAstroportParams = getXplaswapParams;
  const simulateAstroport = (params: SwapParams) =>
    simulateXplaswap(params, 'astroport');

  const getRouteswapParams = useCallback(
    (params: SwapParams) => {
      /* helper function */
      const createSwap = ({ offerAsset, askAsset }: SwapAssets) => {
        const offer_asset_info = toAssetInfo(offerAsset);
        const ask_asset_info = toAssetInfo(askAsset);
        const buyXpla = isDenomNative(offerAsset) && isDenomXpla(askAsset);
        return buyXpla || !getIsOnchainAvailable({ offerAsset, askAsset })
          ? { xpla_swap: { offer_asset_info, ask_asset_info } }
          : { native_swap: { offer_denom: offerAsset, ask_denom: askAsset } };
      };

      const { amount, offerAsset, askAsset, minimum_receive } = params;
      const fromNative = isDenom(offerAsset);
      if (!contracts?.routeswap) throw new Error('Routeswap is not available');

      const route = [offerAsset, 'uusd', askAsset];
      const operations = [
        createSwap({ offerAsset, askAsset: 'uusd' }),
        createSwap({ offerAsset: 'uusd', askAsset }),
      ];

      const options = minimum_receive && { minimum_receive };
      const swapOperations = { ...options, offer_amount: amount, operations };

      /* simulation */
      const simulation = { simulate_swap_operations: swapOperations };
      const execute = { execute_swap_operations: swapOperations };

      /* msgs */
      const routeswap = contracts.routeswap;
      const contract = fromNative ? routeswap : offerAsset;
      const executeMsg = fromNative
        ? execute
        : { send: { contract: routeswap, msg: toBase64(execute), amount } };
      const coins = fromNative ? [new Coin(offerAsset, amount)] : undefined;
      const msgs = address
        ? [new MsgExecuteContract(address, contract, executeMsg, coins)]
        : [];

      return { route, simulation, msgs };
    },
    [address, contracts?.routeswap, getIsOnchainAvailable],
  );

  const simulateRouteswap: SimulateFn<Token[]> = async (params: SwapParams) => {
    if (!contracts?.routeswap) throw new Error('Routeswap is not available');

    const { simulation, route } = getRouteswapParams(params);
    const { amount: value } = await lcd.wasm.contractQuery<{ amount: string }>(
      contracts.routeswap,
      simulation,
    );

    const ratio = toPrice(new BigNumber(params.amount).div(value));

    return {
      mode: SwapMode.ROUTESWAP,
      query: params,
      value,
      ratio,
      payload: route,
    };
  };

  const getSimulateFunction = (mode: SwapMode) => {
    const simulationFunctions = {
      [SwapMode.ONCHAIN]: simulateOnchain,
      [SwapMode.XPLASWAP]: simulateXplaswap,
      [SwapMode.ASTROPORT]: simulateAstroport,
      [SwapMode.ROUTESWAP]: simulateRouteswap,
    };

    return simulationFunctions[mode];
  };

  const getMsgsFunction = useCallback(
    (mode: SwapMode) => {
      const getMsgs = {
        [SwapMode.ONCHAIN]: (params: SwapParams) =>
          getOnchainParams(params).msgs,
        [SwapMode.XPLASWAP]: (params: SwapParams) =>
          getXplaswapParams(params, 'xplaswap').msgs,
        [SwapMode.ASTROPORT]: (params: SwapParams) =>
          getAstroportParams(params, 'astroport').msgs,
        [SwapMode.ROUTESWAP]: (params: SwapParams) =>
          getRouteswapParams(params).msgs,
      };

      return getMsgs[mode];
    },
    [
      getOnchainParams,
      getXplaswapParams,
      getAstroportParams,
      getRouteswapParams,
    ],
  );

  const getSimulateQuery = (params: Partial<SwapParams>) => ({
    queryKey: ['simulate.swap', params],
    queryFn: async () => {
      if (!validateParams(params)) throw new Error();
      const modes = getAvailableSwapModes(params);
      const functions = modes.map(getSimulateFunction);
      const queries = functions.map((fn) => fn(params));
      const responses = await Promise.allSettled(queries);
      const results = responses.map((result) => {
        if (result.status === 'rejected') throw new Error(result.reason);
        return result.value;
      });

      return {
        values: zipObj(modes, results),
        profitable: findProfitable(results),
      };
    },
    enabled: validateParams(params),
  });

  return {
    ...context,
    getIsSwapAvailable,
    getSwapMode,
    getAvailableSwapModes,
    getSimulateFunction,
    getSimulateQuery,
    getMsgsFunction,
  };
};

export default useSwapUtils;

/* type guard */
export const validateAssets = (
  assets: Partial<SwapAssets>,
): assets is Required<SwapAssets> => {
  const { offerAsset, askAsset } = assets;
  return !!offerAsset && !!askAsset && offerAsset !== askAsset;
};

export const validateParams = (
  params: Partial<SwapParams>,
): params is SwapParams => {
  const { amount, ...assets } = params;
  return has(amount) && validateAssets(assets);
};

/* determinant */
const getAssertRequired = ({ offerAsset, askAsset }: SwapAssets) =>
  [offerAsset, askAsset].some(isDenomNative) &&
  [offerAsset, askAsset].some(isDenomXpla);

/* helpers */
const findProfitable = (results: SimulateResult[]) => {
  const index = results.reduce(
    (acc, { value }, index) =>
      new BigNumber(value).gt(results[acc].value) ? index : acc,
    0,
  );

  return results[index];
};

/* calc */
const parsePool = (
  { offerAsset, askAsset }: SwapAssets,
  pairPool: [Asset, Asset],
) => {
  const pair = fromPairs(
    pairPool.map(toTokenItem).map(({ amount, token }) => [token, amount]),
  );

  const offerPool = pair[offerAsset];
  const askPool = pair[askAsset];
  const pool = [offerPool, askPool] as [string, string];
  const rate = toPrice(new BigNumber(pair[offerAsset]).div(pair[askAsset]));

  return { pool, rate };
};

const calcXyk = (amount: Amount, [offerPool, askPool]: [Amount, Amount]) => {
  const returnAmount = new BigNumber(amount)
    .times(askPool)
    .div(new BigNumber(amount).plus(offerPool))
    .integerValue(BigNumber.ROUND_FLOOR);

  const spreadAmount = new BigNumber(amount)
    .times(askPool)
    .div(offerPool)
    .minus(returnAmount)
    .integerValue(BigNumber.ROUND_FLOOR);

  const commissionAmount = returnAmount
    .times(XPLASWAP_COMMISSION_RATE)
    .integerValue(BigNumber.ROUND_FLOOR);

  return {
    return_amount: returnAmount.minus(commissionAmount).toString(),
    spread_amount: spreadAmount.toString(),
    commission_amount: commissionAmount.toString(),
  };
};
