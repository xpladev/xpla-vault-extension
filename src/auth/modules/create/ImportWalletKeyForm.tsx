import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { RawKey } from '@xpla/xpla.js';
import { Form, FormItem, Submit } from 'components/form';
import { Input } from 'components/form';
import validate from '../../scripts/validate';
import { addWallet } from '../../scripts/keystore';

import useAuth from '../../hooks/useAuth';

interface Values {
  name: string;
  password: string;
  privateKey: string;
  confirm: string;
}

const ImportWalletKeyForm = () => {
  const { t } = useTranslation();

  const navigate = useNavigate();
  const { connect } = useAuth();

  /* form */
  const form = useForm<Values>({
    mode: 'onChange',
    defaultValues: {},
  });

  const { register, watch, trigger, handleSubmit, formState, reset, setValue } =
    form;
  const { errors, isValid, isDirty } = formState;
  const { password, privateKey } = watch();

  useEffect(() => {
    return () => reset();
  }, [reset]);

  const submit = ({ name, password, privateKey }: Values) => {
    const rawKey = new RawKey(Uint8Array.from(Buffer.from(privateKey, 'hex')));

    const address = rawKey.accAddress;
    addWallet({ name, password, address, key: rawKey.privateKey });
    connect(name);
    navigate('/wallet');
  };

  return (
    <>
      <Form onSubmit={handleSubmit(submit)}>
        <FormItem label={t('Wallet name')} error={errors.name?.message}>
          <Input {...register('name', { validate: validate.name })} autoFocus />
        </FormItem>

        <FormItem label={t('Password')} error={errors.password?.message}>
          <Input
            {...register('password', { validate: validate.password })}
            type="password"
          />
        </FormItem>

        <FormItem label={t('Confirm password')} error={errors.confirm?.message}>
          <Input
            {...register('confirm', {
              validate: (confirm) => validate.confirm(password, confirm),
            })}
            type="password"
          />
        </FormItem>

        <FormItem label={t('Private Key')} error={errors.privateKey?.message}>
          <Input
            type="password"
            {...register('privateKey', { validate: validate.privateKey })}
          />
        </FormItem>

        <Submit disabled={!isValid} />
      </Form>
    </>
  );
};

export default ImportWalletKeyForm;
