import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import axios, { AxiosError } from 'axios';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import { useLCDClient } from 'data/queries/lcdClient';
import { Grid } from 'components/layout';
import { Details } from 'components/display';
import { Button } from 'components/general';
import useAuth from '../../hooks/useAuth';

const CreatedWallet = ({ name, address }: SingleWallet) => {
  const [isInit, setIsInit] = useState<boolean>(false);
  const [isActivate, setIsActivate] = useState<boolean>(false);

  const { t } = useTranslation();
  const navigate = useNavigate();
  const { connect } = useAuth();
  const lcd = useLCDClient();

  useEffect(() => {
    const init = async () => {
      try {
        if (address) {
          const accountInfo = await lcd.auth.accountInfo(address);
          if (accountInfo) {
            setIsActivate(true);
          }
        }
      } catch (err) {
        if (axios.isAxiosError(err)) {
          const status = (err as AxiosError<any>).response?.status;
          if (status === 404) {
            setIsActivate(false);
          }
        }
      }

      setIsInit(true);
    };
    init();
  }, [address]);

  const activate = () => {
    connect(name);
    navigate('/activate', { replace: true });
  };

  const submit = () => {
    connect(name);
    navigate('/wallet', { replace: true });
  };

  return (
    <article>
      <Grid gap={28}>
        <header className="center">
          <DoneAllIcon className="success" style={{ fontSize: 56 }} />
          <h1>{t('Wallet generated successfully')}</h1>
        </header>

        <Details>
          <article>
            <h1>{name}</h1>
            <p>{address}</p>
          </article>
        </Details>

        {isInit && !isActivate ? (
          <Button color="primary" onClick={activate}>
            {t('Activate')}
          </Button>
        ) : (
          <Button color="primary" onClick={submit}>
            {t('Connect')}
          </Button>
        )}
      </Grid>
    </article>
  );
};

export default CreatedWallet;
