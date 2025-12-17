import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { Pre } from 'components/general';
import { Grid } from 'components/layout';
import { Form, FormItem, FormWarning } from 'components/form';
import { Input, RadioButton, Submit } from 'components/form';
import { Modal } from 'components/feedback';
import useAuth from '../../hooks/useAuth';
import QRCode from '../../components/QRCode';
import styles from './ExportWalletForm.module.scss';

enum Mode {
  QR = 'QR code',
  KEY = 'Private key',
  LEGACY = 'Private key (Legacy)',
}

interface Values {
  mode: Mode;
  password: string;
}

const ExportWalletForm = () => {
  const { t } = useTranslation();
  const { validatePassword, encodeEncryptedWallet, getKey } = useAuth();

  /* form */
  const form = useForm<Values>({
    mode: 'onChange',
    defaultValues: { mode: Mode.QR },
  });

  const { register, watch, handleSubmit, formState } = form;
  const { errors } = formState;
  const { mode } = watch();

  /* submit */
  const [encoded, setEncoded] = useState<string>();
  const [key, setKey] = useState<string>();
  const submit = ({ password }: Values) => {
    const encoded = encodeEncryptedWallet(password);
    const key = getKey(password);
    setEncoded(encoded);
    setKey(key);
  };

  /* reset */
  const reset = () => {
    form.reset();
    setEncoded(undefined);
    setKey(undefined);
  };

  /* render */
  const render = {
    [Mode.QR]: () => (
      <QRCode value={`xplavault://wallet_recover/?payload=${encoded}`} />
    ),
    [Mode.KEY]: () => (
      <Pre normal break copy>
        {key}
      </Pre>
    ),
    [Mode.LEGACY]: () => (
      <Pre normal break copy>
        {encoded}
      </Pre>
    ),
  };

  return (
    <>
      {encoded && (
        <Modal title={mode} isOpen onRequestClose={reset}>
          <Grid gap={20}>
            <FormWarning>{t('Keep this private')}</FormWarning>
            {render[mode]()}
          </Grid>
        </Modal>
      )}

      <Form onSubmit={handleSubmit(submit)}>
        <section>
          {Object.values(Mode).map((key) => {
            const checked = mode === key;

            return (
              <RadioButton
                {...register('mode')}
                value={key}
                checked={checked}
                key={key}
              >
                {key}
              </RadioButton>
            );
          })}

          <div className={styles.desc}>
            {mode === Mode.QR ? (
              <>
                Generate a QR code to restore your wallet.
                <br />
                The QR code is generated based on the Private key (Legacy).
              </>
            ) : mode === Mode.KEY ? (
              'Restore your wallet using only your private key, no password needed.'
            ) : mode === Mode.LEGACY ? (
              ' An encrypted key that requires both your private key andpassword to restore.'
            ) : (
              ''
            )}
          </div>
        </section>

        <FormItem label={t('Password')} error={errors.password?.message}>
          <Input
            {...register('password', { validate: validatePassword })}
            type="password"
            autoFocus
          />
        </FormItem>

        <Submit />
      </Form>
    </>
  );
};

export default ExportWalletForm;
