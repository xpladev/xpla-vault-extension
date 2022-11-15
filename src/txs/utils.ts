import BigNumber from 'bignumber.js';
import { readAmount, toAmount } from '@xpla.kitchen/utils';
import { Coin, Coins } from '@xpla/xpla.js';
import { has } from 'utils/num';

export const getPlaceholder = (decimals = 6) => '0.'.padEnd(decimals + 2, '0');

export const toInput = (amount: BigNumber.Value, decimals = 18) =>
  new BigNumber(readAmount(amount, { decimals })).toString();

/* field array (coins) */
export interface CoinInput {
  input?: string;
  denom: CoinDenom;
}

export const getCoins = (coins: CoinInput[]) => {
  return new Coins(
    coins
      .map(({ input, denom }) => ({ amount: toAmount(input), denom }))
      .filter(({ amount }) => has(amount))
      .map(({ amount, denom }) => new Coin(denom, amount)),
  );
};
