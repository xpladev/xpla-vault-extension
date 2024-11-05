type NetworkName = string;
type XplaNetworks = Record<NetworkName, XplaNetwork>;

interface XplaNetwork {
  name: NetworkName;
  chainID: string;
  lcd: string;
  ecd: string;
  api?: string;
}

type CustomNetworks = Record<NetworkName, CustomNetwork>;

interface CustomNetwork extends XplaNetwork {
  preconfigure?: boolean;
}
