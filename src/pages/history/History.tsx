import { useTranslation } from 'react-i18next';
import { useIsXplaAPIAvailable } from 'data/Xpla/XplaAPI';
import { Wrong } from 'components/feedback';
import HistoryList from './HistoryList';

const History = () => {
  const { t } = useTranslation();
  const available = useIsXplaAPIAvailable();

  if (!available) return <Wrong>{t('History is not supported')}</Wrong>;

  return <HistoryList />;
};

export default History;
