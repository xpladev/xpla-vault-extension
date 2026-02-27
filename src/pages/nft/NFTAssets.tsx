import classNames from 'classnames/bind';
import { ModalButton } from 'components/feedback';
import { InternalButton } from 'components/general';
import { Button } from 'components/general';
import { Card, Col, Grid } from 'components/layout';
import {
  useCustomTokensCW721,
  useCustomTokensERC721,
} from 'data/settings/CustomTokens';
import { useAddress } from 'data/wallet';
import { useTranslation } from 'react-i18next';

import ManageCustomTokensCW721 from '../custom/ManageCustomTokensCW721';
import NFTAssetGroup from './NFTAssetGroup';
import styles from './NFTAssets.module.scss';
import NFTPlaceholder from './NFTPlaceholder';

const cx = classNames.bind(styles);

const NFTAssets = () => {
  const { t } = useTranslation();
  const address = useAddress();
  const { list: cw721 } = useCustomTokensCW721();
  const { list: erc721 } = useCustomTokensERC721();
  const empty = !address || (!cw721.length && !erc721.length);

  // const renderExtra = (render: boolean) => (
  //   <ModalButton
  //     title={t('NFT')}
  //     renderButton={(open) => {
  //       if (!render) return null;

  //       return (
  //         <InternalButton onClick={open} chevron>
  //           {t('Add tokens')}
  //         </InternalButton>
  //       );
  //     }}
  //   >
  //     <ManageCustomTokensCW721 />
  //   </ModalButton>
  // );

  return (
    <Grid gap={16} className={cx({ placeholder: empty })}>
      {empty ? (
        <NFTPlaceholder />
      ) : (
        <Col>
          {cw721.map((item) => (
            <NFTAssetGroup key={item.contract} item={item} />
          ))}

          {erc721.map((item) => (
            <NFTAssetGroup key={item.contract} item={item} evm />
          ))}
        </Col>
      )}

      {/* To maintain the modal even if empty is false when add an NFT */}
      <ModalButton
        title={t('Manage NFT List')}
        renderButton={(open) => {
          return <Button onClick={open}>{t('Manage List')}</Button>;
        }}
      >
        <ManageCustomTokensCW721 />
      </ModalButton>
    </Grid>
  );
};

export default NFTAssets;
