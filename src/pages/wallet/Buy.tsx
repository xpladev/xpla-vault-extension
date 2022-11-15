import { useTranslation } from 'react-i18next';
import qs from 'qs';
import { readDenom } from '@xpla.kitchen/utils';
import { ReactComponent as Binance } from 'styles/images/exchanges/Binance.svg';
import { ReactComponent as KuCoin } from 'styles/images/exchanges/KuCoin.svg';
import { ReactComponent as Huobi } from 'styles/images/exchanges/Huobi.svg';
import { ReactComponent as Bitfinex } from 'styles/images/exchanges/Bitfinex.svg';
import { ReactComponent as Kraken } from 'styles/images/exchanges/Kraken.svg';
import Transak from 'styles/images/exchanges/Transak.png';
import Kado from 'styles/images/exchanges/Kado.svg';
import { ListGroup } from 'components/display';

export const exchanges = {
  axpla: [],
};

const TRANSAK_URL = 'https://global.transak.com';
const TRANSAK_API_KEY = 'f619d86d-48e0-4f2f-99a1-f827b719ac0b';
const KADO_URL = 'https://ramp.kado.money';

const getTransakLink = (denom: 'axpla') => {
  const queryString = qs.stringify(
    {
      apiKey: TRANSAK_API_KEY,
      cryptoCurrencyList: 'XPLA',
      defaultCryptoCurrency: readDenom(denom).toUpperCase(),
      networks: 'xpla',
    },
    { skipNulls: true, encode: false },
  );

  return `${TRANSAK_URL}/?${queryString}`;
};

const Buy = ({ token }: { token: 'axpla' }) => {
  const { t } = useTranslation();
  // const TRANSAK = {
  //   children: 'Transak',
  //   href: getTransakLink(token),
  //   icon: <img src={Transak} alt="" width={24} height={24} />,
  // };

  // const KADO = {
  //   children: 'Kado Ramp',
  //   href: KADO_URL,
  //   icon: <img src={Kado} alt="Kado Ramp" width={24} height={24} />,
  // };

  return (
    <ListGroup
      groups={[
        {
          title: t('Exchanges'),
          list: exchanges[token],
        },
        {
          title: t('Fiat'),
          list: [],
        },
      ]}
    />
  );
};

export default Buy;
