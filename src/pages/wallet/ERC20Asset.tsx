import { ReactNode } from 'react';
import { useTokenBalanceERC20 } from 'data/queries/evm';
import { Props as AssetProps } from './Asset';

interface Props extends TokenItem {
  children: (item: AssetProps) => ReactNode;
}

const ERC20Asset = ({ children: render, ...item }: Props) => {
  const { token } = item;
  const { data: balance, ...state } = useTokenBalanceERC20(token);
  return <>{render({ ...item, ...state, balance })}</>;
};

export default ERC20Asset;
