import { useTranslation } from 'react-i18next';
import { useIsClassic } from 'data/query';
import { useActiveDenoms } from 'data/queries/oracle';
import { readNativeDenom } from 'data/token';
import {
  useCustomTokensIBC,
  useCustomTokensERC20,
  useCustomTokensCW20,
} from 'data/settings/CustomTokens';
import { Button } from 'components/general';
import { Grid } from 'components/layout';
import { useCoins } from 'pages/wallet/Coins';
import IBCAsset from 'pages/wallet/IBCAsset';
import CW20Asset from 'pages/wallet/CW20Asset';
import ERC20Asset from 'pages/wallet/ERC20Asset';
import AddTokens from 'pages/wallet/AddTokens';
import Asset from './Asset';
import styles from './Assets.module.scss';

const Assets = () => {
  const { t } = useTranslation();
  const isClassic = useIsClassic();
  const { data: denoms, ...state } = useActiveDenoms();
  const coins = useCoins(denoms);
  const { list: ibc } = useCustomTokensIBC();
  const { list: cw20 } = useCustomTokensCW20();
  const { list: erc20 } = useCustomTokensERC20();

  if (!(coins && ibc && cw20 && erc20)) return null;

  const [all, filtered] = coins;
  const list = isClassic ? filtered : all;

  return (
    <Grid gap={16}>
      <div className={styles.assets}>
        {list.map((item) => {
          const { denom } = item;
          return (
            <Asset
              {...readNativeDenom(denom, isClassic)}
              {...item}
              key={denom}
            />
          );
        })}

        {!ibc.length
          ? null
          : ibc.map(({ denom }) => (
              <IBCAsset denom={denom} key={denom}>
                {(item) => <Asset {...item} />}
              </IBCAsset>
            ))}

        {!cw20.length
          ? null
          : cw20.map((item) => (
              <CW20Asset {...item} key={item.token}>
                {(item) => <Asset {...item} />}
              </CW20Asset>
            ))}

        {!erc20.length
          ? null
          : erc20.map((item) => (
              <ERC20Asset {...item} key={item.token}>
                {(item) => <Asset {...item} erc20 />}
              </ERC20Asset>
            ))}
      </div>

      <AddTokens>
        {(open) => <Button onClick={open}>{t('Manage List')}</Button>}
      </AddTokens>
    </Grid>
  );
};

export default Assets;
