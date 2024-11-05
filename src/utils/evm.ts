import { AccAddress, ValAddress, ValConsAddress } from '@xpla/xpla.js';
import { bech32 } from 'bech32';
import eip55 from 'eip55';
// import { toChecksumAddress } from 'ethereumjs-util';

const { encode, decode, fromWords, toWords } = bech32;

export const hexToBech32 = (
  prefix: string,
  hex: string | ArrayLike<number>,
) => {
  if (typeof hex === 'string') {
    if (hex.startsWith('0x')) hex = hex.substring(2);
    hex = hex.toLowerCase();
    hex = Buffer.from(hex, 'hex');
  }
  const words = toWords(hex);
  const bech32 = encode(prefix, words);
  return bech32;
};

export const bech32ToHex = (
  bech32: AccAddress | ValAddress | ValConsAddress,
) => {
  const { words } = decode(bech32);
  const hex = Buffer.from(fromWords(words));
  return hex;
};

export const bech32ToHexAddress = (
  bech32: AccAddress | ValAddress | ValConsAddress,
) => {
  const hex = bech32ToHex(bech32);
  const hexAddress = '0x' + hex.toString('hex').toLowerCase();
  return hexAddress;
};

/**
 * EIP-55: Mixed-case checksum address encoding
 * @see https://eips.ethereum.org/EIPS/eip-55
 * @param bech32 bech32 address
 * @returns EIP-55 formatted hex address
 */
// export const bech32ToEthereumAddress = (
//   bech32: AccAddress | ValAddress | ValConsAddress,
// ) => {
//   const hexAddress = bech32ToHexAddress(bech32);
//   const ethereumAddress = toChecksumAddress(hexAddress);
//   return ethereumAddress;
// };

export const bech32ToEip55 = (
  bech32: AccAddress | ValAddress | ValConsAddress,
) => {
  const hex = bech32ToHex(bech32);
  const hexAddress = eip55.encode(hex.toString('hex'));
  return hexAddress;
};
