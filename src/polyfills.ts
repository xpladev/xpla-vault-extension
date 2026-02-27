/**
 * Node.js 폴리필 + React 19 하위 호환 shim
 * 반드시 src/index.tsx의 첫 번째 import여야 함.
 */

// ─── 1. Buffer 전역 주입 ──────────────────────────────────────────────────────
// ─── 2. Recoil → React 19 호환 shim ──────────────────────────────────────────
// 핵심 원인:
//   Recoil의 pre-bundled CJS 청크가 `import_react.default.__SECRET_INTERNALS_...`로 접근
//   → `import * as React` (namespace)가 아닌 `import React` (default = CJS module.exports)에 설정해야 함
//
// React 19 변경사항:
//   __SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED 제거
//   → __CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE 로 대체
//   → .H = 현재 hooks dispatcher (구 ReactCurrentDispatcher.current)
import React from 'react';
import Buffer from 'vite-plugin-node-polyfills/shims/buffer';

globalThis.Buffer = globalThis.Buffer ?? Buffer;

const R = React as unknown as Record<string, unknown>;
const i = R[
  '__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE'
] as Record<string, unknown> | undefined;

if (i && !R['__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED']) {
  const dispatcherRef = {
    get current() {
      return i.H as object | null;
    },
    set current(v) {
      i.H = v;
    },
  };
  R['__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED'] = {
    ReactCurrentDispatcher: dispatcherRef,
    ReactCurrentOwner: {
      current: null,
      get currentDispatcher() {
        return i.H as object | null;
      },
    },
    ReactCurrentBatchConfig: { transition: null },
    IsSomeRendererActing: { current: false },
  };
}
