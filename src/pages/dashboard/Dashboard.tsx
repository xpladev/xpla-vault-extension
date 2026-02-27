import classNames from 'classnames/bind';
import { Col, Page } from 'components/layout';
import { useIsClassic } from 'data/query';
import { useTranslation } from 'react-i18next';

import Charts from './Charts';
import CommunityPool from './CommunityPool';
import styles from './Dashboard.module.scss';
import Issuance from './Issuance';
import StakingRatio from './StakingRatio';

const cx = classNames.bind(styles);

const Dashboard = () => {
  const { t } = useTranslation();
  const isClassic = useIsClassic();

  return (
    <Page title={t('Dashboard')}>
      <Col>
        <header className={cx(styles.header, { trisect: !isClassic })}>
          <Issuance />
          <CommunityPool />
          <StakingRatio />
        </header>

        <Charts />
      </Col>
    </Page>
  );
};

export default Dashboard;
