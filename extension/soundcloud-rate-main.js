// SoundCloud creates detached Audio objects. DOM queries alone cannot find them.
(() => {
  'use strict';
  const allowed = [0.75, 1, 1.25, 1.5, 2];
  let rate = 1;
  const active = new Set();
  const proto = HTMLMediaElement.prototype;
  const descriptor = Object.getOwnPropertyDescriptor(proto,'playbackRate');
  const apply = media => {
    active.add(media);
    media.preservesPitch = true;
    descriptor.set.call(media,rate);
  };
  // Keep the selected speed when the embedded player resets its audio engine.
  Object.defineProperty(proto,'playbackRate',{
    ...descriptor,
    set() { apply(this); }
  });
  for (const method of ['play','load']) {
    const original = proto[method];
    proto[method] = function (...args) { apply(this); return original.apply(this,args); };
  }
  window.addEventListener('nil-soundcloud-rate',event => {
    const value = Number(event.detail);
    if (!allowed.includes(value)) return;
    rate = value;
    document.querySelectorAll('audio,video').forEach(apply);
    active.forEach(media => {
      apply(media);
      if (media.ended) active.delete(media);
    });
  });
})();
