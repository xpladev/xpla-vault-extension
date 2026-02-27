import axios from 'axios';
import { ASSETS } from 'config/constants';
import { useCustomNetworks } from 'data/settings/CustomNetworks';
import { fromPairs } from 'ramda';
import { PropsWithChildren, useEffect, useState } from 'react';
import createContext from 'utils/createContext';

export const [useNetworks, NetworksProvider] =
  createContext<CustomNetworks>('useNetworks');

const InitNetworks = ({ children }: PropsWithChildren<{}>) => {
  const [networks, setNetworks] = useState<CustomNetworks>();
  const { list } = useCustomNetworks();

  useEffect(() => {
    const fetchChains = async () => {
      const { data: chains } = await axios.get<XplaNetworks>('/chains.json', {
        baseURL: ASSETS,
      });

      const networks = {
        ...chains,
        localxpla: { ...chains.localxpla, preconfigure: true },
      };

      setNetworks({
        ...networks,
        ...fromPairs(list.map((item) => [item.name, item])),
      });
    };

    fetchChains();
  }, [list]);

  if (!networks) return null;
  return <NetworksProvider value={networks}>{children}</NetworksProvider>;
};

export default InitNetworks;
