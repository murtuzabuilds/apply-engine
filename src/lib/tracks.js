// The seven career tracks. Each job is scored against all seven; the best match is its track.
export const TRACKS = [
  { id: 'ai', name: 'AI Product', color: '#3455FA', keys: ['ai', 'ml', 'machine learning', 'llm', 'llms', 'generative', 'genai', 'rag', 'agents', 'agentic', 'model', 'evals', 'nlp'] },
  { id: 'platform', name: 'Technical & Platform', color: '#0E7C86', keys: ['platform', 'api', 'apis', 'sdk', 'infrastructure', 'developer', 'technical', 'microservices', 'cloud', 'integrations'] },
  { id: 'strategy', name: 'Product Strategy & Ops', color: '#7A4DD8', keys: ['strategy', 'operations', 'portfolio', 'planning', 'okrs', 'pricing', 'business case', 'market sizing'] },
  { id: 'growth', name: 'Growth', color: '#E0561B', keys: ['growth', 'acquisition', 'activation', 'retention', 'funnel', 'conversion', 'experimentation', 'monetization', 'lifecycle'] },
  { id: 'data', name: 'Data & Analytics', color: '#1F8A4C', keys: ['data', 'analytics', 'sql', 'dashboards', 'insights', 'metrics', 'etl', 'pipeline', 'looker', 'tableau'] },
  { id: 'design', name: 'Design-led / UX', color: '#C2378F', keys: ['ux', 'user research', 'design', 'figma', 'usability', 'prototyping', 'journey', 'personas', 'accessibility'] },
  { id: 'venture', name: 'Venture & BizOps', color: '#8A6A12', keys: ['venture', 'bizops', 'business operations', 'due diligence', 'startup', 'founder', 'investment', 'partnerships', 'corporate development'] },
];

export function classify(job) {
  const t = ' ' + `${job.title} ${job.title} ${job.description}`.toLowerCase() + ' ';
  const scores = TRACKS.map(tr => ({ id: tr.id, score: tr.keys.reduce((a, k) => a + (t.split(k).length - 1) * (k.includes(' ') ? 2 : 1), 0) }));
  scores.sort((a, b) => b.score - a.score);
  return { track: scores[0].score ? scores[0].id : 'strategy', scores };
}
export const trackById = id => TRACKS.find(t => t.id === id);
