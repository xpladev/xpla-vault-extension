import { useMemo } from 'react';
import { ECDClient } from '@xpla/xpla.js';
import { useNetwork } from 'data/wallet';

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
