import { useEffect } from 'react';

import { useCreateWallet } from './CreateWalletWizard';

const SelectAddress = () => {
  const { values, createWallet } = useCreateWallet();
  const { index } = values;

  useEffect(() => {
    createWallet(60, index);
  }, []);

  return <></>;
};

export default SelectAddress;
