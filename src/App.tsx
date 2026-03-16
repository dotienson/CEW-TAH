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
  evaluateBP
} from './utils/calculations';
import { REFERENCES } from './utils/constants';
import { Copy, ChevronDown, ChevronUp, Info, TrendingUp, TrendingDown, Minus } from 'lucide-react';

export default function App() {
  const [gender, setGender] = useState<'male' | 'female'>('male');
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
  const [fgUnit, setFgUnit] = useState<'mmol/L' | 'mg/dL'>('mmol/L');

  const [hba1c, setHba1c] = useState('');
  const [hba1cUnit, setHba1cUnit] = useState<'%' | 'mmol/mol'>('%');

  const [alt, setAlt] = useState('');
  const [ast, setAst] = useState('');

  const [tc, setTc] = useState('');
  const [ldl, setLdl] = useState('');
  const [hdl, setHdl] = useState('');
  const [tg, setTg] = useState('');
  const [lipidUnit, setLipidUnit] = useState<'mmol/L' | 'mg/dL'>('mmol/L');

  const [lh, setLh] = useState('');
  const [fsh, setFsh] = useState('');

  const [sbp, setSbp] = useState('');
  const [dbp, setDbp] = useState('');

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
  
  const homaIr = useMemo(() => calculateHomaIR(fi, fg, fgUnit), [fi, fg, fgUnit]);
  const quicki = useMemo(() => calculateQuicki(fi, fg, fgUnit), [fi, fg, fgUnit]);
  const fgir = useMemo(() => calculateFgir(fi, fg, fgUnit), [fi, fg, fgUnit]);
  
  const hba1cConverted = useMemo(() => convertHbA1c(hba1c, hba1cUnit), [hba1c, hba1cUnit]);
  
  const tgHdl = useMemo(() => calculateTgHdl(tg, hdl, lipidUnit), [tg, hdl, lipidUnit]);
  const nonHdl = useMemo(() => calculateNonHdl(tc, hdl), [tc, hdl]);
  
  const lhFsh = useMemo(() => (lh !== '' && fsh !== '' && fsh !== 0) ? (lh / fsh).toFixed(2) : '', [lh, fsh]);
  const astAlt = useMemo(() => (ast !== '' && alt !== '' && alt !== 0) ? (ast / alt).toFixed(2) : '', [ast, alt]);

  const bpEval = useMemo(() => evaluateBP(sbp, dbp, finalAge.years, gender), [sbp, dbp, finalAge.years, gender]);

  // Diabetes Status
  const diabetesStatus = useMemo(() => {
    if (!fg && !hba1c) return null;
    
    let fgMmol = null;
    if (fg) {
      fgMmol = fgUnit === 'mg/dL' ? Number(fg) / 18 : Number(fg);
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

    if (isDiabetes) return { status: 'Đái tháo đường', color: 'text-red-600', desc: 'Đường huyết hoặc HbA1c ở mức đái tháo đường.' };
    if (isPrediabetes) return { status: 'Tiền đái tháo đường', color: 'text-yellow-600', desc: 'Đường huyết hoặc HbA1c ở mức tiền đái tháo đường.' };
    
    if (fgMmol !== null || hba1cPercent !== null) {
      return { status: 'Bình thường', color: 'text-green-600', desc: 'Đường huyết và HbA1c trong giới hạn bình thường.' };
    }
    return null;
  }, [fg, fgUnit, hba1c, hba1cUnit]);

  // Insulin Resistance Status
  const irStatus = useMemo(() => {
    if (!homaIr || !quicki) return null;
    const h = Number(homaIr);
    const q = Number(quicki);
    const f = Number(fgir);

    if (tanner === 'prepubertal') {
      if (h > 2.5 || q < 0.30) return { status: 'Có tình trạng kháng insulin bệnh lý', color: 'text-red-600', desc: 'Tình trạng kháng insulin rõ rệt. Cần tầm soát thêm các thành phần của hội chứng chuyển hóa (Lipid máu, HbA1c, siêu âm gan nhiễm mỡ, men gan). Khuyến cáo Hội chẩn Nhóm lâm sàng về Nội tiết Nhi (BS. Đỗ Tiến Sơn Ext 8921).' };
      if (h < 2.5 && q > 0.33) return { status: 'Bình thường', color: 'text-green-600', desc: 'Độ nhạy insulin bình thường. Duy trì lối sống lành mạnh.' };
    } else {
      if (h > 4.0 || q < 0.30) return { status: 'Có tình trạng kháng insulin bệnh lý', color: 'text-red-600', desc: 'Tình trạng kháng insulin rõ rệt. Cần tầm soát thêm các thành phần của hội chứng chuyển hóa (Lipid máu, HbA1c, siêu âm gan nhiễm mỡ, men gan). Khuyến cáo Hội chẩn Nhóm lâm sàng về Nội tiết Nhi (BS. Đỗ Tiến Sơn Ext 8921).' };
      if (h >= 3.16 && h <= 4.0 && f < 7) return { status: 'Cảnh báo/Kháng insulin sinh lý', color: 'text-yellow-600', desc: 'Có dấu hiệu giảm độ nhạy insulin. Cần đối chiếu với gai đen lâm sàng và phân độ béo phì. Cân nhắc đây có thể là đỉnh kháng insulin sinh lý của tuổi dậy thì. Khuyến cáo Hội chẩn Nhóm lâm sàng về Nội tiết Nhi (BS. Đỗ Tiến Sơn Ext 8921).' };
      if (h < 3.16 && q > 0.33) return { status: 'Bình thường', color: 'text-green-600', desc: 'Độ nhạy insulin bình thường. Duy trì lối sống lành mạnh.' };
    }
    return { status: 'Theo dõi thêm', color: 'text-gray-600', desc: 'Các chỉ số ở mức ranh giới.' };
  }, [homaIr, quicki, fgir, tanner]);

  // Lipid Status
  const lipidStatus = useMemo(() => {
    if (!tgHdl) return null;
    const r = Number(tgHdl);
    if (r > 3.0) return { status: 'Nguy cơ cao biến chứng tim mạch', color: 'text-red-600', desc: 'Phản ánh sự xuất hiện của các hạt LDL nhỏ, đậm đặc - nguyên nhân lõi gây mảng xơ vữa.' };
    if (r > 2.2) return { status: 'Nguy cơ trung bình', color: 'text-yellow-600', desc: 'Dấu hiệu đặc trưng ở trẻ thừa cân, béo phì có rối loạn dung nạp mỡ máu.' };
    return { status: 'Bình thường', color: 'text-green-600', desc: '' };
  }, [tgHdl]);

  // Liver Status
  const liverStatus = useMemo(() => {
    if (alt === '') return null;
    const a = Number(alt);
    const cutoff = gender === 'male' ? 26 : 22;
    if (a > cutoff) {
      if (astAlt && Number(astAlt) > 1) {
        return { status: 'Nghi ngờ MASH/Xơ hóa', color: 'text-red-600', desc: `ALT > ${cutoff} U/L và AST/ALT > 1. Cảnh báo tiến triển viêm gan thoái hóa mỡ hoặc xơ hóa.` };
      }
      return { status: 'Nghi ngờ MASLD', color: 'text-yellow-600', desc: `ALT > ${cutoff} U/L. Cần sàng lọc MASLD.` };
    }
    return { status: 'Bình thường', color: 'text-green-600', desc: '' };
  }, [alt, astAlt, gender]);

  // Endocrine Status
  const endocrineStatus = useMemo(() => {
    if (!lhFsh) return null;
    const r = Number(lhFsh);
    if (gender === 'female') {
      if (r > 2.0) return { status: 'Nghi ngờ PCOS', color: 'text-red-600', desc: 'Tỉ lệ LH/FSH > 2.0 (hoặc > 3.0 ở vị thành niên) ủng hộ mạnh mẽ chẩn đoán PCOS.' };
      if (finalAge.years !== '' && Number(finalAge.years) < 8 && r > 0.3) return { status: 'Nguy cơ dậy thì sớm', color: 'text-yellow-600', desc: 'LH/FSH > 0.3 ở nữ < 8 tuổi.' };
    }
    return { status: 'Bình thường', color: 'text-green-600', desc: '' };
  }, [lhFsh, gender, finalAge.years]);

  const showEndocrineInputs = useMemo(() => {
    return gender === 'female';
  }, [gender]);

  const generateConclusion = () => {
    const ageStr = finalAge.years !== '' ? `${finalAge.years} tuổi ${finalAge.months} tháng` : '...';
    const genderStr = gender === 'male' ? 'nam' : 'nữ';
    const bmiStr = bmi ? `${bmi}` : '...';
    const waistStr = waist ? `${waist} cm` : '...';
    
    let indices = [];
    const homaIrCutoff = tanner === 'prepubertal' ? 2.5 : 3.16;
    if (homaIr) indices.push(`HOMA-IR = ${homaIr} (${Number(homaIr) > homaIrCutoff ? `> ${homaIrCutoff}` : `< ${homaIrCutoff}`})`);
    if (quicki) indices.push(`QUICKI = ${quicki} (${Number(quicki) < 0.33 ? '< 0.33' : '> 0.33'})`);
    if (whtr) indices.push(`WHtR = ${whtr} (${Number(whtr) > 0.5 ? '> 0.5' : '< 0.5'})`);
    if (tgHdl) indices.push(`TG/HDL = ${tgHdl} (${Number(tgHdl) > 2.2 ? '> 2.2' : '< 2.2'})`);
    if (nonHdl) indices.push(`Non-HDL = ${nonHdl} mg/dL (${Number(nonHdl) > 145 ? '> 145' : '< 145'})`);
    if (astAlt) indices.push(`AST/ALT = ${astAlt} (${Number(astAlt) > 1 ? '> 1' : '< 1'})`);
    if (lhFsh) indices.push(`LH/FSH = ${lhFsh} (${Number(lhFsh) > 0.3 ? '> 0.3' : '< 0.3'})`);

    const indicesStr = indices.length > 0 ? indices.join(', ') : 'Chưa có đủ dữ liệu';
    
    return `Trẻ ${genderStr}, ${ageStr}, hiện có chỉ số BMI ${bmiStr}${bmiZ ? ` (Z-score: ${bmiZ})` : ''}, Vòng bụng ${waistStr}. Hiện tại có các chỉ số như sau: ${indicesStr}. Ý nghĩa: ${doctorNote || '...'}. Ngày khám: ${examDate}.`;
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generateConclusion());
    alert('Đã copy kết luận!');
  };

  const bgColor = gender === 'male' ? 'bg-[#D0D9E4]' : 'bg-[#FCE4EC]';
  const accentColor = gender === 'male' ? 'text-blue-600' : 'text-pink-600';
  const ringColor = gender === 'male' ? 'ring-blue-500' : 'ring-pink-500';

  return (
    <div className={`min-h-screen ${bgColor} p-2 md:p-6 font-sans antialiased transition-colors duration-300`}>
      <div className="max-w-7xl mx-auto">
        <header className="mb-6 text-center">
          <h1 className={`text-2xl md:text-3xl font-bold ${accentColor} mb-1 tracking-tight`}>ỨNG DỤNG TAH KSCN 1.0</h1>
          <p className="text-gray-500 text-sm font-medium">ThS. BS. Đỗ Tiến Sơn</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* LEFT COLUMN: INPUTS */}
          <div className="flex flex-col gap-5">
            {/* THÔNG TIN CHUNG */}
            <div className="bg-white p-4 md:p-5 rounded-2xl shadow-sm border border-gray-200/60">
              <h2 className={`text-lg font-semibold ${accentColor} mb-4 flex items-center gap-2`}>
                <Info className="w-5 h-5" /> Thông tin chung
              </h2>

              {!isAgeValid && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-4 text-sm" role="alert">
                  <strong className="font-semibold">Ngoài khoảng tuổi! </strong>
                  <span>Ứng dụng chỉ dành cho trẻ từ 1 đến 19 tuổi. Các trường nhập liệu đã bị khóa.</span>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-2">
                <div className="col-span-1 md:col-span-2 flex gap-3 mb-1">
                  <button
                    onClick={() => setGender('male')}
                    className={`flex-1 py-1.5 rounded-xl font-medium transition-all text-sm shadow-sm ${gender === 'male' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                  >
                    Nam
                  </button>
                  <button
                    onClick={() => setGender('female')}
                    className={`flex-1 py-1.5 rounded-xl font-medium transition-all text-sm shadow-sm ${gender === 'female' ? 'bg-pink-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                  >
                    Nữ
                  </button>
                </div>
                
                <div className="col-span-1 md:col-span-2">
                  <label className="mb-1 block text-xs font-semibold text-gray-700">Tuổi (chọn 1 trong 2 cách nhập)</label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-gray-50/50 p-3 rounded-xl border border-gray-200/60">
                    <div>
                      <div className="flex flex-col mb-3">
                        <label className="mb-1 text-xs font-medium text-gray-500 uppercase tracking-wider">Cách 1: Theo ngày sinh</label>
                        <div className="flex gap-2 mb-2">
                          <input type="number" value={dobD} onChange={handleDayChange(setDobD)} placeholder="Ngày" className={`w-1/3 px-3 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:${ringColor} shadow-sm text-sm`} />
                          <input type="number" value={dobM} onChange={handleMonthChange(setDobM)} placeholder="Tháng" className={`w-1/3 px-3 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:${ringColor} shadow-sm text-sm`} />
                          <input type="number" value={dobY} onChange={handleYearChange(setDobY)} placeholder="Năm" className={`w-1/3 px-3 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:${ringColor} shadow-sm text-sm`} />
                        </div>
                        <label className="mb-1 text-xs font-medium text-gray-500 uppercase tracking-wider">Ngày khám</label>
                        <div className="flex gap-2">
                          <input type="number" value={examD} onChange={handleDayChange(setExamD)} placeholder="Ngày" className={`w-1/3 px-3 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:${ringColor} shadow-sm text-sm`} />
                          <input type="number" value={examM} onChange={handleMonthChange(setExamM)} placeholder="Tháng" className={`w-1/3 px-3 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:${ringColor} shadow-sm text-sm`} />
                          <input type="number" value={examY} onChange={handleYearChange(setExamY)} placeholder="Năm" className={`w-1/3 px-3 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:${ringColor} shadow-sm text-sm`} />
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col gap-3">
                      <div className="flex flex-col">
                        <label className="mb-1 text-xs font-medium text-gray-500 uppercase tracking-wider">Cách 2: Nhập thủ công</label>
                        <div className="flex gap-2">
                          <div className="flex-1">
                            <input
                              type="number"
                              value={manualYears}
                              onChange={e => setManualYears(e.target.value)}
                              placeholder="Tuổi"
                              className={`w-full px-3 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:${ringColor} shadow-sm text-sm`}
                            />
                          </div>
                          <div className="flex-1">
                            <input
                              type="number"
                              value={manualMonths}
                              onChange={e => setManualMonths(e.target.value)}
                              placeholder="Tháng"
                              className={`w-full px-3 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:${ringColor} shadow-sm text-sm`}
                            />
                          </div>
                        </div>
                      </div>
                      <div className={`flex-1 border p-3 rounded-xl flex flex-col justify-center items-center shadow-sm ${gender === 'male' ? 'bg-blue-50/50 border-blue-100' : 'bg-pink-50/50 border-pink-100'}`}>
                        <span className={`text-xs font-semibold uppercase tracking-wider mb-1 ${gender === 'male' ? 'text-blue-600' : 'text-pink-600'}`}>Tuổi tính toán</span>
                        <span className={`text-xl font-bold ${gender === 'male' ? 'text-blue-900' : 'text-pink-900'}`}>
                          {finalAge.years !== '' ? `${finalAge.years} tuổi ${finalAge.months} tháng` : '--'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* NHÂN TRẮC HỌC */}
            <div className="bg-white p-4 md:p-5 rounded-2xl shadow-sm border border-gray-200/60">
              <h3 className="text-md font-semibold text-gray-800 mb-3">Nhân trắc học</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <InputGroup label="Chiều cao" value={height} onValueChange={setHeight} unit="cm" disabled={isLocked} />
                <InputGroup label="Cân nặng" value={weight} onValueChange={setWeight} unit="kg" disabled={isLocked} />
                
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
                      placeholder="Nhập Z-score..."
                      disabled={isLocked}
                      className={`flex-1 px-3 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:${ringColor} shadow-sm transition-shadow text-sm ${calculatedBmiZ !== null ? 'bg-gray-50 text-gray-500' : ''} ${isLocked ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : ''}`}
                      readOnly={calculatedBmiZ !== null}
                    />
                  </div>
                  {calculatedBmiZ !== null && (
                    <span className="text-xs text-green-600 mt-1 font-medium">
                      *Tự động tính theo WHO (LMS)
                    </span>
                  )}
                </div>
                <InputGroup label="Vòng eo" value={waist} onValueChange={setWaist} unit="cm" disabled={isLocked} />
                
                <div className="flex flex-col mb-3">
                  <label className="mb-1 text-xs font-semibold text-gray-700">Giai đoạn Tanner</label>
                  <select
                    value={tanner}
                    onChange={e => setTanner(e.target.value as 'prepubertal' | 'pubertal')}
                    disabled={isLocked}
                    className={`px-3 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:${ringColor} shadow-sm text-sm ${isLocked ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : ''}`}
                  >
                    <option value="prepubertal">Trước dậy thì (Tanner I)</option>
                    <option value="pubertal">Đang dậy thì (Tanner II-IV)</option>
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
                    <label htmlFor="menstrual" className="ml-2 text-sm font-medium text-gray-700">Rối loạn kinh nguyệt</label>
                  </div>
                )}
              </div>
            </div>

            {/* XÉT NGHIỆM */}
            <div className="bg-white p-4 md:p-5 rounded-2xl shadow-sm border border-gray-200/60">
              <h3 className="text-md font-semibold text-gray-800 mb-3">Xét nghiệm</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <InputGroup label="Insulin (nhịn ăn) (FI)" value={fi} onValueChange={setFi} unit="µU/mL" disabled={isLocked} />
                <InputGroup
                  label="Glucose lúc đói (FG)"
                  value={fg}
                  onValueChange={setFg}
                  unitOptions={['mmol/L', 'mg/dL']}
                  currentUnit={fgUnit}
                  onUnitToggle={() => setFgUnit(prev => prev === 'mmol/L' ? 'mg/dL' : 'mmol/L')}
                  disabled={isLocked}
                />
                <InputGroup
                  label="HbA1c"
                  value={hba1c}
                  onValueChange={setHba1c}
                  unitOptions={['%', 'mmol/mol']}
                  currentUnit={hba1cUnit}
                  onUnitToggle={() => setHba1cUnit(prev => prev === '%' ? 'mmol/mol' : '%')}
                  disabled={isLocked}
                />
                <InputGroup label="ALT" value={alt} onValueChange={setAlt} unit="U/L" disabled={isLocked} />
                <InputGroup label="AST" value={ast} onValueChange={setAst} unit="U/L" disabled={isLocked} />
                
                <InputGroup
                  label="Triglyceride (TG)"
                  value={tg}
                  onValueChange={setTg}
                  unitOptions={['mmol/L', 'mg/dL']}
                  currentUnit={lipidUnit}
                  onUnitToggle={() => setLipidUnit(prev => prev === 'mmol/L' ? 'mg/dL' : 'mmol/L')}
                  disabled={isLocked}
                />
                <InputGroup label="HDL-C" value={hdl} onValueChange={setHdl} unit={lipidUnit} disabled={isLocked} />
                <InputGroup label="Cholesterol TP (TC)" value={tc} onValueChange={setTc} unit={lipidUnit} disabled={isLocked} />
                <InputGroup label="LDL-C" value={ldl} onValueChange={setLdl} unit={lipidUnit} disabled={isLocked} />

                {gender === 'female' && (
                  <>
                    <InputGroup label="LH" value={lh} onValueChange={setLh} unit="IU/L" disabled={isLocked} />
                    <InputGroup label="FSH" value={fsh} onValueChange={setFsh} unit="IU/L" disabled={isLocked} />
                  </>
                )}
              </div>
            </div>

            {/* HUYẾT ÁP */}
            <div className="bg-white p-4 md:p-5 rounded-2xl shadow-sm border border-gray-200/60">
              <h3 className="text-md font-semibold text-gray-800 mb-3">Huyết áp</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <InputGroup label="Tâm thu (SBP)" value={sbp} onValueChange={setSbp} unit="mmHg" disabled={isLocked} />
                <InputGroup label="Tâm trương (DBP)" value={dbp} onValueChange={setDbp} unit="mmHg" disabled={isLocked} />
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: RESULTS */}
          <div className="flex flex-col gap-5">
            <div className="bg-white p-5 md:p-6 rounded-2xl shadow-sm border border-gray-200/60 flex-1">
              <h2 className={`text-lg font-semibold ${accentColor} mb-5`}>Kết quả phân tích</h2>
              
              <div className="grid grid-cols-2 gap-4">
                <ResultCard title="BMI" value={bmi} unit="kg/m²" />
                <ResultCard
                  title="WHtR"
                  value={whtr}
                  status={Number(whtr) > 0.5 ? 'Béo phì trung tâm' : 'Bình thường'}
                  statusColor={Number(whtr) > 0.5 ? 'text-red-600' : 'text-green-600'}
                  description={Number(whtr) > 0.5 ? '> 0.5: Tăng nguy cơ HC chuyển hóa' : ''}
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
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Đường huyết & Kháng Insulin</h3>
                  
                  {diabetesStatus && (
                    <div className="mb-4">
                      <ResultCard 
                        title="Tình trạng Đường huyết" 
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
                      <div className="text-[10px] text-gray-400 mt-1">{tanner === 'prepubertal' ? '(> 2.5 ~ kháng insulin)' : '(> 3.16 ~ kháng insulin)'}</div>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg text-center flex flex-col items-center">
                      <div className="text-xs text-gray-500">QUICKI</div>
                      <div className="text-xl font-bold flex items-center gap-1">
                        {quicki}
                        {Number(quicki) < 0.33 ? <TrendingDown className="w-4 h-4 text-red-500" /> : <Minus className="w-4 h-4 text-green-500" />}
                      </div>
                      <div className="text-[10px] text-gray-400 mt-1">(&lt; 0.33 ~ kháng insulin)</div>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg text-center flex flex-col items-center">
                      <div className="text-xs text-gray-500">FGIR</div>
                      <div className="text-xl font-bold flex items-center gap-1">
                        {fgir}
                        {Number(fgir) < 7 ? <TrendingDown className="w-4 h-4 text-red-500" /> : <Minus className="w-4 h-4 text-green-500" />}
                      </div>
                      <div className="text-[10px] text-gray-400 mt-1">(&lt; 7 ~ kháng insulin)</div>
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
                    title="HbA1c Quy đổi"
                    value={hba1cConverted}
                    unit={hba1cUnit === '%' ? 'mmol/mol' : '%'}
                  />
                </div>
              )}

              {(alt !== '' || astAlt !== '') && (
                <div className="mt-4">
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Chức năng Gan</h3>
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
                  {liverStatus && liverStatus.status !== 'Bình thường' && (
                    <div className={`p-3 rounded-lg border ${liverStatus.color.replace('text', 'border').replace('600', '200')} ${liverStatus.color.replace('text', 'bg').replace('600', '50')}`}>
                      <div className={`font-semibold ${liverStatus.color}`}>{liverStatus.status}</div>
                      <div className="text-sm text-gray-700 mt-1">{liverStatus.desc}</div>
                    </div>
                  )}
                </div>
              )}

              {(tgHdl !== '' || nonHdl !== '') && (
                <div className="mt-4">
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Mỡ máu</h3>
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
                        {nonHdl} <span className="text-xs">mg/dL</span>
                        {Number(nonHdl) > 145 ? <TrendingUp className="w-4 h-4 text-red-500" /> : <Minus className="w-4 h-4 text-green-500" />}
                      </div>
                    </div>
                  </div>
                  {lipidStatus && lipidStatus.status !== 'Bình thường' && (
                    <div className={`p-3 rounded-lg border ${lipidStatus.color.replace('text', 'border').replace('600', '200')} ${lipidStatus.color.replace('text', 'bg').replace('600', '50')}`}>
                      <div className={`font-semibold ${lipidStatus.color}`}>{lipidStatus.status}</div>
                      <div className="text-sm text-gray-700 mt-1">{lipidStatus.desc}</div>
                    </div>
                  )}
                  {Number(nonHdl) > 145 && (
                    <div className="p-3 mt-2 rounded-lg border border-red-200 bg-red-50">
                      <div className="font-semibold text-red-600">Non-HDL &gt; 145 mg/dL</div>
                      <div className="text-sm text-gray-700 mt-1">Nguy cơ cao xơ vữa động mạch.</div>
                    </div>
                  )}
                </div>
              )}

              {lhFsh !== '' && (
                <div className="mt-4">
                  <ResultCard
                    title="Nội tiết (LH/FSH)"
                    value={lhFsh}
                    status={Number(lhFsh) > 0.3 ? 'Nghi ngờ PCOS' : 'Bình thường'}
                    statusColor={Number(lhFsh) > 0.3 ? 'text-red-600' : 'text-green-600'}
                    description={Number(lhFsh) > 0.3 ? '> 0.3: Gợi ý HC buồng trứng đa nang' : ''}
                    trend={Number(lhFsh) > 0.3 ? 'up' : 'neutral'}
                  />
                </div>
              )}

              {bpEval && (
                <div className="mt-4">
                  <ResultCard
                    title="Huyết áp"
                    value={`${sbp}/${dbp}`}
                    unit="mmHg"
                    status={bpEval.status}
                    statusColor={bpEval.color}
                  />
                </div>
              )}

              <div className="mt-6">
                <label className="block mb-2 text-sm font-semibold text-gray-700">Bác sĩ đánh giá:</label>
                <textarea
                  value={doctorNote}
                  onChange={e => setDoctorNote(e.target.value)}
                  placeholder="Tình trạng hiện tại..."
                  className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:${ringColor} min-h-[80px] text-sm`}
                />
              </div>
            </div>

            {/* CONCLUSION BOX */}
            <div className="bg-white p-4 md:p-5 rounded-2xl shadow-sm border border-gray-200/60">
              <div className="flex justify-between items-center mb-3">
                <h2 className={`text-lg font-semibold ${accentColor}`}>Kết luận</h2>
                <button
                  onClick={copyToClipboard}
                  className={`flex items-center gap-1 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors shadow-sm`}
                >
                  <Copy className="w-4 h-4" /> Copy
                </button>
              </div>
              <pre className="whitespace-pre-wrap text-sm text-gray-800 bg-gray-50/50 p-4 rounded-xl border border-gray-200/60 font-sans leading-relaxed">
                {generateConclusion()}
              </pre>
            </div>
          </div>
        </div>

        {/* FOOTER & REFERENCES */}
        <footer className="mt-12 mb-8">
          <button
            onClick={() => setShowRefs(!showRefs)}
            className="flex items-center gap-2 text-gray-500 hover:text-gray-700 font-medium mx-auto"
          >
            {showRefs ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            Tài liệu tham khảo (References)
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
