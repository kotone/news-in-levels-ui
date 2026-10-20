const path = require('node:path');
const assert = require('node:assert/strict');
const {chromium} = require(process.env.PLAYWRIGHT_PATH || 'playwright');
(async () => {
  const browser = await chromium.launch({headless:true,channel:'msedge'});
  try {
    const page = await browser.newPage();
    await page.setContent('<!doctype html><audio></audio>');
    await page.evaluate(() => {
      HTMLMediaElement.prototype.play = function () { this.playCalled = true; return Promise.resolve(); };
      HTMLMediaElement.prototype.load = function () { this.loadCalled = true; };
      window.chrome = {storage:{local:{get:async () => ({nilPlaybackRate:1.5})},onChanged:{addListener:fn => window.changeRate = value => fn({nilPlaybackRate:{newValue:value}},'local')}}};
    });
    for (const script of ['soundcloud-rate-main.js','soundcloud-rate-bridge.js']) await page.addScriptTag({path:path.join(__dirname,'../extension',script)});
    assert.equal(await page.locator('audio').evaluate(audio => audio.playbackRate),1.5);
    assert.deepEqual(await page.evaluate(async () => {
      window.detached = new Audio();
      await detached.play();
      return [detached.playbackRate,detached.preservesPitch,detached.playCalled];
    }),[1.5,true,true]);
    await page.evaluate(() => window.changeRate(0.75));
    assert.equal(await page.evaluate(() => detached.playbackRate),0.75);
    await page.evaluate(() => { detached.playbackRate = 1; });
    assert.equal(await page.evaluate(() => detached.playbackRate),0.75);
    assert.deepEqual(await page.evaluate(() => {
      window.changeRate(2);
      const replacement = new Audio(); replacement.load();
      return [replacement.playbackRate,replacement.loadCalled,detached.playbackRate];
    }),[2,true,2]);
    await page.evaluate(() => window.dispatchEvent(new CustomEvent('nil-soundcloud-rate',{detail:99})));
    assert.equal(await page.evaluate(() => detached.playbackRate),2);
    await page.evaluate(() => window.changeRate(1));
    assert.equal(await page.evaluate(() => detached.playbackRate),1);
    console.log('PASS: saved rate, detached audio, live rate changes, player resets, replacement media, pitch preservation, invalid-rate guard, normal-speed restore.');
  } finally { await browser.close(); }
})().catch(error => {console.error(error);process.exitCode=1;});
