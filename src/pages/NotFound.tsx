import { Wrong } from 'components/feedback';
import { Card, Page } from 'components/layout';
import { useTranslation } from 'react-i18next';

const NotFound = () => {
  const { t } = useTranslation();
  return (
    <Page title="404">
      <Card>
        <Wrong>{t('Not found')}</Wrong>
      </Card>
    </Page>
  );
};

export default NotFound;
