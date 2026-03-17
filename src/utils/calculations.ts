import { BP_TABLE } from './constants';

export const calculateAge = (dob: string, examDate: string) => {
  if (!dob || !examDate || dob.length !== 10 || examDate.length !== 10) return { years: '', months: '' };
  const [d1, m1, y1] = dob.split('-').map(Number);
  const [d2, m2, y2] = examDate.split('-').map(Number);
  if (!y1 || !m1 || !d1 || !y2 || !m2 || !d2) return { years: '', months: '' };

  const date1 = new Date(y1, m1 - 1, d1);
  const date2 = new Date(y2, m2 - 1, d2);
  if (date2 < date1) return { years: '', months: '' };

  let years = y2 - y1;
  let months = m2 - m1;
  if (months < 0 || (months === 0 && d2 < d1)) {
    years--;
    months += 12;
  }
  if (d2 < d1) {
    months--;
    if (months < 0) {
      months += 12;
      years--;
    }
  }
  return { years, months };
};

export const calculateBMI = (weight: string | number, height: string | number) => {
  const w = Number(weight);
  const h = Number(height);
  if (!w || !h) return '';
  const heightM = h / 100;
  return (w / (heightM * heightM)).toFixed(2);
};

export const calculateHomaIR = (fi: string | number, fg: string | number, unit: 'mmol/L' | 'mg/dL') => {
  const i = Number(fi);
  const g = Number(fg);
  if (!i || !g) return '';
  if (unit === 'mmol/L') {
    return ((i * g) / 22.5).toFixed(2);
  } else {
    return ((i * g) / 405).toFixed(2);
  }
};

export const calculateQuicki = (fi: string | number, fg: string | number, unit: 'mmol/L' | 'mg/dL') => {
  const i = Number(fi);
  const g = Number(fg);
  if (!i || !g) return '';
  const fgMg = unit === 'mmol/L' ? g * 18 : g;
  return (1 / (Math.log10(i) + Math.log10(fgMg))).toFixed(3);
};

export const calculateFgir = (fi: string | number, fg: string | number, unit: 'mmol/L' | 'mg/dL') => {
  const i = Number(fi);
  const g = Number(fg);
  if (!i || !g) return '';
  const fgMg = unit === 'mmol/L' ? g * 18 : g;
  return (fgMg / i).toFixed(2);
};

export const calculateWHtR = (waist: string | number, height: string | number) => {
  const w = Number(waist);
  const h = Number(height);
  if (!w || !h) return '';
  return (w / h).toFixed(2);
};

export const convertHbA1c = (val: string | number, fromUnit: '%' | 'mmol/mol') => {
  const v = Number(val);
  if (!v) return '';
  if (fromUnit === '%') {
    return ((v - 2.15) * 10.929).toFixed(1); // to IFCC
  } else {
    return ((0.09148 * v) + 2.15).toFixed(1); // to NGSP
  }
};

export const calculateTgHdl = (tg: string | number, hdl: string | number, unit: 'mmol/L' | 'mg/dL') => {
  const t = Number(tg);
  const h = Number(hdl);
  if (!t || !h) return '';
  if (unit === 'mg/dL') {
    return (t / h).toFixed(2);
  } else {
    return ((t * 88.5) / (h * 38.67)).toFixed(2);
  }
};

export const calculateNonHdl = (tc: string | number, hdl: string | number) => {
  const t = Number(tc);
  const h = Number(hdl);
  if (!t || !h) return null;
  return Number((t - h).toFixed(2));
};

export const evaluateNonHdl = (value: number | null, unit: string) => {
  if (value === null) return null;
  
  if (unit === 'mg/dL') {
    if (value < 120) return { status: 'nonHdlAcceptable', color: 'text-green-600' };
    if (value < 145) return { status: 'nonHdlBorderline', color: 'text-yellow-600' };
    return { status: 'nonHdlHigh', color: 'text-red-600' };
  } else {
    // mmol/L
    if (value < 3.1) return { status: 'nonHdlAcceptable', color: 'text-green-600' };
    if (value < 3.8) return { status: 'nonHdlBorderline', color: 'text-yellow-600' };
    return { status: 'nonHdlHigh', color: 'text-red-600' };
  }
};

export const evaluateBP = (sbp: string | number, dbp: string | number, ageYears: string | number, gender: 'male' | 'female') => {
  const s = Number(sbp);
  const d = Number(dbp);
  const age = Number(ageYears);
  if (!s || !d || !ageYears) return null;
  
  if (age >= 13) {
    if (s >= 140 || d >= 90) return { status: 'bpStage2', color: 'text-red-600' };
    if ((s >= 130 && s <= 139) || (d >= 80 && d <= 89)) return { status: 'bpStage1', color: 'text-orange-600' };
    if (s >= 120 && s <= 129 && d < 80) return { status: 'bpElevated', color: 'text-yellow-600' };
    return { status: 'normal', color: 'text-green-600' };
  }

  const table = BP_TABLE[gender];
  const ageKey = age < 1 ? 1 : age > 12 ? 12 : age;
  const cutoffs = table[ageKey as keyof typeof table];

  if (s >= cutoffs.sbp || d >= cutoffs.dbp) {
    return { status: 'cardioConsult', color: 'text-red-600' };
  }
  return { status: 'normal', color: 'text-green-600' };
};
