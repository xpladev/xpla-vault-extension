import { ReactNode, useEffect, useState } from 'react';
import classNames from 'classnames/bind';
import { Grid } from 'components/layout';
import { SearchInput } from 'components/form';
import styles from './WithSearchInput.module.scss';

const cx = classNames.bind(styles);

export type FilterType = 'all' | 'ibc' | 'cw' | 'erc';
export type Filter = {
  id: FilterType;
  name: string;
};

interface Props {
  gap?: number;
  nft?: boolean;
  children: (
    input: string,
    filter: FilterType | '',
    filterIBC: FilterType | '',
    filterCW: FilterType | '',
    filterERC: FilterType | '',
  ) => ReactNode;
}

const WithSearchInput = ({ gap, nft, children }: Props) => {
  const [input, setInput] = useState('');
  const [filter, setFilter] = useState<'all' | ''>('all');
  const [filterIBC, setFilterIBC] = useState<'ibc' | ''>('ibc');
  const [filterCW, setFilterCW] = useState<'cw' | ''>('cw');
  const [filterERC, setFilterERC] = useState<'erc' | ''>('erc');

  const defaultFilters: Filter[] = [
    {
      id: 'all',
      name: 'All',
    },
    {
      id: 'ibc',
      name: 'IBC Token',
    },
    {
      id: 'cw',
      name: nft ? 'CW-721' : 'CW-20',
    },
    {
      id: 'erc',
      name: nft ? 'ERC-721' : 'ERC-20',
    },
  ];

  const handleFilter = (id: FilterType) => {
    if (id === 'all') {
      if (filter === 'all') {
        setFilter('');
        setFilterIBC('');
        setFilterCW('');
        setFilterERC('');
      } else {
        setFilter('all');
        setFilterIBC('ibc');
        setFilterCW('cw');
        setFilterERC('erc');
      }
    } else if (id === 'ibc') {
      if (filterIBC === 'ibc') {
        setFilterIBC('');
        setFilter('');
      } else {
        setFilterIBC('ibc');

        if (filterCW === 'cw' && filterERC === 'erc') {
          setFilter('all');
        }
      }
    } else if (id === 'cw') {
      if (filterCW === 'cw') {
        setFilterCW('');
        setFilter('');
      } else {
        setFilterCW('cw');

        if (filterIBC === 'ibc' && filterERC === 'erc') {
          setFilter('all');
        }
      }
    } else {
      if (filterERC === 'erc') {
        setFilterERC('');
        setFilter('');
      } else {
        setFilterERC('erc');

        if (filterIBC === 'ibc' && filterCW === 'cw') {
          setFilter('all');
        }
      }
    }
  };

  const filters = nft
    ? defaultFilters.filter((item) => item.id !== 'ibc')
    : defaultFilters;

  return (
    <Grid gap={gap ?? 0}>
      <SearchInput
        value={input}
        onChange={(e) => setInput(e.target.value)}
        autoFocus
      />
      <div className={cx('filter-container')}>
        <div className={cx('filter-wrap')}>
          {filters.map((item) => (
            <button
              type="button"
              className={cx(
                'filter',
                item.id === 'all' && {
                  all: filter === 'all',
                },
                item.id === 'ibc' && {
                  ibc: filterIBC === 'ibc',
                },
                item.id === 'cw' && {
                  cw: filterCW === 'cw',
                },
                item.id === 'erc' && {
                  erc: filterERC === 'erc',
                },
              )}
              onClick={() => handleFilter(item.id)}
            >
              <span>{item.name}</span>
            </button>
          ))}
        </div>
      </div>
      {children(input, filter, filterIBC, filterCW, filterERC)}
    </Grid>
  );
};

export default WithSearchInput;
