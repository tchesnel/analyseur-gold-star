export const FAMILY_KEYS = Object.freeze([
  'structure','liquidity','internalLiquidity','orderBlocks','fvg','poi','fibonacci','premiumDiscount','htf','sessions','trend','vwap','avwap','volumeProfile','orderFlow','adx','volatilityRegime','macro','rsi','atr'
]);

export const CLEAN_PRESET = Object.freeze({
  structure:true,
  liquidity:true,
  internalLiquidity:true,
  orderBlocks:true,
  fvg:true,
  poi:true,
  fibonacci:false,
  premiumDiscount:false,
  htf:true,
  sessions:false,
  trend:true,
  vwap:true,
  avwap:false,
  volumeProfile:false,
  orderFlow:false,
  adx:false,
  volatilityRegime:false,
  macro:false,
  rsi:false,
  atr:false
});

export function allFamilies(enabled=true){
  return Object.fromEntries(FAMILY_KEYS.map(key=>[key,Boolean(enabled)]));
}

export function normalizeFamilyState(input={},fallback=CLEAN_PRESET){
  const out={};
  for(const key of FAMILY_KEYS){
    if(Object.prototype.hasOwnProperty.call(input,key)) out[key]=Boolean(input[key]);
    else out[key]=Boolean(fallback[key]);
  }
  return out;
}
