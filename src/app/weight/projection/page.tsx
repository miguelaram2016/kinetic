'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import {
  addDays, daysBetween, projectWeight, validateProjection, toCm, toInches, toKg, toLb,
  ACTIVITY_MULTIPLIERS,
  type ActivityLevel, type CalorieMode, type ProjectionSettings, type SexForEquation,
} from '@/lib/weight-projection';

type Unit = 'imperial' | 'metric';
type View = 'graph' | 'table';

const field = 'mt-1 w-full rounded-xl border border-dark-600 bg-dark-700 px-3 py-2.5 text-white outline-none focus:border-primary focus:ring-1 focus:ring-primary';
const label = 'block text-sm font-medium text-gray-300';
const dateLabel = (iso: string) =>
  new Date(iso + 'T12:00:00Z').toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' });
const format = (value: number, decimals = 0) => value.toLocaleString('en-US', { maximumFractionDigits: decimals });
const round = (value: number, places = 1) => Number(value.toFixed(places));

function bmiLabel(bmi: number): string {
  if (bmi < 18.5) return 'Underweight';
  if (bmi < 25) return 'Healthy range';
  if (bmi < 30) return 'Overweight';
  return 'Obesity range';
}

function MetricCard({ name, value, detail }: { name: string; value: string; detail: string }) {
  return (
    <div className="rounded-2xl border border-dark-700 bg-dark-800 p-4 sm:p-5">
      <p className="text-sm text-gray-400">{name}</p>
      <p className="mt-2 text-2xl font-bold text-white sm:text-3xl">{value}</p>
      <p className="mt-1 text-xs text-gray-400">{detail}</p>
    </div>
  );
}

export default function WeightProjectionPage() {
  const today = new Date().toISOString().slice(0, 10);
  const [unit, setUnit] = useState<Unit>('imperial');
  const [heightCm, setHeightCm] = useState(180);
  const [weightKg, setWeightKg] = useState(90);
  const [age, setAge] = useState(30);
  const [sex, setSex] = useState<SexForEquation>('male');
  const [activity, setActivity] = useState<ActivityLevel>('moderate');
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(addDays(today, 90));
  const [calories, setCalories] = useState(2000);
  const [useCustomBmr, setUseCustomBmr] = useState(false);
  const [customBmr, setCustomBmr] = useState(1800);
  const [mode, setMode] = useState<CalorieMode>('fixed');
  const [weeklyCalories, setWeeklyCalories] = useState<Record<number, number>>({});
  const [perDayCalories, setPerDayCalories] = useState<Record<string, number>>({});
  const [view, setView] = useState<View>('graph');

  const settings: ProjectionSettings = {
    heightCm, initialWeightKg: weightKg, age, sex, activity,
    startDate, endDate, dailyCalories: calories, mode,
    customBmr: useCustomBmr ? customBmr : null, weeklyCalories, perDayCalories,
  };
  const error = validateProjection(settings);
  const points = error ? [] : projectWeight(settings);
  const start = points[0];
  const last = points[points.length - 1];
  const days = daysBetween(startDate, endDate);
  const displayWeight = (kg: number) => unit === 'metric' ? kg : toLb(kg);
  const weightUnit = unit === 'metric' ? 'kg' : 'lb';
  const inches = toInches(heightCm);
  const feetPart = Math.floor(inches / 12);
  const inchesPart = round(inches - feetPart * 12, 1);
  const delta = start && last ? displayWeight(last.weightKg - start.weightKg) : 0;

  const setOverride = (value: string, key: number | string, scope: 'weekly' | 'daily') => {
    const setter = scope === 'weekly' ? setWeeklyCalories : setPerDayCalories;
    // Keep blank overrides as fallback to the common daily calorie target.
    if (scope === 'weekly') {
      setWeeklyCalories(previous => {
        const updated = { ...previous };
        if (value === '') delete updated[key as number];
        else updated[key as number] = Number(value);
        return updated;
      });
    } else {
      setPerDayCalories(previous => {
        const updated = { ...previous };
        if (value === '') delete updated[key as string];
        else updated[key as string] = Number(value);
        return updated;
      });
    }
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6 pb-10">
      <div>
        <Link href="/weight" className="text-sm text-primary hover:underline">← Weight tracking</Link>
        <div className="mt-3 flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-primary">Weight projection</p>
            <h1 className="mt-2 text-3xl font-bold text-white sm:text-4xl">Where will your weight be?</h1>
            <p className="mt-2 max-w-2xl text-gray-400">
              Forecast weight from your calorie plan, activity, and timeline. Explore different scenarios before changing your routine.
            </p>
          </div>
          <div className="inline-flex rounded-xl border border-dark-600 bg-dark-800 p-1" aria-label="Units">
            {(['imperial', 'metric'] as const).map(option => (
              <button key={option} type="button" onClick={() => setUnit(option)}
                aria-pressed={unit === option}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${unit === option ? 'bg-primary text-white' : 'text-gray-400 hover:text-white'}`}>
                {option === 'imperial' ? 'Imperial (lb / ft)' : 'Metric (kg / cm)'}
              </button>
            ))}
          </div>
        </div>
      </div>

      <section className="rounded-2xl border border-dark-700 bg-dark-800 p-4 sm:p-6">
        <h2 className="mb-5 text-lg font-semibold text-white">Your starting point</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <label className={label}>Height ({unit === 'metric' ? 'cm' : 'ft / in'})</label>
            {unit === 'metric' ? (
              <input className={field} type="number" min="100" max="250" step="0.1"
                value={round(heightCm)} onChange={e => setHeightCm(Number(e.target.value))} />
            ) : (
              <div className="flex gap-2">
                <input className={field} aria-label="Feet" type="number" min="0" max="8"
                  value={feetPart} onChange={e => setHeightCm(toCm(Number(e.target.value) * 12 + inchesPart))} />
                <input className={field} aria-label="Inches" type="number" min="0" max="11.9" step="0.1"
                  value={inchesPart} onChange={e => setHeightCm(toCm(feetPart * 12 + Number(e.target.value)))} />
              </div>
            )}
          </div>
          <div>
            <label className={label} htmlFor="start-weight">Weight ({weightUnit})</label>
            <input id="start-weight" className={field} type="number" min="1" step="0.1"
              value={round(displayWeight(weightKg))} onChange={e => setWeightKg(unit === 'metric' ? Number(e.target.value) : toKg(Number(e.target.value)))} />
          </div>
          <div>
            <label className={label} htmlFor="age">Age</label>
            <input id="age" className={field} type="number" min="18" max="110"
              value={age} onChange={e => setAge(Number(e.target.value))} />
          </div>
          <div>
            <label className={label} htmlFor="sex">Sex used for BMR equation</label>
            <select id="sex" className={field} value={sex} onChange={e => setSex(e.target.value as SexForEquation)}>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className={label} htmlFor="activity">Activity level</label>
            <select id="activity" className={field} value={activity} onChange={e => setActivity(e.target.value as ActivityLevel)}>
              <option value="sedentary">Sedentary (×1.2)</option>
              <option value="light">Lightly active (×1.375)</option>
              <option value="moderate">Moderately active (×1.55)</option>
              <option value="active">Very active (×1.725)</option>
              <option value="very-active">Extremely active (×1.9)</option>
            </select>
          </div>
          <div>
            <label className={label} htmlFor="start-date">Start date</label>
            <input id="start-date" className={field} type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
          </div>
          <div>
            <label className={label} htmlFor="end-date">Target date</label>
            <input id="end-date" className={field} type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
          </div>
        </div>
        <label className="mt-5 flex cursor-pointer items-center gap-3 text-sm text-gray-300">
          <input type="checkbox" checked={useCustomBmr} onChange={e => setUseCustomBmr(e.target.checked)}
            className="h-4 w-4 accent-indigo-500" />
          Use my own BMR instead of the Mifflin–St Jeor estimate
        </label>
        {useCustomBmr && (
          <div className="mt-3 max-w-xs">
            <label htmlFor="custom-bmr" className={label}>Custom BMR (kcal/day)</label>
            <input id="custom-bmr" className={field} type="number" min="300" max="7000"
              value={customBmr} onChange={e => setCustomBmr(Number(e.target.value))} />
          </div>
        )}
      </section>

      <section className="rounded-2xl border border-dark-700 bg-dark-800 p-4 sm:p-6">
        <h2 className="text-lg font-semibold text-white">Daily calories</h2>
        <p className="mt-1 text-sm text-gray-400">Use a fixed intake, or override the calories for specific weeks or days.</p>
        <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label="Calorie scheduling">
          {([
            ['fixed', 'Same every day'], ['weekly', 'Custom by week'], ['daily', 'Custom by day'],
          ] as [CalorieMode, string][]).map(([key, title]) => (
            <button key={key} type="button" aria-pressed={mode === key} onClick={() => setMode(key)}
              className={`rounded-xl border px-3 py-2 text-sm font-medium transition-colors ${mode === key ? 'border-primary bg-primary/20 text-white' : 'border-dark-600 text-gray-400 hover:text-white'}`}>
              {title}
            </button>
          ))}
        </div>
        <div className="mt-4 max-w-xs">
          <label htmlFor="default-calories" className={label}>Default daily calories (kcal)</label>
          <input id="default-calories" className={field} type="number" min="0" max="10000" step="1"
            value={calories} onChange={e => setCalories(Number(e.target.value))} />
        </div>
        {mode === 'fixed' && <p className="mt-2 text-sm text-gray-500">Applied to every projected day.</p>}
        {mode === 'weekly' && Number.isFinite(days) && days >= 1 && days <= 365 && (
          <div className="mt-5 grid max-h-80 grid-cols-1 gap-3 overflow-y-auto pr-1 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: Math.ceil(days / 7) }, (_, i) => (
              <label key={i} className="rounded-xl border border-dark-700 bg-dark-900/60 p-3 text-sm text-gray-300">
                Week {i + 1} · {dateLabel(addDays(startDate, i * 7))}
                <input className={field} aria-label={`Calories for week ${i + 1}`} type="number" min="0" max="10000"
                  placeholder={String(calories)} value={weeklyCalories[i] ?? ''}
                  onChange={e => setOverride(e.target.value, i, 'weekly')} />
              </label>
            ))}
          </div>
        )}
        {mode === 'daily' && Number.isFinite(days) && days >= 1 && days <= 365 && (
          <div className="mt-5 max-h-80 space-y-2 overflow-y-auto pr-1">
            {Array.from({ length: days }, (_, i) => {
              const date = addDays(startDate, i);
              return (
                <label key={date} className="flex items-center justify-between gap-4 rounded-xl border border-dark-700 bg-dark-900/60 px-3 py-2 text-sm text-gray-300">
                  <span>{dateLabel(date)} <span className="text-gray-500">(day {i + 1})</span></span>
                  <input className="w-32 rounded-lg border border-dark-600 bg-dark-700 px-3 py-2 text-right text-white outline-none focus:border-primary"
                    aria-label={`Calories for ${date}`} type="number" min="0" max="10000"
                    placeholder={String(calories)} value={perDayCalories[date] ?? ''}
                    onChange={e => setOverride(e.target.value, date, 'daily')} />
                </label>
              );
            })}
          </div>
        )}
        {mode !== 'fixed' && <p className="mt-3 text-xs text-gray-500">Leave a week or day blank to use the default intake above.</p>}
      </section>

      {error ? (
        <div role="alert" className="rounded-2xl border border-red-800 bg-red-950/30 p-5 text-red-200">{error}</div>
      ) : start && last && (
        <>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <MetricCard name="Starting BMR" value={`${format(start.bmr)} kcal`} detail="Estimated calories at rest" />
            <MetricCard name="Starting TDEE" value={`${format(start.tdee)} kcal`} detail={`Maintenance · activity ×${ACTIVITY_MULTIPLIERS[activity]}`} />
            <MetricCard name="Day-one balance" value={`${format(Math.abs(points[1].balance))} kcal`}
              detail={points[1].balance < 0 ? 'Estimated deficit' : points[1].balance > 0 ? 'Estimated surplus' : 'Estimated maintenance'} />
            <MetricCard name="Starting BMI" value={format(start.bmi, 1)} detail={bmiLabel(start.bmi)} />
          </div>

          <section className="rounded-2xl border border-primary/30 bg-dark-800 p-5 sm:p-6">
            <p className="text-sm text-gray-400">Projected weight by {dateLabel(endDate)}</p>
            <div className="mt-2 flex flex-wrap items-baseline gap-x-4 gap-y-2">
              <span className="text-4xl font-bold text-white sm:text-5xl">{format(displayWeight(last.weightKg), 1)} {weightUnit}</span>
              <span className={`text-xl font-semibold ${delta < 0 ? 'text-green-400' : delta > 0 ? 'text-orange-400' : 'text-gray-300'}`}>
                {delta > 0 ? '+' : ''}{format(delta, 1)} {weightUnit}
              </span>
            </div>
            <p className="mt-2 text-sm text-gray-400">Over {days} days · projected BMI {format(last.bmi, 1)} ({bmiLabel(last.bmi)})</p>
          </section>

          <section className="rounded-2xl border border-dark-700 bg-dark-800 p-4 sm:p-6">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-lg font-semibold text-white">Day-by-day projection</h2>
              <div className="flex rounded-xl border border-dark-600 bg-dark-900 p-1">
                {(['graph', 'table'] as const).map(option => (
                  <button key={option} type="button" aria-pressed={view === option} onClick={() => setView(option)}
                    className={`rounded-lg px-4 py-2 text-sm font-medium ${view === option ? 'bg-primary text-white' : 'text-gray-400 hover:text-white'}`}>
                    {option === 'graph' ? 'Graph' : 'Table'}
                  </button>
                ))}
              </div>
            </div>
            {view === 'graph' ? (
              <div className="h-72 w-full sm:h-80" role="img" aria-label="Line chart of forecast weight by date">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={points} margin={{ top: 10, right: 12, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="date" tickFormatter={dateLabel} minTickGap={32} stroke="#9CA3AF" fontSize={12} />
                    <YAxis domain={['dataMin - 2', 'dataMax + 2']}
                      tickFormatter={value => format(displayWeight(Number(value)), 1)}
                      stroke="#9CA3AF" fontSize={12} width={60} />
                    <Tooltip labelFormatter={value => dateLabel(String(value))}
                      formatter={value => [`${format(displayWeight(Number(value)), 1)} ${weightUnit}`, 'Projected weight']}
                      contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: 12 }} />
                    <Line type="monotone" dataKey="weightKg" name="Projected weight"
                      stroke="#818cf8" strokeWidth={3} dot={false} activeDot={{ r: 5 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="max-h-[480px] overflow-auto rounded-xl border border-dark-700">
                <table className="w-full min-w-[650px] text-left text-sm">
                  <thead className="sticky top-0 bg-dark-700 text-gray-200">
                    <tr>
                      <th className="px-4 py-3">Date</th><th className="px-4 py-3">Projected weight</th>
                      <th className="px-4 py-3">Calories</th><th className="px-4 py-3">TDEE</th>
                      <th className="px-4 py-3">BMI</th>
                    </tr>
                  </thead>
                  <tbody>
                    {points.map(point => (
                      <tr key={point.date} className="border-t border-dark-700 text-gray-300">
                        <td className="px-4 py-2">{dateLabel(point.date)}</td>
                        <td className="px-4 py-2 font-medium text-white">{format(displayWeight(point.weightKg), 1)} {weightUnit}</td>
                        <td className="px-4 py-2">{point.calories == null ? 'Starting point' : format(point.calories)}</td>
                        <td className="px-4 py-2">{format(point.tdee)}</td>
                        <td className="px-4 py-2">{format(point.bmi, 1)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </>
      )}

      <p className="max-w-4xl text-xs leading-relaxed text-gray-500">
        Educational estimate only. BMR is calculated with the Mifflin–St Jeor adult equation unless overridden;
        TDEE uses an activity multiplier. Each day adjusts expected weight using approximately 7,700 kcal per kg,
        with BMR changing as estimated weight changes. This simple model does not capture metabolic adaptation,
        body composition, water changes, medications, or actual adherence. BMI is a screening measure, not a diagnosis.
        Do not use this projection as a medically prescribed calorie target.
      </p>
    </div>
  );
}
