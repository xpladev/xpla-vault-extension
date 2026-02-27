import { isDenomIBC } from '@xpla.kitchen/utils';
import { useQuery } from 'react-query';

import { queryKey, RefetchOptions } from '../query';
import { useLCDClient } from './lcdClient';

export const useIBCBaseDenom = (denom: Denom, enabled: boolean) => {
  const lcd = useLCDClient();

  return useQuery(
    [queryKey.ibc.denomTrace, denom],
    async () => {
      const [ibcDenom] = await lcd.ibcTransfer.denom(denom.replace('ibc/', ''));

      return ibcDenom.base;
    },
    { ...RefetchOptions.INFINITY, enabled: isDenomIBC(denom) && enabled },
  );
};
