import axios from 'axios';
import { useNetwork } from 'data/wallet';
import { useQuery } from 'react-query';

import { queryKey, RefetchOptions } from '../query';

export const useNodeInfo = () => {
  const { lcd, name } = useNetwork();

  return useQuery(
    [queryKey.tendermint.nodeInfo, name],
    async () => {
      const { data } = await axios.get(
        '/cosmos/base/tendermint/v1beta1/node_info',
        { baseURL: lcd },
      );
      return data;
    },
    { ...RefetchOptions.INFINITY },
  );
};
