import { useTranslation } from 'react-i18next';
import { Contacts } from 'components/layout';
import styles from './Links.module.scss';

const community = {
  medium: 'https://medium.com/@XPLA_Official',
  telegram: 'https://t.me/Official_XPLA',
  twitter: 'https://twitter.com/XPLA_Official',
  github: 'https://github.com/xpladev',
};

const Links = () => {
  const { t } = useTranslation();

  return (
    <div className={styles.links}>
      <div className={styles.tutorial}></div>

      <div className={styles.community}>
        <Contacts contacts={community} menu />
      </div>
    </div>
  );
};

export default Links;
