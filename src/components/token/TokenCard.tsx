import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import { FormatConfig } from '@xpla.kitchen/utils';
import classNames from 'classnames/bind';
import { useCurrency } from 'data/settings/Currency';
import { PropsWithChildren } from 'react';
import { getMaxHeightStyle } from 'utils/style';

import { Flex } from '../layout';
import Read from './Read';
import styles from './TokenCard.module.scss';
import TokenIcon from './TokenIcon';

interface Props extends Partial<TokenItem>, Partial<FormatConfig> {
  // customizable
  token: Token;
  amount?: Amount;
  balance?: Amount;
  className?: string;
  value?: Value;
  valueCurrency?: Token;
  valueConfig?: Partial<FormatConfig>;
}

// Where to use:
// 1. Swap form
// 2. Withdraw rewards
// 3. others - if too many tokens to display on the screen
const TokenCard = ({ token, icon, symbol, name, balance, ...props }: Props) => {
  const { amount = balance, value, className, ...rest } = props;
  const { valueCurrency, valueConfig, ...config } = rest;
  const currency = useCurrency();

  return (
    <article className={classNames(styles.item, className)}>
      <Flex start gap={10} className={styles.main}>
        <div className={styles.wrapper}>
          <TokenIcon token={token} icon={icon} />
        </div>

        <header className={styles.detail}>
          <h1 className={styles.title}>{symbol}</h1>
          {name && <h2 className={styles.name}>{name}</h2>}
        </header>
      </Flex>

      {amount && (
        <footer className={styles.footer}>
          <p className={styles.balance}>
            {balance && <AccountBalanceWalletIcon fontSize="inherit" />}
            <Read amount={amount} {...config} />
          </p>

          {value && (
            <Read
              amount={value}
              denom={valueCurrency ?? currency}
              className="muted"
              auto
              approx
              block
              {...valueConfig}
            />
          )}
        </footer>
      )}
    </article>
  );
};

export default TokenCard;

/* layout */
interface GridProps {
  maxHeight?: number | true;
}

export const TokenCardGrid = (props: PropsWithChildren<GridProps>) => {
  const { children, maxHeight } = props;

  return (
    <section className={styles.grid} style={getMaxHeightStyle(maxHeight, 320)}>
      {children}
    </section>
  );
};
