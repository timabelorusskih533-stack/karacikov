// Karacikov — фоновый скрипт для push-уведомлений
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (e) => e.waitUntil(self.clients.claim()));

self.addEventListener("push", (e) => {
  let d = {};
  try { d = e.data ? e.data.json() : {}; } catch (_) { d = { title: "Karacikov", body: e.data ? e.data.text() : "" }; }
  e.waitUntil((async () => {
    // Если сайт сейчас открыт и на экране — уведомление покажет сама страница (звуком)
    const list = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
    if (list.some((c) => c.focused && c.visibilityState === "visible")) return;
    await self.registration.showNotification(d.title || "Karacikov", {
      body: d.body || "",
      tag: d.tag || undefined,
      renotify: !!d.tag,
      icon: "icon-192.png",
      badge: "icon-192.png",
      data: { conv: d.conv || null },
    });
  })());
});

self.addEventListener("notificationclick", (e) => {
  e.notification.close();
  const conv = e.notification.data && e.notification.data.conv;
  const url = new URL(conv ? "./?c=" + conv : "./", self.registration.scope).href;
  e.waitUntil((async () => {
    const list = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
    for (const c of list) {
      if (c.url.startsWith(self.registration.scope)) {
        await c.focus();
        if (conv) c.postMessage({ openConv: conv });
        return;
      }
    }
    await self.clients.openWindow(url);
  })());
});
