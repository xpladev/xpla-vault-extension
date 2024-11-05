import { useTranslation } from 'react-i18next';
import classNames from 'classnames/bind';
import qs from 'qs';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import ShortcutOutlinedIcon from '@mui/icons-material/ShortcutOutlined';
import { truncate } from '@xpla.kitchen/utils';
import { getIpfsGateway, useTokenInfoCW721 } from 'data/queries/wasm';
import { InternalButton, InternalLink } from 'components/general';
import { Grid } from 'components/layout';
import { WithFetching } from 'components/feedback';
import { ModalButton } from 'components/feedback';
import NFTDetails from './NFTDetails';
import styles from './NFTAssetItem.module.scss';
import { TokenBadge } from 'components/token';

const cx = classNames.bind(styles);

interface Props {
  contract: XplaAddress;
  id: string;
  compact?: boolean;
  tx?: boolean;
}

// Where to use
// 1. NFT asset list
// 2. Transfer tx form
const NFTAssetItemCW721 = ({ contract, id, compact, tx }: Props) => {
  const { t } = useTranslation();
  const { data, ...state } = useTokenInfoCW721(contract, id);
  const SIZE = compact
    ? { width: 50, height: 50 }
    : { width: 100, height: 100 };
  const className = cx(styles.item, { compact });

  const renderPlaceholder = () => (
    <article className={className}>
      <div style={SIZE} className={cx(styles.image, styles.placeholder)} />
      <h1 className={styles.name}>{truncate(id)}</h1>
    </article>
  );

  const render = () => {
    if (!data) return null;
    const { extension } = data;
    const name = extension?.name ?? truncate(id);
    const extensionImage = extension?.image;

    const filterThumb = extension?.attributes.filter(
      (item: any) => item.trait_type === 'thumbnail_url',
    );

    const collection = extension?.attributes.filter(
      (item: any) => item.trait_type === 'collection',
    );

    const image =
      filterThumb && filterThumb.length ? filterThumb[0].value : extensionImage;

    const src = getIpfsGateway(image);
    // const temp = getIpfsGateway(image);
    // const arr = temp?.split('//');
    // const src = arr && arr.length ? `//${arr[1]}` : '';

    return (
      <article className={className}>
        {src && (
          <ModalButton
            title={name}
            renderButton={(open) => (
              <button
                type="button"
                onClick={open}
                className={styles.image}
                style={{ marginRight: tx ? 0 : '8px' }}
              >
                <img src={src} alt="" {...SIZE} style={{ borderRadius: 12 }} />
              </button>
            )}
          >
            <img src={src} alt="" className={styles.large} />
          </ModalButton>
        )}

        {tx ? (
          <div className={cx('tx-nft-details')}>
            <dl>
              <dt>Type</dt>
              <dd>
                <TokenBadge className={styles.tag} nft />
              </dd>
              <dt>Token ID</dt>
              <dd>{id}</dd>
              <dt>Collection</dt>
              <dd>{collection.length ? collection[0].value : name}</dd>
            </dl>
          </div>
        ) : (
          <h1 className={styles.name}>{name}</h1>
        )}

        {compact && (
          <>
            <ModalButton
              title={name}
              renderButton={(open) => (
                <InternalButton onClick={open} disabled={!extension}>
                  <InfoOutlinedIcon style={{ fontSize: 18 }} />
                  {t('View')}
                </InternalButton>
              )}
              maxHeight={400}
            >
              <Grid gap={12}>
                {src && <img src={src} alt="" className={styles.large} />}

                {extension && <NFTDetails data={extension} id={id} nft />}
              </Grid>
            </ModalButton>

            <InternalLink
              to={{
                pathname: '/nft/transfer/',
                search: qs.stringify({ contract, id }),
              }}
            >
              <ShortcutOutlinedIcon style={{ fontSize: 18 }} />
              {t('Send')}
            </InternalLink>
          </>
        )}
      </article>
    );
  };

  return (
    // skip loading indicator
    <WithFetching {...state}>
      {(progress, wrong) =>
        wrong ?? (progress ? renderPlaceholder() : render())
      }
    </WithFetching>
  );
};

export default NFTAssetItemCW721;
