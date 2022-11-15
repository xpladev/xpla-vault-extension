import { ReactNode } from 'react';
import QrCodeIcon from '@mui/icons-material/QrCode';
import { Flex, Grid } from 'components/layout';
import WalletQR from 'app/sections/WalletQR';
import { isWallet, useAuth } from 'auth';
import MultisigBadge from 'auth/components/MultisigBadge';
import Copy from './Copy';
import styles from './WalletCard.module.scss';

interface Props {
  extra?: ReactNode;
}

const WalletCard = ({ extra }: Props) => {
  const { wallet } = useAuth();

  if (!wallet) return null;
  const { address } = wallet;
  const name = isWallet.local(wallet) ? wallet.name : undefined;

  return (
    <div className={styles.wallet}>
      <Grid>
        {name && (
          <Flex gap={4} start>
            {isWallet.multisig(wallet) && <MultisigBadge />}
            <h1>{name}</h1>
          </Flex>
        )}

        <Flex gap={4} className={styles.address}>
          <Copy text={address}>{address}</Copy>
          <WalletQR
            renderButton={(open) => (
              <button onClick={open}>
                <QrCodeIcon fontSize="inherit" />
              </button>
            )}
          />
        </Flex>
      </Grid>

      {extra}
    </div>
  );
};

export default WalletCard;
