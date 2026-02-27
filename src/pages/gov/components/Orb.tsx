import { readPercent } from '@xpla.kitchen/utils';
import BigNumber from 'bignumber.js';
import classNames from 'classnames/bind';

import styles from './Orb.module.scss';
import { ReactComponent as Tilde } from './Tilde.svg';

const cx = classNames.bind(styles);

const Orb = ({ ratio, size }: { ratio: number; size?: 'large' }) => {
  const height = readPercent(BigNumber.min(ratio, 1));

  return (
    <div className={cx(styles.orb, size)}>
      <div className={styles.filled} style={{ height }}>
        {!!ratio && <Tilde className={styles.tilde} />}
      </div>
    </div>
  );
};

export default Orb;
