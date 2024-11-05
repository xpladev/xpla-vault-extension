import { useTranslation } from 'react-i18next';
import { flatten, uniq } from 'ramda';
import MonetizationOnOutlinedIcon from '@mui/icons-material/MonetizationOnOutlined';
import ShortcutOutlinedIcon from '@mui/icons-material/ShortcutOutlined';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import { isDenomXplaNative } from '@xpla.kitchen/utils';
import { has } from 'utils/num';
import { useIsClassic } from 'data/query';
import { useIsWalletEmpty } from 'data/queries/bank';
import { useCW20Pairs } from 'data/Xpla/XplaAssets';
import { InternalButton, InternalLink } from 'components/general';
import { ExtraActions } from 'components/layout';
import { ModalButton } from 'components/feedback';
import Buy from './Buy';
import { Props } from './Asset';

const AssetActions = ({ token, symbol, balance, erc20 }: Props) => {
  const { t } = useTranslation();
  const isWalletEmpty = useIsWalletEmpty();
  const isClassic = useIsClassic();
  const getIsSwappableToken = useGetIsSwappableToken();

  return (
    <ExtraActions>
      {/* {!isClassic && token === 'axpla' && (
        <ModalButton
          title={t('Buy {{symbol}}', { symbol })}
          renderButton={(open) => (
            <InternalButton
              icon={<MonetizationOnOutlinedIcon style={{ fontSize: 18 }} />}
              onClick={open}
            >
              {t('Buy')}
            </InternalButton>
          )}
          maxHeight={false}
        >
          <Buy token={token} />
        </ModalButton>
      )} */}

      <InternalLink
        icon={<ShortcutOutlinedIcon style={{ fontSize: 18 }} />}
        to={erc20 ? `/evm/send?token=${token}` : `/send?token=${token}`}
        disabled={isWalletEmpty || !has(balance)}
      >
        {t('Send')}
      </InternalLink>

      {isClassic && (
        <InternalLink
          icon={<RestartAltIcon style={{ fontSize: 18 }} />}
          to="/swap"
          state={token}
          disabled={
            isWalletEmpty || !has(balance) || !getIsSwappableToken(token)
          }
        >
          {t('Swap')}
        </InternalLink>
      )}
    </ExtraActions>
  );
};

export default AssetActions;

/* helpers */
const useGetIsSwappableToken = () => {
  const { data: pairs } = useCW20Pairs();

  return (token: XplaAddress) => {
    if (isDenomXplaNative(token)) return true;
    if (!pairs) return false;
    const xplaswapAvailableList = uniq(flatten(Object.values(pairs)));
    return xplaswapAvailableList.find(({ assets }) => assets.includes(token));
  };
};
