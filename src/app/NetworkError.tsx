import { useTranslation } from 'react-i18next';
import Logo from 'styles/images/LocalXpla.png';
import { useNetworkState } from 'data/wallet';
import { Button, ExternalLink } from 'components/general';
import { FlexColumn } from 'components/layout';
import styles from './NetworkError.module.scss';

const NetworkError = () => {
  const { t } = useTranslation();
  const [network, setNetwork] = useNetworkState();

  const isLocalXpla = network === 'localxpla';

  return (
    <FlexColumn gap={20}>
      <img src={Logo} alt={t('Logo')} width={60} height={60} />

      <article>
        <h1 className={styles.title}>
          {network === 'mainnet'
            ? t('Too many requests. Try again later.')
            : isLocalXpla
            ? t('LocalXpla is not running')
            : t(`${network} is not running`)}
        </h1>
      </article>

      {network === 'mainnet' ? (
        <Button onClick={() => window.location.reload()} size="small" outline>
          {t('Refresh')}
        </Button>
      ) : (
        <Button onClick={() => setNetwork('mainnet')} size="small" outline>
          {t('Back to mainnet')}
        </Button>
      )}
    </FlexColumn>
  );
};

export default NetworkError;
