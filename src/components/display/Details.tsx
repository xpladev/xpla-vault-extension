import { PropsWithChildren } from 'react';
import classNames from 'classnames';
import styles from './Details.module.scss';

const Details = ({
  className,
  children,
}: PropsWithChildren<{ className?: string }>) => {
  return (
    <div className={classNames(styles.component, className)}>{children}</div>
  );
};

export default Details;
