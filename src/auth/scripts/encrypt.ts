import CryptoJS from 'crypto-js';

const DEFAULT_KEY_CONF = {
  keySize: 256,
  iterations: 100,
};

const encrypt = (msg: string, pass: string, _salt?: string, _iv?: string) => {
  try {
    let salt: CryptoJS.lib.WordArray;
    let iv: CryptoJS.lib.WordArray;
    if (_salt === undefined) {
      salt = CryptoJS.lib.WordArray.random(128 / 8);
    } else {
      salt = CryptoJS.enc.Hex.parse(_salt);
    }
    if (_iv === undefined) {
      iv = CryptoJS.lib.WordArray.random(128 / 8);
    } else {
      iv = CryptoJS.enc.Hex.parse(_iv);
    }

    const key = CryptoJS.PBKDF2(pass, salt, {
      keySize: DEFAULT_KEY_CONF.keySize / 32,
      iterations: DEFAULT_KEY_CONF.iterations,
      hasher: CryptoJS.algo.SHA3,
    });

    const encrypted = CryptoJS.AES.encrypt(msg, key, {
      iv: iv,
      padding: CryptoJS.pad.Pkcs7,
      mode: CryptoJS.mode.CBC,
    });

    const transitmessage =
      salt.toString() + iv.toString() + encrypted.toString();

    return transitmessage;
  } catch (error) {
    return '';
  }
};

export default encrypt;
