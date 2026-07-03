import { Settings, RefreshCw, Calendar as CalendarIcon, Cloud, CloudOff, Loader2 } from 'lucide-react';
import { UserProfile } from '../types';

interface DashboardHeaderProps {
  profile: UserProfile;
  onEditProfile: () => void;
  onResetData: () => void;
  completionRate: number;
  isSyncing?: boolean;
  supabaseConfigured?: boolean;
}

export default function DashboardHeader({ 
  profile, 
  onEditProfile, 
  onResetData, 
  completionRate,
  isSyncing = false,
  supabaseConfigured = false
}: DashboardHeaderProps) {
  // Format current date in Korean: e.g. "2026년 7월 2일 목요일"
  const getFormattedDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth() + 1;
    const date = today.getDate();
    const dayNames = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];
    const day = dayNames[today.getDay()];
    return `${year}년 ${month}월 ${date}일 ${day}`;
  };

  const getProfileDescription = () => {
    const ageText = `${profile.age}세`;
    const genderText = profile.gender === 'M' ? '남성' : '여성';
    return `${ageText} ${genderText}`;
  };

  return (
    <header className="bg-white border-b border-gray-100 sticky top-0 z-30 shadow-sm shadow-gray-50/50 backdrop-blur-md bg-white/95">
      <div className="max-w-4xl mx-auto px-4 py-4 md:py-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        {/* Brand & Date */}
        <div className="flex items-center justify-between md:justify-start gap-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl" role="img" aria-label="logo">💊</span>
            <div>
              <h1 className="text-xl font-extrabold font-display tracking-tight text-gray-900 flex items-center gap-1.5">
                Keep-it <span className="text-xs bg-emerald-50 text-emerald-600 font-bold px-2 py-0.5 rounded-full">MVP</span>
              </h1>
              <p className="text-[10px] text-gray-400 font-semibold tracking-wider uppercase">SUPPLEMENT ROUTINE</p>
            </div>
          </div>
          
          <div className="h-6 w-px bg-gray-100 hidden md:block" />

          <div className="flex items-center gap-1.5 text-gray-500 text-xs font-semibold bg-gray-50/50 px-3 py-1.5 rounded-xl">
            <CalendarIcon size={14} className="text-emerald-500" />
            <span id="header-date">{getFormattedDate()}</span>
          </div>

          {/* Sync Status Badge */}
          <div className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-all">
            {supabaseConfigured ? (
              isSyncing ? (
                <div className="flex items-center gap-1 text-emerald-600 border-emerald-100 bg-emerald-50/50">
                  <Loader2 size={10} className="animate-spin" />
                  <span>동기화 중...</span>
                </div>
              ) : (
                <div className="flex items-center gap-1 text-emerald-600 border-emerald-100 bg-emerald-50/30">
                  <Cloud size={10} className="fill-emerald-600/20" />
                  <span>구름 저장 완료</span>
                </div>
              )
            ) : (
              <div className="flex items-center gap-1 text-amber-600 border-amber-100 bg-amber-50/50">
                <CloudOff size={10} />
                <span>로컬 저장 모드</span>
              </div>
            )}
          </div>
        </div>

        {/* User Info & Settings */}
        <div className="flex items-center justify-between md:justify-end gap-3">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-lg shadow-sm shadow-emerald-50">
              {profile.gender === 'M' ? '🙋‍♂️' : '🙋‍♀️'}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span id="header-username" className="text-sm font-bold text-gray-800">{profile.name} 님</span>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-100/50 px-1.5 py-0.5 rounded-md">
                  {getProfileDescription()}
                </span>
              </div>
              <div className="w-24 bg-gray-100 h-1.5 rounded-full mt-1 overflow-hidden">
                <div 
                  className="bg-emerald-500 h-full rounded-full transition-all duration-500" 
                  style={{ width: `${completionRate}%` }}
                />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              id="btn-edit-profile"
              onClick={onEditProfile}
              title="프로필 수정"
              className="p-2.5 rounded-xl border border-gray-100 hover:border-gray-200 text-gray-400 hover:text-gray-700 hover:bg-gray-50 transition-all"
            >
              <Settings size={16} />
            </button>
            <button
              id="btn-reset-all"
              onClick={onResetData}
              title="데이터 초기화"
              className="p-2.5 rounded-xl border border-gray-100 hover:border-gray-200 text-gray-400 hover:text-rose-600 hover:bg-rose-50 transition-all"
            >
              <RefreshCw size={16} />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
