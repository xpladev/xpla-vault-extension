import { Grid } from 'components/layout';

import styles from './Aside.module.scss';
import Links from './Links';

const Aside = () => {
  return (
    <Grid gap={20} className={styles.aside}>
      <Links />
    </Grid>
  );
};

export default Aside;
