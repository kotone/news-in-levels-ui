// Local adapter for the SoundCloud Widget postMessage protocol. No remote SDK.
window.nilSoundCloud = function (sourceURL) {
  const origin = 'https://w.soundcloud.com';
  const make = (tag, text, cls) => {
    const node = document.createElement(tag);
    if (text) node.textContent = text;
    if (cls) node.className = cls;
    return node;
  };
  const box = make('section', '', 'sc-player');
  box.setAttribute('aria-label', '文章音频');
  const row = make('div', '', 'sc-row');
  const play = make('button', '▶', 'sc-play');
  play.type = 'button'; play.disabled = true; play.setAttribute('aria-label', '播放音频');
  const info = make('div', '', 'sc-info');
  const heading = make('div', '听这篇文章', 'sc-heading');
  const status = make('div', '正在连接 SoundCloud…', 'sc-status');
  status.setAttribute('role', 'status');
  info.append(heading, status);
  const time = make('span', '0:00 / --:--', 'sc-time');
  const seek = make('input', '', 'sc-seek');
  seek.type = 'range'; seek.min = '0'; seek.max = '1000'; seek.value = '0'; seek.disabled = true;
  seek.setAttribute('aria-label', '音频播放进度');
  const actions = make('div', '', 'sc-actions');
  const rateLabel = make('label','速度 ','sc-rate');
  const rateSelect = make('select'); rateSelect.setAttribute('aria-label','音频播放速度');
  for (const rate of [0.75,1,1.25,1.5,2]) {
    const option = make('option',`${rate}×`); option.value = String(rate); rateSelect.append(option);
  }
  rateSelect.value = '1';
  chrome.storage.local.get('nilPlaybackRate').then(settings => {
    if ([0.75,1,1.25,1.5,2].includes(Number(settings.nilPlaybackRate))) rateSelect.value = String(settings.nilPlaybackRate);
  }).catch(() => {});
  rateSelect.addEventListener('change',() => {
    chrome.storage.local.set({nilPlaybackRate:Number(rateSelect.value)}).catch(() => { status.textContent = '播放速度保存失败，请重试。'; });
  });
  rateLabel.append(rateSelect);
  const attribution = make('a', 'SoundCloud ↗');
  attribution.href = 'https://soundcloud.com/newsinlevels';
  attribution.target = '_blank'; attribution.rel = 'noopener noreferrer';
  const retry = make('button', '重新加载'); retry.type = 'button'; retry.hidden = true;
  const fallback = make('button', '展开原播放器'); fallback.type = 'button';
  const frame = make('iframe', '', 'sc-frame');
  frame.title = 'SoundCloud 文章音频'; frame.allow = 'autoplay'; frame.tabIndex = -1;
  frame.setAttribute('aria-hidden', 'true');
  const url = new URL(sourceURL);
  for (const [key, value] of Object.entries({auto_play:'false',color:'#24745b',show_artwork:'false',show_comments:'false',show_user:'false',show_reposts:'false',show_teaser:'false',sharing:'false',buying:'false',download:'false',show_playcount:'false',visual:'false'})) url.searchParams.set(key,value);
  let ready = false, playing = false, duration = 0, timer;
  const send = (method, value) => frame.contentWindow?.postMessage(JSON.stringify({method, value}), origin);
  const format = ms => `${Math.floor(ms / 60000)}:${String(Math.floor(ms / 1000) % 60).padStart(2,'0')}`;
  const updateTime = position => {
    time.textContent = `${format(position)} / ${duration ? format(duration) : '--:--'}`;
    seek.value = duration ? String(Math.min(1000, Math.round(position / duration * 1000))) : '0';
    seek.setAttribute('aria-valuetext',time.textContent);
  };
  const failed = text => { clearTimeout(timer); box.setAttribute('aria-busy','false'); status.textContent = text; retry.hidden = false; };
  const wait = (text, timeout, failure) => {
    clearTimeout(timer); status.textContent = text;
    timer = setTimeout(() => failed(failure), timeout);
  };
  const setPlaying = value => {
    playing = value; play.textContent = value ? 'Ⅱ' : '▶';
    play.setAttribute('aria-label',value ? '暂停音频' : '播放音频');
  };
  const load = () => {
    ready = false; duration = 0; setPlaying(false); updateTime(0);
    play.disabled = true; seek.disabled = true; retry.hidden = true;
    box.setAttribute('aria-busy','true');
    wait('正在连接 SoundCloud…',18000,'加载较慢，可重试或展开原播放器。');
    // Replace the browsing context on retry so stale events cannot mark it ready.
    frame.remove(); box.append(frame); frame.src = url.href;
  };
  window.addEventListener('message', event => {
    if (event.origin !== origin || event.source !== frame.contentWindow) return;
    let data;
    try { data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data; } catch { return; }
    if (!data || typeof data.method !== 'string') return;
    const value = data.value;
    if (data.method === 'ready') {
      if (ready) return;
      ready = true; clearTimeout(timer); retry.hidden = true;
      box.setAttribute('aria-busy','false');
      play.disabled = false; status.textContent = '准备就绪，点击播放';
      ['play','pause','finish','playProgress','loadProgress','seek','error'].forEach(name => send('addEventListener',name));
      send('getDuration'); send('getCurrentSound');
    } else if (data.method === 'getDuration' && Number.isFinite(value) && value > 0) {
      duration = value; seek.disabled = false; updateTime(0);
    } else if (data.method === 'getCurrentSound' && value?.permalink_url) {
      try { const link = new URL(value.permalink_url); if (link.protocol === 'https:' && link.hostname === 'soundcloud.com') attribution.href = link.href; } catch { /* Keep publisher link. */ }
    } else if (data.method === 'play') {
      clearTimeout(timer); retry.hidden = true; setPlaying(true); status.textContent = '正在播放';
    } else if (data.method === 'pause' || data.method === 'finish') {
      clearTimeout(timer); setPlaying(false); status.textContent = data.method === 'finish' ? '播放结束' : '已暂停';
      if (data.method === 'finish') updateTime(duration);
    } else if (data.method === 'playProgress' || data.method === 'seek') {
      if (Number.isFinite(value?.currentPosition)) updateTime(Math.max(0,value.currentPosition));
    } else if (data.method === 'error') {
      ready = false; play.disabled = true; seek.disabled = true; box.setAttribute('aria-busy','false');
      setPlaying(false); failed('音频加载失败，请重试或展开原播放器。');
    }
  });
  play.addEventListener('click', () => {
    if (!ready) return;
    if (playing) send('pause');
    else { send('play'); wait('正在缓冲音频…',12000,'播放响应较慢，请重试或展开原播放器。'); }
  });
  seek.addEventListener('input', () => { if (ready && duration) send('seekTo',Number(seek.value) / 1000 * duration); });
  retry.addEventListener('click',load);
  fallback.addEventListener('click', () => {
    const expanded = box.classList.toggle('sc-expanded');
    frame.tabIndex = expanded ? 0 : -1; frame.setAttribute('aria-hidden',String(!expanded));
    fallback.textContent = expanded ? '收起原播放器' : '展开原播放器';
    fallback.setAttribute('aria-expanded',String(expanded));
  });
  fallback.setAttribute('aria-expanded','false');
  box.addEventListener('nil-pause', () => { if (ready) send('pause'); });
  row.append(play, info, time); actions.append(attribution,rateLabel,retry,fallback); box.append(row,seek,actions);
  // Start only after the section is attached, so contentWindow is available.
  queueMicrotask(load);
  return box;
};
