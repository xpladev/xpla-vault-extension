window.isXplaExtensionAvailable = true;

// ---------------------------------------------
// for multiple extension support
// ---------------------------------------------
const XPLA_WALLET_INFO = {
  name: 'XPLA Vault Wallet',
  identifier: 'xplavault',
  icon: 'http://assets.xpla.io/icon/extension/icon.png',
};

if (
  typeof window.xplaWallets !== 'undefined' &&
  Array.isArray(window.xplaWallets)
) {
  window.xplaWallets.push(XPLA_WALLET_INFO);
} else {
  window.xplaWallets = [XPLA_WALLET_INFO];
}
