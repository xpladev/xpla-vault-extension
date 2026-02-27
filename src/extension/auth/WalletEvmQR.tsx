import QRCode from 'auth/components/QRCode';
import { ModalButton } from 'components/feedback';
import { Grid } from 'components/layout';
import { useEvmAddress } from 'data/wallet';
import { useTranslation } from 'react-i18next';
import { RenderButton } from 'types/components';

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
