import { QueryKey, useQuery, useQueryClient } from 'react-query';
import { atom, useSetRecoilState } from 'recoil';
import { LCDClient } from '@xpla/xpla.js';
import { useNetwork } from 'data/wallet';
import { getLocalSetting, SettingKey } from 'utils/localStorage';
import { useLCDClient } from './lcdClient';
import { useECDClient } from './ecdClient';
import { queryKey, RefetchOptions } from '../query';

interface LatestTx {
  txhash: string;
  redirectAfterTx?: { label: string; path: string };
  queryKeys?: QueryKey[];
  evm?: boolean;
}

export const latestTxState = atom<LatestTx>({
  key: 'latestTx',
  default: { txhash: '', evm: false },
});

export const isBroadcastingState = atom({
  key: 'isBroadcasting',
  default: false,
});

export const useTxInfo = ({ txhash, queryKeys, evm }: LatestTx) => {
  const setIsBroadcasting = useSetRecoilState(isBroadcastingState);
  const queryClient = useQueryClient();
  const lcd = useLCDClient();
  const ecd = useECDClient();

  return useQuery(
    [queryKey.tx.txInfo, txhash],
    async () => {
      if (evm) {
        const result = await ecd.tx.txInfo(txhash);
        return result;
      } else {
        const result = await lcd.tx.txInfo(txhash);
        if (result.code !== 0) {
          if (result.code === 5) {
            throw new Error('tx not found.');
          } else {
            return result;
          }
        }

        return result;
      }
    },
    {
      enabled: !!txhash,
      retry: true,
      retryDelay: 1000,
      onSettled: () => setIsBroadcasting(false),
      onSuccess: () => {
        queryKeys?.forEach((queryKey) => {
          queryClient.invalidateQueries(queryKey);
        });

        queryClient.invalidateQueries(queryKey.History);
        queryClient.invalidateQueries(queryKey.bank.balance);
        queryClient.invalidateQueries(queryKey.tx.create);
      },
    },
  );
};

export const useGasPrices = () => {
  const network = useNetwork();

  const gasAdjustment = getLocalSetting<number>(SettingKey.GasAdjustment);

  const config = {
    ...network,
    URL: network.lcd,
    gasAdjustment,
  };

  const lcd = new LCDClient(config);

  return useQuery(
    [network.lcd, 'gas-prices'],
    async () => {
      const gasPrices = lcd.gasPrices(await lcd.getGasPrices());
      return gasPrices;
    },
    { ...RefetchOptions.INFINITY },
  );
};
