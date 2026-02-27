import { isWallet, useAuth } from 'auth';
import { Wrong } from 'components/feedback';
import { Card, Page } from 'components/layout';
import { useTranslation } from 'react-i18next';

import TxContext from '../../txs/TxContext';
import SignMultisigTxForm from './SignMultisigTxForm';
import useDefaultValues from './utils/useDefaultValues';

const SignMultisigTxPage = () => {
  const { t } = useTranslation();
  const { wallet } = useAuth();
  const defaultValues = useDefaultValues();

  const render = () => {
    if (isWallet.multisig(wallet))
      return (
        <Card>
          <Wrong>{t('Multisig wallet cannot sign a tx')}</Wrong>
        </Card>
      );

    return (
      <TxContext>
        <SignMultisigTxForm defaultValues={defaultValues} />
      </TxContext>
    );
  };

  return <Page title={t('Sign a multisig tx')}>{render()}</Page>;
};

export default SignMultisigTxPage;
