window.isXplaExtensionAvailable = true;

// ---------------------------------------------
// for multiple extension support
// ---------------------------------------------
const XPLA_WALLET_INFO = {
  name: 'XPLA Vault Wallet',
  identifier: 'xplavault',
  icon: 'https://assets.xpla.io/icon/extension/icon.png',
};

if (
  typeof window.xplaWallets !== 'undefined' &&
  Array.isArray(window.xplaWallets)
) {
  window.xplaWallets.push(XPLA_WALLET_INFO);
} else {
  window.xplaWallets = [XPLA_WALLET_INFO];
}

// ---------------------------------------------
// window.xpla Provider — account/network change event API
// ---------------------------------------------
(function () {
  const listeners = {
    accountsChanged: [],
    chainChanged: [],
  };

  const xplaProvider = {
    /**
     * 이벤트 리스너 등록
     * @param {'accountsChanged'|'chainChanged'} event
     * @param {Function} callback
     */
    on: function (event, callback) {
      if (listeners[event]) {
        listeners[event].push(callback);
      }
    },

    /**
     * 이벤트 리스너 제거
     * @param {'accountsChanged'|'chainChanged'} event
     * @param {Function} callback
     */
    off: function (event, callback) {
      if (listeners[event]) {
        listeners[event] = listeners[event].filter(function (cb) {
          return cb !== callback;
        });
      }
    },

    /** @internal background 브로드캐스트 메시지를 받아 리스너에 전달 */
    _emit: function (event, payload) {
      if (listeners[event]) {
        listeners[event].forEach(function (cb) {
          try {
            cb(payload);
          } catch (e) {
            console.error('xplaProvider._emit error', e);
          }
        });
      }
    },
  };

  window.xpla = xplaProvider;

  // background → contentScript(pageStream) → window.postMessage 경로로 전달되는
  // accountsChanged / chainChanged 메시지를 수신하여 Provider 이벤트로 전달
  window.addEventListener('message', function (event) {
    if (event.source !== window) return;

    var msg = event.data;
    if (!msg || typeof msg !== 'object') return;

    // contentScript LocalMessageDuplexStream 메시지 포맷: { target, data }
    if (msg.target !== 'xplavault:inpage') return;

    var data = msg.data;
    if (!data || typeof data !== 'object') return;

    var name = data.name;
    if (name === 'accountsChanged' || name === 'chainChanged') {
      xplaProvider._emit(name, data.payload);
    }
  });
})();
