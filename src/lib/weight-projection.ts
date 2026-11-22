/**
 * Educational, energy-balance weight forecast. This is not a clinical model.
 * Calculations are always done in SI units, regardless of display settings.
 */
export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active' | 'very-active';
export type CalorieMode = 'fixed' | 'weekly' | 'daily';
export type SexForEquation = 'male' | 'female';

export const ACTIVITY_MULTIPLIERS: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  'very-active': 1.9,
};

export interface ProjectionSettings {
  heightCm: number;
  initialWeightKg: number;
  age: number;
  sex: SexForEquation;
  activity: ActivityLevel;
  startDate: string; // YYYY-MM-DD; calendar-day arithmetic is UTC-based
  endDate: string;
  dailyCalories: number;
  mode: CalorieMode;
  weeklyCalories?: Record<number, number>;
  perDayCalories?: Record<string, number>;
  customBmr?: number | null;
}

export interface ProjectionPoint {
  date: string;
  day: number;
  weightKg: number;
  bmr: number;
  tdee: number;
  bmi: number;
  calories: number | null;
  balance: number;
}

const DAY_MS = 86_400_000;
const KCAL_PER_KG = 7_700;
const asDate = (iso: string): number => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return NaN;
  const time = Date.parse(iso + 'T00:00:00Z');
  return Number.isFinite(time) && new Date(time).toISOString().slice(0, 10) === iso ? time : NaN;
};

export const addDays = (iso: string, count: number): string =>
  new Date(asDate(iso) + count * DAY_MS).toISOString().slice(0, 10);

export const daysBetween = (start: string, end: string): number =>
  Math.round((asDate(end) - asDate(start)) / DAY_MS);

export const toKg = (lbs: number): number => lbs / 2.2046226218;
export const toLb = (kg: number): number => kg * 2.2046226218;
export const toCm = (inches: number): number => inches * 2.54;
export const toInches = (cm: number): number => cm / 2.54;

export const calculateBmr = (weightKg: number, heightCm: number, age: number, sex: SexForEquation) =>
  10 * weightKg + 6.25 * heightCm - 5 * age + (sex === 'male' ? 5 : -161);

export const calculateBmi = (weightKg: number, heightCm: number) =>
  weightKg / Math.pow(heightCm / 100, 2);

export function validateProjection(settings: ProjectionSettings): string | null {
  const days = daysBetween(settings.startDate, settings.endDate);
  if (!Number.isFinite(days) || days < 1 || days > 365) return 'Choose a target date 1 to 365 days after the start date.';
  if (!(settings.heightCm >= 100 && settings.heightCm <= 250)) return 'Enter a height between 100 and 250 cm.';
  if (!(settings.initialWeightKg >= 20 && settings.initialWeightKg <= 450)) return 'Enter a starting weight between 20 and 450 kg.';
  if (!(settings.age >= 18 && settings.age <= 110)) return 'This adult projection requires an age between 18 and 110.';
  if (!(settings.dailyCalories >= 0 && settings.dailyCalories <= 10000)) return 'Enter a daily intake between 0 and 10,000 kcal.';
  if (settings.customBmr != null && !(settings.customBmr >= 300 && settings.customBmr <= 7000)) return 'Enter a custom BMR between 300 and 7,000 kcal.';
  const overrides = [
    ...Object.values(settings.weeklyCalories || {}),
    ...Object.values(settings.perDayCalories || {}),
  ];
  if (overrides.some(c => !Number.isFinite(c) || c < 0 || c > 10000)) return 'Custom calorie entries must be between 0 and 10,000 kcal.';
  return null;
}

export function projectWeight(settings: ProjectionSettings): ProjectionPoint[] {
  if (validateProjection(settings)) return [];
  const days = daysBetween(settings.startDate, settings.endDate);
  let weight = settings.initialWeightKg;
  const initialBmr = settings.customBmr ?? calculateBmr(weight, settings.heightCm, settings.age, settings.sex);
  const bmrFor = (kg: number) => Math.max(1, initialBmr + 10 * (kg - settings.initialWeightKg));
  const firstBmr = bmrFor(weight);
  const points: ProjectionPoint[] = [{
    day: 0, date: settings.startDate, weightKg: weight, bmr: firstBmr,
    tdee: firstBmr * ACTIVITY_MULTIPLIERS[settings.activity],
    bmi: calculateBmi(weight, settings.heightCm), calories: null, balance: 0,
  }];

  for (let day = 1; day <= days; day++) {
    const intakeDate = addDays(settings.startDate, day - 1);
    const weekly = settings.weeklyCalories?.[Math.floor((day - 1) / 7)];
    const perDay = settings.perDayCalories?.[intakeDate];
    const calories = settings.mode === 'weekly'
      ? weekly ?? settings.dailyCalories
      : settings.mode === 'daily' ? perDay ?? settings.dailyCalories : settings.dailyCalories;
    const bmr = bmrFor(weight);
    const tdee = bmr * ACTIVITY_MULTIPLIERS[settings.activity];
    const balance = calories - tdee;
    // A lower bound prevents nonphysical negative weights in extreme scenarios.
    weight = Math.max(20, weight + balance / KCAL_PER_KG);
    points.push({
      day, date: addDays(settings.startDate, day), weightKg: weight,
      bmr: bmrFor(weight), tdee, bmi: calculateBmi(weight, settings.heightCm),
      calories, balance,
    });
  }
  return points;
}
