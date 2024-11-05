/* Address book */
interface AddressBook {
  name: string;
  recipient: string;
  memo?: string;
}

/* Tokens */
type CustomTokens = Record<NetworkName, CustomTokensByNetwork>;

interface CustomTokensByNetwork {
  ibc: IBCTokenInfoResponse[];
  cw20: CW20TokenInfoResponse[];
  cw721: CW721ContractInfoResponse[];
  erc20: ERC20TokenInfoResponse[];
  erc721: ERC721ContractInfoResponse[];
}

type CustomToken =
  | CustomTokenIBC
  | CustomTokenCW20
  | CustomTokenCW721
  | CustomTokenERC20;

interface CustomTokenIBC extends IBCTokenItem {
  denom: IBCDenom;
}

interface CustomTokenCW20 extends CW20TokenInfoResponse {
  token: XplaAddress;
}

interface CustomTokenCW721 extends CW721ContractInfoResponse {
  contract: XplaAddress;
}

interface CustomTokenERC20 extends ERC20TokenInfoResponse {
  token: EvmAddress;
}

interface CustomTokenERC721 extends ERC721ContractInfoResponse {
  contract: EvmAddress;
}
