window.nilListing = (() => {
  const days = /(^|\.)daysinlevels\.com$/.test(location.hostname);
  const articlePath = days ? '/article/' : '/products/';
  const safeURL = value => {
    if (!value) return null;
    try { const url = new URL(value,location.href); if (url.hostname.replace(/^www\./,'') === location.hostname.replace(/^www\./,'')) url.host = location.host; return url.protocol === 'https:' && url.origin === location.origin ? url : null; } catch { return null; }
  };
  const currentLevel = () => location.pathname.match(/(?:level\/level-|(?:products|article)\/.*-level-)([123])/)?.[1] || new URLSearchParams(location.search).get('level')?.match(/^level-([123])$/)?.[1];
  const categories = (nav,el) => {
    const level = currentLevel();
    for (const a of nav.querySelectorAll('a')) {
      const path = new URL(a.href).pathname;
      if (new URL(a.href).origin === location.origin && ((level && path === `/level/level-${level}/`) || (!level && path === '/' && !location.pathname.startsWith('/category/')))) a.setAttribute('aria-current','page');
    }
    const trigger = el('button','文章分类 ▾','category-trigger');
    trigger.type = 'button'; trigger.setAttribute('aria-expanded','false');
    trigger.setAttribute('aria-controls','nil-category-menu');
    const links = el('nav','','category-nav');
    links.id = 'nil-category-menu'; links.popover = 'auto';
    links.setAttribute('aria-label','文章分类');
    const topics = days ? [['21-century','21st century'],['crime','Crime'],['disasters','Disasters'],['exploration','Exploration'],['landmarks','Landmarks'],['science','Science'],['war','War']] : [['exercises','Exercises'],['funny','Funny'],['history','History'],['information','Information'],['interesting','Interesting'],['nature','Nature'],['news','News'],['sport','Sport']];
    for (const [slug,label] of topics) {
      const url = new URL(`/category/${slug}/`,location.origin);
      if (level) url.searchParams.set('level',`level-${level}`);
      const link = el('a',label); link.href = url.href;
      if (location.pathname.startsWith(url.pathname)) link.setAttribute('aria-current','page');
      links.append(link);
    }
    const position = () => {
      const rect = trigger.getBoundingClientRect();
      const width = Math.min(340,window.innerWidth-28);
      links.style.width = `${width}px`;
      links.style.left = `${Math.max(14,Math.min(rect.left,window.innerWidth-width-14))}px`;
      links.style.top = `${rect.bottom+8}px`;
      links.style.maxHeight = `${Math.max(80,window.innerHeight-rect.bottom-22)}px`;
    };
    trigger.addEventListener('click',() => {
      if (links.matches(':popover-open')) links.hidePopover();
      else { position(); links.showPopover({source:trigger}); }
    });
    links.addEventListener('toggle',() => trigger.setAttribute('aria-expanded',String(links.matches(':popover-open'))));
    links.addEventListener('keydown',event => { if (event.key === 'Escape') trigger.focus({preventScroll:true}); });
    window.addEventListener('resize',() => { if (links.matches(':popover-open')) position(); });
    window.addEventListener('scroll',() => { if (links.matches(':popover-open')) links.hidePopover(); },{passive:true});
    nav.append(trigger,links);
  };
  function extract() {
    if (!/^\/(?:$|page\/|level\/|category\/)/.test(location.pathname)) return null;
    const cards = [...document.querySelectorAll('.recent-news .news-block')].filter(card => safeURL(card.querySelector('h3 a')?.getAttribute('href'))?.pathname.startsWith(articlePath));
    return cards.length ? cards : null;
  }
  function render(cards,main,el,copy) {
    main.classList.add('listing');
    const level = currentLevel();
    const category = location.pathname.match(/\/category\/([^/]+)/)?.[1];
    const intro = el('header','','list-intro');
    const label = category ? `${category.charAt(0).toUpperCase()+category.slice(1)}${level ? ` · Level ${level}` : ''}` : level ? `Level ${level} · 文章列表` : '每日英语，慢慢进步';
    intro.append(el('div',`${days ? 'DAYS' : 'NEWS'} IN LEVELS · DAILY READING`,'eyebrow'),el('h1',days && !category && !level ? '历史上的这一天' : label),el('p',`${cards.length} 篇文章 · 选择感兴趣的话题，开始阅读与听力练习。`));
    const grid = el('div','','news-grid');
    for (const source of cards) {
      const originalLink = source.querySelector('h3 a');
      const card = el('article','','news-card');
      const image = source.querySelector('.img-wrap img');
      if (image) {
        const imageLink = el('a'); imageLink.href = safeURL(originalLink.getAttribute('href')).href;
        imageLink.setAttribute('tabindex','-1'); imageLink.setAttribute('aria-hidden','true');
        const img = el('img','','card-image');
        const src = safeURL(image.getAttribute('data-src') || image.getAttribute('src'));
        if (src) img.src = src.href;
        img.alt = ''; img.loading = 'lazy';
        const srcset = image.getAttribute('data-srcset') || image.getAttribute('srcset');
        if (srcset && srcset.split(',').every(item => safeURL(item.trim().split(/\s+/)[0]))) { img.srcset = srcset; img.sizes = '(max-width: 640px) 100vw, 500px'; }
        imageLink.append(img); card.append(imageLink);
      }
      const content = el('div','','card-content');
      const heading = el('h2'); heading.append(copy(originalLink)); content.append(heading);
      const excerpt = source.querySelector('.news-excerpt');
      const text = excerpt?.textContent.replace(/\s+/g,' ').trim() || '';
      const date = text.match(/^\d{2}-\d{2}-\d{4}(?:\s+\d{2}:\d{2})?/)?.[0];
      if (date) content.append(el('span',date,'card-date'));
      content.append(el('p',date ? text.slice(date.length).trim() : text));
      const levels = el('nav','','levels'); levels.setAttribute('aria-label',`选择 ${originalLink.textContent.trim()} 的等级`);
      source.querySelectorAll('.fancy-buttons a').forEach(a => { if (!safeURL(a.getAttribute('href'))?.pathname.startsWith(articlePath)) return; const link = copy(a); if (level && a.textContent.trim() === `Level ${level}`) link.setAttribute('aria-current','page'); levels.append(link); });
      content.append(levels); card.append(content); grid.append(card);
    }
    const pagination = el('nav','','pagination'); pagination.setAttribute('aria-label','文章列表分页');
    document.querySelectorAll('.pagination-wrap .pagination a, .pagination-wrap .pagination .current').forEach(node => {
      if (node.tagName === 'A') { if (safeURL(node.getAttribute('href'))) pagination.append(copy(node)); }
      else { const active = el('span',node.textContent.trim()); active.setAttribute('aria-current','page'); pagination.append(active); }
    });
    main.append(intro,grid,pagination);
  }
  return {extract,render,categories};
})();
