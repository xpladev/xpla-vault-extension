import { AccAddress, EvmAddress } from '@xpla/xpla.js';
import { combineState } from 'data/query';
import {
  useCustomTokensERC20,
  useCustomTokensIBC,
} from 'data/settings/CustomTokens';
import { useCustomTokensCW20 } from 'data/settings/CustomTokens';
import {
  useIBCWhitelist,
  useCW20Whitelist,
  useERC20WhiteList,
} from 'data/Xpla/XplaAssets';
import { useTokenInfoCW20 } from 'data/queries/wasm';
import { Fetching } from 'components/feedback';
import WithSearchInput, { FilterType } from './WithSearchInput';
import TokenList from './TokenList';
import { useContractInfoERC20 } from 'data/queries/evm';

interface Props {
  whitelist: { ibc: IBCWhitelist; cw20: CW20Whitelist; erc20: ERC20Whitelist };
  keyword: string;
  filter: FilterType | '';
  filterIBC: FilterType | '';
  filterCW: FilterType | '';
  filterERC: FilterType | '';
}

const Component = ({
  whitelist,
  keyword,
  filter,
  filterIBC,
  filterCW,
  filterERC,
}: Props) => {
  const ibc = useCustomTokensIBC();
  const cw20 = useCustomTokensCW20();
  const erc20 = useCustomTokensERC20();

  type AddedIBC = Record<string, CustomTokenIBC>;
  type AddedCW20 = Record<XplaAddress, CustomTokenCW20>;
  type AddERC20 = Record<EvmAddress, CustomTokenERC20>;
  const added = {
    ibc: ibc.list.reduce<AddedIBC>(
      (acc, item) => ({ ...acc, [item.denom.replace('ibc/', '')]: item }),
      {},
    ),
    cw20: cw20.list.reduce<AddedCW20>(
      (acc, item) => ({ ...acc, [item.token]: item }),
      {},
    ),
    erc20: erc20.list.reduce<AddERC20>(
      (acc, item) => ({ ...acc, [item.token]: item }),
      {},
    ),
  };

  const mergedAll = {
    ...added.ibc,
    ...added.cw20,
    ...added.erc20,
    ...whitelist.ibc,
    ...whitelist.cw20,
    ...whitelist.erc20,
  };

  const mergedIBC = { ...added.ibc, ...whitelist.ibc };
  const mergedCW = { ...added.cw20, ...whitelist.cw20 };
  const mergedERC = { ...added.erc20, ...whitelist.erc20 };

  let merged: {
    [x: string]:
      | CustomTokenIBC
      | IBCTokenItem
      | CustomTokenCW20
      | CustomTokenERC20
      | CW20TokenItem
      | ERC20TokenItem;
  } = {};

  if (filter === 'all') {
    merged = mergedAll;
  }

  if (filter === '' && filterIBC === 'ibc') {
    merged = { ...mergedIBC };
  }

  if (filter === '' && filterCW === 'cw') {
    merged = { ...merged, ...mergedCW };
  }

  if (filter === '' && filterERC === 'erc') {
    merged = { ...merged, ...mergedERC };
  }

  // const merged =
  //   filter === 'all'
  //     ? {
  //         ...added.ibc,
  //         ...added.cw20,
  //         ...added.erc20,
  //         ...whitelist.ibc,
  //         ...whitelist.cw20,
  //         ...whitelist.erc20,
  //       }
  //     : filter === 'ibc'
  //     ? { ...added.ibc, ...whitelist.ibc }
  //     : filter === 'cw'
  //     ? { ...added.cw20, ...whitelist.cw20 }
  //     : filter === 'erc'
  //     ? { ...added.erc20, ...whitelist.erc20 }
  //     : {};

  // if listed
  const listedItem = merged[keyword];

  // if not listed
  const { data: tokenInfo, ...tokenInfoState } = useTokenInfoCW20(
    !listedItem ? keyword : '',
  );

  const { data: erc20Info, ...erc20InfoState } = useContractInfoERC20(
    !listedItem ? keyword : '',
  );

  const state = combineState(tokenInfoState, erc20InfoState);

  const responseItem = tokenInfo
    ? { token: keyword, ...tokenInfo }
    : erc20Info
    ? { token: keyword, ...erc20Info }
    : undefined;

  // conclusion
  const result = listedItem ?? responseItem;

  const results =
    AccAddress.validate(keyword) || EvmAddress.validate(keyword)
      ? result
        ? [result]
        : []
      : Object.values(merged).filter((item) => {
          if ('base_denom' in item) {
            // IBC
            const { base_denom } = item;
            return base_denom.includes(keyword.toLowerCase());
          } else {
            // CW20 or ERC20
            const { symbol, name } = item;
            return [symbol, name].some((word) =>
              word?.toLowerCase().includes(keyword.toLowerCase()),
            );
          }
        });

  const manage = {
    list: [...ibc.list, ...cw20.list, ...erc20.list],
    getIsAdded: (item: CustomTokenIBC | CustomTokenCW20) => {
      if ('base_denom' in item) return ibc.getIsAdded(item);
      else if (item.token.startsWith('xpla')) return cw20.getIsAdded(item);
      else return erc20.getIsAdded(item);
    },
    add: (item: CustomTokenIBC | CustomTokenCW20) => {
      if ('base_denom' in item) return ibc.add(item);
      else if (item.token.startsWith('xpla')) return cw20.add(item);
      else return erc20.add(item);
    },
    remove: (item: CustomTokenIBC | CustomTokenCW20) => {
      if ('base_denom' in item) return ibc.remove(item);
      else if (item.token.startsWith('xpla')) return cw20.remove(item);
      else return erc20.remove(item);
    },
  };

  const renderTokenItem = (
    item: CustomTokenIBC | CustomTokenCW20 | CustomTokenERC20,
  ) => {
    if ('base_denom' in item) {
      const { symbol, denom, ...rest } = item;
      return { ...rest, token: denom, title: symbol, key: denom };
    } else {
      const { token, symbol, ...rest } = item;
      return { ...rest, token, title: symbol, contract: token, key: token };
    }
  };

  return (
    <TokenList
      {...state}
      {...manage}
      results={results}
      renderTokenItem={renderTokenItem}
    />
  );
};

const ManageCustomTokens = () => {
  const { data: ibc, ...ibcWhitelistState } = useIBCWhitelist();
  const { data: cw20, ...cw20WhitelistState } = useCW20Whitelist();
  const { data: erc20, ...erc2WiteListState } = useERC20WhiteList();
  const state = combineState(
    ibcWhitelistState,
    cw20WhitelistState,
    erc2WiteListState,
  );

  const render = () => {
    if (!(ibc && cw20 && erc20)) return null;

    return (
      <WithSearchInput>
        {(input, filter, filterIBC, filterCW, filterERC) => (
          <Component
            whitelist={{ ibc, cw20, erc20 }}
            keyword={input}
            filter={filter}
            filterIBC={filterIBC}
            filterCW={filterCW}
            filterERC={filterERC}
          />
        )}
      </WithSearchInput>
    );
  };

  return (
    <Fetching {...state} height={2}>
      {render()}
    </Fetching>
  );
};

export default ManageCustomTokens;
