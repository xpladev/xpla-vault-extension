import { MnemonicKey } from '@xpla/xpla.js';
import { ReactNode, useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import createContext from 'utils/createContext';

import { addWallet } from '../../scripts/keystore';
import CreatedWallet from './CreatedWallet';
import CreateWalletForm from './CreateWalletForm';

export interface Values {
  name: string;
  password: string;
  mnemonic: string;
  index: number;
}

/* context */
interface CreateWallet {
  /* step */
  setStep: (index: number) => void;

  /* form values */
  generated: boolean;
  values: Values;
  setValues: (values: Values) => void;

  /* create wallet */
  createdWallet?: SingleWallet;
  createWallet: (coinType: Bip, index?: number) => void;
}

export const [useCreateWallet, CreateWalletProvider] =
  createContext<CreateWallet>('useCreateWallet');

interface Props {
  defaultMnemonic?: string;
  beforeCreate: ReactNode;
}

const DefaultValues = { name: '', password: '', mnemonic: '', index: 0 };

const CreateWalletWizard = ({ defaultMnemonic = '', beforeCreate }: Props) => {
  /* step */
  const location = useLocation();
  const navigate = useNavigate();
  const step = Number(location.hash.replace('#', '')) || 1;
  const setStep = (index: number) => navigate({ hash: String(index) });

  /* form values */
  const initial = { ...DefaultValues, mnemonic: defaultMnemonic };
  const [values, setValues] = useState(initial);

  /* create wallet */
  const [createdWallet, setCreatedWallet] = useState<SingleWallet>();
  // StrictMode에서 useEffect가 두 번 실행되는 것을 방지하기 위한 ref
  const isCreatingRef = useRef(false);
  const createWallet = (coinType: Bip, index = 0) => {
    if (isCreatingRef.current) return;
    isCreatingRef.current = true;
    const { name, password, mnemonic } = values;
    const mk = new MnemonicKey({ mnemonic, coinType, index });
    const address = mk.accAddress;
    addWallet({ name, password, address, key: Buffer.from(mk.privateKey) });
    setCreatedWallet({ name, address });
    setStep(3);
  };

  /* effect: reset memory on unmount */
  useEffect(() => {
    return () => {
      setValues(DefaultValues);
      setCreatedWallet(undefined);
    };
  }, [setValues]);

  /* render */
  const render = () => {
    switch (step) {
      case 1:
        return <CreateWalletForm />;

      case 2:
        if (!values.mnemonic) setStep(1);
        return beforeCreate;

      case 3:
        if (!createdWallet) return null;
        return <CreatedWallet {...createdWallet} />;
    }
  };

  const generated = !!defaultMnemonic;
  const value = {
    setStep,
    generated,
    values,
    setValues,
    createdWallet,
    createWallet,
  };

  return <CreateWalletProvider value={value}>{render()}</CreateWalletProvider>;
};

export default CreateWalletWizard;
