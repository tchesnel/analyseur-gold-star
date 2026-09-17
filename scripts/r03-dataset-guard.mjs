import fs from 'node:fs';
import path from 'node:path';
import {pathToFileURL} from 'node:url';

export function normalizeSymbol(v){return String(v??'').trim().toUpperCase().replace(/[^A-Z0-9]/g,'');}
export function classifySymbol(v){
  const s=normalizeSymbol(v);
  if(s==='XAUUSD'||s.startsWith('XAUUSD'))return'XAUUSD';
  if(s==='ESV0'||s.startsWith('ES'))return'ES';
  return s||'UNKNOWN';
}

export function inspectCsvSymbol(csvPath,{sampleLines=5000}={}){
  const fd=fs.openSync(csvPath,'r');
  try{
    const chunk=Buffer.alloc(1024*1024);const n=fs.readSync(fd,chunk,0,chunk.length,0);const txt=chunk.subarray(0,n).toString('utf8');
    const lines=txt.split(/\r?\n/).filter(Boolean).slice(0,sampleLines+1);if(lines.length<2)throw new Error('CSV vide/incomplet');
    const header=lines[0].split(',').map(x=>x.trim());const idx=header.findIndex(x=>x.toLowerCase()==='symbol');
    const symbols=new Set();
    if(idx>=0)for(const line of lines.slice(1)){const cols=line.split(',');if(cols[idx])symbols.add(cols[idx].trim());}
    if(!symbols.size){
      const inferred=path.basename(csvPath).match(/XAUUSD|ES(?:_|\.|-)/i)?.[0]??'UNKNOWN';symbols.add(inferred);
    }
    const classes=[...symbols].map(classifySymbol);return{symbols:[...symbols],classes:[...new Set(classes)],header};
  }finally{fs.closeSync(fd);}
}

export function assertGoldDataset(csvPath){
  const info=inspectCsvSymbol(csvPath);
  if(info.classes.length!==1||info.classes[0]!=='XAUUSD'){
    const err=new Error(`DATASET_MISMATCH: R03 Gold calibration requires XAUUSD; detected ${info.classes.join(', ')||'UNKNOWN'}`);err.code='DATASET_MISMATCH';err.info=info;throw err;
  }
  return info;
}

async function main(){
  const args=process.argv.slice(2),csv=args.find(x=>!x.startsWith('--')),external=args.includes('--external');
  if(!csv)throw new Error('Usage: node scripts/r03-dataset-guard.mjs <csv> [--external]');
  const info=inspectCsvSymbol(csv);
  if(!external)assertGoldDataset(csv);
  console.log(JSON.stringify({mode:external?'EXTERNAL_FALSIFICATION':'GOLD_CALIBRATION',...info},null,2));
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href)main().catch(e=>{console.error(e.message);process.exitCode=e.code==='DATASET_MISMATCH'?2:1;});
