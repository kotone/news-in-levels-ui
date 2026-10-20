// Generate README desktop previews with real article images. No audio playback.
const fs = require('node:fs');
const path = require('node:path');
const {chromium} = require(process.env.PLAYWRIGHT_PATH || 'playwright');
(async () => {
  const browser = await chromium.launch({headless:true,channel:'msedge'});
  try {
    const page = await browser.newPage({viewport:{width:1280,height:1000}});
    await page.route('**/*',async route => {
      const req = route.request();
      if (req.isNavigationRequest() && req.frame() === page.mainFrame()) return route.fulfill({body:'<!doctype html><body></body>',contentType:'text/html'});
      const url = new URL(req.url());
      if (req.resourceType() === 'image' && /(^|\.)(newsinlevels|daysinlevels)\.com$/.test(url.hostname)) {
        try { return await route.fulfill({response:await route.fetch({timeout:20000})}); } catch { return route.abort(); }
      }
      return route.abort();
    });
    for (const [url,file,output,dark] of [
      ['https://www.newsinlevels.com/','tests/home-sample.html','preview-list-desktop.png',false],
      ['https://www.newsinlevels.com/products/hackers-attack-french-supermarkets-level-1/','source-sample.html','preview-desktop.png',false],
      ['https://www.daysinlevels.com/article/first-man-climbed-all-mountains-over-8000-meters-level-1/','tests/days-article-sample.html','preview-days-article.png',true]
    ]) {
      await page.goto(url);
      const html = fs.readFileSync(path.join(__dirname,'..',file),'utf8').replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,'');
      await page.setContent(html,{waitUntil:'domcontentloaded'});
      await page.evaluate(dark => { window.chrome = {storage:{local:{get:async () => ({nilDark:dark,nilSize:20}),set:async () => {}}}}; },dark);
      await page.addStyleTag({path:path.join(__dirname,'../extension/isolation.css')});
      for (const script of ['bootstrap.js','soundcloud.js','listing.js','reader.js']) await page.addScriptTag({path:path.join(__dirname,'../extension',script)});
      await page.locator('#nil-reader-host h1').waitFor();
      const images = page.locator('#nil-reader-host img');
      await images.evaluateAll(imgs => imgs.forEach(img => {img.loading='eager';}));
      await page.waitForFunction(() => [...document.querySelectorAll('#nil-reader-host img')].every(img => img.complete),{},{timeout:30000});
      const broken = await images.evaluateAll(imgs => imgs.filter(img => !img.naturalWidth).map(img => img.currentSrc || img.src));
      if (broken.length) throw new Error(`Preview images failed to load: ${broken.join(', ')}`);
      await page.screenshot({path:path.join(__dirname,'..',output),fullPage:true});
      console.log(`Saved ${output}: ${await images.count()} loaded images`);
    }
  } finally {await browser.close();}
})().catch(error => {console.error(error);process.exitCode=1;});
