const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const { chromium } = require(process.env.PLAYWRIGHT_PATH || 'playwright');
// Keep the real markup, without executing third-party ad and tracking scripts.
const fixture = fs.readFileSync(path.join(__dirname,'../source-sample.html'),'utf8').replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,'');
(async () => {
  const browser = await chromium.launch({ headless: true, channel: 'msedge' });
  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 1100 } });
    const currentURL = 'https://www.newsinlevels.com/products/hackers-attack-french-supermarkets-level-1/';
    await page.route('**/*', route => {
      const url = new URL(route.request().url());
      if (url.hostname === 'w.soundcloud.com') return route.fulfill({contentType:'text/html',body:`<!doctype html><body>Mock SoundCloud<script>
        window.addEventListener('message',event => {
          const message = JSON.parse(event.data);
          const reply = (method,value) => parent.postMessage(JSON.stringify({method,value}),'https://www.newsinlevels.com');
          if (message.method === 'getDuration') reply('getDuration',54000);
          if (message.method === 'play' || message.method === 'pause') reply(message.method);
          if (message.method === 'seekTo') reply('seek',{currentPosition:message.value});
        });
      </script></body>`});
      if (url.href === currentURL) return route.fulfill({body:'<!doctype html><html><body></body></html>',contentType:'text/html'});
      if (url.pathname === '/level/level-1/') return route.fulfill({body:`<h3><a href="/products/newer-level-1/">Newer story</a></h3><h3><a href="${currentURL}">Current story</a></h3><a href="/level/level-1/page/2/">›</a>`,contentType:'text/html'});
      if (url.pathname === '/level/level-1/page/2/') return route.fulfill({body:'<h3><a href="/products/older-level-1/">Older story</a></h3>',contentType:'text/html'});
      return route.abort();
    });
    await page.goto(currentURL);
    await page.setContent(fixture);
    await page.evaluate(() => {
      window.chrome = { storage: { local: {
        get: async () => ({nilSize:22,nilDark:false}),
        set: async value => { window.savedSettings = value; }
      } } };
    });
    await page.addStyleTag({ path:path.join(__dirname,'../extension/isolation.css') });
    await page.addScriptTag({ path:path.join(__dirname,'../extension/bootstrap.js') });
    assert.equal(await page.evaluate(() => getComputedStyle(document.body).visibility),'hidden');
    await page.addScriptTag({ path:path.join(__dirname,'../extension/soundcloud.js') });
    await page.addScriptTag({ path:path.join(__dirname,'../extension/listing.js') });
    await page.addScriptTag({ path:path.join(__dirname,'../extension/reader.js') });
    const host = page.locator('#nil-reader-host');
    await host.locator('h1').waitFor();
    await host.locator('.article-links a').first().waitFor();
    assert.equal(await host.locator('.article-links a').count(),2);
    assert.equal(await host.locator('.article-links a').last().getAttribute('href'),'https://www.newsinlevels.com/products/older-level-1/');
    assert.equal(await host.locator('.site-nav > a').count(),5);
    assert.equal(await page.evaluate(() => getComputedStyle(document.body).visibility),'visible');
    assert.equal(await page.evaluate(() => document.documentElement.classList.contains('nil-loading')),false);
    assert.equal(await host.locator('.levels a').count(),3);
    assert.equal(await host.locator('.prose > *').count(),5);
    assert.equal(await host.locator('.vocabulary').count(),1);
    assert.equal(await host.locator('.vocabulary-row').count(),3);
    assert.deepEqual(await host.locator('.vocabulary dt').allTextContents(),['fridge','heat','turn off']);
    assert.equal(await host.locator('.vocabulary dd').first().textContent(),'a large appliance which keeps food fresh and cold');
    assert.equal(await host.locator('.vocabulary dt a').count(),3);
    assert.equal(await host.locator('iframe').count(),1);
    const audio = host.locator('.sc-player');
    const audioPlay = audio.getByRole('button',{name:'播放音频',exact:true});
    await audio.getByRole('combobox',{name:'音频播放速度'}).selectOption('1.5');
    assert.equal(await page.evaluate(() => window.savedSettings.nilPlaybackRate),1.5);
    assert.equal(await audioPlay.isDisabled(),true);
    assert.equal(await host.locator('main').evaluate(main => [...main.children].indexOf(main.querySelector('.sc-player')) < [...main.children].indexOf(main.querySelector('.prose'))),true);
    // The iframe load event alone must not enable playback.
    const audioBody = host.frameLocator('iframe').locator('body');
    await audioBody.waitFor({state:'attached'});
    assert.equal(await audioPlay.isDisabled(),true);
    await page.evaluate(() => window.dispatchEvent(new MessageEvent('message',{origin:'https://w.soundcloud.com',source:window,data:JSON.stringify({method:'ready'})})));
    assert.equal(await audioPlay.isDisabled(),true);
    await page.clock.install();
    await page.clock.fastForward(18001);
    await audio.getByText('加载较慢，可重试或展开原播放器。').waitFor();
    await audio.getByRole('button',{name:'重新加载'}).click();
    await audioBody.waitFor({state:'attached'});
    const emitAudio = (method,value) => audioBody.evaluate((body,data) => window.parent.postMessage(JSON.stringify(data),'https://www.newsinlevels.com'),{method,value});
    await emitAudio('ready');
    await audio.getByText('准备就绪，点击播放').waitFor();
    await audio.getByText('0:00 / 0:54').waitFor();
    await audioPlay.click();
    await audio.getByText('正在播放',{exact:true}).waitFor();
    await audio.getByRole('button',{name:'暂停音频',exact:true}).click();
    await audio.getByText('已暂停',{exact:true}).waitFor();
    await emitAudio('playProgress',{currentPosition:27000});
    await audio.getByText('0:27 / 0:54').waitFor();
    await audio.getByRole('button',{name:'展开原播放器'}).click();
    assert.equal(await audio.locator('iframe').getAttribute('aria-hidden'),'false');
    await audio.getByRole('button',{name:'收起原播放器'}).click();
    await emitAudio('error');
    await audio.getByText('音频加载失败，请重试或展开原播放器。').waitFor();
    assert.equal(await audioPlay.isDisabled(),true);
    await audio.getByRole('button',{name:'重新加载'}).click();
    await audioBody.waitFor({state:'attached'});
    await emitAudio('ready');
    await audio.getByText('准备就绪，点击播放').waitFor();
    await page.clock.resume();
    assert.equal(await host.locator('.question').count(),1);
    assert.equal(await page.evaluate(() => getComputedStyle(document.querySelector('#nil-reader-host').previousElementSibling).display),'none');
    await host.getByRole('button',{name:'增大字号',exact:true}).click();
    assert.equal(await page.evaluate(() => window.savedSettings.nilSize),24);
    await host.getByRole('button',{name:'切换明暗主题'}).click();
    assert.equal(await page.evaluate(() => window.savedSettings.nilDark),true);
    await host.getByRole('button',{name:'查看原网页',exact:true}).click();
    assert.equal(await page.evaluate(() => document.documentElement.classList.contains('nil-reading')),false);
    await host.getByRole('button',{name:'返回专注阅读',exact:true}).click();
    assert.equal(await page.evaluate(() => document.documentElement.classList.contains('nil-reading')),true);
    await host.getByRole('button',{name:'切换明暗主题'}).click();
    await page.screenshot({path:path.join(__dirname,'../preview-desktop.png'),fullPage:true});
    await page.setViewportSize({width:390,height:844});
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),true);
    await page.screenshot({path:path.join(__dirname,'../preview-mobile.png'),fullPage:true});
    await page.setContent('<main>Not an article</main>');
    await page.addScriptTag({path:path.join(__dirname,'../extension/bootstrap.js')});
    await page.addScriptTag({path:path.join(__dirname,'../extension/reader.js')});
    assert.equal(await page.locator('#nil-reader-host').count(),0);
    assert.equal(await page.evaluate(() => document.documentElement.classList.contains('nil-loading')),false);
    // Network failure keeps the archive link usable and releases the loading guard.
    await page.setContent(fixture);
    await page.route('**/level/**',route => route.abort());
    await page.addScriptTag({path:path.join(__dirname,'../extension/reader.js')});
    await host.getByText('相邻文章加载失败，可从下方文章列表继续阅读。').waitFor();
    assert.equal(await host.getByText('浏览全部 Level 1 文章').getAttribute('href'),'https://www.newsinlevels.com/level/level-1/');
    console.log('PASS: SoundCloud readiness, trusted message source, slow loading, retry, play/pause, progress, error recovery, original player fallback; loading guard, extraction, archive navigation, preferences, mobile overflow, fail-open.');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });


