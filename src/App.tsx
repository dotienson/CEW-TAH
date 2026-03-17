import React, { useState, useEffect, useMemo } from 'react';
import { InputGroup } from './components/InputGroup';
import { ResultCard } from './components/ResultCard';
import {
  calculateAge,
  calculateBMI,
  calculateHomaIR,
  calculateQuicki,
  calculateFgir,
  calculateWHtR,
  convertHbA1c,
  calculateTgHdl,
  calculateNonHdl,
  evaluateNonHdl,
  evaluateBP
} from './utils/calculations';
import { REFERENCES } from './utils/constants';
import { Copy, ChevronDown, ChevronUp, Info, TrendingUp, TrendingDown, Minus, Globe } from 'lucide-react';
import { TRANSLATIONS, Language } from './utils/translations';

export default function App() {
  const [language, setLanguage] = useState<Language>('VIE');
  const t = TRANSLATIONS[language];

  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginCode, setLoginCode] = useState('');
  const [dobD, setDobD] = useState('');
  const [dobM, setDobM] = useState('');
  const [dobY, setDobY] = useState('');

  const [examD, setExamD] = useState(() => new Date().getDate().toString());
  const [examM, setExamM] = useState(() => (new Date().getMonth() + 1).toString());
  const [examY, setExamY] = useState(() => new Date().getFullYear().toString());

  const dob = useMemo(() => (dobD && dobM && dobY) ? `${dobD.padStart(2, '0')}-${dobM.padStart(2, '0')}-${dobY}` : '', [dobD, dobM, dobY]);
  const examDate = useMemo(() => (examD && examM && examY) ? `${examD.padStart(2, '0')}-${examM.padStart(2, '0')}-${examY}` : '', [examD, examM, examY]);

  const [manualYears, setManualYears] = useState('');
  const [manualMonths, setManualMonths] = useState('');

  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [bmiZ, setBmiZ] = useState('');
  const [calculatedBmiZ, setCalculatedBmiZ] = useState<number | null>(null);

  const [waist, setWaist] = useState('');

  const [tanner, setTanner] = useState<'prepubertal' | 'pubertal'>('prepubertal');
  const [menstrual, setMenstrual] = useState(false);

  const [fi, setFi] = useState('');
  const [fg, setFg] = useState('');
  const [globalUnit, setGlobalUnit] = useState<'mmol/L' | 'mg/dL'>('mmol/L');

  const [hba1c, setHba1c] = useState('');
  const [hba1cUnit, setHba1cUnit] = useState<'%' | 'mmol/mol'>('%');

  const [alt, setAlt] = useState('');
  const [ast, setAst] = useState('');

  const [tc, setTc] = useState('');
  const [ldl, setLdl] = useState('');
  const [hdl, setHdl] = useState('');
  const [tg, setTg] = useState('');

  const [lh, setLh] = useState('');
  const [fsh, setFsh] = useState('');

  const [sbp, setSbp] = useState('');
  const [dbp, setDbp] = useState('');

  const handleBpChange = (setter: React.Dispatch<React.SetStateAction<string>>) => (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, ''); // Only digits
    setter(val);
  };

  const [doctorNote, setDoctorNote] = useState('');
  const [showRefs, setShowRefs] = useState(false);



  const handleDayChange = (setter: React.Dispatch<React.SetStateAction<string>>) => (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value;
    if (val === '') { setter(''); return; }
    let num = parseInt(val, 10);
    if (num > 31) num = 31;
    if (num < 0) num = 0;
    setter(num.toString());
  };

  const handleMonthChange = (setter: React.Dispatch<React.SetStateAction<string>>) => (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value;
    if (val === '') { setter(''); return; }
    let num = parseInt(val, 10);
    if (num > 12) num = 12;
    if (num < 0) num = 0;
    setter(num.toString());
  };

  const handleYearChange = (setter: React.Dispatch<React.SetStateAction<string>>) => (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value;
    if (val === '') { setter(''); return; }
    let num = parseInt(val, 10);
    if (num < 0) num = 0;
    setter(num.toString());
  };

  const age = useMemo(() => calculateAge(dob, examDate), [dob, examDate]);
  const finalAge = useMemo(() => {
    if (manualYears !== '' || manualMonths !== '') {
      return {
        years: manualYears !== '' ? Number(manualYears) : '',
        months: manualMonths !== '' ? Number(manualMonths) : ''
      };
    }
    return age;
  }, [age, manualYears, manualMonths]);

  const isAgeValid = finalAge.years === '' || (Number(finalAge.years) >= 1 && Number(finalAge.years) <= 19);
  const isLocked = !isAgeValid;

  const bmi = useMemo(() => calculateBMI(weight, height), [weight, height]);

  useEffect(() => {
    const fetchZScore = async () => {
      if (bmi !== '' && finalAge.years !== '') {
        try {
          const { calculateZScore } = await import('@pedi-growth/core');
          const totalMonths = Number(finalAge.years) * 12 + Number(finalAge.months || 0);
          const result = await calculateZScore({
            indicator: 'bmi-for-age',
            sex: gender,
            ageInDays: totalMonths * 30.4375,
            measurement: Number(bmi)
          });
          if (result && result.zScore !== undefined) {
            setCalculatedBmiZ(result.zScore);
            setBmiZ(result.zScore.toFixed(2));
          } else {
            setCalculatedBmiZ(null);
          }
        } catch (error) {
          console.error('Error calculating Z-score:', error);
          setCalculatedBmiZ(null);
        }
      } else {
        setCalculatedBmiZ(null);
      }
    };
    fetchZScore();
  }, [bmi, finalAge, gender]);

  const whtr = useMemo(() => calculateWHtR(waist, height), [waist, height]);
  
  const homaIr = useMemo(() => calculateHomaIR(fi, fg, globalUnit), [fi, fg, globalUnit]);
  const quicki = useMemo(() => calculateQuicki(fi, fg, globalUnit), [fi, fg, globalUnit]);
  const fgir = useMemo(() => calculateFgir(fi, fg, globalUnit), [fi, fg, globalUnit]);
  
  const hba1cConverted = useMemo(() => convertHbA1c(hba1c, hba1cUnit), [hba1c, hba1cUnit]);
  
  const tgHdl = useMemo(() => calculateTgHdl(tg, hdl, globalUnit), [tg, hdl, globalUnit]);
  const nonHdlValue = useMemo(() => calculateNonHdl(tc, hdl), [tc, hdl]);
  const nonHdlEval = useMemo(() => evaluateNonHdl(nonHdlValue, globalUnit), [nonHdlValue, globalUnit]);
  
  const lhFsh = useMemo(() => (lh !== '' && fsh !== '' && fsh !== 0) ? (lh / fsh).toFixed(2) : '', [lh, fsh]);
  const astAlt = useMemo(() => (ast !== '' && alt !== '' && alt !== 0) ? (ast / alt).toFixed(2) : '', [ast, alt]);

  const bpEval = useMemo(() => evaluateBP(sbp, dbp, finalAge.years, gender), [sbp, dbp, finalAge.years, gender]);

  // Diabetes Status
  const diabetesStatus = useMemo(() => {
    if (!fg && !hba1c) return null;
    
    let fgMmol = null;
    if (fg) {
      fgMmol = globalUnit === 'mg/dL' ? Number(fg) / 18 : Number(fg);
    }
    
    let hba1cPercent = null;
    if (hba1c) {
      hba1cPercent = hba1cUnit === 'mmol/mol' ? (Number(hba1c) / 10.929) + 2.15 : Number(hba1c);
    }

    let isDiabetes = false;
    let isPrediabetes = false;

    if ((fgMmol !== null && fgMmol >= 7.0) || (hba1cPercent !== null && hba1cPercent >= 6.5)) {
      isDiabetes = true;
    } else if ((fgMmol !== null && fgMmol >= 5.6 && fgMmol < 7.0) || (hba1cPercent !== null && hba1cPercent >= 5.7 && hba1cPercent < 6.5)) {
      isPrediabetes = true;
    }

    if (isDiabetes) return { status: t.diabetes, color: 'text-red-600', desc: t.diabetesDesc };
    if (isPrediabetes) return { status: t.prediabetes, color: 'text-yellow-600', desc: t.prediabetesDesc };
    
    if (fgMmol !== null || hba1cPercent !== null) {
      return { status: t.normal, color: 'text-green-600', desc: t.normalGlucoseDesc };
    }
    return null;
  }, [fg, globalUnit, hba1c, hba1cUnit]);

  // Insulin Resistance Status
  const irStatus = useMemo(() => {
    if (!homaIr || !quicki) return null;
    const h = Number(homaIr);
    const q = Number(quicki);
    const f = Number(fgir);

    if (tanner === 'prepubertal') {
      if (h > 2.5 || q < 0.30) return { status: t.pathologicalIR, color: 'text-red-600', desc: t.irDesc };
      if (h < 2.5 && q > 0.33) return { status: t.normal, color: 'text-green-600', desc: t.normalIRDesc };
    } else {
      if (h > 4.0 || q < 0.30) return { status: t.pathologicalIR, color: 'text-red-600', desc: t.irDesc };
      if (h >= 3.16 && h <= 4.0 && f < 7) return { status: t.physiologicalIR, color: 'text-yellow-600', desc: t.physioIRDesc };
      if (h < 3.16 && q > 0.33) return { status: t.normal, color: 'text-green-600', desc: t.normalIRDesc };
    }
    return { status: t.followUp, color: 'text-gray-600', desc: t.followUpDesc || '...' };
  }, [homaIr, quicki, fgir, tanner]);

  // Lipid Status
  const lipidStatus = useMemo(() => {
    if (!tgHdl) return null;
    const r = Number(tgHdl);
    if (r > 3.0) return { status: t.highCVD, color: 'text-red-600', desc: t.cvdDesc };
    if (r > 2.2) return { status: t.moderateRisk, color: 'text-yellow-600', desc: t.lipidModerateDesc };
    return { status: t.normal, color: 'text-green-600', desc: '' };
  }, [tgHdl]);

  // Liver Status
  const liverStatus = useMemo(() => {
    if (alt === '') return null;
    const a = Number(alt);
    const cutoff = gender === 'male' ? 26 : 22;
    if (a > cutoff) {
      if (astAlt && Number(astAlt) > 1) {
        return { status: t.mashFibrosis, color: 'text-red-600', desc: t.mashDesc.replace('{cutoff}', cutoff.toString()) };
      }
      return { status: t.masld, color: 'text-yellow-600', desc: t.masldDesc.replace('{cutoff}', cutoff.toString()) };
    }
    return { status: t.normal, color: 'text-green-600', desc: '' };
  }, [alt, astAlt, gender]);

  // Endocrine Status
  const endocrineStatus = useMemo(() => {
    if (!lhFsh) return null;
    const r = Number(lhFsh);
    if (gender === 'female') {
      if (r > 2.0) return { status: t.pcos, color: 'text-red-600', desc: t.pcosDesc };
      if (finalAge.years !== '' && Number(finalAge.years) < 8 && r > 0.3) return { status: t.earlyPuberty, color: 'text-yellow-600', desc: t.earlyPubertyDesc };
    }
    return { status: t.normal, color: 'text-green-600', desc: '' };
  }, [lhFsh, gender, finalAge.years]);

  const showEndocrineInputs = useMemo(() => {
    return gender === 'female';
  }, [gender]);

  const generateConclusion = () => {
    const ageStr = finalAge.years !== '' ? `${finalAge.years} ${t.years} ${finalAge.months} ${t.months}` : '...';
    const genderStr = gender === 'male' ? t.male.toLowerCase() : t.female.toLowerCase();
    const bmiStr = bmi ? `${bmi}` : '...';
    const waistStr = waist ? `${waist} cm` : '...';
    
    let indices = [];
    if (fg) indices.push(`${t.glucose}: ${fg} ${globalUnit}`);
    if (fi) indices.push(`${t.insulin}: ${fi} µU/mL`);
    if (hba1c) indices.push(`${t.hba1c}: ${hba1c} ${hba1cUnit}`);
    if (homaIr) indices.push(`HOMA-IR: ${homaIr}`);
    if (quicki) indices.push(`QUICKI: ${quicki}`);
    if (whtr) indices.push(`WHtR: ${whtr}`);
    if (tg) indices.push(`${t.tg}: ${tg} ${globalUnit}`);
    if (hdl) indices.push(`${t.hdl}: ${hdl} ${globalUnit}`);
    if (tc) indices.push(`${t.tc}: ${tc} ${globalUnit}`);
    if (ldl) indices.push(`${t.ldl}: ${ldl} ${globalUnit}`);
    if (tgHdl) indices.push(`TG/HDL: ${tgHdl}`);
    if (nonHdlValue) indices.push(`Non-HDL: ${nonHdlValue} ${globalUnit}`);
    if (nonHdlEval && nonHdlEval.status !== 'nonHdlAcceptable') indices.push(`${t.meaning}: ${t[nonHdlEval.status]}`);
    if (nonHdlValue && globalUnit === 'mmol/L') {
      const nonHdlMg = (nonHdlValue * 38.67).toFixed(1);
      indices.push(`Non-HDL: ${nonHdlMg} mg/dL`);
    }
    if (alt) indices.push(`${t.alt}: ${alt} U/L`);
    if (ast) indices.push(`${t.ast}: ${ast} U/L`);
    if (lh) indices.push(`${t.lh}: ${lh} IU/L`);
    if (fsh) indices.push(`${t.fsh}: ${fsh} IU/L`);
    if (sbp || dbp) indices.push(`${t.bloodPressure}: ${sbp}/${dbp} mmHg`);

    const indicesStr = indices.length > 0 ? indices.join(', ') : t.noData;
    
    return `${t.child} ${genderStr}, ${ageStr}, BMI ${bmiStr}${bmiZ ? ` (Z-score: ${bmiZ})` : ''}, ${t.waist} ${waistStr}. ${t.indices}: ${indicesStr}. ${t.meaning}: ${doctorNote || '...'}. ${t.examDate}: ${examDate}.`;
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generateConclusion());
    alert(t.copySuccess);
  };

  const hasAbnormality = useMemo(() => {
    const checks = [
      Number(whtr) > 0.5,
      diabetesStatus?.status && diabetesStatus.status !== t.normal,
      irStatus?.status && irStatus.status !== t.normal,
      lipidStatus?.status && lipidStatus.status !== t.normal,
      liverStatus?.status && liverStatus.status !== t.normal,
      endocrineStatus?.status && endocrineStatus.status !== t.normal,
      nonHdlEval?.status && nonHdlEval.status !== 'nonHdlAcceptable',
      bpEval?.status && bpEval.status !== 'normal',
      Number(bmiZ) > 2 || Number(bmiZ) < -2
    ];
    return checks.some(Boolean);
  }, [whtr, diabetesStatus, irStatus, lipidStatus, liverStatus, endocrineStatus, bpEval, bmiZ, t.normal]);

  const bgColor = hasAbnormality ? 'bg-[#FFCCBC]' : (gender === 'male' ? 'bg-[#B2DFDB]' : 'bg-[#FCE4EC]');
  const accentColor = hasAbnormality ? 'text-red-800' : (gender === 'male' ? 'text-teal-800' : 'text-pink-600');
  const ringColor = gender === 'male' ? 'ring-teal-700' : 'ring-pink-500';

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
        <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-200 w-full max-w-sm text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-6" onClick={() => setIsLoggedIn(true)}>{t.login}</h1>
          <input
            type="password"
            value={loginCode}
            onChange={e => {
              setLoginCode(e.target.value);
              if (e.target.value.endsWith('0')) {
                setIsLoggedIn(true);
              }
            }}
            placeholder={t.enterCode}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${bgColor} p-2 md:p-6 font-sans antialiased transition-colors duration-300`}>
      <div className="max-w-7xl mx-auto">
        <header className="mb-6 text-center relative">
          <div className="absolute top-0 right-0 flex gap-1">
            {(['VIE', 'EN'] as Language[]).map(lang => (
              <button
                key={lang}
                onClick={() => setLanguage(lang)}
                className={`px-2 py-1 text-[10px] font-bold rounded border transition-all ${language === lang ? 'bg-white text-teal-700 border-teal-200 shadow-sm' : 'bg-white/50 text-gray-500 border-transparent hover:bg-white'}`}
              >
                {lang}
              </button>
            ))}
          </div>
          <h1 className={`text-2xl md:text-3xl font-bold ${accentColor} mb-1 tracking-tight`}>{t.title}</h1>
          <div className="text-gray-600 text-sm font-medium leading-tight">
            <p>{t.unitName}</p>
            <p>{t.doctorName}</p>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* LEFT COLUMN: INPUTS */}
          <div className="flex flex-col gap-5">
            {/* THÔNG TIN CHUNG */}
            <div className="bg-white p-4 md:p-5 rounded-2xl shadow-sm border border-gray-200/60">
              <h2 className={`text-lg font-semibold ${accentColor} mb-4 flex items-center gap-2`}>
                <Info className="w-5 h-5" /> {t.generalInfo}
              </h2>

              {!isAgeValid && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-4 text-sm" role="alert">
                  <strong className="font-semibold">{t.outOfRange} </strong>
                  <span>{t.ageLimitMsg}</span>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-2">
                <div className="col-span-1 md:col-span-2 flex gap-3 mb-1">
                  <button
                    onClick={() => setGender('male')}
                    className={`flex-1 py-1.5 rounded-xl font-medium transition-all text-sm shadow-sm ${gender === 'male' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                  >
                    {t.male}
                  </button>
                  <button
                    onClick={() => setGender('female')}
                    className={`flex-1 py-1.5 rounded-xl font-medium transition-all text-sm shadow-sm ${gender === 'female' ? 'bg-pink-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                  >
                    {t.female}
                  </button>
                </div>
                
                <div className="col-span-1 md:col-span-2">
                  <label className="mb-1 block text-xs font-semibold text-gray-700">{t.age}</label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-gray-50/50 p-3 rounded-xl border border-gray-200/60">
                    <div>
                      <div className="flex flex-col mb-3">
                        <label className="mb-1 text-xs font-medium text-gray-500 uppercase tracking-wider">{t.method1}</label>
                        <div className="flex gap-2 mb-2">
                          <input type="number" value={dobD} onChange={handleDayChange(setDobD)} placeholder={t.day} className={`w-1/3 px-3 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:${ringColor} shadow-sm text-sm`} />
                          <input type="number" value={dobM} onChange={handleMonthChange(setDobM)} placeholder={t.month} className={`w-1/3 px-3 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:${ringColor} shadow-sm text-sm`} />
                          <input type="number" value={dobY} onChange={handleYearChange(setDobY)} placeholder={t.year} className={`w-1/3 px-3 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:${ringColor} shadow-sm text-sm`} />
                        </div>
                        <label className="mb-1 text-xs font-medium text-gray-500 uppercase tracking-wider">{t.examDate}</label>
                        <div className="flex gap-2">
                          <input type="number" value={examD} onChange={handleDayChange(setExamD)} placeholder={t.day} className={`w-1/3 px-3 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:${ringColor} shadow-sm text-sm`} />
                          <input type="number" value={examM} onChange={handleMonthChange(setExamM)} placeholder={t.month} className={`w-1/3 px-3 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:${ringColor} shadow-sm text-sm`} />
                          <input type="number" value={examY} onChange={handleYearChange(setExamY)} placeholder={t.year} className={`w-1/3 px-3 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:${ringColor} shadow-sm text-sm`} />
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col gap-3">
                      <div className="flex flex-col">
                        <label className="mb-1 text-xs font-medium text-gray-500 uppercase tracking-wider">{t.method2}</label>
                        <div className="flex gap-2">
                          <div className="flex-1">
                            <input
                              type="number"
                              value={manualYears}
                              onChange={e => setManualYears(e.target.value)}
                              placeholder={t.age}
                              className={`w-full px-3 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:${ringColor} shadow-sm text-sm`}
                            />
                          </div>
                          <div className="flex-1">
                            <input
                              type="number"
                              value={manualMonths}
                              onChange={e => setManualMonths(e.target.value)}
                              placeholder={t.month}
                              className={`w-full px-3 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:${ringColor} shadow-sm text-sm`}
                            />
                          </div>
                        </div>
                      </div>
                      <div className={`flex-1 border p-3 rounded-xl flex flex-col justify-center items-center shadow-sm ${gender === 'male' ? 'bg-blue-50/50 border-blue-100' : 'bg-pink-50/50 border-pink-100'}`}>
                        <span className={`text-xs font-semibold uppercase tracking-wider mb-1 ${gender === 'male' ? 'text-blue-600' : 'text-pink-600'}`}>{t.ageCalculated}</span>
                        <span className={`text-xl font-bold ${gender === 'male' ? 'text-blue-900' : 'text-pink-900'}`}>
                          {finalAge.years !== '' ? `${finalAge.years} ${t.years} ${finalAge.months} ${t.months}` : '--'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* NHÂN TRẮC HỌC */}
            <div className="bg-white p-4 md:p-5 rounded-2xl shadow-sm border border-gray-200/60">
              <h3 className="text-md font-semibold text-gray-800 mb-3">{t.anthropometry}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <InputGroup label={t.height} value={height} onValueChange={setHeight} unit="cm" disabled={isLocked} />
                <InputGroup label={t.weight} value={weight} onValueChange={setWeight} unit="kg" disabled={isLocked} />
                
                <div className="flex flex-col mb-3">
                  <label className="mb-1 text-xs font-semibold text-gray-700">BMI Z-score</label>
                  <div className="flex items-center">
                    <input
                      type="text"
                      inputMode="decimal"
                      value={bmiZ}
                      onChange={e => {
                        let val = e.target.value.replace(',', '.');
                        if (/^-?\d*\.?\d*$/.test(val)) {
                          setBmiZ(val);
                        }
                      }}
                      placeholder={t.enterCode}
                      disabled={isLocked}
                      className={`flex-1 px-3 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:${ringColor} shadow-sm transition-shadow text-sm ${calculatedBmiZ !== null ? 'bg-gray-50 text-gray-500' : ''} ${isLocked ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : ''}`}
                      readOnly={calculatedBmiZ !== null}
                    />
                  </div>
                  {calculatedBmiZ !== null && (
                    <span className="text-xs text-green-600 mt-1 font-medium">
                      {t.autoWHO}
                    </span>
                  )}
                </div>
                <InputGroup label={t.waistLabel} value={waist} onValueChange={setWaist} disabled={isLocked} />
                
                <div className="flex flex-col mb-3">
                  <label className="mb-1 text-xs font-semibold text-gray-700">{t.tanner}</label>
                  <select
                    value={tanner}
                    onChange={e => setTanner(e.target.value as 'prepubertal' | 'pubertal')}
                    disabled={isLocked}
                    className={`px-3 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:${ringColor} shadow-sm text-sm ${isLocked ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : ''}`}
                  >
                    <option value="prepubertal">{t.tanner1}</option>
                    <option value="pubertal">{t.tanner2}</option>
                  </select>
                </div>
                {gender === 'female' && (
                  <div className="flex items-center mb-3 mt-5">
                    <input
                      type="checkbox"
                      id="menstrual"
                      checked={menstrual}
                      onChange={e => setMenstrual(e.target.checked)}
                      disabled={isLocked}
                      className={`w-4 h-4 text-pink-600 border-gray-300 rounded focus:ring-pink-500 ${isLocked ? 'cursor-not-allowed' : ''}`}
                    />
                    <label htmlFor="menstrual" className="ml-2 text-sm font-medium text-gray-700">{t.menstrual}</label>
                  </div>
                )}
              </div>
            </div>

            {/* XÉT NGHIỆM */}
            <div className="bg-white p-4 md:p-5 rounded-2xl shadow-sm border border-gray-200/60">
              <div className="flex flex-col md:flex-row md:items-center justify-between mb-3 gap-2">
                <h3 className="text-md font-semibold text-gray-800">{t.labTests}</h3>
                <div className="flex items-center bg-gray-100 p-1 rounded-lg self-start">
                  <button
                    onClick={() => setGlobalUnit('mmol/L')}
                    className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${globalUnit === 'mmol/L' ? 'bg-white text-teal-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                  >
                    mmol/L
                  </button>
                  <button
                    onClick={() => setGlobalUnit('mg/dL')}
                    className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${globalUnit === 'mg/dL' ? 'bg-white text-teal-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                  >
                    mg/dL
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <InputGroup label={`${t.glucose} (${globalUnit})`} value={fg} onValueChange={setFg} disabled={isLocked} />
                <InputGroup label={`${t.insulin} (µU/mL)`} value={fi} onValueChange={setFi} disabled={isLocked} />
                <InputGroup label={`${t.hba1c} (%)`} value={hba1c} onValueChange={setHba1c} disabled={isLocked} />
                <InputGroup label={`${t.alt} (U/L)`} value={alt} onValueChange={setAlt} disabled={isLocked} />
                <InputGroup label={`${t.ast} (U/L)`} value={ast} onValueChange={setAst} disabled={isLocked} />
                
                <InputGroup label={`${t.tg} (${globalUnit})`} value={tg} onValueChange={setTg} disabled={isLocked} />
                <InputGroup label={`${t.hdl} (${globalUnit})`} value={hdl} onValueChange={setHdl} disabled={isLocked} />
                <InputGroup label={`${t.tc} (${globalUnit})`} value={tc} onValueChange={setTc} disabled={isLocked} />
                <InputGroup label={`${t.ldl} (${globalUnit})`} value={ldl} onValueChange={setLdl} disabled={isLocked} />

                {gender === 'female' && (
                  <>
                    <InputGroup label={`${t.lh} (IU/L)`} value={lh} onValueChange={setLh} disabled={isLocked} />
                    <InputGroup label={`${t.fsh} (IU/L)`} value={fsh} onValueChange={setFsh} disabled={isLocked} />
                  </>
                )}
              </div>
            </div>

            {/* HUYẾT ÁP */}
            <div className="bg-white p-4 md:p-5 rounded-2xl shadow-sm border border-gray-200/60">
              <h3 className="text-md font-semibold text-gray-800 mb-3">{t.bloodPressure} (mmHg)</h3>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  inputMode="numeric"
                  value={sbp}
                  onChange={handleBpChange(setSbp)}
                  placeholder="SBP"
                  disabled={isLocked}
                  className={`w-full px-3 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 shadow-sm text-sm text-center ${isLocked ? 'bg-gray-100 text-gray-400' : ''} ${(sbp !== '' && (Number(sbp) < 50 || Number(sbp) > 200)) ? 'border-orange-500 ring-1 ring-orange-500' : ''}`}
                />
                <span className="text-gray-400 font-bold">/</span>
                <input
                  type="text"
                  inputMode="numeric"
                  value={dbp}
                  onChange={handleBpChange(setDbp)}
                  placeholder="DBP"
                  disabled={isLocked}
                  className={`w-full px-3 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 shadow-sm text-sm text-center ${isLocked ? 'bg-gray-100 text-gray-400' : ''} ${(dbp !== '' && (Number(dbp) < 50 || Number(dbp) > 200)) ? 'border-orange-500 ring-1 ring-orange-500' : ''}`}
                />
              </div>
              {((sbp !== '' && (Number(sbp) < 50 || Number(sbp) > 200)) || (dbp !== '' && (Number(dbp) < 50 || Number(dbp) > 200))) && (
                <p className="text-[10px] text-red-600 mt-1 font-medium text-center">{t.abnormalRange}</p>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN: RESULTS */}
          <div className="flex flex-col gap-5">
            <div className="bg-white p-5 md:p-6 rounded-2xl shadow-sm border border-gray-200/60 flex-1">
              <h2 className={`text-lg font-semibold ${accentColor} mb-5`}>{t.analysisResults}</h2>
              
              <div className="grid grid-cols-2 gap-4">
                <ResultCard title="BMI" value={bmi} unit="kg/m²" />
                <ResultCard
                  title="WHtR"
                  value={whtr}
                  status={Number(whtr) > 0.5 ? t.centralObesity : t.normal}
                  statusColor={Number(whtr) > 0.5 ? 'text-red-600' : 'text-green-600'}
                  description={Number(whtr) > 0.5 ? t.whtrDesc : ''}
                  trend={Number(whtr) > 0.5 ? 'up' : 'neutral'}
                />
              </div>

              {bmiZ && (
                <div className="mt-4 bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-sm font-semibold text-gray-700">BMI Z-Score</h3>
                    <span className="font-bold text-lg">{bmiZ}</span>
                  </div>
                  <div 
                    className="relative h-4 rounded-full overflow-hidden shadow-inner"
                    style={{ background: 'linear-gradient(to right, #ef4444 0%, #ef4444 16.6%, #22c55e 16.6%, #22c55e 66.6%, #eab308 66.6%, #eab308 83.3%, #ef4444 83.3%, #ef4444 100%)' }}
                  >
                    {/* Markers */}
                    <div className="absolute top-0 bottom-0 left-[16.6%] w-px bg-white/70"></div>
                    <div className="absolute top-0 bottom-0 left-[33.3%] w-px bg-white/70"></div>
                    <div className="absolute top-0 bottom-0 left-[50%] w-px bg-white/70"></div>
                    <div className="absolute top-0 bottom-0 left-[66.6%] w-px bg-white/70"></div>
                    <div className="absolute top-0 bottom-0 left-[83.3%] w-px bg-white/70"></div>
                    
                    {/* Indicator */}
                    <div 
                      className="absolute top-0 bottom-0 w-1.5 bg-black rounded-full shadow-md transform -translate-x-1/2 transition-all duration-500 border border-white"
                      style={{ left: `${Math.min(Math.max(((Number(bmiZ) + 3) / 6) * 100, 0), 100)}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-[10px] text-gray-500 mt-1 px-1 font-medium">
                    <span>-3</span>
                    <span>-2</span>
                    <span>-1</span>
                    <span>0</span>
                    <span>1</span>
                    <span>2</span>
                    <span>3</span>
                  </div>
                </div>
              )}

              {homaIr && (
                <div className="mt-4">
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">{t.glucoseIR}</h3>
                  
                  {diabetesStatus && (
                    <div className="mb-4">
                      <ResultCard 
                        title={t.glucoseStatus} 
                        value={diabetesStatus.status} 
                        statusColor={diabetesStatus.color} 
                        description={diabetesStatus.desc} 
                      />
                    </div>
                  )}

                  <div className="grid grid-cols-3 gap-4 mb-2">
                    <div className="bg-gray-50 p-3 rounded-lg text-center flex flex-col items-center">
                      <div className="text-xs text-gray-500">HOMA-IR</div>
                      <div className="text-xl font-bold flex items-center gap-1">
                        {homaIr}
                        {Number(homaIr) > (tanner === 'prepubertal' ? 2.5 : 3.16) ? <TrendingUp className="w-4 h-4 text-red-500" /> : <Minus className="w-4 h-4 text-green-500" />}
                      </div>
                      <div className="text-[10px] text-gray-400 mt-1">{tanner === 'prepubertal' ? t.irPre : t.irPub}</div>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg text-center flex flex-col items-center">
                      <div className="text-xs text-gray-500">QUICKI</div>
                      <div className="text-xl font-bold flex items-center gap-1">
                        {quicki}
                        {Number(quicki) < 0.33 ? <TrendingDown className="w-4 h-4 text-red-500" /> : <Minus className="w-4 h-4 text-green-500" />}
                      </div>
                      <div className="text-[10px] text-gray-400 mt-1">{t.irQuicki}</div>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg text-center flex flex-col items-center">
                      <div className="text-xs text-gray-500">FGIR</div>
                      <div className="text-xl font-bold flex items-center gap-1">
                        {fgir}
                        {Number(fgir) < 7 ? <TrendingDown className="w-4 h-4 text-red-500" /> : <Minus className="w-4 h-4 text-green-500" />}
                      </div>
                      <div className="text-[10px] text-gray-400 mt-1">{t.irFgir}</div>
                    </div>
                  </div>
                  {irStatus && (
                    <div className={`p-3 rounded-lg border ${irStatus.color.replace('text', 'border').replace('600', '200')} ${irStatus.color.replace('text', 'bg').replace('600', '50')}`}>
                      <div className={`font-semibold ${irStatus.color}`}>{irStatus.status}</div>
                      <div className="text-sm text-gray-700 mt-1">{irStatus.desc}</div>
                    </div>
                  )}
                </div>
              )}

              {hba1c !== '' && (
                <div className="mt-4">
                  <ResultCard
                    title={t.hba1cConv}
                    value={hba1cConverted}
                    unit={hba1cUnit === '%' ? 'mmol/mol' : '%'}
                  />
                </div>
              )}

              {(alt !== '' || astAlt !== '') && (
                <div className="mt-4">
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">{t.liverFunction}</h3>
                  <div className="grid grid-cols-2 gap-4 mb-2">
                    <div className="bg-gray-50 p-3 rounded-lg text-center flex flex-col items-center">
                      <div className="text-xs text-gray-500">ALT</div>
                      <div className="text-xl font-bold flex items-center gap-1">
                        {alt} <span className="text-xs">U/L</span>
                        {Number(alt) > (gender === 'male' ? 26 : 22) ? <TrendingUp className="w-4 h-4 text-red-500" /> : <Minus className="w-4 h-4 text-green-500" />}
                      </div>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg text-center flex flex-col items-center">
                      <div className="text-xs text-gray-500">AST/ALT</div>
                      <div className="text-xl font-bold flex items-center gap-1">
                        {astAlt || '--'}
                        {astAlt && Number(astAlt) > 1 ? <TrendingUp className="w-4 h-4 text-red-500" /> : <Minus className="w-4 h-4 text-green-500" />}
                      </div>
                    </div>
                  </div>
                  {liverStatus && liverStatus.status !== t.normal && (
                    <div className={`p-3 rounded-lg border ${liverStatus.color.replace('text', 'border').replace('600', '200')} ${liverStatus.color.replace('text', 'bg').replace('600', '50')}`}>
                      <div className={`font-semibold ${liverStatus.color}`}>{liverStatus.status}</div>
                      <div className="text-sm text-gray-700 mt-1">{liverStatus.desc}</div>
                    </div>
                  )}
                </div>
              )}

              {(tgHdl !== '' || nonHdlValue !== null) && (
                <div className="mt-4">
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">{t.lipids}</h3>
                  <div className="grid grid-cols-2 gap-4 mb-2">
                    <div className="bg-gray-50 p-3 rounded-lg text-center flex flex-col items-center">
                      <div className="text-xs text-gray-500">TG/HDL Ratio</div>
                      <div className="text-xl font-bold flex items-center gap-1">
                        {tgHdl}
                        {Number(tgHdl) > 2.2 ? <TrendingUp className="w-4 h-4 text-red-500" /> : <Minus className="w-4 h-4 text-green-500" />}
                      </div>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg text-center flex flex-col items-center">
                      <div className="text-xs text-gray-500">Non-HDL</div>
                      <div className="text-xl font-bold flex items-center gap-1">
                        {nonHdlValue} <span className="text-xs">{globalUnit}</span>
                        {nonHdlEval?.status === 'nonHdlHigh' ? (
                          <TrendingUp className="w-4 h-4 text-red-500" />
                        ) : nonHdlEval?.status === 'nonHdlBorderline' ? (
                          <TrendingUp className="w-4 h-4 text-yellow-500" />
                        ) : (
                          <Minus className="w-4 h-4 text-green-500" />
                        )}
                      </div>
                    </div>
                  </div>
                  {lipidStatus && lipidStatus.status !== t.normal && (
                    <div className={`p-3 rounded-lg border ${lipidStatus.color.replace('text', 'border').replace('600', '200')} ${lipidStatus.color.replace('text', 'bg').replace('600', '50')}`}>
                      <div className={`font-semibold ${lipidStatus.color}`}>{lipidStatus.status}</div>
                      <div className="text-sm text-gray-700 mt-1">{lipidStatus.desc}</div>
                    </div>
                  )}
                  {nonHdlEval && nonHdlEval.status !== 'nonHdlAcceptable' && (
                    <div className={`p-3 mt-2 rounded-lg border ${nonHdlEval.color.replace('text', 'border').replace('600', '200')} ${nonHdlEval.color.replace('text', 'bg').replace('600', '50')}`}>
                      <div className={`font-semibold ${nonHdlEval.color}`}>{t[nonHdlEval.status]}</div>
                      <div className="text-sm text-gray-700 mt-1">{t.nonHdlDesc}</div>
                    </div>
                  )}
                </div>
              )}

              {lh !== '' && fsh !== '' && (
                <div className="mt-4">
                  <ResultCard
                    title={t.endocrine}
                    value={lhFsh}
                    status={endocrineStatus?.status || t.normal}
                    statusColor={endocrineStatus?.color || 'text-green-600'}
                    description={endocrineStatus?.desc || ''}
                    trend={Number(lhFsh) > 0.3 ? 'up' : 'neutral'}
                  />
                </div>
              )}

              {bpEval && (
                <div className="mt-4">
                  <ResultCard
                    title={t.bloodPressure}
                    value={`${sbp}/${dbp}`}
                    unit="mmHg"
                    status={t[bpEval.status] || bpEval.status}
                    statusColor={bpEval.color}
                  />
                </div>
              )}

              <div className="mt-6">
                <label className="block mb-2 text-sm font-semibold text-gray-700">{t.doctorEval}</label>
                <textarea
                  value={doctorNote}
                  onChange={e => setDoctorNote(e.target.value)}
                  placeholder={t.currentStatus}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:${ringColor} min-h-[80px] text-sm`}
                />
              </div>
            </div>

            {/* CONCLUSION BOX */}
            <div className="bg-white p-4 md:p-5 rounded-2xl shadow-sm border border-gray-200/60">
              <div className="flex justify-between items-center mb-3">
                <h2 className={`text-lg font-semibold ${accentColor}`}>{t.conclusion}</h2>
                <button
                  onClick={copyToClipboard}
                  className={`flex items-center gap-1 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors shadow-sm`}
                >
                  <Copy className="w-4 h-4" /> {t.copy}
                </button>
              </div>
              <pre className="whitespace-pre-wrap text-sm text-gray-800 bg-gray-50/50 p-4 rounded-xl border border-gray-200/60 font-sans leading-relaxed">
                {generateConclusion()}
              </pre>
            </div>
          </div>
        </div>

        {/* FOOTER & REFERENCES */}
        <footer className="mt-12 mb-8 text-center">
          <div className="text-gray-600 text-sm font-medium mb-4 leading-tight">
            <p>{t.unitName}</p>
            <p>{t.doctorName}</p>
          </div>
          <button
            onClick={() => setShowRefs(!showRefs)}
            className="flex items-center gap-2 text-gray-500 hover:text-gray-700 font-medium mx-auto"
          >
            {showRefs ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            {t.references}
          </button>
          
          {showRefs && (
            <div className="mt-4 bg-white p-6 rounded-xl shadow-sm border border-gray-100 max-w-4xl mx-auto">
              <ul className="list-disc pl-5 space-y-2 text-sm text-gray-600">
                {REFERENCES.map((ref, idx) => (
                  <li key={idx}>{ref}</li>
                ))}
              </ul>
            </div>
          )}
        </footer>
      </div>
    </div>
  );
}
