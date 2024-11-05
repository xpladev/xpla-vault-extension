import { isDenomIBC, isDenomNative } from '@xpla.kitchen/utils';
import classNames from 'classnames/bind';
import styles from './TokenBadge.module.scss';

const cx = classNames.bind(styles);

interface Props {
  token?: string;
  evm?: boolean;
  nft?: boolean;
  className?: string;
}

const TokenBadge = ({ token, evm, nft, className }: Props) => {
  let title = '';

  if (isDenomNative(token)) title = 'Native';
  if (isDenomIBC(token)) title = 'IBC Token';
  if (!isDenomNative(token) && !isDenomIBC(token)) title = 'CW-20';
  if (evm) title = 'ERC-20';
  if (nft) title = 'CW-721';
  if (evm && nft) title = 'ERC-721';

  return (
    <span
      className={cx(
        'tag',
        className,
        evm
          ? { erc: true }
          : {
              native: isDenomNative(token),
              ibc: isDenomIBC(token),
              cw: (!isDenomNative(token) && !isDenomIBC(token)) || nft,
            },
      )}
    >
      {title}
    </span>
  );
};

export default TokenBadge;
