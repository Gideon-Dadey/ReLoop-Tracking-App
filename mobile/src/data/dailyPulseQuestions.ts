export type PulseCategory = 'Habits' | 'Motivation' | 'Community' | 'Awareness' | 'Impact';

export interface DailyPulseQuestion {
  id: number;
  category: PulseCategory;
  text: string;
}

export const PULSE_CATEGORY_COLORS: Record<PulseCategory, string> = {
  Habits: '#14B8A6',
  Motivation: '#8B5CF6',
  Community: '#3B82F6',
  Awareness: '#F59E0B',
  Impact: '#10B981',
};

/** Rotating bank — one question surfaced per day (21-day cycle). */
export const DAILY_PULSE_QUESTIONS: DailyPulseQuestion[] = [
  { id: 101, category: 'Habits', text: 'Today I chose reusable packaging when I had the option.' },
  { id: 102, category: 'Motivation', text: 'I feel motivated to reduce waste in my daily routine.' },
  { id: 103, category: 'Community', text: 'I noticed others around me making sustainable choices today.' },
  { id: 104, category: 'Awareness', text: 'I thought about the environmental impact of packaging I used today.' },
  { id: 105, category: 'Impact', text: 'Returning a reusable container felt like a meaningful action today.' },
  { id: 106, category: 'Habits', text: 'I avoided at least one single-use item today.' },
  { id: 107, category: 'Motivation', text: 'Zero-waste content I saw recently influenced my behavior.' },
  { id: 108, category: 'Community', text: 'I feel part of a community working toward less waste.' },
  { id: 109, category: 'Awareness', text: 'I understand how the circular economy reduces landfill waste.' },
  { id: 110, category: 'Impact', text: 'My small actions today contribute to a larger environmental goal.' },
  { id: 111, category: 'Habits', text: 'I remembered to bring or use a reusable container today.' },
  { id: 112, category: 'Motivation', text: 'I am confident I can maintain sustainable habits long-term.' },
  { id: 113, category: 'Community', text: 'I would recommend reusable packaging to someone I know.' },
  { id: 114, category: 'Awareness', text: 'I can identify which materials in my waste are avoidable.' },
  { id: 115, category: 'Impact', text: 'Tracking my returns makes me more mindful of consumption.' },
  { id: 116, category: 'Habits', text: 'I rinsed and prepared a container properly before returning it.' },
  { id: 117, category: 'Motivation', text: 'Earning points for returns keeps me engaged with the program.' },
  { id: 118, category: 'Community', text: 'Seeing community impact stats inspires me to do more.' },
  { id: 119, category: 'Awareness', text: 'I learned something new about sustainability this week.' },
  { id: 120, category: 'Impact', text: 'I believe individual choices add up to systemic change.' },
  { id: 121, category: 'Habits', text: 'I planned ahead to avoid needing disposable packaging today.' },
];

export function formatLocalDateKey(date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function getPulseVersion(date = new Date()): string {
  return `pulse-${formatLocalDateKey(date)}`;
}

export function getQuestionForDate(date = new Date()): DailyPulseQuestion & { dateKey: string } {
  const dateKey = formatLocalDateKey(date);
  const dayIndex = Math.floor(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / 86_400_000,
  ) % DAILY_PULSE_QUESTIONS.length;
  return { ...DAILY_PULSE_QUESTIONS[dayIndex], dateKey };
}
