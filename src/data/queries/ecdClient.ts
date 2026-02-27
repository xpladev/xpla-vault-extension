import { ECDClient } from '@xpla/xpla.js';
import { useNetwork } from 'data/wallet';
import { useMemo } from 'react';

export const useECDClient = () => {
  const network = useNetwork();

  const ecdClient = useMemo(
    () =>
      new ECDClient({
        URL: network.ecd,
        chainID: network.chainID,
        id: ECDClient.getIDfromChainID(network.chainID),
      }),
    [network],
  );

  return ecdClient;
};
