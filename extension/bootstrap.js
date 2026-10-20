(() => {
  'use strict';
  if (!/^\/(?:$|products\/|article\/|level\/|category\/|page\/)/.test(location.pathname)) return;
  const root = document.documentElement;
  root.classList.add('nil-loading');
  // Release the original page even if extraction fails or never runs.
  const timer = setTimeout(() => root.classList.remove('nil-loading'), 8000);
  window.nilReady = () => {
    clearTimeout(timer);
    root.classList.remove('nil-loading');
  };
  window.nilPreferences = chrome.storage.local.get(['nilSize', 'nilDark']).then(settings => {
    if (root.classList.contains('nil-loading')) root.classList.toggle('nil-dark', settings.nilDark === true);
    return settings;
  }).catch(() => ({}));
})();
