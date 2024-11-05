import { HTMLAttributes, PropsWithChildren, ReactNode } from 'react';
import classNames from 'classnames/bind';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import { Grid } from '../layout';
import styles from './Form.module.scss';

const cx = classNames.bind(styles);

const Form = (attrs: HTMLAttributes<HTMLFormElement>) => {
  return <form {...attrs} className={styles.form} />;
};

export default Form;

/* arrow */
export const FormArrow = ({ onClick }: { onClick?: () => void }) => {
  return (
    <div className="center">
      {onClick ? (
        <button type="button" onClick={onClick}>
          <ArrowDownwardIcon />
        </button>
      ) : (
        <ArrowDownwardIcon />
      )}
    </div>
  );
};

/* group */
interface FormGroupProps {
  button?: { onClick: () => void; children: ReactNode };
  className?: string;
}

export const FormGroup = (props: PropsWithChildren<FormGroupProps>) => {
  const { children, button, className } = props;

  return (
    <div className={classNames(styles.group, className)}>
      {children}
      {button && <button type="button" className={styles.button} {...button} />}
    </div>
  );
};

interface FormItemProps {
  label?: ReactNode;
  extra?: ReactNode;
  tooltip?: ReactNode;
  error?: string;
  className?: string;
}

/* item */
export const FormItem = (props: PropsWithChildren<FormItemProps>) => {
  const { label, extra, tooltip, error, className, children } = props;

  return (
    <Grid gap={4} className={className}>
      <header className={styles.header}>
        {label && <label className={styles.label}>{label}</label>}
        <aside className={styles.extra}>
          {extra}
          {tooltip}
        </aside>
      </header>

      {children}

      {error && <p className={styles.error}>{error}</p>}
    </Grid>
  );
};

export const FormItemMemo = (props: PropsWithChildren<FormItemProps>) => {
  const { label, extra, tooltip, error, className, children } = props;

  return (
    <Grid gap={4} className={className}>
      <header className={styles.header}>
        {label && <label className={styles.label}>{label}</label>}
        <aside className={styles.extra}>
          {extra}
          {tooltip}
        </aside>
      </header>

      {children}

      <p className={cx('memo-notice', { warning: error === 'mnemonic' })}>
        <i>DON'T&nbsp;</i>write important, personal, private information in the
        memo. (<b>NEVER&nbsp;</b>include Mnemonic, phone number, secrets)
      </p>

      {error && (
        <>
          {error !== 'mnemonic' ? (
            <p className={styles.error}>{error}</p>
          ) : (
            <></>
          )}
        </>
      )}
    </Grid>
  );
};
