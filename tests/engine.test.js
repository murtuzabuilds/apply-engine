import { test } from 'node:test';
import assert from 'node:assert/strict';
import { keywords, lexiconHits } from '../src/lib/text.js';
import { classify, TRACKS } from '../src/lib/tracks.js';
import { ats, cityScore, rank } from '../src/lib/score.js';
import { tailor, bullets } from '../src/lib/tailor.js';
import { JOBS } from '../src/data/jobs.js';
import { SAMPLE_RESUME } from '../src/data/sampleResume.js';

test('seven tracks, every sample job lands in one', () => {
  assert.equal(TRACKS.length, 7);
  const seen = new Set(JOBS.map(j => classify(j).track));
  assert.equal(seen.size, 7);
});

test('classifier reads the job, not just the title', () => {
  assert.equal(classify({ title: 'Product Manager', description: 'Own LLM evals, RAG and AI agents.' }).track, 'ai');
  assert.equal(classify({ title: 'Product Manager', description: 'Run experimentation on activation, retention and the funnel.' }).track, 'growth');
});

test('lexicon finds multi-word skills and collapses synonyms', () => {
  const h = lexiconHits('We use LLMs and llm evals, a/b testing, and go-to-market (GTM) plans.');
  assert.ok(h.has('llms') && !h.has('llm')); assert.ok(h.has('a/b testing')); assert.ok(h.has('go-to-market') && !h.has('gtm'));
});

test('ATS splits matched from missing keywords', () => {
  const r = ats('Built SQL dashboards and wrote PRDs', 'Need SQL, dashboards, PRD writing and Tableau');
  assert.ok(r.matched.includes('sql') && r.matched.includes('dashboards'));
  assert.ok(r.missing.includes('tableau'));
  assert.ok(r.score > 0 && r.score < 100);
});

test('city priority follows your order, remote counts', () => {
  const cities = ['Madison', 'Chicago', 'Remote'];
  assert.equal(cityScore({ city: 'Madison, WI' }, cities), 100);
  assert.ok(cityScore({ city: 'Remote (US)', remote: true }, cities) > 0);
  assert.equal(cityScore({ city: 'Austin, TX' }, cities), 0);
});

test('ranking puts the preferred track and city on top', () => {
  const tw = Object.fromEntries(TRACKS.map(t => [t.id, t.id === 'ai' ? 100 : 20]));
  const top = rank(JOBS, { resume: SAMPLE_RESUME, trackWeights: tw, cities: ['Remote', 'Chicago'] })[0];
  assert.equal(top.track, 'ai');
});

test('tailoring leads with the most relevant bullets and never invents experience', () => {
  const jd = JOBS.find(j => j.title === 'AI Product Manager').description;
  const a = ats(SAMPLE_RESUME, jd), t = tailor(SAMPLE_RESUME, jd, a.missing);
  assert.match(t.lead[0].text, /LLM|RAG|evals/i);
  assert.ok(t.suggestions.every(s => /Only add|If it's true/.test(s.advice)));
  assert.equal(bullets(SAMPLE_RESUME).length, 7);
});

test('keywords include frequent terms beyond the lexicon', () => {
  assert.ok(keywords('Kubernetes Kubernetes clusters clusters and SQL').includes('kubernetes'));
});
