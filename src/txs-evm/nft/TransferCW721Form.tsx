import { useCallback, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import PersonIcon from '@mui/icons-material/Person';
import { AccAddress, EvmAddress, EvmSendNft } from '@xpla/xpla.js';
import { truncate } from '@xpla.kitchen/utils';
import useEvmAddress from 'auth/hooks/useEvmAddress';
import { queryKey } from 'data/query';
import { useBankBalance } from 'data/queries/bank';
import { useTnsAddress } from 'data/external/tns';
import { bech32ToEip55 } from 'utils/evm';
import { Auto, Card, InlineFlex } from 'components/layout';
import { Form, FormItem, FormHelp, Input } from 'components/form';
import { TooltipClickIcon } from 'components/display';
import NFTAssetItem from 'pages/nft/NFTAssetItem';
import AddressBookList from '../../txs/AddressBook/AddressBookList';
import validate from '../../txs/validate';
import Tx, { getInitialGasDenom } from '../Tx';

interface TxValues {
  recipient?: string; // AccAddress | TNS
  address?: AccAddress; // hidden input
  memo?: string;
}

interface Props {
  contract: string;
  id: string;
  balance: Amount;
}

const EvmTransferERC721Form = ({ contract, id, balance }: Props) => {
  const { t } = useTranslation();
  const connectedAddress = useEvmAddress();
  const bankBalance = useBankBalance();

  /* tx context */
  const initialGasDenom = getInitialGasDenom(bankBalance);

  /* form */
  const form = useForm<TxValues>({ mode: 'onChange' });
  const { register, trigger, watch, setValue, setError, handleSubmit } = form;
  const { formState } = form;
  const { errors } = formState;
  const { recipient, memo } = watch();

  const onClickAddressBookItem = async ({ recipient, memo }: AddressBook) => {
    setValue('recipient', recipient);
    setValue('memo', memo);
    await trigger('recipient');
  };

  /* resolve recipient */
  const { data: resolvedAddress, ...tnsState } = useTnsAddress(recipient ?? '');
  useEffect(() => {
    if (!recipient) {
      setValue('address', undefined);
    } else if (EvmAddress.validate(recipient)) {
      setValue('address', recipient);
    } else if (AccAddress.validate(recipient)) {
      setValue('address', bech32ToEip55(recipient));
    } else if (resolvedAddress) {
      setValue('address', resolvedAddress);
    } else {
      setValue('address', recipient);
    }
  }, [form, recipient, resolvedAddress, setValue]);

  // validate(tns): not found
  const invalid =
    recipient?.endsWith('.ust') && !tnsState.isLoading && !resolvedAddress
      ? t('Address not found')
      : '';

  const disabled =
    invalid || (tnsState.isLoading && t('Searching for address...'));

  useEffect(() => {
    if (invalid) setError('recipient', { type: 'invalid', message: invalid });
  }, [invalid, setError]);

  /* tx */
  const createTx = useCallback(
    ({ address, memo }: TxValues) => {
      if (!connectedAddress) return;
      if (!(address && EvmAddress.validate(address))) return;

      const msgs = [
        new EvmSendNft(contract, connectedAddress, address, Number(id)),
      ];

      return { msgs, memo };
    },
    [connectedAddress, contract, id],
  );

  /* fee */
  const estimationTxValues = useMemo(() => {
    const defaultTxValues = {
      address: connectedAddress,
      isSimul: false,
    };

    if (recipient) {
      if (AccAddress.validate(recipient) || EvmAddress.validate(recipient)) {
        let hexAddress = recipient;
        if (AccAddress.validate(recipient)) {
          hexAddress = bech32ToEip55(recipient);
        }

        return {
          address: hexAddress,
          isSimul: true,
        };
      }
    }

    return defaultTxValues;
  }, [connectedAddress, recipient]);

  const tx = {
    balance,
    initialGasDenom,
    estimationTxValues,
    createTx,
    disabled,
    onSuccess: { label: t('NFT'), path: '/nft' },
    queryKeys: [
      [
        queryKey.wasm.contractQuery,
        contract,
        { tokens: { owner: connectedAddress } },
      ],
    ],
  };

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
    <Auto
      columns={[
        <Card isFetching={tnsState.isLoading}>
          <NFTAssetItem contract={contract} id={id} evm tx />

          <Tx {...tx}>
            {({ fee, submit }) => (
              <Form onSubmit={handleSubmit(submit.fn)}>
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
                      {t('Recipient')}
                    </TooltipClickIcon>
                  }
                  extra={renderResolvedAddress()}
                  error={errors.recipient?.message}
                >
                  <Input
                    {...register('recipient', {
                      validate: validate.recipient(),
                    })}
                    placeholder={`Please enter the recipient's address.`}
                    autoFocus
                  />

                  <input {...register('address')} readOnly hidden />
                </FormItem>

                {/* <FormItem
                  label={`${t('Memo')} (${t('optional')})`}
                  error={errors.memo?.message}
                >
                  <Input
                    {...register('memo', {
                      validate: {
                        size: validate.size(256, 'Memo'),
                        brackets: validate.memo(),
                      },
                    })}
                  />
                </FormItem> */}

                {fee.render()}

                {!memo && (
                  <FormHelp>
                    {t('Check if this transaction requires a memo')}
                  </FormHelp>
                )}

                {submit.button}
              </Form>
            )}
          </Tx>
        </Card>,
        <AddressBookList onClick={onClickAddressBookItem} />,
      ]}
    />
  );
};

export default EvmTransferERC721Form;
