if (!self.define) {
  let a,
    e = {};
  const s = (s, c) => (
    (s = new URL(s + '.js', c).href),
    e[s] ||
      new Promise((e) => {
        if ('document' in self) {
          const a = document.createElement('script');
          ((a.src = s),
            (a.onload = e),
            document.head.appendChild(a));
        } else ((a = s), importScripts(s), e());
      }).then(() => {
        let a = e[s];
        if (!a)
          throw new Error(
            `Module ${s} didn’t register its module`
          );
        return a;
      })
  );
  self.define = (c, i) => {
    const t =
      a ||
      ('document' in self
        ? document.currentScript.src
        : '') ||
      location.href;
    if (e[t]) return;
    let n = {};
    const r = (a) => s(a, t),
      o = { module: { uri: t }, exports: n, require: r };
    e[t] = Promise.all(c.map((a) => o[a] || r(a))).then(
      (a) => (i(...a), n)
    );
  };
}
define(['./workbox-00a24876'], function (a) {
  'use strict';
  (importScripts(),
    self.skipWaiting(),
    a.clientsClaim(),
    a.precacheAndRoute(
      [
        {
          url: '/_next/static/6XZbJgjf_3-ELKwtpGFUQ/_buildManifest.js',
          revision: 'b8b67a430ac39e4c7b185bf19e6a964f',
        },
        {
          url: '/_next/static/6XZbJgjf_3-ELKwtpGFUQ/_ssgManifest.js',
          revision: 'b6652df95db52feb4daf4eca35380933',
        },
        {
          url: '/_next/static/chunks/1966.1560d0f43ac9a41a.js',
          revision: '1560d0f43ac9a41a',
        },
        {
          url: '/_next/static/chunks/2900-b1902d4c06d92350.js',
          revision: 'b1902d4c06d92350',
        },
        {
          url: '/_next/static/chunks/3794-cbad47926f58962d.js',
          revision: 'cbad47926f58962d',
        },
        {
          url: '/_next/static/chunks/3899.cf10152d8085e352.js',
          revision: 'cf10152d8085e352',
        },
        {
          url: '/_next/static/chunks/4bd1b696-bf5e0dbacfa5baef.js',
          revision: 'bf5e0dbacfa5baef',
        },
        {
          url: '/_next/static/chunks/5481-c0c9f07a70837bdb.js',
          revision: 'c0c9f07a70837bdb',
        },
        {
          url: '/_next/static/chunks/6283-5da213e1e7a4fea1.js',
          revision: '5da213e1e7a4fea1',
        },
        {
          url: '/_next/static/chunks/7656-939dda9b98bf26cf.js',
          revision: '939dda9b98bf26cf',
        },
        {
          url: '/_next/static/chunks/773-f6c2ef12d7db857a.js',
          revision: 'f6c2ef12d7db857a',
        },
        {
          url: '/_next/static/chunks/7839-d204abdc49ab643f.js',
          revision: 'd204abdc49ab643f',
        },
        {
          url: '/_next/static/chunks/7980-85d12dd68ead8c09.js',
          revision: '85d12dd68ead8c09',
        },
        {
          url: '/_next/static/chunks/8500-41fa79ac743d83f1.js',
          revision: '41fa79ac743d83f1',
        },
        {
          url: '/_next/static/chunks/8981-da391fbeb662b4fd.js',
          revision: 'da391fbeb662b4fd',
        },
        {
          url: '/_next/static/chunks/app/_global-error/page-8ab919f768ca7730.js',
          revision: '8ab919f768ca7730',
        },
        {
          url: '/_next/static/chunks/app/_not-found/page-83816277d7047bb8.js',
          revision: '83816277d7047bb8',
        },
        {
          url: '/_next/static/chunks/app/admin/login/page-2e42a69de6811d7d.js',
          revision: '2e42a69de6811d7d',
        },
        {
          url: '/_next/static/chunks/app/admin/page-cd1b1cc9a96b77cf.js',
          revision: 'cd1b1cc9a96b77cf',
        },
        {
          url: '/_next/static/chunks/app/admin/signup/page-b5f588024962f1ab.js',
          revision: 'b5f588024962f1ab',
        },
        {
          url: '/_next/static/chunks/app/api/admin/library/route-8ab919f768ca7730.js',
          revision: '8ab919f768ca7730',
        },
        {
          url: '/_next/static/chunks/app/api/admin/signup/route-8ab919f768ca7730.js',
          revision: '8ab919f768ca7730',
        },
        {
          url: '/_next/static/chunks/app/api/admin/stats/route-8ab919f768ca7730.js',
          revision: '8ab919f768ca7730',
        },
        {
          url: '/_next/static/chunks/app/api/auth/login/route-8ab919f768ca7730.js',
          revision: '8ab919f768ca7730',
        },
        {
          url: '/_next/static/chunks/app/api/calendar/notes/route-8ab919f768ca7730.js',
          revision: '8ab919f768ca7730',
        },
        {
          url: '/_next/static/chunks/app/api/calendar/sync/route-8ab919f768ca7730.js',
          revision: '8ab919f768ca7730',
        },
        {
          url: '/_next/static/chunks/app/api/chat/history/route-8ab919f768ca7730.js',
          revision: '8ab919f768ca7730',
        },
        {
          url: '/_next/static/chunks/app/api/chat/mastery/create/route-8ab919f768ca7730.js',
          revision: '8ab919f768ca7730',
        },
        {
          url: '/_next/static/chunks/app/api/chat/mastery/delete/route-8ab919f768ca7730.js',
          revision: '8ab919f768ca7730',
        },
        {
          url: '/_next/static/chunks/app/api/chat/mastery/route-8ab919f768ca7730.js',
          revision: '8ab919f768ca7730',
        },
        {
          url: '/_next/static/chunks/app/api/chat/mastery/update/route-8ab919f768ca7730.js',
          revision: '8ab919f768ca7730',
        },
        {
          url: '/_next/static/chunks/app/api/chat/message/route-8ab919f768ca7730.js',
          revision: '8ab919f768ca7730',
        },
        {
          url: '/_next/static/chunks/app/api/chatbot/route-8ab919f768ca7730.js',
          revision: '8ab919f768ca7730',
        },
        {
          url: '/_next/static/chunks/app/api/classrooms/join/route-8ab919f768ca7730.js',
          revision: '8ab919f768ca7730',
        },
        {
          url: '/_next/static/chunks/app/api/courses/%5Bid%5D/route-8ab919f768ca7730.js',
          revision: '8ab919f768ca7730',
        },
        {
          url: '/_next/static/chunks/app/api/courses/generate/route-8ab919f768ca7730.js',
          revision: '8ab919f768ca7730',
        },
        {
          url: '/_next/static/chunks/app/api/courses/image/generate/route-8ab919f768ca7730.js',
          revision: '8ab919f768ca7730',
        },
        {
          url: '/_next/static/chunks/app/api/courses/route-8ab919f768ca7730.js',
          revision: '8ab919f768ca7730',
        },
        {
          url: '/_next/static/chunks/app/api/library/route-8ab919f768ca7730.js',
          revision: '8ab919f768ca7730',
        },
        {
          url: '/_next/static/chunks/app/api/ocr/route-8ab919f768ca7730.js',
          revision: '8ab919f768ca7730',
        },
        {
          url: '/_next/static/chunks/app/api/reports/generate/route-8ab919f768ca7730.js',
          revision: '8ab919f768ca7730',
        },
        {
          url: '/_next/static/chunks/app/api/reports/student/route-8ab919f768ca7730.js',
          revision: '8ab919f768ca7730',
        },
        {
          url: '/_next/static/chunks/app/api/student/classrooms/%5Bid%5D/assignments/submit/route-8ab919f768ca7730.js',
          revision: '8ab919f768ca7730',
        },
        {
          url: '/_next/static/chunks/app/api/student/classrooms/%5Bid%5D/tests/attempt/route-8ab919f768ca7730.js',
          revision: '8ab919f768ca7730',
        },
        {
          url: '/_next/static/chunks/app/api/teacher/classrooms/%5Bid%5D/assignments/route-8ab919f768ca7730.js',
          revision: '8ab919f768ca7730',
        },
        {
          url: '/_next/static/chunks/app/api/teacher/classrooms/%5Bid%5D/library/route-8ab919f768ca7730.js',
          revision: '8ab919f768ca7730',
        },
        {
          url: '/_next/static/chunks/app/api/teacher/classrooms/%5Bid%5D/members/route-8ab919f768ca7730.js',
          revision: '8ab919f768ca7730',
        },
        {
          url: '/_next/static/chunks/app/api/teacher/classrooms/%5Bid%5D/route-8ab919f768ca7730.js',
          revision: '8ab919f768ca7730',
        },
        {
          url: '/_next/static/chunks/app/api/teacher/classrooms/%5Bid%5D/submissions/route-8ab919f768ca7730.js',
          revision: '8ab919f768ca7730',
        },
        {
          url: '/_next/static/chunks/app/api/teacher/classrooms/%5Bid%5D/tests/attempts/route-8ab919f768ca7730.js',
          revision: '8ab919f768ca7730',
        },
        {
          url: '/_next/static/chunks/app/api/teacher/classrooms/%5Bid%5D/tests/route-8ab919f768ca7730.js',
          revision: '8ab919f768ca7730',
        },
        {
          url: '/_next/static/chunks/app/api/teacher/classrooms/route-8ab919f768ca7730.js',
          revision: '8ab919f768ca7730',
        },
        {
          url: '/_next/static/chunks/app/api/tests/generate/route-8ab919f768ca7730.js',
          revision: '8ab919f768ca7730',
        },
        {
          url: '/_next/static/chunks/app/api/tests/submit/route-8ab919f768ca7730.js',
          revision: '8ab919f768ca7730',
        },
        {
          url: '/_next/static/chunks/app/calendar/page-4feeb46279e3136a.js',
          revision: '4feeb46279e3136a',
        },
        {
          url: '/_next/static/chunks/app/chat/page-82d94913e20166d7.js',
          revision: '82d94913e20166d7',
        },
        {
          url: '/_next/static/chunks/app/course/%5Bid%5D/page-f221e873ed535301.js',
          revision: 'f221e873ed535301',
        },
        {
          url: '/_next/static/chunks/app/course/%5Bid%5D/quiz/page-57e85742fa582916.js',
          revision: '57e85742fa582916',
        },
        {
          url: '/_next/static/chunks/app/dashboard/classrooms/%5Bid%5D/page-7c4dccc3ef669dea.js',
          revision: '7c4dccc3ef669dea',
        },
        {
          url: '/_next/static/chunks/app/dashboard/classrooms/page-9bdceca8ae6d05c0.js',
          revision: '9bdceca8ae6d05c0',
        },
        {
          url: '/_next/static/chunks/app/dashboard/page-4cdcc52aed26bad4.js',
          revision: '4cdcc52aed26bad4',
        },
        {
          url: '/_next/static/chunks/app/dashboard/profile/page-5776602fca41994a.js',
          revision: '5776602fca41994a',
        },
        {
          url: '/_next/static/chunks/app/downloads/page-0a026ac48ba14d48.js',
          revision: '0a026ac48ba14d48',
        },
        {
          url: '/_next/static/chunks/app/layout-1111f5613870dfb6.js',
          revision: '1111f5613870dfb6',
        },
        {
          url: '/_next/static/chunks/app/library/page-24a85e6b6498e0fe.js',
          revision: '24a85e6b6498e0fe',
        },
        {
          url: '/_next/static/chunks/app/login/page-32e797b32d5dac32.js',
          revision: '32e797b32d5dac32',
        },
        {
          url: '/_next/static/chunks/app/page-a564c65eb794847b.js',
          revision: 'a564c65eb794847b',
        },
        {
          url: '/_next/static/chunks/app/planner/page-623f4f19acb20460.js',
          revision: '623f4f19acb20460',
        },
        {
          url: '/_next/static/chunks/app/settings/page-1ffa026ba47cc66e.js',
          revision: '1ffa026ba47cc66e',
        },
        {
          url: '/_next/static/chunks/app/teacher/page-5eabf1d77502206e.js',
          revision: '5eabf1d77502206e',
        },
        {
          url: '/_next/static/chunks/app/teacher/students/page-ebb8dd2a91102e0c.js',
          revision: 'ebb8dd2a91102e0c',
        },
        {
          url: '/_next/static/chunks/framework-49e4fa4528eeb1a2.js',
          revision: '49e4fa4528eeb1a2',
        },
        {
          url: '/_next/static/chunks/main-06d4e1cfcebf984e.js',
          revision: '06d4e1cfcebf984e',
        },
        {
          url: '/_next/static/chunks/main-app-75547587aa974e66.js',
          revision: '75547587aa974e66',
        },
        {
          url: '/_next/static/chunks/next/dist/client/components/builtin/app-error-8ab919f768ca7730.js',
          revision: '8ab919f768ca7730',
        },
        {
          url: '/_next/static/chunks/next/dist/client/components/builtin/forbidden-8ab919f768ca7730.js',
          revision: '8ab919f768ca7730',
        },
        {
          url: '/_next/static/chunks/next/dist/client/components/builtin/global-error-f6ac2f48adb759f2.js',
          revision: 'f6ac2f48adb759f2',
        },
        {
          url: '/_next/static/chunks/next/dist/client/components/builtin/not-found-8ab919f768ca7730.js',
          revision: '8ab919f768ca7730',
        },
        {
          url: '/_next/static/chunks/next/dist/client/components/builtin/unauthorized-8ab919f768ca7730.js',
          revision: '8ab919f768ca7730',
        },
        {
          url: '/_next/static/chunks/polyfills-42372ed130431b0a.js',
          revision: '846118c33b2c0e922d7b3a7676f81f6f',
        },
        {
          url: '/_next/static/chunks/webpack-d82d31546c644b61.js',
          revision: 'd82d31546c644b61',
        },
        {
          url: '/_next/static/css/5d3c5cff17ca562c.css',
          revision: '5d3c5cff17ca562c',
        },
        {
          url: '/_next/static/css/c674b624c5e5adf4.css',
          revision: 'c674b624c5e5adf4',
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
          url: '/course-images/1.png',
          revision: '8c62be0a450b1baf123691699be250c9',
        },
        {
          url: '/course-images/2.png',
          revision: 'c9b57a8724459835d8d25024eee330b6',
        },
        {
          url: '/course-images/3.png',
          revision: 'accf4aa882766c60a4ea47503f19abcf',
        },
        {
          url: '/course-images/4340f19b-acc2-4efc-823a-d6fc64ad5752.jpg',
          revision: '22c449e29574a7c34de204b38fa7bc67',
        },
        {
          url: '/default_pics/blue.jpg',
          revision: '7a2fd972c322f9c85b0b462887df047f',
        },
        {
          url: '/default_pics/green.jpg',
          revision: 'dbc82ed1cc6a48a2d418580129972d30',
        },
        {
          url: '/default_pics/purple.jpg',
          revision: '18a5ea0d7601538b0a3da877d1ef9de1',
        },
        {
          url: '/default_pics/red.png',
          revision: '04c2c080c26d897cb03682f1388e2d1a',
        },
        {
          url: '/default_pics/yellow.jpg',
          revision: 'be42c59ffdd56a3a0b90d58084dea11e',
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
        {
          url: '/sample_videos/video1.mp4',
          revision: '7938ca9e5e8a3c2125c3e12b2d25a149',
        },
        {
          url: '/sample_videos/video2.mp4',
          revision: '0776db7a4fb7ccd624e089f0f97d07ea',
        },
        {
          url: '/sample_videos/video3.mp4',
          revision: 'bbb939e5b23390917bfc88e3859e6efc',
        },
      ],
      { ignoreURLParametersMatching: [] }
    ),
    a.cleanupOutdatedCaches(),
    a.registerRoute(
      '/',
      new a.NetworkFirst({
        cacheName: 'start-url',
        plugins: [
          {
            cacheWillUpdate: async ({
              request: a,
              response: e,
              event: s,
              state: c,
            }) =>
              e && 'opaqueredirect' === e.type
                ? new Response(e.body, {
                    status: 200,
                    statusText: 'OK',
                    headers: e.headers,
                  })
                : e,
          },
        ],
      }),
      'GET'
    ),
    a.registerRoute(
      /^https:\/\/fonts\.(?:gstatic)\.com\/.*/i,
      new a.CacheFirst({
        cacheName: 'google-fonts-webfonts',
        plugins: [
          new a.ExpirationPlugin({
            maxEntries: 4,
            maxAgeSeconds: 31536e3,
          }),
        ],
      }),
      'GET'
    ),
    a.registerRoute(
      /\.(?:eot|otf|ttc|ttf|woff|woff2|font.css)$/i,
      new a.StaleWhileRevalidate({
        cacheName: 'static-font-assets',
        plugins: [
          new a.ExpirationPlugin({
            maxEntries: 4,
            maxAgeSeconds: 604800,
          }),
        ],
      }),
      'GET'
    ),
    a.registerRoute(
      /\.(?:jpg|jpeg|gif|png|svg|ico|webp)$/i,
      new a.StaleWhileRevalidate({
        cacheName: 'static-image-assets',
        plugins: [
          new a.ExpirationPlugin({
            maxEntries: 64,
            maxAgeSeconds: 86400,
          }),
        ],
      }),
      'GET'
    ),
    a.registerRoute(
      /\/_next\/image\?url=.+$/i,
      new a.StaleWhileRevalidate({
        cacheName: 'next-image',
        plugins: [
          new a.ExpirationPlugin({
            maxEntries: 64,
            maxAgeSeconds: 86400,
          }),
        ],
      }),
      'GET'
    ),
    a.registerRoute(
      /\.(?:js)$/i,
      new a.StaleWhileRevalidate({
        cacheName: 'static-js-assets',
        plugins: [
          new a.ExpirationPlugin({
            maxEntries: 32,
            maxAgeSeconds: 86400,
          }),
        ],
      }),
      'GET'
    ),
    a.registerRoute(
      /\.(?:css|less)$/i,
      new a.StaleWhileRevalidate({
        cacheName: 'static-style-assets',
        plugins: [
          new a.ExpirationPlugin({
            maxEntries: 32,
            maxAgeSeconds: 86400,
          }),
        ],
      }),
      'GET'
    ),
    a.registerRoute(
      /\/_next\/data\/.+\/.+\.json$/i,
      new a.StaleWhileRevalidate({
        cacheName: 'next-data',
        plugins: [
          new a.ExpirationPlugin({
            maxEntries: 32,
            maxAgeSeconds: 86400,
          }),
        ],
      }),
      'GET'
    ),
    a.registerRoute(
      /\/api\/(?!.*downloads).*/i,
      new a.NetworkFirst({
        cacheName: 'api-cache',
        networkTimeoutSeconds: 10,
        plugins: [
          new a.ExpirationPlugin({
            maxEntries: 16,
            maxAgeSeconds: 300,
          }),
        ],
      }),
      'GET'
    ));
});
