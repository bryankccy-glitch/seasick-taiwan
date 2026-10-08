import { test } from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { resolveTheme, THEME_BOOTSTRAP } from '../lib/theme.ts';
function boot(saved, systemLight, blocked = false) {
  const root = {dataset:{},classList:{toggle(name,on){this[name]=on;}}};
  vm.runInNewContext(THEME_BOOTSTRAP, {document:{documentElement:root},localStorage:{getItem(){if(blocked)throw Error();return saved;}},matchMedia(){return {matches:systemLight};}});
  return root;
}
test('explicit preference wins over system preference',()=>{
  assert.equal(resolveTheme('dark',true),'dark'); assert.equal(resolveTheme('light',false),'light');
});
test('first visit follows system and invalid values are ignored',()=>{
  assert.equal(boot(null,true).dataset.theme,'light'); assert.equal(boot('invalid',false).dataset.theme,'dark');
});
test('blocked storage still paints system theme without throwing',()=>{
  assert.equal(boot(null,true,true).dataset.theme,'light');
});
test('bootstrap applies dark class before paint and falls back without matchMedia',()=>{
  assert.equal(boot('dark',true).classList.dark,true);
  const root={dataset:{},classList:{toggle(){}}}; vm.runInNewContext(THEME_BOOTSTRAP,{document:{documentElement:root}}); assert.equal(root.dataset.theme,'dark');
});
test('light theme text and risk colors meet AA on its palest and tinted surfaces', async()=>{
  const {readFile} = await import('node:fs/promises');
  const css=await readFile(new URL('../app/theme.css',import.meta.url),'utf8');
  const luminance=hex=>hex.match(/\w{2}/g).map(x=>parseInt(x,16)/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4).reduce((sum,v,i)=>sum+v*[.2126,.7152,.0722][i],0);
  for(const token of ['foreground','ocean-secondary','ocean-accent','risk-low','risk-medium','risk-high','risk-very-high']){
    const color=css.match(new RegExp(`--${token}:#([a-f0-9]{6})`))[1];
    for(const bg of ['ffffff','edf5f8','ddf1f7'])assert.ok((luminance(bg)+.05)/(luminance(color)+.05)>=4.5,`${token} on ${bg}`);
  }
});
