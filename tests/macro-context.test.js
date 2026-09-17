import test from 'node:test';
import assert from 'node:assert/strict';
import { parseFredCsv,parseBlsIcs,parseBeaSchedule,parseFomcCalendar } from '../api/_lib/macro.js';

test('FRED CSV parser ignores missing observations and returns latest numeric rows',()=>{const r=parseFredCsv('DATE,DGS10\n2026-09-14,4.12\n2026-09-15,.\n2026-09-16,4.08\n');assert.deepEqual(r,[{date:'2026-09-14',value:4.12},{date:'2026-09-16',value:4.08}]);});
test('BLS ICS parser keeps only high-impact releases',()=>{const now=Date.UTC(2026,8,1);const ics='BEGIN:VCALENDAR\nBEGIN:VEVENT\nDTSTART:20261014T083000\nSUMMARY:Consumer Price Index for September 2026\nEND:VEVENT\nBEGIN:VEVENT\nDTSTART:20261002T083000\nSUMMARY:Employment Situation for September 2026\nEND:VEVENT\nEND:VCALENDAR';const e=parseBlsIcs(ics,now);assert.deepEqual(e.map(x=>x.type),['NFP','CPI']);assert.ok(e.every(x=>x.impact==='critical'));});
test('BEA schedule parser detects Personal Income and Outlays / PCE',()=>{const html='<div>September 30 8:30 AM News Personal Income and Outlays, August 2026</div>';const e=parseBeaSchedule(html,Date.UTC(2026,8,1));assert.equal(e[0]?.type,'PCE');});
test('FOMC parser extracts the decision date from official-style calendar text',()=>{const html='<h4>September</h4><p>15-16*</p><h4>October</h4><p>27-28</p>';const e=parseFomcCalendar(html,Date.UTC(2026,8,1));assert.ok(e.some(x=>x.type==='FOMC'));assert.ok(e[0].time>Date.UTC(2026,8,1));});

test('Federal Reserve monthly calendar parser keeps only macro-relevant senior speeches/testimony',async()=>{
  const { parseFedSpeakerCalendar } = await import('../api/_lib/macro.js');
  const html='<h4>September 2026</h4><h4>Speeches</h4><h6>Time:</h6><h6>Release Date(s):</h6>9:30 a.m. Speech - Vice Chair Jane Doe Stress Testing At event 18 8:30 a.m. Speech - Governor Chris Doe Economic Outlook At event 20 <h4>Testimony</h4><h6>Time:</h6><h6>Release Date(s):</h6>10:00 a.m. Testimony - Chairman Alex Doe Semiannual Monetary Policy Report to Congress 22 <h4>FOMC Meetings</h4>';
  const now=Date.UTC(2026,8,16);
  const e=parseFedSpeakerCalendar(html,now,2026,8);
  assert.deepEqual(e.map(x=>x.type),['FED_SPEECH','FED_TESTIMONY']);
  assert.ok(e.every(x=>x.impact==='high'));
  assert.ok(e.every(x=>x.time>now));
});
