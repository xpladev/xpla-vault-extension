import NFTAssetGroupCW721 from './NFTAssetGroupCW721';
import NFTAssetGroupERC721 from './NFTAssetGroupERC721';

interface Props {
  item: CW721ContractItem | ERC721ContractItem;
  evm?: boolean;
}

const NFTAssetGroup = (props: Props) => {
  const { item, evm } = props;

  return evm ? (
    <NFTAssetGroupERC721 {...item} />
  ) : (
    <NFTAssetGroupCW721 {...item} />
  );
};

export default NFTAssetGroup;
