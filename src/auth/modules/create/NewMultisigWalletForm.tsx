import { LegacyAminoMultisigPublicKey } from '@xpla/xpla.js';
import { Modal } from 'components/feedback';
import { Form, FormItem } from 'components/form';
import { Input, Submit } from 'components/form';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { addWallet } from '../../scripts/keystore';
import validate from '../../scripts/validate';
import CreatedWallet from './CreatedWallet';
import CreateMultisigWalletForm from './CreateMultisigWalletForm';

interface Values {
  name: string;
}

const NewMultisigWalletForm = () => {
  const { t } = useTranslation();

  /* form */
  const form = useForm<Values>({
    mode: 'onChange',
    defaultValues: { name: '' },
  });

  const { register, handleSubmit, formState } = form;
  const { errors, isValid } = formState;

  /* submit */
  const [publicKey, setPublicKey] = useState<LegacyAminoMultisigPublicKey>();
  const [wallet, setWallet] = useState<MultisigWallet>();

  const submit = async ({ name }: Values) => {
    if (!publicKey) return;
    const address = publicKey.address();
    const wallet = { name, address, multisig: true as const };

    addWallet(wallet);
    setWallet(wallet);
  };

  /* render */
  return (
    <>
      {wallet && (
        <Modal isOpen>
          <CreatedWallet {...wallet} />
        </Modal>
      )}

      {publicKey ? (
        <Form onSubmit={handleSubmit(submit)}>
          <FormItem label={t('Wallet name')} error={errors.name?.message}>
            <Input
              {...register('name', { validate: validate.name })}
              autoFocus
            />
          </FormItem>

          <Submit disabled={!isValid} />
        </Form>
      ) : (
        <CreateMultisigWalletForm onCreated={setPublicKey} />
      )}
    </>
  );
};

export default NewMultisigWalletForm;
