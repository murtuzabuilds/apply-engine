import React, { useMemo, useState } from 'react';
import { JOBS } from './data/jobs.js';
import { SAMPLE_RESUME } from './data/sampleResume.js';
import { TRACKS, trackById } from './lib/tracks.js';
import { rank } from './lib/score.js';
import { tailor } from './lib/tailor.js';
import { usePersisted } from './usePersisted.js';

const DEFAULT_WEIGHTS = { ai: 100, platform: 70, strategy: 60, growth: 50, data: 70, design: 60, venture: 40 };

export default function App() {
  const [resume, setResume] = usePersisted('ae.resume', SAMPLE_RESUME);
  const [weights, setWeights] = usePersisted('ae.tracks', DEFAULT_WEIGHTS);
  const [cities, setCities] = usePersisted('ae.cities', ['Remote', 'Chicago', 'Madison', 'New York', 'Seattle']);
  const [filter, setFilter] = useState('all');
  const [minFit, setMinFit] = useState(0);
  const [q, setQ] = useState('');
  const [sel, setSel] = useState(null);

  const ranked = useMemo(() => rank(JOBS, { resume, trackWeights: weights, cities }), [resume, weights, cities]);
  const shown = ranked.filter(j => (filter === 'all' || j.track === filter) && j.fit >= minFit && (`${j.title} ${j.company} ${j.city}`.toLowerCase().includes(q.toLowerCase())));
  const job = shown.find(j => j.id === sel) || shown[0];
  const counts = Object.fromEntries(TRACKS.map(t => [t.id, ranked.filter(j => j.track === t.id).length]));

  return (
    <div className="app">
      <header className="top">
        <div className="brand"><span className="mark" aria-hidden="true"><i /><i /><i /></span>Apply Engine</div>
        <p>Rank roles by resume fit, career track and city. Then tailor, honestly.</p>
        <a href="https://github.com/murtuzabuilds/apply-engine" target="_blank" rel="noreferrer">GitHub ↗</a>
      </header>

      <aside className="panel profile">
        <h2>Your resume</h2>
        <textarea value={resume} onChange={e => setResume(e.target.value)} aria-label="Resume text" spellCheck="false" />
        <div className="row"><small>Stays in this browser.</small><button type="button" onClick={() => setResume(SAMPLE_RESUME)}>Reset sample</button></div>

        <h2>Track priority</h2>
        {TRACKS.map(t => (
          <label key={t.id} className="slider">
            <span><i style={{ background: t.color }} />{t.name}</span>
            <input type="range" min="0" max="100" step="10" value={weights[t.id]} onChange={e => setWeights({ ...weights, [t.id]: +e.target.value })} />
            <b>{weights[t.id]}</b>
          </label>
        ))}

        <h2>City priority <small>most wanted first</small></h2>
        <ol className="cities">
          {cities.map((c, i) => (
            <li key={c + i}><span>{c}</span>
              <button type="button" aria-label={`Move ${c} up`} disabled={!i} onClick={() => { const n = [...cities]; [n[i - 1], n[i]] = [n[i], n[i - 1]]; setCities(n); }}>↑</button>
              <button type="button" aria-label={`Remove ${c}`} onClick={() => setCities(cities.filter((_, k) => k !== i))}>×</button></li>
          ))}
        </ol>
        <form className="add" onSubmit={e => { e.preventDefault(); const v = e.target.city.value.trim(); if (v) setCities([...cities, v]); e.target.reset(); }}>
          <input name="city" placeholder="Add a city or Remote" aria-label="Add city" /><button>Add</button>
        </form>
      </aside>

      <main className="panel list">
        <div className="filters">
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search roles, companies, cities" aria-label="Search" />
          <label className="min">Min fit <input type="range" min="0" max="90" step="5" value={minFit} onChange={e => setMinFit(+e.target.value)} /> <b>{minFit}</b></label>
        </div>
        <div className="chips">
          <button type="button" className={filter === 'all' ? 'on' : ''} onClick={() => setFilter('all')}>All · {ranked.length}</button>
          {TRACKS.map(t => <button type="button" key={t.id} className={filter === t.id ? 'on' : ''} style={{ '--c': t.color }} onClick={() => setFilter(t.id)}>{t.name} · {counts[t.id]}</button>)}
        </div>
        <ol className="jobs">
          {shown.map((j, i) => (
            <li key={j.id}>
              <button type="button" className={job?.id === j.id ? 'job on' : 'job'} onClick={() => setSel(j.id)}>
                <span className="rankno">{String(i + 1).padStart(2, '0')}</span>
                <span className="jt"><b>{j.title}</b><small>{j.company} · {j.city} · {j.posted}d ago</small>
                  <span className="tag" style={{ '--c': trackById(j.track).color }}>{trackById(j.track).name}</span></span>
                <Fit value={j.fit} />
              </button>
            </li>
          ))}
          {!shown.length && <li className="empty">No roles match. Lower the minimum fit or clear the search.</li>}
        </ol>
        <p className="note">Sample postings with fictional companies, so the demo works offline.</p>
      </main>

      <section className="panel detail">{job ? <Detail job={job} resume={resume} /> : <p className="empty">Pick a role.</p>}</section>
    </div>
  );
}

function Fit({ value, big }) {
  const r = big ? 34 : 16, c = 2 * Math.PI * r, s = big ? 84 : 40;
  const col = value >= 70 ? 'var(--good)' : value >= 50 ? 'var(--mid)' : 'var(--low)';
  return (
    <span className={big ? 'fit big' : 'fit'} aria-label={`Fit ${value}`}>
      <svg viewBox={`0 0 ${s} ${s}`} width={s} height={s}><circle cx={s / 2} cy={s / 2} r={r} className="tr" /><circle cx={s / 2} cy={s / 2} r={r} className="fl" style={{ stroke: col, strokeDasharray: c, strokeDashoffset: c * (1 - value / 100) }} /></svg>
      <b>{value}</b>
    </span>
  );
}

function Detail({ job, resume }) {
  const t = useMemo(() => tailor(resume, job.description, job.ats.missing), [resume, job]);
  const tr = trackById(job.track);
  const [copied, setCopied] = useState(false);
  const notes = `${job.title} · ${job.company}\nFit ${job.fit} (ATS ${job.ats.score}%)\n\nHeadline: ${t.headline}\n\nLead with:\n${t.lead.map(l => '- ' + l.text).join('\n')}\n\nMissing keywords:\n${t.suggestions.map(s => '- ' + s.advice).join('\n')}`;
  return (
    <>
      <div className="dh">
        <div><span className="tag" style={{ '--c': tr.color }}>{tr.name}</span><h2>{job.title}</h2><p>{job.company} · {job.city}</p></div>
        <Fit value={job.fit} big />
      </div>
      <div className="breakdown">
        <div><small>ATS match</small><b>{job.ats.score}%</b><i style={{ width: job.ats.score + '%' }} /></div>
        <div><small>Track priority</small><b>{job.trackPriority}</b><i style={{ width: job.trackPriority + '%' }} /></div>
        <div><small>City priority</small><b>{job.cityPriority}</b><i style={{ width: job.cityPriority + '%' }} /></div>
      </div>
      <p className="formula">fit = 0.5 × ATS + 0.3 × track + 0.2 × city</p>

      <h3>Keywords</h3>
      <div className="kw">{job.ats.matched.map(k => <span key={k} className="hit">✓ {k}</span>)}{job.ats.missing.map(k => <span key={k} className="miss">{k}</span>)}</div>

      <h3>Lead with these bullets</h3>
      <ol className="lead">{t.lead.map(l => <li key={l.text}>{l.text}{l.hits.length > 0 && <small>{l.hits.join(' · ')}</small>}</li>)}</ol>

      <h3>Close the gaps</h3>
      <ul className="sugg">{t.suggestions.map(s => <li key={s.keyword}><b>{s.keyword}</b>{s.advice}</li>)}</ul>
      {!t.suggestions.length && <p className="ok">Your resume already covers this posting's keywords.</p>}

      <h3>Suggested headline</h3>
      <p className="headline">{t.headline}</p>

      <details className="jd"><summary>Job description</summary><p>{job.description}</p></details>
      <button type="button" className="copy" onClick={() => { navigator.clipboard?.writeText(notes); setCopied(true); setTimeout(() => setCopied(false), 1500); }}>{copied ? 'Copied ✓' : 'Copy tailoring notes'}</button>
    </>
  );
}
