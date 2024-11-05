import { useTranslation } from 'react-i18next';
import { Card, Grid } from 'components/layout';
import { ExternalLink } from 'components/general';

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
