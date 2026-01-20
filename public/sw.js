if (!self.define) {
  let e,
    s = {};
  const a = (a, t) => (
    (a = new URL(a + '.js', t).href),
    s[a] ||
      new Promise((s) => {
        if ('document' in self) {
          const e = document.createElement('script');
          ((e.src = a),
            (e.onload = s),
            document.head.appendChild(e));
        } else ((e = a), importScripts(a), s());
      }).then(() => {
        let e = s[a];
        if (!e)
          throw new Error(
            `Module ${a} didn’t register its module`
          );
        return e;
      })
  );
  self.define = (t, i) => {
    const n =
      e ||
      ('document' in self
        ? document.currentScript.src
        : '') ||
      location.href;
    if (s[n]) return;
    let c = {};
    const r = (e) => a(e, n),
      u = { module: { uri: n }, exports: c, require: r };
    s[n] = Promise.all(t.map((e) => u[e] || r(e))).then(
      (e) => (i(...e), c)
    );
  };
}
define(['./workbox-00a24876'], function (e) {
  'use strict';
  (importScripts(),
    self.skipWaiting(),
    e.clientsClaim(),
    e.precacheAndRoute(
      [
        {
          url: '/_next/static/chunks/1486-62588752925f87f9.js',
          revision: '62588752925f87f9',
        },
        {
          url: '/_next/static/chunks/164f4fb6-67211e558fa5de32.js',
          revision: '67211e558fa5de32',
        },
        {
          url: '/_next/static/chunks/1966.b8f83f7ba376c962.js',
          revision: 'b8f83f7ba376c962',
        },
        {
          url: '/_next/static/chunks/1992.d220c685821eae19.js',
          revision: 'd220c685821eae19',
        },
        {
          url: '/_next/static/chunks/2900-6ca03c02c43b25ca.js',
          revision: '6ca03c02c43b25ca',
        },
        {
          url: '/_next/static/chunks/2f0b94e8-ce53c98b232310fc.js',
          revision: 'ce53c98b232310fc',
        },
        {
          url: '/_next/static/chunks/3794-0fa92e90b939f74c.js',
          revision: '0fa92e90b939f74c',
        },
        {
          url: '/_next/static/chunks/3899.3f761f7e3a944e8c.js',
          revision: '3f761f7e3a944e8c',
        },
        {
          url: '/_next/static/chunks/4bd1b696-e5d7c65570c947b7.js',
          revision: 'e5d7c65570c947b7',
        },
        {
          url: '/_next/static/chunks/5481-a4496736c8460371.js',
          revision: 'a4496736c8460371',
        },
        {
          url: '/_next/static/chunks/5902.b511719cc8efa9e5.js',
          revision: 'b511719cc8efa9e5',
        },
        {
          url: '/_next/static/chunks/6283-c173af4583a278e4.js',
          revision: 'c173af4583a278e4',
        },
        {
          url: '/_next/static/chunks/7656-558370563d85e330.js',
          revision: '558370563d85e330',
        },
        {
          url: '/_next/static/chunks/773-4d21e51ccd604baf.js',
          revision: '4d21e51ccd604baf',
        },
        {
          url: '/_next/static/chunks/7980-ae5ee8be8de5d6af.js',
          revision: 'ae5ee8be8de5d6af',
        },
        {
          url: '/_next/static/chunks/8500-98e13bcce54aa7a0.js',
          revision: '98e13bcce54aa7a0',
        },
        {
          url: '/_next/static/chunks/8823-645a1148b3c8426e.js',
          revision: '645a1148b3c8426e',
        },
        {
          url: '/_next/static/chunks/8981-f7434d10a45a49a7.js',
          revision: 'f7434d10a45a49a7',
        },
        {
          url: '/_next/static/chunks/ad2866b8.6c51983a1eb56136.js',
          revision: '6c51983a1eb56136',
        },
        {
          url: '/_next/static/chunks/app/_global-error/page-028e67f4e107ed3b.js',
          revision: '028e67f4e107ed3b',
        },
        {
          url: '/_next/static/chunks/app/_not-found/page-f2c79f328983d203.js',
          revision: 'f2c79f328983d203',
        },
        {
          url: '/_next/static/chunks/app/admin/login/page-a5e29921eecfc76c.js',
          revision: 'a5e29921eecfc76c',
        },
        {
          url: '/_next/static/chunks/app/admin/page-1a8aa6cbd06400db.js',
          revision: '1a8aa6cbd06400db',
        },
        {
          url: '/_next/static/chunks/app/admin/signup/page-afba2db19fd1586b.js',
          revision: 'afba2db19fd1586b',
        },
        {
          url: '/_next/static/chunks/app/api/admin/library/route-028e67f4e107ed3b.js',
          revision: '028e67f4e107ed3b',
        },
        {
          url: '/_next/static/chunks/app/api/admin/signup/route-028e67f4e107ed3b.js',
          revision: '028e67f4e107ed3b',
        },
        {
          url: '/_next/static/chunks/app/api/auth/login/route-028e67f4e107ed3b.js',
          revision: '028e67f4e107ed3b',
        },
        {
          url: '/_next/static/chunks/app/api/calendar/notes/route-028e67f4e107ed3b.js',
          revision: '028e67f4e107ed3b',
        },
        {
          url: '/_next/static/chunks/app/api/calendar/sync/route-028e67f4e107ed3b.js',
          revision: '028e67f4e107ed3b',
        },
        {
          url: '/_next/static/chunks/app/api/chat/history/route-028e67f4e107ed3b.js',
          revision: '028e67f4e107ed3b',
        },
        {
          url: '/_next/static/chunks/app/api/chat/mastery/create/route-028e67f4e107ed3b.js',
          revision: '028e67f4e107ed3b',
        },
        {
          url: '/_next/static/chunks/app/api/chat/mastery/delete/route-028e67f4e107ed3b.js',
          revision: '028e67f4e107ed3b',
        },
        {
          url: '/_next/static/chunks/app/api/chat/mastery/route-028e67f4e107ed3b.js',
          revision: '028e67f4e107ed3b',
        },
        {
          url: '/_next/static/chunks/app/api/chat/mastery/update/route-028e67f4e107ed3b.js',
          revision: '028e67f4e107ed3b',
        },
        {
          url: '/_next/static/chunks/app/api/chat/message/route-028e67f4e107ed3b.js',
          revision: '028e67f4e107ed3b',
        },
        {
          url: '/_next/static/chunks/app/api/chatbot/route-028e67f4e107ed3b.js',
          revision: '028e67f4e107ed3b',
        },
        {
          url: '/_next/static/chunks/app/api/classrooms/join/route-028e67f4e107ed3b.js',
          revision: '028e67f4e107ed3b',
        },
        {
          url: '/_next/static/chunks/app/api/courses/%5Bid%5D/route-028e67f4e107ed3b.js',
          revision: '028e67f4e107ed3b',
        },
        {
          url: '/_next/static/chunks/app/api/courses/generate/route-028e67f4e107ed3b.js',
          revision: '028e67f4e107ed3b',
        },
        {
          url: '/_next/static/chunks/app/api/courses/image/generate/route-028e67f4e107ed3b.js',
          revision: '028e67f4e107ed3b',
        },
        {
          url: '/_next/static/chunks/app/api/courses/route-028e67f4e107ed3b.js',
          revision: '028e67f4e107ed3b',
        },
        {
          url: '/_next/static/chunks/app/api/library/route-028e67f4e107ed3b.js',
          revision: '028e67f4e107ed3b',
        },
        {
          url: '/_next/static/chunks/app/api/reports/generate/route-028e67f4e107ed3b.js',
          revision: '028e67f4e107ed3b',
        },
        {
          url: '/_next/static/chunks/app/api/reports/student/route-028e67f4e107ed3b.js',
          revision: '028e67f4e107ed3b',
        },
        {
          url: '/_next/static/chunks/app/api/teacher/classrooms/%5Bid%5D/members/route-028e67f4e107ed3b.js',
          revision: '028e67f4e107ed3b',
        },
        {
          url: '/_next/static/chunks/app/api/teacher/classrooms/%5Bid%5D/route-028e67f4e107ed3b.js',
          revision: '028e67f4e107ed3b',
        },
        {
          url: '/_next/static/chunks/app/api/teacher/classrooms/route-028e67f4e107ed3b.js',
          revision: '028e67f4e107ed3b',
        },
        {
          url: '/_next/static/chunks/app/api/tests/generate/route-028e67f4e107ed3b.js',
          revision: '028e67f4e107ed3b',
        },
        {
          url: '/_next/static/chunks/app/api/tests/submit/route-028e67f4e107ed3b.js',
          revision: '028e67f4e107ed3b',
        },
        {
          url: '/_next/static/chunks/app/calendar/page-c08f6adc5e7f3109.js',
          revision: 'c08f6adc5e7f3109',
        },
        {
          url: '/_next/static/chunks/app/chat/page-75656bcd3fd5cbff.js',
          revision: '75656bcd3fd5cbff',
        },
        {
          url: '/_next/static/chunks/app/course/%5Bid%5D/page-0b45629de4b45e6e.js',
          revision: '0b45629de4b45e6e',
        },
        {
          url: '/_next/static/chunks/app/course/%5Bid%5D/quiz/page-59dfd4d43877af0d.js',
          revision: '59dfd4d43877af0d',
        },
        {
          url: '/_next/static/chunks/app/dashboard/classrooms/page-c7582d358b8fd425.js',
          revision: 'c7582d358b8fd425',
        },
        {
          url: '/_next/static/chunks/app/dashboard/page-08f3fdec345790e1.js',
          revision: '08f3fdec345790e1',
        },
        {
          url: '/_next/static/chunks/app/dashboard/profile/page-86543f4674a420ef.js',
          revision: '86543f4674a420ef',
        },
        {
          url: '/_next/static/chunks/app/downloads/page-29518e750e1ee421.js',
          revision: '29518e750e1ee421',
        },
        {
          url: '/_next/static/chunks/app/layout-27fe879c87ddb181.js',
          revision: '27fe879c87ddb181',
        },
        {
          url: '/_next/static/chunks/app/library/page-ee8f58461402e82e.js',
          revision: 'ee8f58461402e82e',
        },
        {
          url: '/_next/static/chunks/app/login/page-122587053a4fa093.js',
          revision: '122587053a4fa093',
        },
        {
          url: '/_next/static/chunks/app/page-417fc886512e3886.js',
          revision: '417fc886512e3886',
        },
        {
          url: '/_next/static/chunks/app/planner/page-6f974495749ea126.js',
          revision: '6f974495749ea126',
        },
        {
          url: '/_next/static/chunks/app/settings/page-0b5fa56175b2ddc0.js',
          revision: '0b5fa56175b2ddc0',
        },
        {
          url: '/_next/static/chunks/app/teacher/page-37e4953f4d99de45.js',
          revision: '37e4953f4d99de45',
        },
        {
          url: '/_next/static/chunks/app/teacher/students/page-73cac1a8843e62af.js',
          revision: '73cac1a8843e62af',
        },
        {
          url: '/_next/static/chunks/bc98253f.1c4ca5773e357da2.js',
          revision: '1c4ca5773e357da2',
        },
        {
          url: '/_next/static/chunks/framework-f9945a3298379151.js',
          revision: 'f9945a3298379151',
        },
        {
          url: '/_next/static/chunks/main-app-eadcdb44168062ec.js',
          revision: 'eadcdb44168062ec',
        },
        {
          url: '/_next/static/chunks/main-fd09e8703afee65e.js',
          revision: 'fd09e8703afee65e',
        },
        {
          url: '/_next/static/chunks/next/dist/client/components/builtin/app-error-028e67f4e107ed3b.js',
          revision: '028e67f4e107ed3b',
        },
        {
          url: '/_next/static/chunks/next/dist/client/components/builtin/forbidden-028e67f4e107ed3b.js',
          revision: '028e67f4e107ed3b',
        },
        {
          url: '/_next/static/chunks/next/dist/client/components/builtin/global-error-8ad36346678187b3.js',
          revision: '8ad36346678187b3',
        },
        {
          url: '/_next/static/chunks/next/dist/client/components/builtin/not-found-028e67f4e107ed3b.js',
          revision: '028e67f4e107ed3b',
        },
        {
          url: '/_next/static/chunks/next/dist/client/components/builtin/unauthorized-028e67f4e107ed3b.js',
          revision: '028e67f4e107ed3b',
        },
        {
          url: '/_next/static/chunks/polyfills-42372ed130431b0a.js',
          revision: '846118c33b2c0e922d7b3a7676f81f6f',
        },
        {
          url: '/_next/static/chunks/webpack-c10dbbccdb81177a.js',
          revision: 'c10dbbccdb81177a',
        },
        {
          url: '/_next/static/css/3c015f13b3b8ef41.css',
          revision: '3c015f13b3b8ef41',
        },
        {
          url: '/_next/static/css/5d3c5cff17ca562c.css',
          revision: '5d3c5cff17ca562c',
        },
        {
          url: '/_next/static/media/62c97acc3aa63787-s.p.woff2',
          revision: 'e57915c86b86dbb75d04cce3376a8343',
        },
        {
          url: '/_next/static/media/6ced06489fd81a3f-s.woff2',
          revision: 'd935374b20a3bef1455f0b318ebbd101',
        },
        {
          url: '/_next/static/media/aa5f74293546f6d0-s.woff2',
          revision: '930b65138a24195edf55d50337220605',
        },
        {
          url: '/_next/static/wEDh6xWlPrUPxsSuprvLO/_buildManifest.js',
          revision: 'f7874da9d73f5c90d1da04aa1e141fa0',
        },
        {
          url: '/_next/static/wEDh6xWlPrUPxsSuprvLO/_ssgManifest.js',
          revision: 'b6652df95db52feb4daf4eca35380933',
        },
        {
          url: '/favicon.ico',
          revision: '281cfd5367d6a26c6d52ecdd6814da8a',
        },
        {
          url: '/icons/icon-128x128.png',
          revision: '8a7ea1c7237ebf3c3c58d3554a92e233',
        },
        {
          url: '/icons/icon-144x144.png',
          revision: '8a7ea1c7237ebf3c3c58d3554a92e233',
        },
        {
          url: '/icons/icon-152x152.png',
          revision: '8a7ea1c7237ebf3c3c58d3554a92e233',
        },
        {
          url: '/icons/icon-192x192.png',
          revision: '4854a147fab9e33d854e5fa9cc7d4b35',
        },
        {
          url: '/icons/icon-384x384.png',
          revision: '4854a147fab9e33d854e5fa9cc7d4b35',
        },
        {
          url: '/icons/icon-512x512.png',
          revision: '1c68d33c40566f9cfaf890749b3d15b7',
        },
        {
          url: '/icons/icon-72x72.png',
          revision: '8a7ea1c7237ebf3c3c58d3554a92e233',
        },
        {
          url: '/icons/icon-96x96.png',
          revision: '8a7ea1c7237ebf3c3c58d3554a92e233',
        },
        {
          url: '/manifest.json',
          revision: '68b6c0b7fe7407e3d939f46cb4cc3506',
        },
      ],
      { ignoreURLParametersMatching: [] }
    ),
    e.cleanupOutdatedCaches(),
    e.registerRoute(
      '/',
      new e.NetworkFirst({
        cacheName: 'start-url',
        plugins: [
          {
            cacheWillUpdate: async ({
              request: e,
              response: s,
              event: a,
              state: t,
            }) =>
              s && 'opaqueredirect' === s.type
                ? new Response(s.body, {
                    status: 200,
                    statusText: 'OK',
                    headers: s.headers,
                  })
                : s,
          },
        ],
      }),
      'GET'
    ),
    e.registerRoute(
      /^https:\/\/fonts\.(?:gstatic)\.com\/.*/i,
      new e.CacheFirst({
        cacheName: 'google-fonts-webfonts',
        plugins: [
          new e.ExpirationPlugin({
            maxEntries: 4,
            maxAgeSeconds: 31536e3,
          }),
        ],
      }),
      'GET'
    ),
    e.registerRoute(
      /\.(?:eot|otf|ttc|ttf|woff|woff2|font.css)$/i,
      new e.StaleWhileRevalidate({
        cacheName: 'static-font-assets',
        plugins: [
          new e.ExpirationPlugin({
            maxEntries: 4,
            maxAgeSeconds: 604800,
          }),
        ],
      }),
      'GET'
    ),
    e.registerRoute(
      /\.(?:jpg|jpeg|gif|png|svg|ico|webp)$/i,
      new e.StaleWhileRevalidate({
        cacheName: 'static-image-assets',
        plugins: [
          new e.ExpirationPlugin({
            maxEntries: 64,
            maxAgeSeconds: 86400,
          }),
        ],
      }),
      'GET'
    ),
    e.registerRoute(
      /\/_next\/image\?url=.+$/i,
      new e.StaleWhileRevalidate({
        cacheName: 'next-image',
        plugins: [
          new e.ExpirationPlugin({
            maxEntries: 64,
            maxAgeSeconds: 86400,
          }),
        ],
      }),
      'GET'
    ),
    e.registerRoute(
      /\.(?:js)$/i,
      new e.StaleWhileRevalidate({
        cacheName: 'static-js-assets',
        plugins: [
          new e.ExpirationPlugin({
            maxEntries: 32,
            maxAgeSeconds: 86400,
          }),
        ],
      }),
      'GET'
    ),
    e.registerRoute(
      /\.(?:css|less)$/i,
      new e.StaleWhileRevalidate({
        cacheName: 'static-style-assets',
        plugins: [
          new e.ExpirationPlugin({
            maxEntries: 32,
            maxAgeSeconds: 86400,
          }),
        ],
      }),
      'GET'
    ),
    e.registerRoute(
      /\/_next\/data\/.+\/.+\.json$/i,
      new e.StaleWhileRevalidate({
        cacheName: 'next-data',
        plugins: [
          new e.ExpirationPlugin({
            maxEntries: 32,
            maxAgeSeconds: 86400,
          }),
        ],
      }),
      'GET'
    ),
    e.registerRoute(
      /\/api\/(?!.*downloads).*/i,
      new e.NetworkFirst({
        cacheName: 'api-cache',
        networkTimeoutSeconds: 10,
        plugins: [
          new e.ExpirationPlugin({
            maxEntries: 16,
            maxAgeSeconds: 300,
          }),
        ],
      }),
      'GET'
    ));
});
