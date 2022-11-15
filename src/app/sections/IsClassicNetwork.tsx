import { useIsClassic } from 'data/query';
import styles from './IsClassicNetwork.module.scss';

const IsClassicNetwork = () => {
  const isClassic = useIsClassic();

  return <div className={styles.component}>{isClassic ? 'Xpla' : 'Xpla'}</div>;
};

export default IsClassicNetwork;
