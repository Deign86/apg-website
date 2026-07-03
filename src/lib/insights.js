// AI Insights Engine — deterministic heuristic, no external API required.
// If VITE_INSIGHTS_API_URL is set, routes to that endpoint as an LLM seam.

const BUYING_SIGNALS = ['budget','urgent','invest','cash','loan','schedule','viewing','down payment','ready','now','available'];

export function scoreLead(inquiry) {
  let score = 10;
  if (inquiry.phone) score += 20;
  if ((inquiry.message || '').split(/\s+/).length > 40) score += 15;
  if (inquiry.property_id) score += 20;
  const text = `${inquiry.subject || ''} ${inquiry.message || ''}`.toLowerCase();
  const hits = BUYING_SIGNALS.filter(s => text.includes(s)).length;
  score += Math.min(hits * 10, 30);
  if (inquiry.source && inquiry.source !== 'contact_form' && inquiry.source !== 'chatbot') score += 10;
  if (inquiry.lead_score) score += inquiry.lead_score;
  return Math.min(Math.max(score, 0), 100);
}

export function listingStaleness(property) {
  if (!property.updated_at) return { days: Infinity, stale: false };
  const days = (Date.now() - new Date(property.updated_at).getTime()) / 86400000;
  return { days: Math.round(days), stale: days > 60 };
}

export function generateDashboardInsights({ properties, inquiries }) {
  const insights = [];
  const now = Date.now();
  // Stale listings
  const stale = (properties || []).filter(p => {
    if (!p.updated_at) return false;
    return (now - new Date(p.updated_at).getTime()) / 86400000 > 60;
  });
  if (stale.length > 0) insights.push({ id:'stale', severity:'warn', icon:'fa-clock', title:`${stale.length} stale listing${stale.length > 1 ? 's' : ''}`, body:`${stale.length} listing${stale.length > 1 ? 's haven\'t' : ' hasn\'t'} been updated in 60+ days. Consider repricing or featuring.` });
  // Uncontacted leads
  const old = (inquiries || []).filter(l => l.status === 'new' && (now - new Date(l.created_at).getTime()) / 86400000 > 3);
  if (old.length > 0) insights.push({ id:'uncontacted', severity:'warn', icon:'fa-message', title:`${old.length} uncontacted lead${old.length > 1 ? 's' : ''}`, body:`${old.length} lead${old.length > 1 ? 's are' : ' is'} still 'new' after 3+ days. Follow up soon.` });
  // Pipeline value
  const pipeline = (inquiries || []).filter(l => l.status === 'qualified' || l.status === 'contacted' || l.status === 'new');
  if (pipeline.length > 0) insights.push({ id:'pipeline', severity:'good', icon:'fa-arrow-trend-up', title:`${pipeline.length} leads in pipeline`, body:`You have ${pipeline.length} active lead${pipeline.length > 1 ? 's' : ''}. Keep moving them through your sales process.` });
  // Win rate
  const won = (inquiries || []).filter(l => l.status === 'won').length;
  const lost = (inquiries || []).filter(l => l.status === 'lost').length;
  if (won + lost > 0) insights.push({ id:'winrate', severity:'good', icon:'fa-trophy', title:`Win rate: ${(won / (won + lost) * 100).toFixed(0)}%`, body:`${won} won, ${lost} lost ${won + lost > 0 ? `(${(won + lost)} total closed)` : ''}` });
  // Top lead
  const scored = (inquiries || []).map(l => ({ ...l, _score: scoreLead(l) })).sort((a, b) => b._score - a._score);
  const top = scored[0];
  if (top && top._score > 50) insights.push({ id:'toplead', severity:'info', icon:'fa-fire', title:`Hot lead: ${top.name} (${top._score})`, body:`${top.name} scored ${top._score} — ${top.message ? top.message.substring(0, 80) : ''}` });
  return insights;
}

export async function getInsights(state) {
  if (typeof import.meta !== 'undefined' && import.meta.env?.VITE_INSIGHTS_API_URL) {
    try {
      const res = await fetch(import.meta.env.VITE_INSIGHTS_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(state),
      });
      return await res.json();
    } catch { /* fallthrough to heuristics */ }
  }
  return { insights: generateDashboardInsights(state), scored: (state.inquiries || []).map(l => ({ ...l, _score: scoreLead(l) })) };
}
