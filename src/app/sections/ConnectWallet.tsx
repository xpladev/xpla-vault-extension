import UsbIcon from '@mui/icons-material/Usb';
import { useWallet } from '@xpla/wallet-provider';
import { useAuth } from 'auth';
import SwitchWallet from 'auth/modules/select/SwitchWallet';
import { List } from 'components/display';
import { ModalButton } from 'components/feedback';
import { FormHelp } from 'components/form';
import { Button, ExternalLink } from 'components/general';
import { Grid } from 'components/layout';
import { VAULT } from 'config/constants';
import { useAddress } from 'data/wallet';
import { useTranslation } from 'react-i18next';
import { RenderButton } from 'types/components';

import Connected from './Connected';

interface Props {
  renderButton?: RenderButton;
}

const ConnectWallet = ({ renderButton }: Props) => {
  const { t } = useTranslation();

  const { connect, availableConnections, availableInstallations } = useWallet();
  const { available } = useAuth();

  const address = useAddress();
  if (address) return <Connected />;

  const defaultRenderButton: Props['renderButton'] = (open) => (
    <Button onClick={open} size="small" outline>
      {t('Connect')}
    </Button>
  );

  const list = [
    ...availableConnections.map(({ type, identifier, name, icon }) => ({
      src: icon,
      children: name,
      onClick: () => connect(type, identifier),
    })),
    {
      icon: <UsbIcon />,
      to: '/auth/ledger',
      children: t('Access with Ledger'),
    },
    ...availableInstallations.map(({ name, icon, url }) => ({
      src: icon,
      children: t(`Install ${name}`),
      href: url,
    })),
  ];

  return (
    <ModalButton
      title={t('Connect wallet')}
      renderButton={renderButton ?? defaultRenderButton}
      maxHeight
    >
      <Grid gap={20}>
        <SwitchWallet />
        <List list={available.length ? available : list} />
        {!!available.length && (
          <FormHelp>
            Use <ExternalLink href={VAULT}>Xpla Vault</ExternalLink> on the
            browser to access with ledger device
          </FormHelp>
        )}
      </Grid>
    </ModalButton>
  );
};

export default ConnectWallet;
