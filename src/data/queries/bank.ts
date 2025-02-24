import { useQuery } from 'react-query';
import axios from 'axios';
import BigNumber from 'bignumber.js';
import { isDenomXplaNative, toAmount } from '@xpla.kitchen/utils';
import { Coins } from '@xpla/xpla.js';
import createContext from 'utils/createContext';
import { getAmount } from 'utils/coin';
import { queryKey, RefetchOptions, useIsClassic } from '../query';
import { useAddress, useNetwork } from '../wallet';
import { useLCDClient } from './lcdClient';

export const useSupply = () => {
  const { lcd } = useNetwork();

  return useQuery(
    [queryKey.bank.supply],
    async () => {
      // TODO: Pagination
      // Required when the number of results exceed 100
      const { data } = await axios.get<{ supply: CoinData[] }>(
        'cosmos/bank/v1beta1/supply', // FIXME: Import from xpla.js
        { baseURL: lcd },
      );

      return data.supply;
    },
    { ...RefetchOptions.INFINITY },
  );
};

// As a wallet app, native token balance is always required from the beginning.
export const [useBankBalance, BankBalanceProvider] =
  createContext<Coins>('useBankBalance');

export const useInitialBankBalance = () => {
  const address = useAddress();
  const lcd = useLCDClient();
  const isClassic = useIsClassic();

  return useQuery(
    [queryKey.bank.balance, address],
    async () => {
      if (!address) return new Coins();
      // TODO: Pagination
      // Required when the number of results exceed 100
      if (isClassic) {
        const [coins] = await lcd.bank.balance(address);
        return coins;
      }

      const [coins] = await lcd.bank.spendableBalances(address);
      return coins;
    },
    { ...RefetchOptions.DEFAULT },
  );
};

export const useBalances = () => {
  const address = useAddress();
  const lcd = useLCDClient();

  return useQuery(
    [queryKey.bank.balances, address],
    async () => {
      if (!address) return new Coins();
      const [coins] = await lcd.bank.balance(address);
      return coins;
    },
    { ...RefetchOptions.DEFAULT },
  );
};

export const useXplaNativeLength = () => {
  const bankBalance = useBankBalance();
  const amount = getAmount(bankBalance, 'axpla');

  if (new BigNumber(amount).lte(1)) {
    return 0;
  }

  return bankBalance?.toArray().filter(({ denom }) => isDenomXplaNative(denom))
    .length;
};

export const useIsWalletEmpty = () => {
  const length = useXplaNativeLength();
  return !length;
};

export const useIsGetXPLA = () => {
  const bankBalance = useBankBalance();
  const amount = getAmount(bankBalance, 'axpla');

  if (new BigNumber(amount).lt(toAmount(1))) {
    return true;
  }

  return false;
};
