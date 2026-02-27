import LanguageIcon from '@mui/icons-material/Language';
import { sandbox } from 'auth/scripts/env';
import { Popover } from 'components/display';
import { Tabs } from 'components/layout';
import { useIsClassic } from 'data/query';
import { useTranslation } from 'react-i18next';

import HeaderIconButton from '../components/HeaderIconButton';
import PopoverNone from '../components/PopoverNone';
import CurrencySetting from './CurrencySetting';
import LanguageSetting from './LanguageSetting';
import NetworkSetting from './NetworkSetting';

const Preferences = () => {
  const { t } = useTranslation();
  const isClassic = useIsClassic();

  const network = {
    key: 'network',
    tab: t('Network'),
    children: <NetworkSetting />,
    condition: ['sandbox'],
  };

  const lang = {
    key: 'lang',
    tab: t('Language'),
    children: <LanguageSetting />,
    condition: undefined,
  };

  const currency = {
    key: 'currency',
    tab: t('Currency'),
    children: <CurrencySetting />,
    condition: ['classic'],
  };

  const tabs = [network, lang, currency].filter(({ condition }) => {
    if (!condition) return true;
    if (condition.includes('sandbox')) return sandbox;
    if (condition.includes('classic')) return isClassic;
    return true;
  });

  return (
    <Popover
      content={
        <PopoverNone>
          <Tabs tabs={tabs} type="line" state />
        </PopoverNone>
      }
      placement="bottom"
      theme="none"
    >
      <HeaderIconButton>
        <LanguageIcon style={{ fontSize: 18 }} />
      </HeaderIconButton>
    </Popover>
  );
};

export default Preferences;
