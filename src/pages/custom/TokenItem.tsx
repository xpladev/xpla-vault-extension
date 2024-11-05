import { isNil } from 'ramda';
import { useTranslation } from 'react-i18next';
import classNames from 'classnames/bind';
import AddIcon from '@mui/icons-material/Add';
import CheckIcon from '@mui/icons-material/Check';
import { truncate } from '@xpla.kitchen/utils';
import { FinderLink } from 'components/general';
import { Token } from 'components/token';
import styles from './TokenItem.module.scss';

const cx = classNames.bind(styles);

export interface TokenItemProps {
  token: Token;
  title: string; // ibc:symbol | cw20:symbol | cw721:name
  icon?: string;
  contract?: XplaAddress; // cw20 | cw721
  decimals?: number;
  key: string;
  evm?: boolean;
  nft?: boolean;
}

interface Props extends TokenItemProps {
  added: boolean;
  onAdd: () => void;
  onRemove: () => void;
}

const TokenItem = ({ added, onAdd, onRemove, ...props }: Props) => {
  const { token, contract, decimals, ...rest } = props;
  const { evm, nft } = rest;
  const { t } = useTranslation();

  const link = contract && (
    <FinderLink value={contract}>
      {truncate(contract)}
      {!isNil(decimals) && `(${t('decimals')}: ${decimals ?? '6'})`}
    </FinderLink>
  );

  return (
    <Token
      {...rest}
      className={styles.item}
      token={token}
      description={link}
      extra={
        <button
          type="button"
          className={cx(styles.button, { added })}
          onClick={added ? onRemove : onAdd}
        >
          {added ? (
            <CheckIcon style={{ fontSize: 16 }} />
          ) : (
            <AddIcon style={{ fontSize: 16 }} />
          )}
        </button>
      }
      badge={true}
      evm={evm}
      nft={nft}
    />
  );
};

export default TokenItem;
