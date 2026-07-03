/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Plus, Sparkles, Heart, Loader2 } from 'lucide-react';

import { UserProfile, RoutineItem, HistoryLog, Supplement, TimeOfDay, DailyRecord } from './types';
import { getRecommendations } from './data';

import Onboarding from './components/Onboarding';
import DashboardHeader from './components/DashboardHeader';
import StreakCalendar from './components/StreakCalendar';
import SupplementRecommendList from './components/SupplementRecommendList';
import RoutineChecklist from './components/RoutineChecklist';
import AddCustomModal from './components/AddCustomModal';
import EncouragementModal from './components/EncouragementModal';

export default function App() {
  // --- States ---
  const [userId, setUserId] = useState<string>('');
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [routines, setRoutines] = useState<RoutineItem[]>([]);
  const [historyLog, setHistoryLog] = useState<HistoryLog>({});
  const [recommendations, setRecommendations] = useState<Supplement[]>([]);
  const [selectedDateKey, setSelectedDateKey] = useState<string>('');
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEncouragementOpen, setIsEncouragementOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Sync and API Loading states
  const [isGeneratingRecommendations, setIsGeneratingRecommendations] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [supabaseConfigured, setSupabaseConfigured] = useState(false);
  const [isInitialLoaded, setIsInitialLoaded] = useState(false);

  // Supabase Diagnostics and Tables Check
  const [supabaseSchemaStatus, setSupabaseSchemaStatus] = useState<'healthy' | 'schema_mismatch' | 'unknown'>('unknown');
  const [supabaseMissingTables, setSupabaseMissingTables] = useState<string[]>([]);
  const [supabaseSyncErrors, setSupabaseSyncErrors] = useState<any>(null);
  const [showSupabaseGuide, setShowSupabaseGuide] = useState(false);

  // --- Dynamic recommendations fetching from Gemini API ---
  const fetchGeminiRecommendations = async (gender: 'M' | 'F', age: number) => {
    setIsGeneratingRecommendations(true);
    try {
      const res = await fetch("/api/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gender, age })
      });
      const data = await res.json();
      if (data.success && data.data && data.data.length > 0) {
        setRecommendations(data.data);
      } else {
        // Fallback to local
        setRecommendations(getRecommendations(gender, age));
      }
    } catch (error) {
      console.error("Failed to fetch dynamic recommendations:", error);
      // Fallback to local
      setRecommendations(getRecommendations(gender, age));
    } finally {
      setIsGeneratingRecommendations(false);
    }
  };

  // --- Supabase Cloud Sync helper ---
  const syncToSupabase = async (
    currentUserId: string,
    currentProfile: UserProfile | null,
    currentRoutines: RoutineItem[],
    currentHistory: HistoryLog
  ) => {
    if (!supabaseConfigured || !currentUserId || !currentProfile) return;
    setIsSyncing(true);
    try {
      const res = await fetch("/api/sync/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: currentUserId,
          profile: currentProfile,
          routines: currentRoutines,
          historyLog: currentHistory
        })
      });
      const data = await res.json();
      if (data.success) {
        console.log("Supabase synced successfully.");
        setSupabaseSyncErrors(null);
        setSupabaseSchemaStatus('healthy');
        setSupabaseMissingTables([]);
      } else {
        console.warn("Supabase sync had issues:", data.errors);
        setSupabaseSyncErrors(data.errors);
        setSupabaseSchemaStatus('schema_mismatch');
        
        // Infer missing tables from error message or keys
        const missing: string[] = [];
        if (data.errors) {
          const errMsg = JSON.stringify(data.errors).toLowerCase();
          if (errMsg.includes('profiles') || errMsg.includes('relation "profiles" does not exist')) {
            missing.push('profiles');
          }
          if (errMsg.includes('supplements') || errMsg.includes('relation "supplements" does not exist')) {
            missing.push('supplements');
          }
          if (errMsg.includes('user_routines') || errMsg.includes('relation "user_routines" does not exist')) {
            missing.push('user_routines');
          }
        }
        if (missing.length > 0) {
          setSupabaseMissingTables(prev => Array.from(new Set([...prev, ...missing])));
        }
      }
    } catch (error) {
      console.error("Supabase sync failed:", error);
    } finally {
      setIsSyncing(false);
    }
  };

  // --- Initial Load ---
  useEffect(() => {
    const initApp = async () => {
      try {
        // Generate or fetch user ID
        let storedUserId = localStorage.getItem('keepit_user_id');
        if (!storedUserId) {
          storedUserId = 'user_' + Math.random().toString(36).substring(2, 15);
          localStorage.setItem('keepit_user_id', storedUserId);
        }
        setUserId(storedUserId);

        // Fetch Supabase configuration status from backend
        let isConfigured = false;
        try {
          const configRes = await fetch("/api/config");
          const configData = await configRes.json();
          isConfigured = !!configData.supabaseConfigured;
          setSupabaseConfigured(isConfigured);
          if (configData.schema) {
            setSupabaseSchemaStatus(configData.schema.status || 'unknown');
            setSupabaseMissingTables(configData.schema.missingTables || []);
          }
        } catch (e) {
          console.warn("Could not retrieve config from Express server:", e);
        }

        let initialProfile: UserProfile | null = null;
        let initialRoutines: RoutineItem[] = [];
        let initialHistory: HistoryLog = {};

        // If Supabase is configured, try loading state from the cloud first
        if (isConfigured) {
          try {
            const loadRes = await fetch(`/api/sync/load?userId=${storedUserId}`);
            const loadData = await loadRes.json();
            if (loadData.success && loadData.data) {
              initialProfile = loadData.data.profile;
              initialRoutines = loadData.data.routines;
              initialHistory = loadData.data.historyLog;
            }
          } catch (cloudErr) {
            console.warn("Could not load from Supabase cloud, falling back to LocalStorage:", cloudErr);
          }
        }

        // Fallback to LocalStorage if not fetched from cloud
        if (!initialProfile) {
          const storedProfile = localStorage.getItem('keepit_profile');
          if (storedProfile) {
            initialProfile = JSON.parse(storedProfile);
          }
        }
        if (!initialRoutines || initialRoutines.length === 0) {
          const storedRoutines = localStorage.getItem('keepit_routines');
          if (storedRoutines) {
            initialRoutines = JSON.parse(storedRoutines);
          }
        }
        if (!initialHistory || Object.keys(initialHistory).length === 0) {
          const storedHistory = localStorage.getItem('keepit_history');
          if (storedHistory) {
            initialHistory = JSON.parse(storedHistory);
          }
        }

        // Apply loaded states
        const todayStr = getTodayKey();
        setSelectedDateKey(todayStr);

        if (initialProfile) {
          setProfile(initialProfile);
          // Load recommendations
          fetchGeminiRecommendations(initialProfile.gender, initialProfile.age);
        }
        if (initialRoutines) {
          setRoutines(initialRoutines);
        }
        if (initialHistory) {
          setHistoryLog(initialHistory);
        }

      } catch (e) {
        console.error('Failed to initialize Keep-it app:', e);
      } finally {
        setLoading(false);
        setIsInitialLoaded(true);
      }
    };

    initApp();
  }, []);

  // --- Auto-Sync Side Effect on State Change ---
  useEffect(() => {
    if (!isInitialLoaded || !profile || !userId) return;

    // Persist locally
    localStorage.setItem('keepit_profile', JSON.stringify(profile));
    localStorage.setItem('keepit_routines', JSON.stringify(routines));
    localStorage.setItem('keepit_history', JSON.stringify(historyLog));

    // Sync to Supabase in background
    syncToSupabase(userId, profile, routines, historyLog);
  }, [profile, routines, historyLog, userId, isInitialLoaded]);

  // --- Date helper ---
  const getTodayKey = (): string => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const activeDateKey = selectedDateKey || getTodayKey();
  const selectedRecord: DailyRecord = historyLog[activeDateKey] || {};

  // --- Logic helpers ---
  const generateId = (): string => {
    return 'routine_' + Math.random().toString(36).substring(2, 11);
  };

  const getCompletionRate = (): number => {
    if (routines.length === 0) return 0;
    const checkedCount = routines.filter(r => selectedRecord[r.id]).length;
    return Math.round((checkedCount / routines.length) * 100);
  };

  const triggerConfetti = () => {
    const duration = 1.5 * 1000;
    const end = Date.now() + duration;

    (function frame() {
      confetti({
        particleCount: 5,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.8 },
        colors: ['#10b981', '#34d399', '#059669', '#6ee7b7', '#f59e0b']
      });
      confetti({
        particleCount: 5,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.8 },
        colors: ['#10b981', '#34d399', '#059669', '#6ee7b7', '#f59e0b']
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    }());
  };

  // --- Handlers ---
  const handleOnboardingComplete = async (newProfile: UserProfile) => {
    setProfile(newProfile);
    localStorage.setItem('keepit_profile', JSON.stringify(newProfile));

    // Populate with high-quality local recommendations instantly
    const localRecommendations = getRecommendations(newProfile.gender, newProfile.age);
    setRecommendations(localRecommendations);

    const initialRoutines: RoutineItem[] = localRecommendations.map(rec => ({
      id: generateId(),
      name: rec.name,
      timeOfDay: rec.defaultTime,
      dosage: '1캡슐',
      isCustom: false,
      createdAt: new Date().toISOString()
    }));

    setRoutines(initialRoutines);
    localStorage.setItem('keepit_routines', JSON.stringify(initialRoutines));
    
    // Clear today's check record for fresh state
    const todayKey = getTodayKey();
    const updatedHistory = { ...historyLog, [todayKey]: {} };
    setHistoryLog(updatedHistory);
    localStorage.setItem('keepit_history', JSON.stringify(updatedHistory));
    setSelectedDateKey(todayKey);

    // Fetch dynamic, highly personalized recommendations from Gemini API
    await fetchGeminiRecommendations(newProfile.gender, newProfile.age);
  };

  const handleToggleCheck = (routineId: string) => {
    const isChecked = !selectedRecord[routineId];
    
    const updatedRecord = {
      ...selectedRecord,
      [routineId]: isChecked
    };

    const updatedHistory = {
      ...historyLog,
      [activeDateKey]: updatedRecord
    };

    setHistoryLog(updatedHistory);

    // Compute if ALL active routines are now completed
    const checkedCount = routines.filter(r => updatedRecord[r.id]).length;
    const allCompletedNow = routines.length > 0 && checkedCount === routines.length;

    if (allCompletedNow && isChecked) {
      triggerConfetti();
      setIsEncouragementOpen(true);
    }
  };

  const handleAddRecommendSupplement = (supplement: Supplement) => {
    if (routines.some(r => r.name === supplement.name)) return;

    const newItem: RoutineItem = {
      id: generateId(),
      name: supplement.name,
      timeOfDay: supplement.defaultTime,
      dosage: '1캡슐',
      isCustom: false,
      createdAt: new Date().toISOString()
    };

    const updated = [...routines, newItem];
    setRoutines(updated);
  };

  const handleAddCustomSupplement = (name: string, timeOfDay: TimeOfDay, dosage: string) => {
    const newItem: RoutineItem = {
      id: generateId(),
      name,
      timeOfDay,
      dosage,
      isCustom: true,
      createdAt: new Date().toISOString()
    };

    const updated = [...routines, newItem];
    setRoutines(updated);
  };

  const handleRemoveRoutine = (routineId: string) => {
    const updated = routines.filter(r => r.id !== routineId);
    setRoutines(updated);

    // Clean up record of the deleted item
    const updatedRecord = { ...selectedRecord };
    delete updatedRecord[routineId];
    
    const updatedHistory = {
      ...historyLog,
      [activeDateKey]: updatedRecord
    };
    setHistoryLog(updatedHistory);
  };

  const handleEditProfile = () => {
    // Set profile null but preserve other data so they can update details in onboarding form
    setProfile(null);
  };

  const handleResetData = () => {
    if (window.confirm('모든 기록과 프로필 데이터를 초기화하고 처음부터 다시 시작하시겠습니까?')) {
      localStorage.clear();
      setProfile(null);
      setRoutines([]);
      setHistoryLog({});
      setRecommendations([]);
      setIsAddModalOpen(false);
      setIsEncouragementOpen(false);
    }
  };

  const handleAddAllRecommendations = () => {
    if (!profile || recommendations.length === 0) return;
    let updatedRoutines = [...routines];

    recommendations.forEach(rec => {
      if (!updatedRoutines.some(r => r.name === rec.name)) {
        updatedRoutines.push({
          id: generateId(),
          name: rec.name,
          timeOfDay: rec.defaultTime,
          dosage: '1캡슐',
          isCustom: false,
          createdAt: new Date().toISOString()
        });
      }
    });

    setRoutines(updatedRoutines);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-4xl animate-bounce mb-3">💊</div>
          <p className="text-xs text-gray-400 font-bold tracking-wider">LOADING KEEP-IT...</p>
        </div>
      </div>
    );
  }

  // If user hasn't completed onboarding, show Onboarding
  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50/50">
        <Onboarding onComplete={handleOnboardingComplete} />
      </div>
    );
  }

  const completionRate = getCompletionRate();

  return (
    <div className="min-h-screen bg-gray-50/55 flex flex-col justify-between">
      <div>
        <DashboardHeader
          profile={profile}
          onEditProfile={handleEditProfile}
          onResetData={handleResetData}
          completionRate={completionRate}
          isSyncing={isSyncing}
          supabaseConfigured={supabaseConfigured}
        />

        <main className="max-w-4xl mx-auto px-4 py-8 space-y-8">
          {/* Supabase Diagnostics Panel */}
          {supabaseConfigured && (
            <div className={`border rounded-3xl p-5 transition-all ${
              supabaseSchemaStatus === 'schema_mismatch' || supabaseMissingTables.length > 0 || supabaseSyncErrors
                ? 'bg-amber-50/40 border-amber-200/80 shadow-sm shadow-amber-50'
                : 'bg-emerald-50/20 border-emerald-100 shadow-sm shadow-emerald-50/50'
            }`}>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <span className="text-xl mt-0.5">
                    {supabaseSchemaStatus === 'schema_mismatch' || supabaseMissingTables.length > 0 || supabaseSyncErrors ? '⚠️' : '☁️'}
                  </span>
                  <div>
                    <h4 className="text-xs font-black text-gray-800 flex items-center gap-1.5">
                      Supabase 클라우드 동기화 상태 진단
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${
                        supabaseSchemaStatus === 'schema_mismatch' || supabaseMissingTables.length > 0 || supabaseSyncErrors
                          ? 'bg-amber-100 text-amber-800 border-amber-200'
                          : 'bg-emerald-100 text-emerald-800 border-emerald-200'
                      }`}>
                        {supabaseSchemaStatus === 'schema_mismatch' || supabaseMissingTables.length > 0 || supabaseSyncErrors
                          ? '설정 필요 (테이블 미생성)'
                          : '동기화 활성화됨 (연결 정상)'}
                      </span>
                    </h4>
                    <p className="text-[10px] text-gray-500 font-medium mt-1">
                      {supabaseSchemaStatus === 'schema_mismatch' || supabaseMissingTables.length > 0 || supabaseSyncErrors
                        ? `Supabase 연결은 되었으나 필수 테이블이 데이터베이스에 존재하지 않습니다 (${supabaseMissingTables.join(', ') || '확인 필요'}).`
                        : 'Supabase 데이터베이스와 실시간으로 연동되어 모든 기기에서 복용 기록이 자동 저장됩니다.'}
                    </p>
                  </div>
                </div>
                
                <button
                  type="button"
                  onClick={() => setShowSupabaseGuide(!showSupabaseGuide)}
                  className={`text-xs font-bold px-3 py-1.5 rounded-xl border transition-all ${
                    supabaseSchemaStatus === 'schema_mismatch' || supabaseMissingTables.length > 0 || supabaseSyncErrors
                      ? 'bg-amber-500 hover:bg-amber-600 text-white border-transparent'
                      : 'bg-white hover:bg-gray-50 text-gray-700 border-gray-200'
                  }`}
                >
                  {showSupabaseGuide ? '가이드 닫기' : 'SQL 테이블 가이드 보기'}
                </button>
              </div>

              {/* Collapsible Supabase Guide */}
              {showSupabaseGuide && (
                <div className="mt-5 pt-4 border-t border-dashed border-gray-200 space-y-4">
                  <div className="p-3 bg-gray-900 rounded-2xl text-left font-mono text-[10px] text-gray-300 space-y-2">
                    <p className="text-emerald-400 font-bold border-b border-gray-800 pb-1.5"># Supabase SQL Editor에 아래 쿼리를 전체 복사하여 붙여넣고 실행(Run)하세요:</p>
                    <pre className="overflow-x-auto whitespace-pre leading-relaxed select-all">
{`-- 1. profiles 테이블 생성
CREATE TABLE IF NOT EXISTS public.profiles (
  id text PRIMARY KEY,
  gender text NOT NULL,
  age integer,
  age_group text,
  name text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. supplements 테이블 생성
CREATE TABLE IF NOT EXISTS public.supplements (
  id bigint PRIMARY KEY,
  name text NOT NULL,
  target_group text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. user_routines 테이블 생성
CREATE TABLE IF NOT EXISTS public.user_routines (
  id bigint PRIMARY KEY,
  user_id text REFERENCES public.profiles(id) ON DELETE CASCADE,
  supplement_id bigint REFERENCES public.supplements(id) ON DELETE CASCADE,
  is_checked boolean DEFAULT false NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS (Row Level Security) 설정 해제 또는 전체 접근 허용 정책 수립
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.supplements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_routines ENABLE ROW LEVEL SECURITY;

-- 익명/인증 접근 허용 정책 추가
CREATE POLICY "Allow public read profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Allow public insert profiles" ON public.profiles FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update profiles" ON public.profiles FOR UPDATE USING (true) WITH CHECK (true);

CREATE POLICY "Allow public read supplements" ON public.supplements FOR SELECT USING (true);
CREATE POLICY "Allow public insert supplements" ON public.supplements FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update supplements" ON public.supplements FOR UPDATE USING (true) WITH CHECK (true);

CREATE POLICY "Allow public read user_routines" ON public.user_routines FOR SELECT USING (true);
CREATE POLICY "Allow public insert user_routines" ON public.user_routines FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update user_routines" ON public.user_routines FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Allow public delete user_routines" ON public.user_routines FOR DELETE USING (true);`}
                    </pre>
                  </div>
                  <div className="flex items-center gap-1 text-[10px] text-gray-500 font-semibold bg-gray-50 p-3 rounded-xl border border-gray-100">
                    💡 <strong>Tip:</strong> 테이블 생성 쿼리를 실행한 후 페이지를 새로고침하거나 영양제를 체크하면 즉시 Supabase 클라우드에 성공적으로 자동 저장되기 시작합니다!
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Calendar Streak Tracker */}
          <StreakCalendar 
            historyLog={historyLog} 
            routines={routines} 
            selectedDateKey={activeDateKey}
            onSelectDate={setSelectedDateKey}
          />

          {/* Recommendations Header & Quick Action */}
          <section className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 border border-gray-100 rounded-3xl">
              <div className="flex items-center gap-2.5">
                <span className="p-2.5 bg-emerald-50 text-emerald-600 rounded-2xl text-sm">
                  {isGeneratingRecommendations ? (
                    <Loader2 size={16} className="animate-spin text-emerald-600" />
                  ) : (
                    "💡"
                  )}
                </span>
                <div>
                  <h4 className="text-xs font-black text-gray-800 flex items-center gap-1.5">
                    추천 영양제 간편 일괄 등록 
                    {isGeneratingRecommendations && (
                      <span className="text-[9px] text-emerald-600 bg-emerald-50 border border-emerald-100 px-1.5 py-0.5 rounded-full animate-pulse font-bold">
                        Gemini AI 분석중...
                      </span>
                    )}
                  </h4>
                  <p className="text-[10px] text-gray-500 font-medium">내 연령/성별 필수 영양제 3가지를 한 번에 내 루틴에 추가해보세요.</p>
                </div>
              </div>
              <button
                id="btn-add-all-recommendations"
                onClick={handleAddAllRecommendations}
                disabled={recommendations.length === 0}
                className="py-2.5 px-4 bg-emerald-500 hover:bg-emerald-600 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-100 transition-all text-center"
              >
                추천 영양제 전체 추가하기
              </button>
            </div>

            {/* Custom recommendations list */}
            <SupplementRecommendList
              recommendations={recommendations}
              routines={routines}
              onAddRoutine={handleAddRecommendSupplement}
            />
          </section>

          {/* Core Daily Routines */}
          <section>
            <RoutineChecklist
              routines={routines}
              todayRecord={selectedRecord}
              onToggleCheck={handleToggleCheck}
              onRemoveRoutine={handleRemoveRoutine}
              onOpenAddModal={() => setIsAddModalOpen(true)}
              selectedDateKey={activeDateKey}
            />
          </section>
        </main>
      </div>

      {/* Footer */}
      <footer className="max-w-4xl mx-auto w-full px-4 py-8 text-center border-t border-gray-100 mt-12">
        <p className="text-[10px] font-bold text-gray-400 flex items-center justify-center gap-1">
          <span>KEEP-IT 킵잇</span>
          <span>•</span>
          <span>내 또래 맞춤형 영양제 관리 파트너</span>
        </p>
        <p className="text-[9px] text-gray-400 mt-1 flex items-center justify-center gap-0.5">
          <span>Made with</span>
          <Heart size={8} className="text-rose-400 fill-rose-400" />
          <span>for a healthy life</span>
        </p>
      </footer>

      {/* Modals */}
      <AddCustomModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAddCustomSupplement}
      />

      <EncouragementModal
        isOpen={isEncouragementOpen}
        onClose={() => setIsEncouragementOpen(false)}
        streakDays={Object.keys(historyLog).length}
      />
    </div>
  );
}
