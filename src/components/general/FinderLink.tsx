import { ForwardedRef, HTMLAttributes, PropsWithChildren } from 'react';
import { forwardRef } from 'react';
import classNames from 'classnames';
import { EvmAddress } from '@xpla/xpla.js';
import { truncate } from '@xpla.kitchen/utils';
import { EXPLORER } from 'config/constants';
import { useNetworkName } from 'data/wallet';
import { hexToBech32 } from 'utils/evm';
import ExternalLink from './ExternalLink';
import styles from './FinderLink.module.scss';

interface Props extends HTMLAttributes<HTMLAnchorElement> {
  value?: string;

  /* path (default: address) */
  block?: boolean;
  tx?: boolean;
  validator?: boolean;

  /* customize */
  short?: boolean;
}

const FinderLink = forwardRef(
  (
    { children, short, ...rest }: PropsWithChildren<Props>,
    ref: ForwardedRef<HTMLAnchorElement>,
  ) => {
    const { block, tx, validator, ...attrs } = rest;
    const networkName = useNetworkName();
    let path = tx
      ? 'tx'
      : block
      ? 'block'
      : validator
      ? 'validator'
      : 'address';

    const temp = rest.value ?? children;
    const tempValue = temp ? temp.toString() : '';
    let value = tempValue;

    if (path === 'tx') {
      if (tempValue.startsWith('0x')) {
        path = 'evmtx';
      }
    } else if (path === 'address') {
      value = EvmAddress.validate(tempValue)
        ? hexToBech32('xpla', tempValue)
        : tempValue;
    }

    const link = [EXPLORER, networkName, path, value].join('/');
    const className = classNames(attrs.className, styles.link);

    return (
      <ExternalLink {...attrs} href={link} className={className} ref={ref} icon>
        {short && typeof children === 'string' ? truncate(children) : children}
      </ExternalLink>
    );
  },
);

export default FinderLink;
