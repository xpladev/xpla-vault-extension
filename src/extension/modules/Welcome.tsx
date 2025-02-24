import { useTranslation } from 'react-i18next';
import { useThemeFront } from 'data/settings/Theme';
import { FlexColumn } from 'components/layout';
import styles from './Welcome.module.scss';

const Welcome = () => {
  const { t } = useTranslation();
  const front = useThemeFront();

  return (
    <FlexColumn gap={20} className={styles.component}>
      <img
        src={front}
        alt="Xpla"
        width={105}
        height={120}
        style={{ width: 'fit-content' }}
      />
      <p className={styles.content}>{t('Welcome to XPLA Wallet')}</p>
    </FlexColumn>
  );
};

export default Welcome;
