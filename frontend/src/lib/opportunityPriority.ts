import type { Opportunity } from '../graphql/opportunities';

export function localOpportunityDate(now = new Date()): string {
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

export const tractionLabels = {
  'next-step-agreed': 'Next step agreed',
  'interest-expressed': 'Interest expressed',
  exploring: 'Exploring',
};

export function todaysOpportunities(opportunities: Opportunity[], today: string): Opportunity[] {
  const traction = { 'next-step-agreed': 0, 'interest-expressed': 1, exploring: 2 };
  return opportunities.filter((item) => item.status === 'open' && item.nextAction.trim() && (!item.followUpOn || item.followUpOn <= today))
    .sort((a, b) => Number(!a.followUpOn) - Number(!b.followUpOn)
      || traction[a.traction] - traction[b.traction]
      || (a.followUpOn || '').localeCompare(b.followUpOn || '')
      || a.createdAt.localeCompare(b.createdAt)
      || a.id.localeCompare(b.id))
    .slice(0, 3);
}

export function opportunityReason(item: Opportunity, today: string): string {
  let timing = 'No date set';
  if (item.followUpOn === today) timing = 'Due today';
  else if (item.followUpOn && item.followUpOn < today) {
    const days = Math.round((Date.parse(`${today}T00:00:00Z`) - Date.parse(`${item.followUpOn}T00:00:00Z`)) / 86400000);
    timing = `Overdue by ${days} ${days === 1 ? 'day' : 'days'}`;
  }
  return `${timing} · ${tractionLabels[item.traction]}`;
}
