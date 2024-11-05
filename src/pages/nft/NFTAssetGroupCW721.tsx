import { Fragment, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import classNames from 'classnames/bind';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useCW721InfinityTokens } from 'data/queries/wasm';
import { ExternalLink, InternalButton } from 'components/general';
import { Card, Grid } from 'components/layout';
import { TokenBadge, TokenIcon } from 'components/token';
import NFTAssetItem from './NFTAssetItem';
import styles from './NFTAssetGroup.module.scss';

const cx = classNames.bind(styles);

const NFTAssetGroupCW721 = (props: CW721ContractItem) => {
  const [isShow, setIsShow] = useState<boolean>(false);

  const { contract, name, icon, marketplace } = props;
  const { t } = useTranslation();
  const {
    data: data,
    error,
    fetchNextPage,
    ...state
  } = useCW721InfinityTokens(contract);

  const { hasNextPage, isFetchingNextPage } = state;

  const getPages = () => {
    if (!data) return [];
    const { pages } = data;
    const [{ tokens }] = data.pages;
    return tokens.length ? pages : [];
  };

  const pages = getPages();

  const title = (
    <>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          width: '100%',
          gap: '4px',
          cursor: 'pointer',
        }}
        onClick={() => {
          if (pages && pages.length > 0) {
            setIsShow(!isShow);
          }
        }}
      >
        <div className={cx('tag-wrap')}>
          <TokenIcon
            token={contract}
            icon={icon}
            className={styles.icon}
            size={20}
          />
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <span
              style={{
                fontWeight: 500,
                margin: 0,
                fontSize: 12,
              }}
            >
              {name}
            </span>
            {pages && pages.length > 0 && (
              <ExpandMoreIcon className={styles.expand} />
            )}
          </div>
          <TokenBadge className={styles.tag} nft />
        </div>
      </div>
    </>
  );

  const renderExtra = () => {
    if (!marketplace?.length) return null;
    const [link] = marketplace;
    return (
      <ExternalLink href={link} className={styles.link}>
        {t('Collection')}
      </ExternalLink>
    );
  };

  const render = () => {
    if (!data) return null;

    return pages.map(({ tokens }, i) => (
      <Fragment key={i}>
        {tokens.map((id) => (
          <NFTAssetItem key={id} contract={contract} id={id} compact />
        ))}
      </Fragment>
    ));
  };

  return (
    <Card
      {...state}
      title={title}
      extra={renderExtra()}
      className={styles.card}
      mainClassName={styles.main}
      size="small"
      bordered
      bg
    >
      <div
        style={{
          display: isShow ? 'grid' : 'none',
          gridTemplateColumns: '1fr',
          gap: '8px',
          width: '100%',
        }}
      >
        {render()}
        <Grid>
          <InternalButton
            onClick={() => fetchNextPage()}
            disabled={!hasNextPage || isFetchingNextPage}
            style={{ padding: '20px 0' }}
          >
            {t('Load more')}
          </InternalButton>
        </Grid>
      </div>
    </Card>
  );
};

export default NFTAssetGroupCW721;
