
export default {
  bootstrap: () => import('./main.server.mjs').then(m => m.default),
  inlineCriticalCss: true,
  baseHref: '/',
  locale: undefined,
  routes: [
  {
    "renderMode": 1,
    "redirectTo": "/home",
    "route": "/"
  },
  {
    "renderMode": 1,
    "preload": [
      "chunk-V5RIH2VC.js",
      "chunk-WAHE36TI.js",
      "chunk-YIVIJGUR.js",
      "chunk-C45M3ALE.js",
      "chunk-DHNQFSCR.js"
    ],
    "route": "/home"
  },
  {
    "renderMode": 1,
    "preload": [
      "chunk-IGPZB4CB.js",
      "chunk-WAHE36TI.js",
      "chunk-YIVIJGUR.js",
      "chunk-C45M3ALE.js",
      "chunk-DHNQFSCR.js"
    ],
    "route": "/shop"
  },
  {
    "renderMode": 1,
    "preload": [
      "chunk-EIBLXRB2.js",
      "chunk-WAHE36TI.js"
    ],
    "route": "/categories"
  },
  {
    "renderMode": 1,
    "preload": [
      "chunk-VAN7DODO.js",
      "chunk-YIVIJGUR.js"
    ],
    "route": "/brands"
  },
  {
    "renderMode": 1,
    "preload": [
      "chunk-JEOBLBN4.js"
    ],
    "route": "/wishlist"
  },
  {
    "renderMode": 1,
    "preload": [
      "chunk-NP4VCAJW.js"
    ],
    "route": "/cart"
  },
  {
    "renderMode": 1,
    "preload": [
      "chunk-HYMBJCQS.js",
      "chunk-C45M3ALE.js",
      "chunk-DHNQFSCR.js"
    ],
    "route": "/details/*/*"
  },
  {
    "renderMode": 1,
    "preload": [
      "chunk-RZHCHTWT.js",
      "chunk-A3LVWZOR.js",
      "chunk-DHNQFSCR.js"
    ],
    "route": "/checkout/*"
  },
  {
    "renderMode": 1,
    "preload": [
      "chunk-7N6F3JDO.js",
      "chunk-A3LVWZOR.js"
    ],
    "route": "/allorders"
  },
  {
    "renderMode": 1,
    "preload": [
      "chunk-CHUFWF5B.js"
    ],
    "route": "/profile"
  },
  {
    "renderMode": 1,
    "preload": [
      "chunk-5GWM3NDQ.js",
      "chunk-DHNQFSCR.js"
    ],
    "route": "/login"
  },
  {
    "renderMode": 1,
    "preload": [
      "chunk-GZZ5RMFJ.js",
      "chunk-DHNQFSCR.js"
    ],
    "route": "/register"
  },
  {
    "renderMode": 1,
    "preload": [
      "chunk-E6EKIPLB.js",
      "chunk-DHNQFSCR.js"
    ],
    "route": "/forgot-password"
  },
  {
    "renderMode": 1,
    "preload": [
      "chunk-35GWHKLN.js"
    ],
    "route": "/**"
  }
],
  entryPointToBrowserMapping: undefined,
  assets: {
    'index.csr.html': {size: 24166, hash: '402497bc0646ba4ce6f982c5fdce0c95fae89a0d1e1218cfc65741e936856554', text: () => import('./assets-chunks/index_csr_html.mjs').then(m => m.default)},
    'index.server.html': {size: 5744, hash: 'f355f7a65b7557f815fe851675b5772361c73b2b85a0572092067baa05d39b70', text: () => import('./assets-chunks/index_server_html.mjs').then(m => m.default)},
    'styles-IXYRNWQX.css': {size: 213798, hash: 'ibs+QRG239Q', text: () => import('./assets-chunks/styles-IXYRNWQX_css.mjs').then(m => m.default)}
  },
};
