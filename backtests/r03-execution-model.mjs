export function resolveR03Bar({side,bar,stop,target,slippage=0}){
  const s=String(side).toLowerCase();
  if(!['buy','sell'].includes(s))throw new Error('side must be buy or sell');
  const o=Number(bar?.open),h=Number(bar?.high),l=Number(bar?.low),st=Number(stop),tp=Number(target),sl=Math.max(Number(slippage)||0,0);
  for(const [k,v] of Object.entries({open:o,high:h,low:l,stop:st,target:tp}))if(!Number.isFinite(v))throw new Error(`invalid ${k}`);
  if(s==='buy'){
    if(o<=st)return{hit:true,reason:'SL_GAP',price:o-sl};
    if(o>=tp)return{hit:true,reason:'TP_GAP',price:tp-sl};
    const hitStop=l<=st,hitTp=h>=tp;
    if(hitStop)return{hit:true,reason:hitTp?'SL_SAME_BAR':'SL',price:st-sl};
    if(hitTp)return{hit:true,reason:'TP',price:tp-sl};
  }else{
    if(o>=st)return{hit:true,reason:'SL_GAP',price:o+sl};
    if(o<=tp)return{hit:true,reason:'TP_GAP',price:tp+sl};
    const hitStop=h>=st,hitTp=l<=tp;
    if(hitStop)return{hit:true,reason:hitTp?'SL_SAME_BAR':'SL',price:st+sl};
    if(hitTp)return{hit:true,reason:'TP',price:tp+sl};
  }
  return{hit:false,reason:null,price:null};
}

export function rMultiple({side,entry,exit,stop}){
  const s=String(side).toLowerCase(),e=Number(entry),x=Number(exit),st=Number(stop),risk=Math.abs(e-st);
  if(!Number.isFinite(e)||!Number.isFinite(x)||!Number.isFinite(st)||risk<=0)return null;
  return s==='buy'?(x-e)/risk:(e-x)/risk;
}
