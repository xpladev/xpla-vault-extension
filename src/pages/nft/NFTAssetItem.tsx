import NFTAssetItemCW721 from './NFTAssetItemCW721';
import NFTAssetItemERC721 from './NFTAssetItemERC721';

interface Props {
  contract: XplaAddress | EvmAddress;
  id: string;
  compact?: boolean;
  evm?: boolean;
  tx?: boolean;
}

const NFTAssetItem = ({ contract, id, compact, evm, tx }: Props) => {
  return evm ? (
    <NFTAssetItemERC721 {...{ contract, id, compact, tx }} />
  ) : (
    <NFTAssetItemCW721 {...{ contract, id, compact, tx }} />
  );
};

export default NFTAssetItem;
