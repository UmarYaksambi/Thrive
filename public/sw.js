if (!self.define) {
  let e,
    s = {};
  const a = (a, i) => (
    (a = new URL(a + '.js', i).href),
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
  self.define = (i, t) => {
    const c =
      e ||
      ('document' in self
        ? document.currentScript.src
        : '') ||
      location.href;
    if (s[c]) return;
    let n = {};
    const f = (e) => a(e, c),
      r = { module: { uri: c }, exports: n, require: f };
    s[c] = Promise.all(i.map((e) => r[e] || f(e))).then(
      (e) => (t(...e), n)
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
          url: '/_next/static/chunks/2205-bd3ba3d2353d3fbc.js',
          revision: 'bd3ba3d2353d3fbc',
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
          url: '/_next/static/chunks/773-4534d2ac3fb17e13.js',
          revision: '4534d2ac3fb17e13',
        },
        {
          url: '/_next/static/chunks/7839-7a733337d049f796.js',
          revision: '7a733337d049f796',
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
          url: '/_next/static/chunks/app/_global-error/page-8b60f592e53f3ef4.js',
          revision: '8b60f592e53f3ef4',
        },
        {
          url: '/_next/static/chunks/app/_not-found/page-f2c79f328983d203.js',
          revision: 'f2c79f328983d203',
        },
        {
          url: '/_next/static/chunks/app/admin/login/page-c9eec09dfba1194d.js',
          revision: 'c9eec09dfba1194d',
        },
        {
          url: '/_next/static/chunks/app/admin/page-93adaabf02736649.js',
          revision: '93adaabf02736649',
        },
        {
          url: '/_next/static/chunks/app/admin/signup/page-6aaa2f8c9150a30f.js',
          revision: '6aaa2f8c9150a30f',
        },
        {
          url: '/_next/static/chunks/app/api/admin/library/route-8b60f592e53f3ef4.js',
          revision: '8b60f592e53f3ef4',
        },
        {
          url: '/_next/static/chunks/app/api/admin/signup/route-8b60f592e53f3ef4.js',
          revision: '8b60f592e53f3ef4',
        },
        {
          url: '/_next/static/chunks/app/api/admin/stats/route-8b60f592e53f3ef4.js',
          revision: '8b60f592e53f3ef4',
        },
        {
          url: '/_next/static/chunks/app/api/auth/login/route-8b60f592e53f3ef4.js',
          revision: '8b60f592e53f3ef4',
        },
        {
          url: '/_next/static/chunks/app/api/calendar/notes/route-8b60f592e53f3ef4.js',
          revision: '8b60f592e53f3ef4',
        },
        {
          url: '/_next/static/chunks/app/api/calendar/sync/route-8b60f592e53f3ef4.js',
          revision: '8b60f592e53f3ef4',
        },
        {
          url: '/_next/static/chunks/app/api/chat/history/route-8b60f592e53f3ef4.js',
          revision: '8b60f592e53f3ef4',
        },
        {
          url: '/_next/static/chunks/app/api/chat/mastery/create/route-8b60f592e53f3ef4.js',
          revision: '8b60f592e53f3ef4',
        },
        {
          url: '/_next/static/chunks/app/api/chat/mastery/delete/route-8b60f592e53f3ef4.js',
          revision: '8b60f592e53f3ef4',
        },
        {
          url: '/_next/static/chunks/app/api/chat/mastery/route-8b60f592e53f3ef4.js',
          revision: '8b60f592e53f3ef4',
        },
        {
          url: '/_next/static/chunks/app/api/chat/mastery/update/route-8b60f592e53f3ef4.js',
          revision: '8b60f592e53f3ef4',
        },
        {
          url: '/_next/static/chunks/app/api/chat/message/route-8b60f592e53f3ef4.js',
          revision: '8b60f592e53f3ef4',
        },
        {
          url: '/_next/static/chunks/app/api/chatbot/route-8b60f592e53f3ef4.js',
          revision: '8b60f592e53f3ef4',
        },
        {
          url: '/_next/static/chunks/app/api/classrooms/join/route-8b60f592e53f3ef4.js',
          revision: '8b60f592e53f3ef4',
        },
        {
          url: '/_next/static/chunks/app/api/courses/%5Bid%5D/route-8b60f592e53f3ef4.js',
          revision: '8b60f592e53f3ef4',
        },
        {
          url: '/_next/static/chunks/app/api/courses/generate/route-8b60f592e53f3ef4.js',
          revision: '8b60f592e53f3ef4',
        },
        {
          url: '/_next/static/chunks/app/api/courses/image/generate/route-8b60f592e53f3ef4.js',
          revision: '8b60f592e53f3ef4',
        },
        {
          url: '/_next/static/chunks/app/api/courses/route-8b60f592e53f3ef4.js',
          revision: '8b60f592e53f3ef4',
        },
        {
          url: '/_next/static/chunks/app/api/library/route-8b60f592e53f3ef4.js',
          revision: '8b60f592e53f3ef4',
        },
        {
          url: '/_next/static/chunks/app/api/ocr/route-8b60f592e53f3ef4.js',
          revision: '8b60f592e53f3ef4',
        },
        {
          url: '/_next/static/chunks/app/api/reports/generate/route-8b60f592e53f3ef4.js',
          revision: '8b60f592e53f3ef4',
        },
        {
          url: '/_next/static/chunks/app/api/reports/student/route-8b60f592e53f3ef4.js',
          revision: '8b60f592e53f3ef4',
        },
        {
          url: '/_next/static/chunks/app/api/student/classrooms/%5Bid%5D/assignments/submit/route-8b60f592e53f3ef4.js',
          revision: '8b60f592e53f3ef4',
        },
        {
          url: '/_next/static/chunks/app/api/student/classrooms/%5Bid%5D/tests/attempt/route-8b60f592e53f3ef4.js',
          revision: '8b60f592e53f3ef4',
        },
        {
          url: '/_next/static/chunks/app/api/teacher/classrooms/%5Bid%5D/assignments/route-8b60f592e53f3ef4.js',
          revision: '8b60f592e53f3ef4',
        },
        {
          url: '/_next/static/chunks/app/api/teacher/classrooms/%5Bid%5D/library/route-8b60f592e53f3ef4.js',
          revision: '8b60f592e53f3ef4',
        },
        {
          url: '/_next/static/chunks/app/api/teacher/classrooms/%5Bid%5D/members/route-8b60f592e53f3ef4.js',
          revision: '8b60f592e53f3ef4',
        },
        {
          url: '/_next/static/chunks/app/api/teacher/classrooms/%5Bid%5D/route-8b60f592e53f3ef4.js',
          revision: '8b60f592e53f3ef4',
        },
        {
          url: '/_next/static/chunks/app/api/teacher/classrooms/%5Bid%5D/submissions/route-8b60f592e53f3ef4.js',
          revision: '8b60f592e53f3ef4',
        },
        {
          url: '/_next/static/chunks/app/api/teacher/classrooms/%5Bid%5D/tests/attempts/route-8b60f592e53f3ef4.js',
          revision: '8b60f592e53f3ef4',
        },
        {
          url: '/_next/static/chunks/app/api/teacher/classrooms/%5Bid%5D/tests/route-8b60f592e53f3ef4.js',
          revision: '8b60f592e53f3ef4',
        },
        {
          url: '/_next/static/chunks/app/api/teacher/classrooms/route-8b60f592e53f3ef4.js',
          revision: '8b60f592e53f3ef4',
        },
        {
          url: '/_next/static/chunks/app/api/tests/generate/ocr/route-8b60f592e53f3ef4.js',
          revision: '8b60f592e53f3ef4',
        },
        {
          url: '/_next/static/chunks/app/api/tests/generate/route-8b60f592e53f3ef4.js',
          revision: '8b60f592e53f3ef4',
        },
        {
          url: '/_next/static/chunks/app/api/tests/submit/route-8b60f592e53f3ef4.js',
          revision: '8b60f592e53f3ef4',
        },
        {
          url: '/_next/static/chunks/app/calendar/page-df0dd5da49f59f18.js',
          revision: 'df0dd5da49f59f18',
        },
        {
          url: '/_next/static/chunks/app/chat/page-331bba6f2b6b2358.js',
          revision: '331bba6f2b6b2358',
        },
        {
          url: '/_next/static/chunks/app/course/%5Bid%5D/page-88a254e86522892a.js',
          revision: '88a254e86522892a',
        },
        {
          url: '/_next/static/chunks/app/course/%5Bid%5D/quiz/page-45cfb536d62285c8.js',
          revision: '45cfb536d62285c8',
        },
        {
          url: '/_next/static/chunks/app/dashboard/classrooms/%5Bid%5D/page-98e636a19ed4b275.js',
          revision: '98e636a19ed4b275',
        },
        {
          url: '/_next/static/chunks/app/dashboard/classrooms/page-b3def64b137c5694.js',
          revision: 'b3def64b137c5694',
        },
        {
          url: '/_next/static/chunks/app/dashboard/page-516b7c45d0f8b080.js',
          revision: '516b7c45d0f8b080',
        },
        {
          url: '/_next/static/chunks/app/dashboard/profile/page-18609d23101be50b.js',
          revision: '18609d23101be50b',
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
          url: '/_next/static/chunks/app/login/page-a66de505bf2fd9e6.js',
          revision: 'a66de505bf2fd9e6',
        },
        {
          url: '/_next/static/chunks/app/page-5b4e348987dc52b6.js',
          revision: '5b4e348987dc52b6',
        },
        {
          url: '/_next/static/chunks/app/planner/page-3806cd8719120ae0.js',
          revision: '3806cd8719120ae0',
        },
        {
          url: '/_next/static/chunks/app/settings/page-0b5fa56175b2ddc0.js',
          revision: '0b5fa56175b2ddc0',
        },
        {
          url: '/_next/static/chunks/app/teacher/page-11fdc33a1c0c40fb.js',
          revision: '11fdc33a1c0c40fb',
        },
        {
          url: '/_next/static/chunks/app/teacher/students/page-089ee3012d238b64.js',
          revision: '089ee3012d238b64',
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
          url: '/_next/static/chunks/next/dist/client/components/builtin/app-error-8b60f592e53f3ef4.js',
          revision: '8b60f592e53f3ef4',
        },
        {
          url: '/_next/static/chunks/next/dist/client/components/builtin/forbidden-8b60f592e53f3ef4.js',
          revision: '8b60f592e53f3ef4',
        },
        {
          url: '/_next/static/chunks/next/dist/client/components/builtin/global-error-8ad36346678187b3.js',
          revision: '8ad36346678187b3',
        },
        {
          url: '/_next/static/chunks/next/dist/client/components/builtin/not-found-8b60f592e53f3ef4.js',
          revision: '8b60f592e53f3ef4',
        },
        {
          url: '/_next/static/chunks/next/dist/client/components/builtin/unauthorized-8b60f592e53f3ef4.js',
          revision: '8b60f592e53f3ef4',
        },
        {
          url: '/_next/static/chunks/polyfills-42372ed130431b0a.js',
          revision: '846118c33b2c0e922d7b3a7676f81f6f',
        },
        {
          url: '/_next/static/chunks/webpack-fd7dfa4e04191c0d.js',
          revision: 'fd7dfa4e04191c0d',
        },
        {
          url: '/_next/static/css/5d3c5cff17ca562c.css',
          revision: '5d3c5cff17ca562c',
        },
        {
          url: '/_next/static/css/660f831c83b2cea3.css',
          revision: '660f831c83b2cea3',
        },
        {
          url: '/_next/static/dlpLRAiQ0iGAGoKViwIgS/_buildManifest.js',
          revision: 'a48b1e57447e6ee350910b122bbc2dc7',
        },
        {
          url: '/_next/static/dlpLRAiQ0iGAGoKViwIgS/_ssgManifest.js',
          revision: 'b6652df95db52feb4daf4eca35380933',
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
          revision: '47beeaa4b5bf554a42006613ec52a4ab',
        },
        {
          url: '/course-images/2.png',
          revision: '5f20e908a2f020147cf1767f60cddd0f',
        },
        {
          url: '/course-images/3.png',
          revision: 'e76299e98f7fbad050b360765d7af9ef',
        },
        {
          url: '/course-images/356014eb-f31b-412b-8744-44131543aabe.jpg',
          revision: 'ee8de8ead7a932acafe86e61d0d96ff6',
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
              state: i,
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
