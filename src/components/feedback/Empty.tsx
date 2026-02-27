import InboxOutlinedIcon from '@mui/icons-material/InboxOutlined';
import { PropsWithChildren, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import State from './State';

const Empty = ({ icon, children }: PropsWithChildren<{ icon?: ReactNode }>) => {
  const { t } = useTranslation();

  return (
    <State icon={icon ?? <InboxOutlinedIcon fontSize="inherit" />}>
      {children ?? t('No results found')}
    </State>
  );
};

export default Empty;
