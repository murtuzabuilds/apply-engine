// Keyword extraction tuned for product roles: a skills lexicon (multi-word phrases first) plus frequent terms.
export const LEXICON = [
  'product strategy', 'product roadmap', 'roadmap', 'prd', 'user research', 'usability testing', 'a/b testing', 'experimentation',
  'go-to-market', 'gtm', 'pricing', 'okrs', 'kpis', 'north star metric', 'jtbd', 'rice', 'prioritization', 'stakeholder management',
  'cross-functional', 'agile', 'scrum', 'jira', 'confluence', 'figma', 'prototyping', 'wireframes', 'design systems', 'ux', 'ui',
  'sql', 'python', 'r', 'amplitude', 'mixpanel', 'looker', 'tableau', 'data analysis', 'analytics', 'dashboards', 'etl', 'data pipeline',
  'api', 'apis', 'platform', 'sdk', 'microservices', 'cloud', 'aws', 'gcp', 'azure',
  'machine learning', 'ml', 'llm', 'llms', 'generative ai', 'genai', 'rag', 'retrieval', 'embeddings', 'agents', 'agentic', 'ai agents',
  'tool calling', 'prompt engineering', 'evaluation', 'evals', 'fine-tuning', 'nlp', 'computer vision', 'responsible ai', 'ai governance',
  'growth', 'acquisition', 'activation', 'retention', 'onboarding', 'funnel', 'conversion', 'monetization', 'lifecycle',
  'b2b', 'b2c', 'saas', 'enterprise', 'marketplace', 'fintech', 'healthcare', 'compliance', 'regulatory',
  'market sizing', 'competitive analysis', 'business case', 'financial modeling', 'p&l', 'strategy', 'operations', 'venture', 'due diligence',
  'mba', 'consulting', 'customer discovery', 'user interviews', 'personas', 'journey mapping', 'automation', 'n8n', 'workflow',
];
const STOP = new Set('a an and are as at be by for from has have in into is it its of on or our that the their this to we will with you your who what work working team teams role roles years year experience across about including ability strong plus preferred required help new build building own drive using use using'.split(' '));

export const norm = s => ' ' + String(s).toLowerCase().replace(/[^a-z0-9/&+#.\- ]+/g, ' ').replace(/\s+/g, ' ') + ' ';

export function lexiconHits(text) {
  const t = norm(text), hits = new Set();
  for (const k of LEXICON) if (t.includes(' ' + k + ' ')) hits.add(k);
  // collapse synonyms so one skill counts once
  const SYN = [['llm', 'llms'], ['api', 'apis'], ['ml', 'machine learning'], ['genai', 'generative ai'], ['ai agents', 'agents'], ['evals', 'evaluation'], ['gtm', 'go-to-market'], ['roadmap', 'product roadmap']];
  for (const [a, b] of SYN) if (hits.has(a) && hits.has(b)) hits.delete(a);
  return hits;
}

export function keywords(text, extra = 8) {
  const hits = lexiconHits(text);
  const freq = new Map();
  for (const w of norm(text).trim().split(' ')) if (w.length > 3 && !STOP.has(w) && !/^\d+$/.test(w)) freq.set(w, (freq.get(w) || 0) + 1);
  const common = [...freq].filter(([w, n]) => n >= 2 && ![...hits].some(h => h.includes(w))).sort((a, b) => b[1] - a[1]).slice(0, extra).map(([w]) => w);
  return [...hits, ...common];
}
