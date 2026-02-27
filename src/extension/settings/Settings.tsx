import FullscreenIcon from '@mui/icons-material/Fullscreen';
import SettingsIcon from '@mui/icons-material/Settings';
import HeaderIconButton from 'app/components/HeaderIconButton';
import PopoverNone from 'app/components/PopoverNone';
import { Popover } from 'components/display';
import { Flex, Tabs } from 'components/layout';
import { useIsClassic } from 'data/query';
import { useTranslation } from 'react-i18next';

import { getOpenURL } from '../storage';
import BalanceSetting from './BalanceSetting';
import LanguageSetting from './LanguageSetting';
import NetworkSetting from './NetworkSetting';
import ThemeSetting from './ThemeSetting';

const Settings = () => {
  const { t } = useTranslation();
  const isClassic = useIsClassic();

  const tabs = [
    { key: 'network', tab: t('Network'), children: <NetworkSetting /> },
    // { key: 'lang', tab: t('Language'), children: <LanguageSetting /> },
    { key: 'theme', tab: t('Theme'), children: <ThemeSetting /> },
    { key: 'balance', tab: t('Balance'), children: <BalanceSetting /> },
  ].filter(({ key }) => {
    if (key === 'balance') return isClassic;
    return true;
  });

  const openURL = getOpenURL();
  const footer = (
    <Flex gap={4}>
      <FullscreenIcon fontSize="small" />
      {t('Expand')}
    </Flex>
  );

  return (
    <Popover
      content={
        <PopoverNone footer={openURL && { onClick: openURL, children: footer }}>
          <Tabs tabs={tabs} type="line" state />
        </PopoverNone>
      }
      placement="bottom-end"
      theme="none"
    >
      <HeaderIconButton>
        <SettingsIcon style={{ fontSize: 18 }} />
      </HeaderIconButton>
    </Popover>
  );
};

export default Settings;
