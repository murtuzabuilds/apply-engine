// Tailoring: which resume bullets to lead with, which keywords are missing, and where they'd honestly fit.
import { keywords, norm } from './text.js';

export const bullets = resume => resume.split('\n').map(l => l.trim()).filter(l => (/^[-•*]/.test(l) || l.length > 60) && !/^skills\s*:/i.test(l)).map(l => l.replace(/^[-•*]\s*/, ''));

export function tailor(resume, jd, missing) {
  const want = keywords(jd);
  const ranked = bullets(resume).map(b => {
    const t = norm(b); const hits = want.filter(k => t.includes(' ' + k + ' '));
    return { text: b, hits, score: hits.length + (/\d/.test(b) ? 0.5 : 0) };
  }).sort((a, b) => b.score - a.score);
  const suggestions = missing.slice(0, 6).map(k => {
    const near = ranked.find(r => r.hits.length && relatedTo(k, r.text));
    return near ? { keyword: k, advice: `If it's true, name "${k}" in: "${clip(near.text)}"` }
                : { keyword: k, advice: `Not evidenced in your resume. Only add "${k}" if you have real experience with it` };
  });
  return { lead: ranked.slice(0, 3), suggestions, headline: headline(want, ranked) };
}

const FAMILY = [['sql', 'data', 'analytics', 'dashboards', 'pipeline'], ['llm', 'rag', 'agents', 'ai', 'ml', 'evaluation'], ['user research', 'usability', 'ux', 'figma', 'personas'], ['go-to-market', 'pricing', 'strategy', 'roadmap'], ['experimentation', 'a/b testing', 'growth', 'funnel', 'retention']];
function relatedTo(k, text) { const t = text.toLowerCase(); const fam = FAMILY.find(f => f.includes(k)); return fam ? fam.some(w => t.includes(w)) : false; }
const clip = s => (s.length > 90 ? s.slice(0, 87) + '…' : s);
function headline(want, ranked) {
  const top = [...new Set(ranked.flatMap(r => r.hits))].slice(0, 3);
  return top.length ? `Product manager with hands-on ${top.join(', ')}.` : 'Add a one-line summary that names the role\'s top three skills.';
}
