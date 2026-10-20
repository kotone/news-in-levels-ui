(() => {
  'use strict';
  const apply = value => {
    const rate = [0.75,1,1.25,1.5,2].includes(Number(value)) ? Number(value) : 1;
    window.dispatchEvent(new CustomEvent('nil-soundcloud-rate',{detail:rate}));
  };
  chrome.storage.local.get('nilPlaybackRate').then(settings => apply(settings.nilPlaybackRate)).catch(() => apply(1));
  chrome.storage.onChanged.addListener((changes,area) => {
    if (area === 'local' && changes.nilPlaybackRate) apply(changes.nilPlaybackRate.newValue);
  });
})();
