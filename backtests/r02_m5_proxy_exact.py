#!/usr/bin/env python3
"""Reproductible M5 proxy backtest for R02 v0.7.1.

Uses the same EMA/ATR/ADX equations as the JavaScript LIVE engine for the
H4/H1/M5 context. The LIVE M1 resume cannot be reproduced from an M5-only
CSV, so the entry trigger is a causal M5 proxy after the held retest.

Usage:
  python backtests/r02_m5_proxy_exact.py xauusd-m5.csv --out backtest-output
"""
from __future__ import annotations
import argparse, json, math
from pathlib import Path
import numpy as np
import pandas as pd

CFG = dict(
    balance_hours=60, min_width_atr_h1=4.0, max_width_atr_h1=12.0,
    max_efficiency=0.32, edge_fraction=0.35, pressure_closes=5,
    penetration_atr_m5=0.10, min_break_range_atr=1.30,
    min_volume_ratio=1.20, rearm_bars=6, adx_rise_bars=5,
    min_adx_rise=1.0, acceptance_buffer_atr=0.08,
    acceptance_closes=2, acceptance_max_bars=4,
    reentry_invalidation_atr=0.10, retest_max_bars=12,
    retest_band_atr=0.35, resume_proxy_bars=4,
    resume_proxy_range_atr=0.70, stop_buffer_atr=0.12,
    min_risk_atr=0.50, max_risk_atr=3.0,
    target_rr=2.25, hold_bars=144, cost_per_oz=0.30,
)

def ema_js(values, period):
    v=np.asarray(values,float); out=np.full(len(v),np.nan)
    if len(v)<period:return out
    x=float(v[:period].mean());out[period-1]=x;k=2/(period+1)
    for i in range(period,len(v)):
        x=float(v[i])*k+x*(1-k);out[i]=x
    return out

def atr_js(high,low,close,period=14):
    h=np.asarray(high,float);l=np.asarray(low,float);c=np.asarray(close,float);out=np.full(len(c),np.nan)
    if len(c)<period+1:return out
    tr=[max(h[i]-l[i],abs(h[i]-c[i-1]),abs(l[i]-c[i-1])) for i in range(1,len(c))]
    x=float(np.mean(tr[:period]));out[period]=x
    for i in range(period,len(tr)):
        x=((x*(period-1))+tr[i])/period;out[i+1]=x
    return out

def adx_js(high,low,close,period=14):
    h=np.asarray(high,float);l=np.asarray(low,float);c=np.asarray(close,float);out=np.full(len(c),np.nan)
    tr=[];plus_dm=[];minus_dm=[]
    for i in range(1,len(c)):
        up=h[i]-h[i-1];dn=l[i-1]-l[i]
        tr.append(max(h[i]-l[i],abs(h[i]-c[i-1]),abs(l[i]-c[i-1])))
        plus_dm.append(up if up>dn and up>0 else 0);minus_dm.append(dn if dn>up and dn>0 else 0)
    if len(tr)<period*2:return out
    a=sum(tr[:period]);ps=sum(plus_dm[:period]);ms=sum(minus_dm[:period]);dx=[];idx=[]
    def push(i):
        plus=100*ps/a if a else 0;minus=100*ms/a if a else 0
        d=100*abs(plus-minus)/(plus+minus) if plus+minus else 0
        dx.append(d);idx.append(i+1)
    push(period-1)
    for i in range(period,len(tr)):
        a=a-a/period+tr[i];ps=ps-ps/period+plus_dm[i];ms=ms-ms/period+minus_dm[i];push(i)
    if len(dx)<period:return out
    av=float(np.mean(dx[:period]));out[idx[period-1]]=av
    for i in range(period,len(dx)):
        av=(av*(period-1)+dx[i])/period;out[idx[i]]=av
    return out

def metrics(trades):
    if len(trades)==0:return dict(n=0,expectancy=None,pf=None,total_r=0,win_rate=None,max_dd=None)
    r=np.asarray([x['R'] for x in trades],float);gp=r[r>0].sum();gl=-r[r<0].sum();eq=np.cumsum(r);peak=np.maximum.accumulate(np.r_[0,eq])[:-1]
    return dict(n=int(len(r)),expectancy=float(r.mean()),pf=float(gp/gl) if gl else None,total_r=float(r.sum()),win_rate=float((r>0).mean()),max_dd=float(np.max(peak-eq)))

def prepare(csv_path):
    df=pd.read_csv(csv_path)
    required={'time','open','high','low','close','volume'};missing=required-set(df.columns)
    if missing:raise SystemExit(f'Missing columns: {sorted(missing)}')
    df['time']=pd.to_datetime(df.time,utc=True);df=df.sort_values('time').drop_duplicates('time').reset_index(drop=True)
    A=atr_js(df.high,df.low,df.close);ADX=adx_js(df.high,df.low,df.close)
    pc=df.close.shift(1)
    TR=np.maximum.reduce([(df.high-df.low).abs().values,(df.high-pc).abs().values,(df.low-pc).abs().values])
    RRANGE=TR/A;VMED=df.volume.shift(1).rolling(20,min_periods=10).median().values
    VR=df.volume.values/np.where(VMED==0,np.nan,VMED)
    YEAR=df.time.dt.year.values;T=df.time.values.astype('datetime64[ms]').astype(np.int64)
    O,H,L,C=[df[x].values.astype(float) for x in ['open','high','low','close']]
    x=df.set_index('time')
    def rs(tf):return x.resample(tf,label='left',closed='left').agg(open=('open','first'),high=('high','max'),low=('low','min'),close=('close','last'),volume=('volume','sum')).dropna().reset_index()
    h1=rs('1h');h4=rs('4h');h1['end']=h1.time+pd.Timedelta(hours=1);h4['end']=h4.time+pd.Timedelta(hours=4)
    h1A=atr_js(h1.high,h1.low,h1.close);h4['e20']=ema_js(h4.close,20);h4['e50']=ema_js(h4.close,50)
    h4['bias']=np.where((h4.close>h4.e20)&(h4.e20>h4.e50),1,np.where((h4.close<h4.e20)&(h4.e20<h4.e50),-1,0))
    base=pd.merge_asof(df[['time']],h4[['end','bias']].sort_values('end'),left_on='time',right_on='end',direction='backward').drop(columns=['end'])
    BIAS=base.bias.fillna(0).values.astype(int)
    N=CFG['balance_hours'];efrac=CFG['edge_fraction'];u=np.full(len(h1),np.nan);lo=u.copy();wa=u.copy();eff=u.copy();bp=u.copy()
    for k in range(N-1,len(h1)):
        w=h1.iloc[k-N+1:k+1];U=float(w.high.max());D=float(w.low.min());a=h1A[k]
        u[k]=U;lo[k]=D;wa[k]=(U-D)/a if np.isfinite(a) and a>0 else np.nan
        cl=w.close.values.astype(float);path=np.abs(np.diff(cl)).sum();eff[k]=abs(cl[-1]-cl[0])/path if path>0 else 0
        threshold=U-(U-D)*efrac;bp[k]=(cl[-6:]>=threshold).sum()
    z=pd.DataFrame({'end':h1.end,'upper':u,'lower':lo,'widthAtr':wa,'eff':eff,'bp':bp}).dropna().sort_values('end')
    bal=pd.merge_asof(df[['time']],z,left_on='time',right_on='end',direction='backward').drop(columns=['end'])
    return df,A,ADX,RRANGE,VR,YEAR,T,O,H,L,C,BIAS,*(bal[k].values for k in ['upper','lower','widthAtr','eff','bp'])

def simulate(csv_path):
    df,A,ADX,RRANGE,VR,YEAR,T,O,H,L,C,BIAS,UP,LO,WA,EF,BP=prepare(csv_path);p=CFG;trades=[];last_exit=-1
    for i in range(120,len(C)):
        if i<=last_exit or i<p['adx_rise_bars']:continue
        a=A[i]
        if not np.isfinite(a) or not np.isfinite(UP[i]) or not np.isfinite(ADX[i]) or not np.isfinite(ADX[i-p['adx_rise_bars']]):continue
        # Calibrated production branch is BUY-only.
        if not(C[i]>=UP[i]+p['penetration_atr_m5']*a and C[i-1]<=UP[i]+0.05*a) or BIAS[i]!=1:continue
        if not(p['min_width_atr_h1']<=WA[i]<=p['max_width_atr_h1']) or EF[i]>p['max_efficiency'] or BP[i]<p['pressure_closes']:continue
        if RRANGE[i]<p['min_break_range_atr'] or not np.isfinite(VR[i]) or VR[i]<p['min_volume_ratio'] or ADX[i]-ADX[i-p['adx_rise_bars']]<p['min_adx_rise']:continue
        K=p['rearm_bars'];tol=.05*a
        if not np.all((C[i-K:i]<=UP[i]+tol)&(C[i-K:i]>=LO[i]-tol)):continue
        boundary=UP[i];consecutive=0;accept=None;invalid=False
        for j in range(i,min(len(C),i+p['acceptance_max_bars']+1)):
            aj=A[j] if np.isfinite(A[j]) else a
            if C[j]<boundary-p['reentry_invalidation_atr']*aj:invalid=True;break
            consecutive=consecutive+1 if C[j]>=boundary+p['acceptance_buffer_atr']*aj else 0
            if consecutive>=p['acceptance_closes']:accept=j;break
        if invalid or accept is None:continue
        retest=None
        for j in range(accept+1,min(len(C),accept+p['retest_max_bars']+1)):
            aj=A[j] if np.isfinite(A[j]) else a
            if C[j]<boundary-p['reentry_invalidation_atr']*aj:invalid=True;break
            if L[j]<=boundary+p['retest_band_atr']*aj and C[j]>=boundary-p['reentry_invalidation_atr']*aj:retest=j;break
        if invalid or retest is None:continue
        resume=None
        for k in range(retest+1,min(len(C),retest+1+p['resume_proxy_bars'])):
            if not np.isfinite(A[k]):continue
            prior_high=np.max(H[max(retest,k-3):k])
            if C[k]>prior_high and C[k]>O[k] and RRANGE[k]>=p['resume_proxy_range_atr']:resume=k;break
        if resume is None:continue
        entry=C[resume];ar=A[resume];stop=min(L[retest]-p['stop_buffer_atr']*ar,boundary-p['stop_buffer_atr']*ar);risk=entry-stop
        if risk<=0 or risk/ar<p['min_risk_atr'] or risk/ar>p['max_risk_atr']:continue
        target=entry+p['target_rr']*risk;gross=None;exit_i=None;reason=None
        for k in range(resume+1,min(len(C),resume+p['hold_bars']+1)):
            sl=L[k]<=stop;tp=H[k]>=target
            if sl and tp:gross=-1.;exit_i=k;reason='SL_same_bar';break
            if sl:gross=-1.;exit_i=k;reason='SL';break
            if tp:gross=p['target_rr'];exit_i=k;reason='TP';break
        if gross is None:
            k=min(len(C)-1,resume+p['hold_bars']);gross=max(-1,min(p['target_rr'],(C[k]-entry)/risk));exit_i=k;reason='TIME'
        trades.append(dict(time=pd.Timestamp(T[resume],unit='ms',tz='UTC'),year=int(YEAR[resume]),R=float(gross-p['cost_per_oz']/risk),grossR=float(gross),risk=float(risk),entry=float(entry),stop=float(stop),target=float(target),exit_time=pd.Timestamp(T[exit_i],unit='ms',tz='UTC'),exit_reason=reason,break_time=pd.Timestamp(T[i],unit='ms',tz='UTC'),accept_time=pd.Timestamp(T[accept],unit='ms',tz='UTC'),retest_time=pd.Timestamp(T[retest],unit='ms',tz='UTC'),widthAtr=float(WA[i]),efficiency=float(EF[i]),pressureCloses=float(BP[i]),penetrationAtr=float((C[i]-UP[i])/a),rangeRatio=float(RRANGE[i]),volumeRatio=float(VR[i]),adx=float(ADX[i]),adxRise=float(ADX[i]-ADX[i-p['adx_rise_bars']])))
        last_exit=exit_i
    return trades

def main():
    ap=argparse.ArgumentParser();ap.add_argument('csv');ap.add_argument('--out',default='r02-backtest-output');args=ap.parse_args();out=Path(args.out);out.mkdir(parents=True,exist_ok=True)
    trades=simulate(args.csv);df=pd.DataFrame(trades);df.to_csv(out/'R02_BACKTEST_M5_PROXY_TRADES.csv',index=False)
    result={'config':CFG,'all':metrics(trades),'development_2021_2023':metrics([x for x in trades if x['year']<=2023]),'oos_2024_2026':metrics([x for x in trades if x['year']>=2024]),'by_year':{str(y):metrics([x for x in trades if x['year']==y]) for y in range(2021,2027)},'limitation':'M5-only dataset: LIVE M1 resumption is represented by a causal M5 proxy.'}
    (out/'R02_BACKTEST_RESULTS.json').write_text(json.dumps(result,indent=2,ensure_ascii=False),encoding='utf-8');print(json.dumps(result,indent=2,ensure_ascii=False))
if __name__=='__main__':main()
