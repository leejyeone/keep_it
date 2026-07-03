import { useState, FormEvent } from 'react';
import { User, Sparkles, ChevronRight, Check } from 'lucide-react';
import { Gender, UserProfile } from '../types';

interface OnboardingProps {
  onComplete: (profile: UserProfile) => void;
}

export default function Onboarding({ onComplete }: OnboardingProps) {
  const [gender, setGender] = useState<Gender | null>(null);
  const [age, setAge] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [error, setError] = useState<string>('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!gender) {
      setError('성별을 선택해주세요.');
      return;
    }
    
    const parsedAge = parseInt(age, 10);
    if (!age || isNaN(parsedAge) || parsedAge < 1 || parsedAge > 120) {
      setError('올바른 나이(1~120세)를 입력해주세요.');
      return;
    }
    
    const finalName = name.trim() || "사용자";
    onComplete({
      gender,
      age: parsedAge,
      name: finalName
    });
  };

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-4">
      <div 
        id="onboarding-card"
        className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-gray-100 p-8 relative overflow-hidden transition-all"
      >
        {/* Background accent blobs */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-full blur-3xl -mr-8 -mt-8 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-teal-50 rounded-full blur-3xl -ml-8 -mb-8 pointer-events-none" />

        {/* Logo and Tagline */}
        <div className="text-center mb-8 relative z-10">
          <div className="inline-flex items-center justify-center p-3 bg-emerald-50 rounded-2xl mb-4 animate-float">
            <span className="text-3xl">💊</span>
          </div>
          <h1 className="text-3xl font-bold font-display tracking-tight text-gray-900 flex items-center justify-center gap-1.5">
            Keep-it <span className="text-emerald-500 text-2xl font-semibold">킵잇</span>
          </h1>
          <p className="text-sm text-gray-500 mt-2 font-medium">
            내 또래 맞춤형 영양제 추천부터 3초 컷 루틴 체크까지
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
          {/* Name input */}
          <div className="space-y-2">
            <label id="label-name" className="text-xs font-semibold uppercase tracking-wider text-gray-400 block">
              이름 (닉네임)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                <User size={18} />
              </div>
              <input
                id="input-name"
                type="text"
                placeholder="이름을 입력해주세요 (선택)"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setError('');
                }}
                className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all text-sm font-medium"
              />
            </div>
          </div>

          {/* Gender selection */}
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-gray-400 block">
              성별
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                id="btn-gender-m"
                type="button"
                onClick={() => {
                  setGender('M');
                  setError('');
                }}
                className={`py-4 px-6 rounded-2xl border text-sm font-semibold transition-all flex flex-col items-center gap-2 ${
                  gender === 'M'
                    ? 'border-emerald-500 bg-emerald-50/50 text-emerald-700 shadow-sm shadow-emerald-100'
                    : 'border-gray-100 bg-gray-50/50 text-gray-600 hover:border-gray-200 hover:bg-gray-50'
                }`}
              >
                <span className="text-2xl">🙋‍♂️</span>
                <span>남성</span>
                {gender === 'M' && (
                  <span className="absolute top-2 right-2 p-0.5 bg-emerald-500 text-white rounded-full">
                    <Check size={10} strokeWidth={3} />
                  </span>
                )}
              </button>

              <button
                id="btn-gender-f"
                type="button"
                onClick={() => {
                  setGender('F');
                  setError('');
                }}
                className={`py-4 px-6 rounded-2xl border text-sm font-semibold transition-all flex flex-col items-center gap-2 relative ${
                  gender === 'F'
                    ? 'border-emerald-500 bg-emerald-50/50 text-emerald-700 shadow-sm shadow-emerald-100'
                    : 'border-gray-100 bg-gray-50/50 text-gray-600 hover:border-gray-200 hover:bg-gray-50'
                }`}
              >
                <span className="text-2xl">🙋‍♀️</span>
                <span>여성</span>
                {gender === 'F' && (
                  <span className="absolute top-2 right-2 p-0.5 bg-emerald-500 text-white rounded-full">
                    <Check size={10} strokeWidth={3} />
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Age input (Integer) */}
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-gray-400 block">
              나이 (만 나이)
            </label>
            <div className="relative">
              <input
                id="input-age"
                type="number"
                min="1"
                max="120"
                placeholder="예: 27"
                value={age}
                onChange={(e) => {
                  setAge(e.target.value);
                  setError('');
                }}
                className="w-full px-4 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all text-sm font-medium"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-gray-400">
                세
              </span>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div id="error-message" className="text-xs font-medium text-rose-500 text-center bg-rose-50 border border-rose-100 rounded-xl py-2 px-3">
              ⚠️ {error}
            </div>
          )}

          {/* Submit button */}
          <button
            id="btn-submit-onboarding"
            type="submit"
            className="w-full bg-gray-900 hover:bg-emerald-600 hover:scale-[1.01] text-white font-semibold py-4 px-6 rounded-2xl shadow-lg shadow-gray-200 hover:shadow-emerald-100 transition-all duration-300 flex items-center justify-center gap-2 text-sm"
          >
            <Sparkles size={16} />
            <span>맞춤 루틴 생성하기</span>
            <ChevronRight size={16} />
          </button>
        </form>
      </div>
    </div>
  );
}
