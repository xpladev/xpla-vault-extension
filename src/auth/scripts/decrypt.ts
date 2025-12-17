import CryptoJS from 'crypto-js';

const DEFAULT_KEY_CONF = {
  keySize: 256,
  iterations: 100,
};
const LEGACY_KEY_CONF = {
  keySize: 256,
  iterations: 100,
};

const decrypt = (transitmessage: string, pass: string, _key?: string) => {
  try {
    const salt = CryptoJS.enc.Hex.parse(transitmessage.substr(0, 32));
    const iv = CryptoJS.enc.Hex.parse(transitmessage.substr(32, 32));
    const encrypted = transitmessage.substring(64);

    let key: CryptoJS.lib.WordArray;
    if (_key === undefined) {
      key = CryptoJS.PBKDF2(pass, salt, {
        keySize: DEFAULT_KEY_CONF.keySize / 32,
        iterations: DEFAULT_KEY_CONF.iterations,
        hasher: CryptoJS.algo.SHA3,
      });
    } else {
      key = CryptoJS.enc.Hex.parse(_key);
    }

    let decrypted = '';
    try {
      decrypted = CryptoJS.AES.decrypt(encrypted, key, {
        iv: iv,
        padding: CryptoJS.pad.Pkcs7,
        mode: CryptoJS.mode.CBC,
      }).toString(CryptoJS.enc.Utf8);
    } catch {}

    if (decrypted.length === 0) {
      // decrypt with legacy key
      key = CryptoJS.PBKDF2(pass, salt, {
        keySize: LEGACY_KEY_CONF.keySize / 32,
        iterations: LEGACY_KEY_CONF.iterations,
        hasher: CryptoJS.algo.SHA1,
      });
      decrypted = CryptoJS.AES.decrypt(encrypted, key, {
        iv: iv,
        padding: CryptoJS.pad.Pkcs7,
        mode: CryptoJS.mode.CBC,
      }).toString(CryptoJS.enc.Utf8);
    }

    return decrypted;
  } catch (error) {
    return '';
  }
};

export default decrypt;
