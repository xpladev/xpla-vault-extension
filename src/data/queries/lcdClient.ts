import { LCDClient } from '@xpla/xpla.js';
import { useIsClassic } from 'data/query';
import { useNetwork } from 'data/wallet';
import { useMemo } from 'react';

export const useLCDClient = () => {
  const network = useNetwork();
  const isClassic = useIsClassic();

  const lcdClient = useMemo(
    () => new LCDClient({ ...network, URL: network.lcd, isClassic }),
    [network, isClassic],
  );

  return lcdClient;
};
