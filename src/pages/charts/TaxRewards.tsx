import { capitalize } from '@mui/material';
import { readAmount, readDenom } from '@xpla.kitchen/utils';
import BigNumber from 'bignumber.js';
import { TooltipIcon } from 'components/display';
import { Select } from 'components/form';
import { Card } from 'components/layout';
import { useMemoizedPrices } from 'data/queries/oracle';
import { combineState } from 'data/query';
import { useCurrency } from 'data/settings/Currency';
import { Aggregate, useTaxRewards } from 'data/Xpla/XplaAPI';
import { head, last } from 'ramda';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';

import ChartContainer from './components/ChartContainer';
import Filter from './components/Filter';
import Range from './components/Range';

const TaxRewards = () => {
  const { t } = useTranslation();
  const currency = useCurrency();

  /* data */
  const [type, setType] = useState<Aggregate>(Aggregate.CUMULATIVE);
  const { data, ...result } = useTaxRewards(type);
  const { data: prices, ...priceState } = useMemoizedPrices('axpla');
  const state = combineState(result, priceState);

  /* render */
  const renderFilter = () => {
    return (
      <Filter>
        <Select
          value={type}
          onChange={(e) => setType(e.target.value as Aggregate)}
          small
        >
          {Object.values(Aggregate).map((type) => (
            <option value={type} key={type}>
              {capitalize(type)}
            </option>
          ))}
        </Select>
      </Filter>
    );
  };

  const calcValue = useCallback(
    (range: number) => {
      if (!(data && prices)) return;

      const sliced = data.slice(-1 * range).map(({ value }) => value);
      const h = head(sliced);
      const l = last(sliced);

      if (!(h && l)) return;

      const value = {
        [Aggregate.CUMULATIVE]: new BigNumber(l).minus(h).toString(),
        [Aggregate.PERIODIC]: BigNumber.sum(...sliced.slice(1)).toString(),
      }[type];

      const price = prices[currency];

      return new BigNumber(value).div(price).toString();
    },
    [currency, data, prices, type],
  );

  const render = () => {
    return (
      <Range>
        {(range) => {
          const filled = type === Aggregate.PERIODIC && !range;
          return (
            <ChartContainer
              type={type === Aggregate.CUMULATIVE || filled ? 'area' : 'bar'}
              filled={filled}
              result={data}
              total={calcValue(range)}
              unit={readDenom(currency)}
              range={range}
              formatValue={(value) => readAmount(value, { prefix: true })}
              formatY={(value) =>
                readAmount(value, { prefix: true, integer: true })
              }
            />
          );
        }}
      </Range>
    );
  };

  return (
    <Card
      {...state}
      title={
        <TooltipIcon
          content={t('Tax rewards distributed over the selected time period')}
        >
          {t('Tax rewards')}
        </TooltipIcon>
      }
      extra={renderFilter()}
      size="small"
    >
      {render()}
    </Card>
  );
};

export default TaxRewards;
