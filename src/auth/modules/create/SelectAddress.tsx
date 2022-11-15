import { useCreateWallet } from './CreateWalletWizard';
import { useEffect } from 'react';

const SelectAddress = () => {
  const { values, createWallet } = useCreateWallet();
  const { index } = values;

  useEffect(() => {
    createWallet(60, index);
  }, []);

  return <></>;
};

export default SelectAddress;
