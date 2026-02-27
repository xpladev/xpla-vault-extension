import { Fetching } from 'components/feedback';
import {
  EditorInput,
  Form,
  FormArrow,
  FormItem,
  Submit,
} from 'components/form';
import { Pre } from 'components/general';
import { useGetContractQuery } from 'data/queries/wasm';
import { isEmpty } from 'ramda';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useQuery } from 'react-query';
import validate from 'txs/validate';
import { parseJSON, validateMsg } from 'utils/data';
import { getErrorMessage } from 'utils/error';

import { useContract } from './Contract';

interface Values {
  msg: string;
}

const ContractQuery = () => {
  const { t } = useTranslation();
  const { address } = useContract();

  /* form */
  const form = useForm<Values>({ mode: 'onChange' });
  const { register, watch, handleSubmit } = form;
  const { msg } = watch();
  const invalid = msg && !parseJSON(msg);
  const disabled = !validateMsg(msg);

  /* query */
  const getContractQuery = useGetContractQuery();
  const [query, setQuery] = useState<object>({});

  const { data, error, ...state } = useQuery({
    ...getContractQuery<object>(address, query),
    enabled: !isEmpty(query),
    retry: false,
  });

  const message = getErrorMessage(error);

  /* submit */
  const submit = ({ msg }: Values) => {
    const parsed = parseJSON(msg);
    if (parsed) setQuery(parsed);
  };

  return (
    <Fetching {...state}>
      <Form onSubmit={handleSubmit(submit)}>
        <FormItem
          label={t('Input')}
          error={invalid ? t('Invalid JSON') : undefined}
        >
          <EditorInput
            {...register('msg', { validate: validate.msg() })}
            placeholder='{"token_info": {}}'
          />
        </FormItem>

        {(data || message) && (
          <>
            <FormArrow />

            <FormItem label={t('Output')}>
              <Pre height={240} normal={!!message}>
                {message ?? data}
              </Pre>
            </FormItem>
          </>
        )}

        <Submit disabled={disabled} submitting={state.isLoading} />
      </Form>
    </Fetching>
  );
};

export default ContractQuery;
