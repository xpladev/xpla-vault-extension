import { AccAddress, EvmAddress } from '@xpla/xpla.js';
import {
  useCustomTokensCW721,
  useCustomTokensERC721,
} from 'data/settings/CustomTokens';
import { useCW721Whitelist, useERC721Whitelist } from 'data/Xpla/XplaAssets';
import { useContractInfoERC721 } from 'data/queries/evm';
import { useInitMsg } from 'data/queries/wasm';
import { Fetching } from 'components/feedback';
import WithSearchInput, { FilterType } from './WithSearchInput';
import TokenList from './TokenList';
import { combineState } from 'data/query';

interface Props {
  whitelist: { cw721: CW721Whitelist; erc721: ERC721Whitelist };
  keyword: string;
  filter: FilterType | '';
  filterCW: FilterType | '';
  filterERC: FilterType | '';
}

const Component = ({
  whitelist,
  keyword,
  filter,
  filterCW,
  filterERC,
}: Props) => {
  const cw721 = useCustomTokensCW721();
  const erc721 = useCustomTokensERC721();

  type AddedCW721 = Record<XplaAddress, CustomTokenCW721>;
  type AddedERC721 = Record<EvmAddress, CustomTokenERC721>;
  const added = {
    cw721: cw721.list.reduce<AddedCW721>(
      (acc, item) => ({ ...acc, [item.contract]: item }),
      {},
    ),
    erc721: erc721.list.reduce<AddedERC721>(
      (acc, item) => ({ ...acc, [item.contract]: item }),
      {},
    ),
  };

  const mergedAll = {
    ...added.cw721,
    ...added.erc721,
    ...whitelist.cw721,
    ...whitelist.erc721,
  };

  const mergedCW = {
    ...added.cw721,
    ...whitelist.cw721,
  };

  const mergedERC = {
    ...added.erc721,
    ...whitelist.erc721,
  };

  let merged: {
    [x: string]:
      | CW721ContractItem
      | ERC721ContractItem
      | CustomTokenCW721
      | CustomTokenERC721;
  } = {};

  if (filter === 'all') {
    merged = mergedAll;
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
  //         ...added.cw721,
  //         ...added.erc721,
  //         ...whitelist.cw721,
  //         ...whitelist.erc721,
  //       }
  //     : filter === 'cw'
  //     ? {
  //         ...added.cw721,
  //         ...whitelist.cw721,
  //       }
  //     : filter === 'erc'
  //     ? {
  //         ...added.erc721,
  //         ...whitelist.erc721,
  //       }
  //     : {};

  // if listed
  const listedItem = merged[keyword];

  // if not listed
  const { data: initMsg, ...initMsgState } =
    useInitMsg<CW721ContractInfoResponse>(!listedItem ? keyword : '');

  // if not listed
  const { data: erc721Info, ...erc721InfoState } = useContractInfoERC721(
    !listedItem ? keyword : '',
  );

  const state = combineState(initMsgState, erc721InfoState);

  const responseItem = initMsg
    ? { contract: keyword, ...initMsg }
    : erc721Info
    ? { contract: keyword, ...erc721Info }
    : undefined;

  // conclusion
  const result = listedItem ?? responseItem;

  // list
  const results =
    AccAddress.validate(keyword) || EvmAddress.validate(keyword)
      ? result
        ? [result]
        : []
      : Object.values(merged).filter(({ name, symbol }) =>
          [symbol, name].some((word) =>
            word?.toLowerCase().includes(keyword.toLowerCase()),
          ),
        );

  const manage = {
    list: [...cw721.list, ...erc721.list],
    getIsAdded: (item: CustomTokenCW721 | CustomTokenERC721) => {
      if (item.contract.startsWith('xpla')) return cw721.getIsAdded(item);
      else return erc721.getIsAdded(item);
    },
    add: (item: CustomTokenCW721 | CustomTokenERC721) => {
      if (item.contract.startsWith('xpla')) return cw721.add(item);
      else return erc721.add(item);
    },
    remove: (item: CustomTokenCW721 | CustomTokenERC721) => {
      if (item.contract.startsWith('xpla')) return cw721.remove(item);
      else return erc721.remove(item);
    },
  };

  return (
    <TokenList
      {...state}
      {...manage}
      results={results}
      renderTokenItem={({ contract, name, ...rest }) => {
        return {
          ...rest,
          token: contract,
          title: name,
          contract,
          key: contract,
        };
      }}
      nft
    />
  );
};

const ManageCustomTokensCW721 = () => {
  const { data: cw721, ...cw721State } = useCW721Whitelist();
  const { data: erc721, ...erc721State } = useERC721Whitelist();

  const state = combineState(cw721State, erc721State);

  return (
    <Fetching {...state} height={2}>
      {cw721 && erc721 && (
        <WithSearchInput nft>
          {(input, filter, _, filterCW, filterERC) => (
            <Component
              whitelist={{ cw721, erc721 }}
              keyword={input}
              filter={filter}
              filterCW={filterCW}
              filterERC={filterERC}
            />
          )}
        </WithSearchInput>
      )}
    </Fetching>
  );
};

export default ManageCustomTokensCW721;
