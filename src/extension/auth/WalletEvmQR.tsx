import { useTranslation } from 'react-i18next';
import { RenderButton } from 'types/components';
import { useEvmAddress } from 'data/wallet';
import { Grid } from 'components/layout';
import { ModalButton } from 'components/feedback';
import QRCode from 'auth/components/QRCode';

const WalletEvmQR = ({ renderButton }: { renderButton: RenderButton }) => {
  const { t } = useTranslation();
  const address = useEvmAddress();

  if (!address) return null;

  return (
    <ModalButton title={t('Wallet address')} renderButton={renderButton}>
      <Grid gap={20}>
        <QRCode value={address} />
        <p className="small center">{address}</p>
      </Grid>
    </ModalButton>
  );
};

export default WalletEvmQR;
