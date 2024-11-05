import { ReactNode } from 'react';
import { Flex } from '../layout';
import TokenIcon from './TokenIcon';
import TokenBadge from './TokenBadge';
import styles from './Token.module.scss';

interface Props extends Partial<TokenItem> {
  // customizable
  token: Token;
  extra?: ReactNode;
  className?: string;

  /* customize */
  title?: string;
  description?: ReactNode;

  /* badge */
  badge?: boolean;
  evm?: boolean;
  nft?: boolean;
}

// Custom token search result
const Token = ({ token, icon, symbol, name, ...props }: Props) => {
  const {
    extra,
    className,
    title = symbol,
    description,
    badge,
    evm,
    nft,
  } = props;

  return (
    <Flex start gap={12} className={className}>
      <TokenIcon token={token} icon={icon} />

      <header className={styles.header}>
        <div className={styles['tag-wrap']}>
          <h1 className={styles.title}>{title}</h1>
          {badge && (
            <TokenBadge
              className={styles.tag}
              token={token}
              evm={evm}
              nft={nft}
            />
          )}
        </div>

        {name && <h2 className={styles.name}>{name}</h2>}
        {description && <p className={styles.description}>{description}</p>}
      </header>

      {extra && <aside className={styles.extra}>{extra}</aside>}
    </Flex>
  );
};

export default Token;
