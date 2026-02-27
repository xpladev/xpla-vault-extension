import ShortcutOutlinedIcon from '@mui/icons-material/ShortcutOutlined';
import axios from 'axios';
import { Button, InternalLink } from 'components/general';
import { ExtraActions } from 'components/layout';
import { ALCHEMY_PAY_API_URL } from 'config/environment';
import { useIsWalletEmpty } from 'data/queries/bank';
import { useAddress, useNetworkName } from 'data/wallet';
import { useTranslation } from 'react-i18next';
import { has } from 'utils/num';

import { Props } from './Asset';
import styles from './AssetActions.module.scss';

const AssetActions = ({ token, symbol, balance, erc20 }: Props) => {
  const { t } = useTranslation();

  const address = useAddress();
  const isWalletEmpty = useIsWalletEmpty();
  const networkName = useNetworkName();

  const handleBuy = async () => {
    const { data: resData } = await axios.get(
      `${ALCHEMY_PAY_API_URL}/api/alchemy/generate-link?address=${address}`,
    );

    const { data } = resData;
    const link = data.link;

    window.open(link, '_blank', 'noopener noreferrer');
  };

  return (
    <ExtraActions className={styles['asset-actions']}>
      {token === 'axpla' && networkName === 'mainnet' && (
        <Button className={styles['asset-btn']} onClick={handleBuy}>
          {t('Buy')}
        </Button>
      )}

      <InternalLink
        className={styles['asset-btn']}
        icon={<ShortcutOutlinedIcon style={{ fontSize: 18 }} />}
        to={erc20 ? `/evm/send?token=${token}` : `/send?token=${token}`}
        disabled={isWalletEmpty || !has(balance)}
      >
        {t('Send')}
      </InternalLink>
    </ExtraActions>
  );
};

export default AssetActions;
