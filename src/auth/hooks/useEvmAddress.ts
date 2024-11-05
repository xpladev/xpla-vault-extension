import { bech32ToEip55 } from 'utils/evm';
import useAuth from './useAuth';

const useEvmAddress = () => {
  const { wallet } = useAuth();

  if (wallet?.address) {
    return bech32ToEip55(wallet.address);
  }

  return undefined;
};

export default useEvmAddress;
