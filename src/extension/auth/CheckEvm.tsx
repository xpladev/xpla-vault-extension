import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import classNames from 'classnames/bind';
import { truncate } from '@xpla.kitchen/utils';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { isWallet, useAuth } from 'auth';
import { useEvmAddress } from 'data/wallet';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import QrCodeIcon from '@mui/icons-material/QrCode';
import { ReactComponent as CheckEvmIcon } from 'styles/images/menu/CheckEvm.svg';
import { FormHelp } from 'components/form';
import { Card, Grid } from 'components/layout';
import ExtensionPage from '../components/ExtensionPage';
import WalletEvmQR from './WalletEvmQR';
import styles from './CheckEvm.module.scss';

const cx = classNames.bind(styles);

const CheckEvm = () => {
  const { t } = useTranslation();

  const [copied, setCopied] = useState(false);

  const address = useEvmAddress();
  const { wallet } = useAuth();

  return (
    <ExtensionPage title={t('EVM Style Address')}>
      <Grid gap={20}>
        <Card>
          <div className={cx('address-container')}>
            <header>
              <div className={cx('address-walletName')}>
                <CheckEvmIcon />
                <h1>
                  {isWallet.local(wallet) ? wallet.name : truncate(address)}
                </h1>
              </div>
              <div>
                <CopyToClipboard
                  text={address || ''}
                  onCopy={() => {
                    setCopied(true);
                    setTimeout(() => {
                      setCopied(false);
                    }, 2000);
                  }}
                >
                  <button type="button" className={cx('copy')}>
                    <ContentCopyIcon />
                    <span>{copied ? t('Copied') : t('Copy')} </span>
                  </button>
                </CopyToClipboard>
                <WalletEvmQR
                  renderButton={(open) => (
                    <button className={cx('copy')} onClick={open}>
                      <QrCodeIcon fontSize="inherit" />
                    </button>
                  )}
                />
              </div>
            </header>
            <div className={cx('address')}>{address}</div>
          </div>
        </Card>

        <FormHelp className="evm">
          {t(
            'When transferring tokens between EVM-based wallets (e.g. MetaMask) and XPLA Vault, an EVM Style Address is necessary.',
          )}
        </FormHelp>
      </Grid>
    </ExtensionPage>
  );
};

export default CheckEvm;
