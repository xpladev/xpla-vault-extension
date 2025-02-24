import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import axios, { AxiosError } from 'axios';

import { isWallet, useAuth } from 'auth';
import { useAddress } from 'data/wallet';
import { useLCDClient } from 'data/queries/lcdClient';
import { useXplaAPIURL } from 'data/Xpla/XplaAPI';

import ActivateForm from './ActivateForm';
import styles from './ActivateForm.module.scss';

const ActivateTx = () => {
  const { t } = useTranslation();
  const [visible, setVisible] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>();

  const { wallet } = useAuth();
  const address = useAddress();
  const lcd = useLCDClient();
  const url = useXplaAPIURL();

  if (!isWallet.single(wallet)) throw new Error('Address is multisig.');

  useEffect(() => {
    const init = async () => {
      try {
        if (address) {
          await lcd.auth.accountInfo(address);
          setErrorMessage('Already activated.');
        }
      } catch (err) {
        if (axios.isAxiosError(err)) {
          const status = (err as AxiosError<any>).response?.status;
          if (status === 404) {
            setVisible(true);
          }
        }
      }
    };

    init();
  }, [address]);

  useEffect(() => {
    if (errorMessage) {
      throw new Error(errorMessage);
    }
  }, [errorMessage]);

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <h1 className={styles.title}>{t('Activate')}</h1>
        </div>
      </header>

      <ActivateForm />
    </div>
  );
};

export default ActivateTx;
