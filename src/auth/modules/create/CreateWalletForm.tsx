import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { Grid } from 'components/layout';
import { Form, FormItem, FormWarning, Submit, Value } from 'components/form';
import { Checkbox, Input } from 'components/form';
import { Modal } from 'components/feedback';
import validate from '../../scripts/validate';
import { useCreateWallet, Values as DefaultValues } from './CreateWalletWizard';
import WhatIsMnemonic from './WhatIsMnemonic';
import styles from './CreateWalletForm.module.scss';

interface Values extends DefaultValues {
  confirm: string;
  checked1: boolean;
  checked2: boolean;
  checked3: boolean;
}

const CreateWalletForm = () => {
  const [modalVisible, setModalVisible] = useState<boolean>(false);

  const { t } = useTranslation();
  const { setStep, generated, values, setValues } = useCreateWallet();

  /* form */
  const form = useForm<Values>({
    mode: 'onChange',
    defaultValues: {
      ...values,
      confirm: '',
      checked1: false,
      checked2: false,
      checked3: false,
    },
  });

  const { register, watch, trigger, handleSubmit, formState, reset, setValue } =
    form;
  const { errors, isValid, isDirty } = formState;
  const { password, mnemonic, index, checked1, checked2, checked3 } = watch();

  useEffect(() => {
    return () => reset();
  }, [reset]);

  const handleOK = async () => {
    setModalVisible(false);

    setValue('checked1', true);
    await trigger('checked1');
  };

  const submit = ({ name, password, mnemonic, index }: Values) => {
    setValues({ name, password, mnemonic: mnemonic.trim(), index });
    setStep(2);
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

        <FormItem label={t('Mnemonic')} error={errors.mnemonic?.message}>
          {generated ? (
            <Value>{mnemonic}</Value>
          ) : (
            <Input
              type="password"
              {...register('mnemonic', { validate: validate.mnemonic })}
            />
          )}
        </FormItem>

        {!generated && (
          <FormItem /* do not translate this */
            label="Index"
            error={errors.index?.message}
          >
            <Input
              {...register('index', {
                valueAsNumber: true,
                validate: validate.index,
              })}
            />
            {index !== 0 && (
              <FormWarning>{t('Default index is 0')}</FormWarning>
            )}
          </FormItem>
        )}

        {generated && (
          <>
            <Grid gap={4}>
              <FormWarning>
                {t(
                  'Never share the mnemonic with others or enter it in unverified sites',
                )}
              </FormWarning>
            </Grid>

            {/* <Checkbox
            {...register('checked', { required: true })}
            checked={checked}
          >
            {t('I have written down the mnemonic')}
          </Checkbox> */}
            <div className={styles['mnemonic-checkbox-wrap']}>
              <Checkbox
                {...register('checked1', { required: true })}
                checked={checked1}
                onChange={async (e) => {
                  const { checked } = e.target;

                  if (checked) {
                    setModalVisible(true);
                  } else {
                    setValue('checked1', false);
                  }

                  await trigger('checked1');
                }}
              >
                <button
                  type="button"
                  onClick={async () => {
                    if (!checked1) {
                      setModalVisible(true);
                    } else {
                      setValue('checked1', false);
                    }

                    await trigger('checked1');
                  }}
                >
                  {t('What is Mnemonic?')}
                </button>
              </Checkbox>

              <Checkbox
                {...register('checked2', { required: true })}
                checked={checked2}
              >
                <i>NEVER&nbsp;</i>share Mnemonic with others.
                <br />
                <i>NEVER&nbsp;</i>write it on unverified sites.
              </Checkbox>

              <Checkbox
                {...register('checked3', { required: true })}
                checked={checked3}
              >
                I copied and pasted my Mnemonic on a safe place.
                <br />I will<i>&nbsp;NEVER&nbsp;</i>share my Mnemonic to anyone.
              </Checkbox>
            </div>
          </>
        )}

        <Submit disabled={!isValid} />
      </Form>

      {modalVisible && (
        <Modal isOpen={modalVisible}>
          <WhatIsMnemonic handleOK={handleOK} />
        </Modal>
      )}
    </>
  );
};

export default CreateWalletForm;
