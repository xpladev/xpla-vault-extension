import { Flex } from 'components/layout';
import { Fetching, Empty } from 'components/feedback';
import TokenItem, { TokenItemProps } from './TokenItem';
import styles from './TokenList.module.scss';

interface Props<T> extends QueryState {
  results: T[];
  renderTokenItem: (item: T) => TokenItemProps;

  /* manage tokens */
  list: T[];
  getIsAdded: (item: T) => boolean;
  add: (item: T) => void;
  remove: (item: T) => void;

  nft?: boolean;
}

function TokenList<T extends { symbol: string }>(props: Props<T>) {
  const { list, getIsAdded, add, remove, ...rest } = props;
  const { results, renderTokenItem, nft, ...state } = rest;
  const empty = !state.isLoading && !results.length;

  return state.error || empty ? (
    <Flex className={styles.results}>
      <Empty />
    </Flex>
  ) : (
    <Fetching {...state} height={2}>
      <ul className={styles.results}>
        {results
          .sort((a, b) => Number(getIsAdded(b)) - Number(getIsAdded(a)))
          .map((item) => {
            const tokenItem = renderTokenItem(item);
            return (
              <li key={tokenItem.key}>
                <TokenItem
                  {...tokenItem}
                  added={getIsAdded(item)}
                  onAdd={() => add(item)}
                  onRemove={() => remove(item)}
                  evm={tokenItem.token.startsWith('0x')}
                  nft={nft}
                />
              </li>
            );
          })}
      </ul>
    </Fetching>
  );
}

export default TokenList;
