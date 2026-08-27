/* eslint-disable no-console */
import extension from 'extensionizer';
import PortStream from 'extension-port-stream';

/* 연결된 모든 contentScript 포트 목록 */
const activePorts = [];

/* 모든 연결된 포트에 이벤트 메시지 브로드캐스트 */
const broadcastToAllPorts = (name, payload) => {
  activePorts.forEach((portStream) => {
    try {
      portStream.write({ name, payload });
    } catch (e) {
      console.warn('Xpla(background): broadcast failed', e);
    }
  });
};

/* wallet/network 변경 → 연결된 dApp에 이벤트 브로드캐스트 */
extension.storage.onChanged.addListener((changes, namespace) => {
  if (namespace !== 'local') return;

  // 계정 변경 (로그인·지갑 전환·로그아웃)
  if ('wallet' in changes) {
    const address = changes.wallet.newValue?.address;
    broadcastToAllPorts('accountsChanged', address ? [address] : []);
  }

  // 네트워크 변경 (chainID 가 달라질 때만)
  if ('network' in changes) {
    const { oldValue, newValue } = changes.network;
    if (newValue && oldValue && newValue.chainID !== oldValue.chainID) {
      broadcastToAllPorts('chainChanged', newValue.chainID);
    }
  }
});

const connectRemote = (remotePort) => {
  if (remotePort.name !== 'XplaExtension') {
    return;
  }

  const origin = remotePort.sender.origin || remotePort.sender.url;

  console.log('Xpla(background): connectRemote', remotePort);
  const portStream = new PortStream(remotePort);

  /* 포트 등록 및 disconnect 시 제거 */
  activePorts.push(portStream);
  remotePort.onDisconnect.addListener(() => {
    const idx = activePorts.indexOf(portStream);
    if (idx !== -1) activePorts.splice(idx, 1);
  });

  const sendResponse = (name, payload) => {
    portStream.write({ name, payload });
  };

  portStream.on('data', (data) => {
    console.log('Xpla(background): portStream.on', data);
    const { type, ...payload } = data;

    /* handle sign & post */
    const handleRequest = (key) => {
      const handleChange = (changes, namespace) => {
        // Detects changes in storage and returns responses if there are changes.
        // When the request is successful, it also closes the popup.
        if (namespace === 'local') {
          const { oldValue, newValue } = changes[key] || {};

          if (oldValue && newValue) {
            const changed = newValue.find(
              (post, index) =>
                oldValue[index] &&
                typeof oldValue[index].success === 'undefined' &&
                typeof post.success === 'boolean',
            );

            changed &&
              changed.origin === origin &&
              sendResponse('on' + capitalize(key), changed);

            extension.storage.local.get(
              ['sign', 'post'],
              ({ sign = [], post = [] }) => {
                const getRequest = ({ success }) =>
                  typeof success !== 'boolean';
                const nextRequest =
                  sign.some(getRequest) || post.some(getRequest);

                !nextRequest && closePopup();
              },
            );
          }
        }
      };

      const handleGet = (storage) => {
        // Check the storage for any duplicate requests already, place them at the end of the storage, and then open a popup.
        // Then it detects changes in storage. (See code above)
        // TODO: Even if the popup is already open, reactivate the popup
        const list = storage[key] || [];

        const alreadyRequested =
          list.findIndex(
            (req) => req.id === payload.id && req.origin === origin,
          ) !== -1;

        !alreadyRequested &&
          extension.storage.local.set({
            [key]: payload.purgeQueue
              ? [{ ...payload, origin }]
              : [...list, { ...payload, origin }],
          });

        openPopup();
        extension.storage.onChanged.addListener(handleChange);
      };

      extension.storage.local.get([key], handleGet);
    };

    switch (type) {
      case 'info':
        console.log('info');
        extension.storage.local.get(['network'], ({ network }) => {
          console.log(network);
          sendResponse('onInfo', network);
        });

        break;

      case 'connect':
        const handleChangeConnect = (changes, namespace) => {
          // It is recursive.
          // After referring to a specific value in the storage, perform the function listed below again.
          if (namespace === 'local') {
            const { newValue, oldValue } = changes.connect;

            const denied =
              oldValue &&
              oldValue.request.length - 1 === newValue.request.length &&
              oldValue.allowed.length === newValue.allowed.length;

            if (!denied)
              extension.storage.local.get(
                ['connect', 'wallet'],
                handleGetConnect,
              );
          }
        };

        const handleGetConnect = ({
          connect = { request: [], allowed: [] },
          wallet = {},
        }) => {
          // 1. If the address is authorized and the wallet exists
          //    - send back the response and close the popup.
          // 2. If not,
          //    - store the address on the storage and open the popup to request it (only if it is not the requested address).
          const isAllowed = connect.allowed.includes(origin);
          const walletExists = wallet.address;
          const alreadyRequested = [
            ...connect.request,
            ...connect.allowed,
          ].includes(origin);

          if (isAllowed && walletExists) {
            sendResponse('onConnect', wallet);
            closePopup();
            extension.storage.onChanged.removeListener(handleChangeConnect);
          } else {
            !alreadyRequested &&
              extension.storage.local.set({
                connect: { ...connect, request: [origin, ...connect.request] },
              });

            openPopup();
            extension.storage.onChanged.addListener(handleChangeConnect);
          }
        };

        extension.storage.local.get(['connect', 'wallet'], handleGetConnect);

        break;

      case 'sign':
        handleRequest('sign');
        break;

      case 'post':
        handleRequest('post');
        break;

      default:
        break;
    }
  });
};

extension.runtime.onConnect.addListener(connectRemote);

/* popup */
// TODO: Actions such as transaction rejection if user closes a popup
let tabId = undefined;
extension.tabs.onRemoved.addListener(() => (tabId = undefined));

const POPUP_WIDTH = 480;
const POPUP_HEIGHT = 600; // Chrome extension maximum height

const getCenter = (window) => {
  return {
    top: Math.floor(window.height / 2 - POPUP_HEIGHT / 2),
    left: Math.floor(window.width / 2 - POPUP_WIDTH / 2),
  };
};

const openPopup = () => {
  const popup = {
    type: 'popup',
    focused: true,
    width: POPUP_WIDTH,
    height: POPUP_HEIGHT,
  };
  !tabId &&
    extension.tabs.create(
      { url: extension.runtime.getURL('index.html'), active: false },
      (tab) => {
        tabId = tab.id;
        extension.windows.getCurrent((window) => {
          const center = getCenter(window);
          const top = Math.max(center.top, 0) || 0;
          const left = Math.max(center.left, 0) || 0;

          const config = { ...popup, tabId: tab.id, top, left };
          extension.windows.create(config);
        });
      },
    );
};

const closePopup = () => {
  tabId && extension.tabs.remove(tabId);
};

/* utils */
const capitalize = (string) => string.charAt(0).toUpperCase() + string.slice(1);

// Invoke alarm periodically to keep service worker persistent
extension.alarms.create('keep-alive-alarm', {
  periodInMinutes: 0.25,
  delayInMinutes: 0.25,
});

extension.alarms.onAlarm.addListener((alarm) => {
  // eslint-disable-next-line
  if (alarm.name === 'keep-alive-alarm') {
    console.log('Service worker kept alive'); // 로그 추가
    extension.runtime.getPlatformInfo(() => {
      console.log('Service worker kept alive');
    });
  }
});
