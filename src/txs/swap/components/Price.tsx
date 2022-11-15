import BigNumber from 'bignumber.js';
import { Read } from 'components/token';
import { SwapAssets } from '../useSwapUtils';

interface Props extends SwapAssets {
  price?: string;
  className?: string;
}

const Price = ({ price, offerAsset, askAsset, className }: Props) => {
  if (!price) return null;

  return new BigNumber(price).gt(1) ? (
    <span className={className}>
      <Read amount={String(1)} token={askAsset} decimals={0} /> ={' '}
      <Read amount={price} token={offerAsset} decimals={0} auto />
    </span>
  ) : (
    <span className={className}>
      <Read amount={String(1)} token={offerAsset} decimals={0} /> ={' '}
      <Read
        amount={new BigNumber(1).div(price).toString()}
        token={askAsset}
        decimals={0}
        auto
      />
    </span>
  );
};

export default Price;
