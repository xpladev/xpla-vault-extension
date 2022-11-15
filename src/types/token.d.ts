type XplaAddress = string;

type Amount = string;
type Value = string | number;
type Price = number;

/* coin | token */
type CoinDenom = string; // axpla
type IBCDenom = string; // ibc/...
type TokenAddress = XplaAddress;
type Denom = CoinDenom | IBCDenom;
type Token = Denom | TokenAddress;

/* asset info */
interface Asset {
  amount: Amount;
  info: AssetInfo;
}

type AssetInfo = AssetInfoNativeToken | AssetInfoCW20Token;

interface AssetInfoNativeToken {
  native_token: { denom: Denom };
}

interface AssetInfoCW20Token {
  token: { contract_addr: XplaAddress };
}

/* token item */
interface TokenItem {
  token: XplaAddress;
  decimals: number;
  symbol: string;
  name?: string;
  icon?: string;
}

interface TokenItemWithBalance extends TokenItem {
  balance: string;
}

/* native */
interface CoinData {
  amount: Amount;
  denom: Denom;
}

/* ibc */
type IBCWhitelist = Record<string, IBCTokenItem>;

interface IBCTokenInfoResponse {
  path: string;
  base_denom: string;
}

interface IBCTokenItem extends IBCTokenInfoResponse {
  denom: string;
  symbol: string;
  name: string;
  icon: string;
  decimals?: number;
}

/* cw20 */
type CW20Contracts = Record<XplaAddress, CW20ContractItem>;
type CW20Whitelist = Record<XplaAddress, CW20TokenItem>;

interface CW20ContractItem {
  protocol: string;
  name: string;
  icon: string;
}

interface CW20TokenInfoResponse {
  symbol: string;
  name: string;
  decimals: number;
}

interface CW20TokenItem extends CW20TokenInfoResponse {
  token: XplaAddress;
  protocol?: string;
  icon?: string;
}

/* cw20: pair */
type CW20Pairs = Record<XplaAddress, PairDetails>;
type Dex = 'xplaswap' | 'astroport';
type PairType = 'xyk' | 'stable';
interface PairDetails {
  dex: Dex;
  type: PairType;
  assets: Pair;
}

type Pair = [Token, Token];

/* cw721 */
interface CW721ContractInfoResponse {
  name: string;
  symbol: string;
  decimals: number;
}

interface CW721ContractItem extends CW721ContractInfoResponse {
  contract: XplaAddress;
  protocol?: string;
  icon?: string;
  homepage?: string;
  marketplace?: string[];
}

type CW721Whitelist = Record<XplaAddress, CW721ContractItem>;

interface NFTTokenItem {
  token_uri?: string;
  extension?: Extension;
}

interface Extension {
  name?: string;
  description?: string;
  image?: string;
}
