import { ExternalLink } from 'components/general';
import { Card, Grid } from 'components/layout';
import { useTranslation } from 'react-i18next';

const ProposalMetadata = ({ metadata }: { metadata: string }) => {
  const { t } = useTranslation();

  return (
    <Card title={t('Metadata')} bordered>
      <Grid gap={40}>
        {metadata.startsWith('ipfs://') ? (
          <ExternalLink
            href={metadata.replace(
              'ipfs://',
              'https://web3-storage.xpla.dev/ipfs/',
            )}
          />
        ) : (
          <>{metadata}</>
        )}
      </Grid>
    </Card>
  );
};

export default ProposalMetadata;
