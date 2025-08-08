import { PropsWithChildren } from 'react';
import classNames from 'classnames/bind';
import styles from './ExtraActions.module.scss';

const cx = classNames.bind(styles);

interface Props {
  align?: 'stretch' | 'end' | 'center';
  className?: string;
}

const ExtraActions = ({
  children,
  className,
  ...props
}: PropsWithChildren<Props>) => {
  const { align = 'end' } = props;
  return <div className={cx(styles.actions, align, className)}>{children}</div>;
};

export default ExtraActions;
