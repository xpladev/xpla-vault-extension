/* eslint-disable no-console */
import extension from 'extensionizer';
import PortStream from 'extension-port-stream';
import LocalMessageDuplexStream from 'post-message-stream';

if (shouldInjectProvider()) {
  injectScript();
  start();
}

/**
 * Injects a script tag into the current document
 *
 * @param {string} content - Code to be executed in the current document
 */
function injectScript() {
  try {
    const container = document.head || document.documentElement;
    const scriptTag = document.createElement('script');
    // FIXME (Ian Lee) <script async="false"> is useless. both async="false" and async="true" operate in async="true"
    //  by removing async attribute, the `inpage.js` will be complated before DOM loading.
    //scriptTag.setAttribute('async', 'false')
    scriptTag.setAttribute('src', extension.runtime.getURL('inpage.js'));
    container.insertBefore(scriptTag, container.children[0]);
    container.removeChild(scriptTag);
  } catch (e) {
    console.error('MsgDemo provider injection failed.', e);
  }
}

/**
 * Sets up the stream communication and submits site metadata
 *
 */
async function start() {
  await setupStreams();
  await domIsReady();
}

/**
 * Determines if the provider should be injected
 *
 * @returns {boolean} {@code true} - if the provider should be injected
 */
function shouldInjectProvider() {
  return doctypeCheck() && suffixCheck() && documentElementCheck();
}

/**
 * Checks the doctype of the current document if it exists
 *
 * @returns {boolean} {@code true} - if the doctype is html or if none exists
 */
function doctypeCheck() {
  const { doctype } = window.document;
  if (doctype) {
    return doctype.name === 'html';
  }
  return true;
}

/**
 * Returns whether or not the extension (suffix) of the current document is prohibited
 *
 * This checks {@code window.location.pathname} against a set of file extensions
 * that we should not inject the provider into. This check is indifferent of
 * query parameters in the location.
 *
 * @returns {boolean} - whether or not the extension of the current document is prohibited
 */
function suffixCheck() {
  const prohibitedTypes = [/\.xml$/, /\.pdf$/];
  const currentUrl = window.location.pathname;
  for (let i = 0; i < prohibitedTypes.length; i += 1) {
    if (prohibitedTypes[i].test(currentUrl)) {
      return false;
    }
  }
  return true;
}

/**
 * Checks the documentElement of the current document
 *
 * @returns {boolean} {@code true} - if the documentElement is an html node or if none exists
 */
function documentElementCheck() {
  const documentElement = document.documentElement.nodeName;
  if (documentElement) {
    return documentElement.toLowerCase() === 'html';
  }
  return true;
}

/**
 * Sets up two-way communication streams between the
 * browser extension and local per-page browser context.
 * pageStream은 inpage.js와의 SYN/ACK 핸드셰이크가 완료된 스트림이므로 유지하고,
 * extensionStream(background.js 포트)만 재연결한다.
 */
async function setupStreams() {
  const pageStream = new LocalMessageDuplexStream({
    name: 'xplavault:content',
    target: 'xplavault:inpage',
  });

  connectToBackground(pageStream);
}

/**
 * background.js Service Worker에 포트를 연결하고,
 * MV3 Service Worker 종료 시 자동으로 재연결한다.
 *
 * @param {LocalMessageDuplexStream} pageStream - inpage.js와의 스트림 (유지)
 */
function connectToBackground(pageStream) {
  const extensionPort = extension.runtime.connect({
    name: 'XplaExtension',
  });
  const extensionStream = new PortStream(extensionPort);

  // 미처리 에러로 인한 크래시 방지
  extensionStream.on('error', (err) => {
    console.warn('Xpla(contentScript): extension stream error', err);
  });

  // end:false → extensionStream 종료 시 pageStream이 닫히지 않도록 보호
  extensionStream.pipe(pageStream, { end: false });
  pageStream.pipe(extensionStream, { end: false });

  // MV3 Service Worker 종료 감지 → 자동 재연결
  extensionPort.onDisconnect.addListener(() => {
    extensionStream.unpipe(pageStream);
    pageStream.unpipe(extensionStream);
    setTimeout(() => connectToBackground(pageStream), 1000);
  });
}

/**
 * Returns a promise that resolves when the DOM is loaded (does not wait for images to load)
 */
function domIsReady() {
  // already loaded
  if (['interactive', 'complete'].includes(document.readyState)) {
    return Promise.resolve();
  }

  // wait for load
  return new Promise((resolve) =>
    window.addEventListener('DOMContentLoaded', resolve, { once: true }),
  );
}
