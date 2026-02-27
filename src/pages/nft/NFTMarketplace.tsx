import { ExternalLink } from 'components/general';
import { Card } from 'components/layout';
import { useCW721Marketplace } from 'data/Xpla/XplaAssets';
import { useTranslation } from 'react-i18next';

import styles from './NFTMarketplace.module.scss';

const NFTMarketplace = () => {
  const { t } = useTranslation();
  const { data, ...state } = useCW721Marketplace();

  return (
    <Card {...state} title={t('Marketplace')}>
      {data?.map(({ link, name }) => (
        <ExternalLink href={link} className={styles.link} icon key={name}>
          {name}
        </ExternalLink>
      ))}
    </Card>
  );
};

export default NFTMarketplace;
