// Fit = how well the resume covers the job (ATS) + how much you want the track + how much you want the city.
import { keywords, lexiconHits } from './text.js';
import { classify } from './tracks.js';

export function ats(resume, jd) {
  const want = keywords(jd), have = lexiconHits(resume), resumeText = ' ' + resume.toLowerCase() + ' ';
  const matched = [], missing = [];
  for (const k of want) (have.has(k) || resumeText.includes(' ' + k + ' ') ? matched : missing).push(k);
  const score = want.length ? matched.length / want.length : 0;
  return { score: Math.round(score * 100), matched, missing };
}

// cities: ordered list, most wanted first. Remote is its own entry.
export function cityScore(job, cities) {
  const list = cities.map(c => c.toLowerCase().trim()).filter(Boolean);
  if (!list.length) return 50;
  const loc = `${job.city} ${job.remote ? 'remote' : ''}`.toLowerCase();
  const i = list.findIndex(c => loc.includes(c));
  return i < 0 ? 0 : Math.round(100 * (1 - i / list.length));
}

export function rank(jobs, { resume, trackWeights, cities, weights = { ats: .5, track: .3, city: .2 } }) {
  return jobs.map(job => {
    const { track, scores } = classify(job);
    const a = ats(resume, job.description);
    const t = trackWeights[track] ?? 50, c = cityScore(job, cities);
    const fit = Math.round(a.score * weights.ats + t * weights.track + c * weights.city);
    return { ...job, track, trackScores: scores, ats: a, trackPriority: t, cityPriority: c, fit };
  }).sort((x, y) => y.fit - x.fit);
}
