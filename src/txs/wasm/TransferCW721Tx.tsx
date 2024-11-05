import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import { useBankBalance } from 'data/queries/bank';
import { getAmount } from 'utils/coin';
import { Page } from 'components/layout';
// import { TokenBadge } from 'components/token';
import TxContext from '../TxContext';
import TransferCW721Form from './TransferCW721Form';

const TransferCW721Tx = () => {
  const { t } = useTranslation();
  const bankBalance = useBankBalance();
  const [searchParams] = useSearchParams();
  const contract = searchParams.get('contract');
  const id = searchParams.get('id');

  if (!(contract && id)) throw new Error('Invalid');

  const balance = getAmount(bankBalance, 'axpla');

  return (
    <Page
      title={t('Send NFT')}
      // extra={<TokenBadge className="page-title" nft />}
      tx
    >
      <TxContext>
        <TransferCW721Form contract={contract} id={id} balance={balance} />
      </TxContext>
    </Page>
  );
};

export default TransferCW721Tx;
