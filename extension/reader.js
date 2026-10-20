(() => {
  'use strict';
  const isDays = /(^|\.)daysinlevels\.com$/.test(location.hostname);
  const siteName = isDays ? 'Days in Levels' : 'News in Levels';
  const articlePath = isDays ? '/article/' : '/products/';
  if (document.getElementById('nil-reader-host')) return;
  const source = document.querySelector('.article #nContent');
  const title = document.querySelector('.article-title h2');
  const listing = !source && window.nilListing?.extract();
  // Fail open if the site's article structure changes.
  if ((!source || !title || !source.textContent.trim()) && !listing) { window.nilReady?.(); return; }

  const host = document.createElement('div');
  host.id = 'nil-reader-host';
  // Keep editorial text in the document tree for selection/translation tools.
  const shadow = host;
  const style = document.createElement('style');
  style.textContent = `
    :host { all: initial; display:block; color-scheme:light; }
    * { box-sizing:border-box; }
    .reader { --paper:#fffefb; --bg:#f5f3ee; --ink:#243b37; --muted:#78817b; --line:#e4e6de; --accent:#24745b; min-height:100vh; background:var(--bg); color:var(--ink); font:15px/1.6 system-ui,sans-serif; padding:0 24px 64px; }
    .reader.dark { --paper:#202b29; --bg:#17211f; --ink:#e1e8df; --muted:#a1b1a8; --line:#394641; --accent:#8ad3ad; color-scheme:dark; }
    .bar { max-width:1040px; margin:auto; min-height:88px; display:flex; align-items:center; justify-content:space-between; gap:20px; border-bottom:1px solid var(--line); flex-wrap:wrap; padding:16px 0; }
    a { color:var(--accent); text-underline-offset:4px; }
    .brand { color:var(--ink); text-decoration:none; font-weight:750; letter-spacing:-.5px; font-size:19px; }
    .brand span { color:var(--accent); }
    .tools { display:flex; gap:8px; align-items:center; flex-wrap:wrap; }
    .site-nav { max-width:1040px; margin:0 auto; display:flex; gap:20px; flex-wrap:wrap; align-items:center; padding:16px 0 0; font-size:13px; }
    .site-nav a { text-decoration:none; }
    .article-nav { margin-top:32px; padding-top:24px; border-top:1px solid var(--line); }
    .article-links { display:grid; grid-template-columns:1fr 1fr; gap:12px; }
    .article-links a { display:block; padding:16px; border:1px solid var(--line); border-radius:10px; text-decoration:none; overflow-wrap:anywhere; }
    .article-links a:hover { border-color:var(--accent); }
    .article-links span { display:block; color:var(--muted); font-size:12px; margin-bottom:6px; }
    .nav-status { font-size:12px; color:var(--muted); margin:12px 0; }
    button,.levels a { font:inherit; border:1px solid var(--line); border-radius:8px; background:var(--paper); color:var(--ink); cursor:pointer; padding:7px 12px; text-decoration:none; }
    button:hover,.levels a:hover { border-color:var(--accent); }
    :focus-visible { outline:3px solid var(--accent); outline-offset:4px; }
    main { max-width:1040px; margin:40px auto 0; padding:48px 56px; border:1px solid var(--line); background:var(--paper); border-radius:16px; box-shadow:0 12px 48px #102b1510; }
    .eyebrow { text-transform:uppercase; letter-spacing:2px; color:var(--accent); font-size:11px; font-weight:700; }
    h1 { font:600 clamp(28px,4vw,40px)/1.2 Georgia,serif; letter-spacing:-1px; margin:16px 0 22px; }
    .meta { color:var(--muted); font-size:13px; margin:16px 0 26px; }
    .levels { display:flex; gap:8px; flex-wrap:wrap; }
    .levels a[aria-current] { color:var(--paper); background:var(--accent); border-color:var(--accent); }
    .hero { width:100%; max-height:300px; object-fit:cover; border-radius:10px; margin:0 0 24px; }
    .prose { font:var(--size,20px)/1.9 Georgia,'Times New Roman',serif; overflow-wrap:anywhere; }
    p { margin:0 0 1.1em; }
    strong { font-weight:700; color:var(--accent); }
    .vocabulary { font:16px/1.8 system-ui,sans-serif; padding:20px 24px; background:var(--bg); border-left:3px solid var(--accent); border-radius:0 8px 8px 0; }
    .vocabulary h2 { margin:0 0 12px; color:var(--muted); font-size:11px; letter-spacing:1.5px; }
    .vocabulary dl { margin:0; }
    .vocabulary-row { display:grid; grid-template-columns:minmax(100px, .25fr) minmax(0, 1fr); gap:20px; padding:12px 0; }
    .vocabulary-row + .vocabulary-row { border-top:1px solid var(--line); }
    .vocabulary dt { font-weight:700; color:var(--accent); }
    .vocabulary dd { margin:0; color:var(--ink); overflow-wrap:anywhere; }
    @media(max-width:600px) { .vocabulary { padding:18px; } .vocabulary-row { grid-template-columns:1fr; gap:3px; } }
    h2 { font:700 12px/1.6 system-ui,sans-serif; text-transform:uppercase; letter-spacing:1.5px; margin:28px 0 14px; color:var(--muted); }
    iframe { width:100%; border:0; border-radius:10px; display:block; margin:12px 0; }
    video,audio { display:block; width:100%; margin:12px 0 0; }
    .sc-player { position:relative; margin:0 0 28px; padding:18px 20px 12px; border:1px solid var(--line); border-radius:12px; background:var(--bg); }
    .sc-row { display:flex; align-items:center; gap:12px; }
    .sc-play { width:44px; height:44px; flex-shrink:0; border-radius:50%; padding:0; background:var(--accent); color:var(--paper); }
    button:disabled { cursor:wait; opacity:.5; }
    .sc-info { flex:1; min-width:0; }
    .sc-heading { font-size:14px; font-weight:650; }
    .sc-status { font-size:12px; color:var(--muted); }
    .sc-time { font-size:11px; font-variant-numeric:tabular-nums; color:var(--muted); white-space:nowrap; }
    .sc-seek { width:100%; margin:14px 0 6px; accent-color:var(--accent); cursor:pointer; }
    .sc-actions { display:flex; gap:12px; flex-wrap:wrap; align-items:center; font-size:11px; }
    .sc-actions a { margin-right:auto; text-decoration:none; color:var(--muted); }
    .sc-actions button { padding:0; border:0; background:transparent; color:var(--muted); font-size:11px; }
    .sc-rate { display:flex; align-items:center; gap:4px; color:var(--muted); }
    .sc-rate select { font:inherit; color:var(--ink); background:var(--paper); border:1px solid var(--line); border-radius:5px; padding:3px 5px; cursor:pointer; }
    .sc-player .sc-frame { position:absolute; width:1px; height:1px; opacity:0; pointer-events:none; margin:0; }
    .sc-expanded .sc-frame { position:static; width:100%; height:166px; opacity:1; pointer-events:auto; margin-top:12px; }
    .question { border-top:1px solid var(--line); margin-top:28px; padding-top:22px; }
    footer { text-align:center; font-size:12px; color:var(--muted); margin:28px 0; }
    .restore { position:fixed; bottom:24px; right:24px; background:#24745b; color:white; box-shadow:0 4px 24px #0003; }
    main.listing { max-width:1040px; background:transparent; border:0; box-shadow:none; padding:0; }
    .list-intro { margin-bottom:28px; }
    .list-intro h1 { margin-bottom:12px; }
    .list-intro p { color:var(--muted); font-size:14px; }
    .category-trigger { padding:0; border:0; background:transparent; color:var(--accent); font:inherit; }
    .category-nav { display:none; position:fixed; inset:auto; margin:0; padding:12px; border:1px solid var(--line); border-radius:12px; background:var(--paper); color:var(--ink); box-shadow:0 12px 36px #0003; overflow:auto; }
    .category-nav:popover-open { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:8px; }
    .category-nav a:hover { background:var(--bg); border-color:var(--accent); }
    .category-nav a,.pagination a,.pagination span { font-size:13px; border:1px solid var(--line); padding:6px 12px; border-radius:8px; background:var(--paper); text-decoration:none; }
    .category-nav a[aria-current],.site-nav a[aria-current],.pagination [aria-current] { color:var(--accent); font-weight:750; }
    .news-grid { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:20px; }
    .news-card { min-width:0; background:var(--paper); border:1px solid var(--line); border-radius:14px; overflow:hidden; }
    .card-image { width:100%; aspect-ratio:2/1; object-fit:cover; display:block; background:var(--line); }
    .card-content { padding:24px; }
    .card-content h2 { margin:0 0 12px; font:600 24px/1.3 Georgia,serif; letter-spacing:-.3px; text-transform:none; }
    .card-content h2 a { color:var(--ink); text-decoration:none; }
    .card-content h2 a:hover { color:var(--accent); }
    .card-content p { color:var(--muted); font-size:calc(var(--size,20px) * .8); }
    .card-date { display:block; font-size:12px; color:var(--muted); margin-bottom:12px; }
    .card-content .levels { font-size:12px; }
    .pagination { display:flex; justify-content:center; flex-wrap:wrap; gap:8px; padding:30px 0; }
    @media(max-width:640px) { .news-grid { grid-template-columns:1fr; } .card-content { padding:20px; } main.listing { padding:0; } }
    [hidden] { display:none !important; }
    @media(max-width:600px) { .reader { padding:0 14px 32px; } main { margin-top:20px; padding:28px 22px; } .bar { gap:12px; } .tools { gap:5px; } button { padding:6px 9px; } .sc-player { padding:14px 12px 10px; } .sc-row { flex-wrap:wrap; gap:10px; } .sc-time { margin-left:auto; } }
    @media print { .reader { padding:0; background:white; } .bar,.site-nav,.article-nav,.media,.sc-player,footer { display:none; } main { margin:0; padding:0; border:0; box-shadow:none; max-width:none; } }
  `;
  const sheet = new CSSStyleSheet();
  sheet.replaceSync(style.textContent);
  const scope = rules => [...rules].map(rule => {
    if (rule instanceof CSSStyleRule) {
      const selectors = rule.selectorText.split(',').map(selector => selector.includes(':host') ? selector.replace(/:host/g,'#nil-reader-host') : `#nil-reader-host ${selector.trim()}`).join(',');
      return `${selectors} { ${rule.style.cssText} }`;
    }
    if (rule.cssRules) return `${rule.cssText.slice(0,rule.cssText.indexOf('{'))}{${scope(rule.cssRules)}}`;
    return rule.cssText;
  }).join('\n');
  style.textContent = '#nil-reader-host * { all:revert; box-sizing:border-box; }\n' + scope(sheet.cssRules);
  shadow.append(style);
  const el = (tag, text, className) => {
    const node = document.createElement(tag);
    if (text) node.textContent = text;
    if (className) node.className = className;
    return node;
  };
  // Copy editorial markup only; never copy site scripts, adverts or event handlers.
  function copy(node) {
    if (node.nodeType === Node.TEXT_NODE) return document.createTextNode(node.textContent);
    if (node.nodeType !== Node.ELEMENT_NODE) return document.createTextNode('');
    if (['SCRIPT', 'STYLE', 'IFRAME', 'INS', 'FORM'].includes(node.tagName)) return document.createTextNode('');
    const allowed = ['P','STRONG','B','EM','I','A','BR','UL','OL','LI','BLOCKQUOTE','H3','H4'];
    const result = document.createElement(allowed.includes(node.tagName) ? node.tagName : 'span');
    if (node.tagName === 'A') {
      try {
        const url = new URL(node.getAttribute('href'), location.href);
        if (['https:', 'http:'].includes(url.protocol)) result.href = url.href;
      } catch { /* Leave malformed links inert. */ }
      result.rel = 'noopener noreferrer';
      if (node.target === '_blank') result.target = '_blank';
    }
    node.childNodes.forEach(child => result.append(copy(child)));
    return result;
  }
  function vocabulary(node) {
    const text = node.textContent.trim().replace(/^Difficult words:\s*/i,'');
    // Separate entries only outside parentheses; definitions may contain commas.
    const chunks = [];
    let depth = 0, start = 0;
    for (let i = 0; i < text.length; i++) {
      if (text[i] === '(') depth++;
      if (text[i] === ')') depth--;
      if (depth < 0) return null;
      if (text[i] === ',' && depth === 0) { chunks.push(text.slice(start,i).trim()); start = i+1; }
    }
    if (depth !== 0) return null;
    chunks.push(text.slice(start).trim());
    const entries = chunks.map(chunk => chunk.match(/^(.+?)\s*\(([\s\S]+)\)[.。]?$/));
    if (!entries.length || entries.some(entry => !entry)) return null;
    const section = el('section','','vocabulary');
    section.setAttribute('aria-label','Difficult words');
    section.append(el('h2','Difficult words'));
    const list = el('dl');
    entries.forEach(([,word,definition]) => {
      const row = el('div','','vocabulary-row');
      const term = el('dt');
      const link = [...node.querySelectorAll('a[href]')].find(a => a.textContent.trim() === word.trim());
      term.append(link ? copy(link) : document.createTextNode(word.trim()));
      row.append(term,el('dd',definition.trim())); list.append(row);
    });
    section.append(list);
    return section;
  }
  const reader = el('div', '', 'reader');
  const bar = el('header', '', 'bar');
  const brand = el('a', siteName, 'brand');
  brand.href = `${location.origin}/`;
  const tools = el('div', '', 'tools');
  const button = (label, action, hint) => {
    const b = el('button', label);
    b.type = 'button'; b.addEventListener('click', action);
    if (hint) { b.title = hint; b.setAttribute('aria-label', hint); }
    tools.append(b); return b;
  };
  let size = 20;
  const save = () => chrome.storage.local.set({ nilSize:size, nilDark:reader.classList.contains('dark') }).catch(() => {});
  button('A−', () => { size = Math.max(16, size - 2); reader.style.setProperty('--size', `${size}px`); save(); }, '减小字号');
  button('A+', () => { size = Math.min(30, size + 2); reader.style.setProperty('--size', `${size}px`); save(); }, '增大字号');
  const theme = button('深色', () => { reader.classList.toggle('dark'); document.documentElement.classList.toggle('nil-dark',reader.classList.contains('dark')); theme.textContent = reader.classList.contains('dark') ? '浅色' : '深色'; save(); }, '切换明暗主题');
  const restore = el('button', '返回专注阅读', 'restore');
  restore.hidden = true;
  let scroll = 0;
  button('查看原网页', () => { shadow.querySelectorAll('audio,video').forEach(player => player.pause()); shadow.querySelectorAll('.sc-player').forEach(player => player.dispatchEvent(new Event('nil-pause'))); scroll = window.scrollY; reader.hidden = true; restore.hidden = false; document.documentElement.classList.remove('nil-reading'); window.scrollTo(0,0); });
  restore.addEventListener('click', () => { reader.hidden = false; restore.hidden = true; document.documentElement.classList.add('nil-reading'); window.scrollTo(0,scroll); });
  bar.append(brand, tools);
  const siteNav = el('nav', '', 'site-nav');
  siteNav.setAttribute('aria-label', '站内导航');
  for (const [label, path] of [['首页','/'], ['Level 1 文章','/level/level-1/'], ['Level 2 文章','/level/level-2/'], ['Level 3 文章','/level/level-3/']]) {
    const link = el('a',label); link.href = new URL(path, location.origin).href; siteNav.append(link);
  }
  const sisterSite = el('a',isDays ? 'News ↗' : 'Days ↗');
  sisterSite.href = isDays ? 'https://www.newsinlevels.com/' : 'https://www.daysinlevels.com/';
  siteNav.append(sisterSite);
  const main = el('main');
  main.lang = 'en';
  window.nilListing?.categories(siteNav,el);
  if (listing) {
    window.nilListing.render(listing,main,el,copy);
  } else {
  main.append(el('div', 'A little news. A little progress.', 'eyebrow'), el('h1', title.textContent.trim()));
  const levels = el('nav', '', 'levels');
  levels.setAttribute('aria-label', 'Article level');
  document.querySelectorAll('.article .level a').forEach(link => {
    const a = copy(link);
    if (link.closest('li')?.classList.contains('active')) a.setAttribute('aria-current','page');
    levels.append(a);
  });
  main.append(levels);
  const prose = el('article', '', 'prose');
  const paragraphs = [...source.children];
  const date = paragraphs[0]?.textContent.trim();
  const hasDate = /^\d{2}-\d{2}-\d{4}/.test(date || '');
  const words = source.textContent.trim().split(/\s+/).length;
  main.append(el('div', `${hasDate ? date + '  ·  ' : ''}${Math.max(1, Math.ceil(words / 180))} min read`, 'meta'));
  const image = document.querySelector('.article .img-wrap img');
  if (image) {
    const hero = el('img', '', 'hero');
    const full = image.closest('a')?.href;
    hero.src = full && /\.(jpe?g|png|webp|avif)(\?|$)/i.test(full) ? full : image.currentSrc || image.src;
    hero.alt = image.alt; main.append(hero);
  }
  paragraphs.forEach((p, i) => {
    if (i === 0 && hasDate) return;
    const isVocabulary = /^Difficult words:/i.test(p.textContent.trim());
    const cloned = (isVocabulary && vocabulary(p)) || copy(p);
    if (isVocabulary) cloned.classList.add('vocabulary');
    prose.append(cloned);
  });
  main.append(prose);
  const media = el('section', '', 'media');
  document.querySelectorAll('.article .video-wrap iframe, .article .video-wrap audio, .article .video-wrap video').forEach(original => {
    if (original.tagName === 'IFRAME') {
      const src = original.getAttribute('src') || original.getAttribute('data-src') || original.getAttribute('data-rocket-src');
      let url;
      try { url = new URL(src, location.href); } catch { return; }
      if (!['w.soundcloud.com','www.youtube.com','www.youtube-nocookie.com','www.dailymotion.com','player.vimeo.com'].includes(url.hostname) || url.protocol !== 'https:') return;
      if (url.hostname === 'w.soundcloud.com') {
        main.insertBefore(window.nilSoundCloud(url.href),prose);
        return;
      }
      const frame = el('iframe');
      frame.src = url.href; frame.title = url.hostname === 'w.soundcloud.com' ? 'Listen to this article' : 'Article video';
      frame.height = url.hostname === 'w.soundcloud.com' ? '166' : '360';
      frame.allow = 'autoplay; encrypted-media; fullscreen'; frame.allowFullscreen = true;
      media.append(frame);
    } else {
      const player = el(original.tagName.toLowerCase());
      player.controls = true; player.preload = 'metadata';
      for (const sourceNode of [original,...original.querySelectorAll('source')]) {
        const src = sourceNode.getAttribute('src') || sourceNode.getAttribute('data-src');
        if (!src) continue;
        try { const safe = new URL(src,location.href); if (safe.protocol !== 'https:') continue; const item = el('source'); item.src = safe.href; if (sourceNode.type) item.type = sourceNode.type; player.append(item); } catch { /* Ignore invalid sources. */ }
      }
      if (original.tagName === 'AUDIO') {
        const box = el('section','','sc-player');
        const state = el('div','正在加载音频…','sc-status'); state.setAttribute('role','status');
        const retry = el('button','刷新页面并重试'); retry.hidden = true; retry.type = 'button'; retry.addEventListener('click',() => location.reload());
        player.addEventListener('loadedmetadata',() => { state.textContent = '准备就绪，点击播放'; retry.hidden = true; });
        player.addEventListener('waiting',() => { state.textContent = '正在缓冲音频…'; });
        player.addEventListener('playing',() => { state.textContent = '正在播放'; });
        player.addEventListener('pause',() => { state.textContent = '已暂停'; });
        player.addEventListener('ended',() => { state.textContent = '播放结束'; });
        player.addEventListener('error',() => { state.textContent = '音频加载失败或链接已过期，请刷新后重试。'; retry.hidden = false; });
        box.append(el('div','听这篇文章','sc-heading'),state,player,retry); main.insertBefore(box,prose);
      } else media.append(player);
    }
  });
  if (media.children.length) { media.prepend(el('h2', 'Listen & watch')); main.append(media); }
  const question = document.querySelector('.fancy-facebook-block .title h3');
  if (question) { const box = el('section', '', 'question'); box.append(el('h2','Think about it'), el('p',question.textContent)); main.append(box); }
  const articleNav = el('nav', '', 'article-nav');
  articleNav.setAttribute('aria-label','文章翻页');
  const articleLinks = el('div', '', 'article-links');
  const status = el('p', '正在查找相邻文章…', 'nav-status');
  status.setAttribute('role','status');
  const currentLevel = location.pathname.match(/-level-([123])\/?$/)?.[1] || document.querySelector('.article .level li.active a')?.textContent.match(/[123]/)?.[0] || '1';
  const listURL = new URL(`/level/level-${currentLevel}/`,location.origin);
  const allArticles = el('a', `浏览全部 Level ${currentLevel} 文章`);
  allArticles.href = listURL.href;
  articleNav.append(el('h2','继续阅读'),articleLinks,status,allArticles);
  main.append(articleNav);
  loadNeighbors(currentLevel,listURL,articleLinks,status);
  }
  reader.append(bar,siteNav,main,el('footer',`${siteName} · Focus on your daily progress`));
  shadow.append(reader,restore);
  [...document.body.children].forEach(node => {
    // Preserve already-mounted extension widgets as well as later popups.
    if (!node.shadowRoot && !node.tagName.includes('-') && getComputedStyle(node).position !== 'fixed') node.setAttribute('data-nil-original','');
  });
  document.body.append(host);
  document.documentElement.classList.add('nil-reading');
  (window.nilPreferences || chrome.storage.local.get(['nilSize','nilDark'])).then(settings => {
    size = Math.min(30, Math.max(16, Number(settings.nilSize) || 20));
    reader.style.setProperty('--size',`${size}px`);
    reader.classList.toggle('dark', settings.nilDark === true);
    document.documentElement.classList.toggle('nil-dark',settings.nilDark === true);
    theme.textContent = settings.nilDark ? '浅色' : '深色';
  }).catch(() => {}).finally(() => window.nilReady?.());

  // Follow the same-level archive order (newest first), including page boundaries.
  async function loadNeighbors(currentLevel,listURL,articleLinks,status) {
    const normalize = url => new URL(url,location.href).pathname.replace(/\/$/,'');
    const current = normalize(location.href);
    const entries = [];
    const seen = new Set();
    const visited = new Set();
    let nextPage = listURL.href;
    try {
      for (let page = 0; nextPage && page < 10; page++) {
        if (visited.has(nextPage)) break;
        visited.add(nextPage);
        const response = await fetch(nextPage, {signal:AbortSignal.timeout(10000)});
        if (!response.ok) throw new Error('Archive unavailable');
        const doc = new DOMParser().parseFromString(await response.text(),'text/html');
        doc.querySelectorAll('h3 a[href], h2 a[href]').forEach(a => {
          const url = new URL(a.getAttribute('href'),nextPage);
          if (url.origin !== location.origin || !url.pathname.startsWith(articlePath) || !new RegExp(`-level-${currentLevel}/?$`).test(url.pathname)) return;
          const key = normalize(url.href);
          if (!seen.has(key)) { seen.add(key); entries.push({url:url.href,title:a.textContent.trim()}); }
        });
        const index = entries.findIndex(entry => normalize(entry.url) === current);
        const next = [...doc.querySelectorAll('a[href]')].find(a => a.rel === 'next' || a.classList.contains('next') || a.textContent.trim() === '›');
        const candidate = next ? new URL(next.getAttribute('href'),nextPage) : null;
        nextPage = candidate?.origin === location.origin && candidate.pathname.startsWith(listURL.pathname) ? candidate.href : null;
        if (index >= 0 && (index + 1 < entries.length || !nextPage)) break;
      }
      const index = entries.findIndex(entry => normalize(entry.url) === current);
      if (index < 0) { status.textContent = '未找到相邻文章，请从下方文章列表继续阅读。'; return; }
      for (const [label, entry] of [['← 上一篇（较新）',entries[index-1]],['下一篇（较早） →',entries[index+1]]]) {
        if (!entry) continue;
        const a = el('a'); a.href = entry.url;
        a.append(el('span',label),document.createTextNode(entry.title)); articleLinks.append(a);
      }
      status.textContent = index === 0 ? '这是当前等级的最新文章。' : index === entries.length - 1 && !nextPage ? '已到当前等级的最早文章。' : '';
    } catch {
      status.textContent = '相邻文章加载失败，可从下方文章列表继续阅读。';
    }
  }
})();
