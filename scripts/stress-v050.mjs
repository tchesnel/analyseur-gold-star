import assert from 'node:assert/strict';
import { generateMockHistory } from '../api/_lib/mock.js';
import { StrategyRuntime, REQUIRED_TIMEFRAMES } from '../engine/strategy-runtime.js';
import { buildVisualAnalysis } from '../engine/visual-analysis.js';
import { FAMILY_KEYS } from '../assets/layer-state.js';

const validFamilies=new Set(FAMILY_KEYS);
const base=Date.UTC(2026,8,16,0,0,0);
let analyses=0;
function finiteTree(x,path='root'){
  if(x===null||x===undefined||typeof x==='string'||typeof x==='boolean') return;
  if(typeof x==='number'){assert.ok(Number.isFinite(x),`non-finite ${path}: ${x}`);return;}
  if(Array.isArray(x)){x.forEach((v,i)=>finiteTree(v,`${path}[${i}]`));return;}
  if(typeof x==='object'){for(const [k,v] of Object.entries(x))finiteTree(v,`${path}.${k}`);}
}
for(let s=0;s<500;s++){
  const runtime=new StrategyRuntime([]);
  const now=base+s*17*60_000;
  for(const tf of REQUIRED_TIMEFRAMES){
    const bars=generateMockHistory(tf,180,now+s*37_000);
    // deterministic regime variants without breaking OHLC
    const drift=((s%9)-4)*0.015;
    for(let i=0;i<bars.length;i++){
      const adj=drift*i;
      bars[i]={...bars[i],open:bars[i].open+adj,high:bars[i].high+adj,low:bars[i].low+adj,close:bars[i].close+adj,volume:Math.max(1,bars[i].volume*(1+((s+i)%7)*0.08))};
    }
    runtime.ingest('history',{timeframe:tf,bars,symbolName:'XAUUSD',digits:2});
  }
  const m5=runtime.bars.M5; const px=m5.at(-1).close;
  runtime.ingest('quote',{bid:px,ask:px+0.12,spread:0.12,timestamp:now});
  const imb=((s%21)-10)/12; const clamped=Math.max(-.92,Math.min(.92,imb));
  const total=5000,bidSize=total*(1+clamped)/2,askSize=total-bidSize;
  runtime.ingest('depth',{available:true,bidSize,askSize,ratio:askSize>0?bidSize/askSize:null,imbalance:clamped,bidWall:{price:px-0.3,size:bidSize*.24},askWall:{price:px+0.3,size:askSize*.24},bidLevels:[{price:px-.1,size:bidSize}],askLevels:[{price:px+.1,size:askSize}]});
  const risks=['normal','elevated','high','critical']; const biases=['neutral','gold-supportive','gold-negative'];
  runtime.ingest('macro',{available:true,risk:risks[s%4],bias:biases[s%3],dxy:{value:100+(s%30)*.1,change:((s%5)-2)*.08},us10y:{value:3.5+(s%20)*.04,change:((s%7)-3)*.01},real10y:{value:1.2+(s%15)*.03,change:((s%5)-2)*.01},nextEvent:{type:['CPI','NFP','FOMC','PCE'][s%4],title:'stress',time:now+(s%240)*60_000,impact:'critical',source:'stress'}});
  for(const tf of REQUIRED_TIMEFRAMES){
    const v=buildVisualAnalysis(runtime.snapshot(),tf); analyses++;
    assert.equal(v.execution,null,'execution must remain null');
    assert.ok(v.display.visibleCount<=9,`too many AUTO families: ${v.display.visibleCount}`);
    for(const [k,on] of Object.entries(v.display.families)){assert.ok(validFamilies.has(k),`unknown family ${k}`);assert.equal(typeof on,'boolean');}
    for(const z of v.overlays.zones??[]){if(Number.isFinite(z.low)&&Number.isFinite(z.high))assert.ok(z.low<=z.high,`inverted zone ${z.kind}`);}
    const m=v.metrics??{};
    if(Number.isFinite(m.rsi14))assert.ok(m.rsi14>=0&&m.rsi14<=100,'RSI bounds');
    if(Number.isFinite(m.adx14))assert.ok(m.adx14>=0&&m.adx14<=100,'ADX bounds');
    if(Number.isFinite(m.bandwidth))assert.ok(m.bandwidth>=0,'BBW negative');
    if(Number.isFinite(m.depthImbalance))assert.ok(m.depthImbalance>=-1&&m.depthImbalance<=1,'DOM imbalance bounds');
    if(m.profileAvailable){assert.ok(Number.isFinite(m.profileVal)&&Number.isFinite(m.profilePoc)&&Number.isFinite(m.profileVah));assert.ok(m.profileVal<=m.profilePoc&&m.profilePoc<=m.profileVah,'profile ordering');}
    finiteTree(v);
  }
}
console.log(`STRESS_V050_OK analyses=${analyses}`);
