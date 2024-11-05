import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import PersonIcon from '@mui/icons-material/Person';
import { truncate } from '@xpla.kitchen/utils';
import { useAddressBook } from 'data/settings/AddressBook';
import { useTnsAddress } from 'data/external/tns';
import { InlineFlex } from 'components/layout';
import { Form, FormItem, FormItemMemo, Submit, Input } from 'components/form';
import { Fetching, useModal } from 'components/feedback';
import { TooltipClickIcon } from 'components/display';
import validate from 'txs/validate';

const AddAddressBookItem = () => {
  const { t } = useTranslation();
  const close = useModal();
  const { add, validateName } = useAddressBook();

  /* form */
  const form = useForm<AddressBook>({ mode: 'onChange' });
  const { register, watch, setError, handleSubmit, formState } = form;
  const { errors } = formState;
  const { recipient } = watch();

  const submit = (values: AddressBook) => {
    add(values);
    close();
  };

  /* resolve recipient */
  const { data: resolvedAddress, ...tnsState } = useTnsAddress(recipient ?? '');

  // validate(tns): not found
  const invalid =
    recipient?.endsWith('.ust') && !tnsState.isLoading && !resolvedAddress
      ? t('Address not found')
      : '';

  const disabled =
    invalid ||
    (tnsState.isLoading && t('Searching for address...')) ||
    (errors && errors.memo?.message && 'Invalid memo');

  useEffect(() => {
    if (invalid) setError('recipient', { type: 'invalid', message: invalid });
  }, [invalid, setError]);

  const renderResolvedAddress = () => {
    if (!resolvedAddress) return null;
    return (
      <InlineFlex gap={4} className="success">
        <PersonIcon fontSize="inherit" />
        {truncate(resolvedAddress)}
      </InlineFlex>
    );
  };

  return (
    <Fetching isFetching={tnsState.isLoading}>
      <Form onSubmit={handleSubmit(submit)}>
        <FormItem label={t('Name')} error={errors.name?.message}>
          <Input
            {...register('name', {
              required: true,
              validate: {
                exists: (value) =>
                  !validateName(value) ? `${value} already exists` : undefined,
              },
            })}
          />
        </FormItem>

        <FormItem
          label={
            <TooltipClickIcon
              content={
                <div>
                  The recipient address can be entered in either
                  <br />
                  XPLA Style (xpla1…) or EVM Style Address (0x…).
                </div>
              }
              placement="top"
            >
              {t('Address')}
            </TooltipClickIcon>
          }
          extra={renderResolvedAddress()}
          error={errors.recipient?.message}
        >
          <Input
            {...register('recipient', { validate: validate.recipient() })}
            placeholder={`Please enter the recipient's address.`}
          />
        </FormItem>

        <FormItemMemo
          label={`${t('Memo')} (${t('optional')})`}
          error={errors.memo?.message}
        >
          <Input
            {...register('memo', {
              validate: {
                size: validate.size(256),
                bracket: validate.memo(),
                mnemonic: validate.mnemonic(),
              },
            })}
            placeholder="Remember, everyone can see your 'Memo.'"
          />
        </FormItemMemo>

        <Submit disabled={!!disabled}>{disabled}</Submit>
      </Form>
    </Fetching>
  );
};

export default AddAddressBookItem;
