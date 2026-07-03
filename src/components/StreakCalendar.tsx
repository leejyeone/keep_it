import { Flame, Check, Trophy } from 'lucide-react';
import { HistoryLog, RoutineItem } from '../types';

interface StreakCalendarProps {
  historyLog: HistoryLog;
  routines: RoutineItem[];
}

export default function StreakCalendar({ historyLog, routines }: StreakCalendarProps) {
  // Get date string in YYYY-MM-DD format
  const formatDateKey = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Generate last 7 days
  const getLast7Days = () => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      days.push(date);
    }
    return days;
  };

  const days = getLast7Days();
  const todayKey = formatDateKey(new Date());

  // Calculate current streak
  const calculateStreak = (): number => {
    let streak = 0;
    const checkDate = new Date();
    
    // Check today first
    const todayKey = formatDateKey(checkDate);
    const todayRecord = historyLog[todayKey];
    const activeRoutinesCount = routines.length;
    
    let todayCompleted = false;
    if (activeRoutinesCount > 0 && todayRecord) {
      const checkedCount = Object.keys(todayRecord).filter(id => todayRecord[id] && routines.some(r => r.id === id)).length;
      if (checkedCount === activeRoutinesCount) {
        todayCompleted = true;
      }
    }

    if (todayCompleted) {
      streak = 1;
    }

    // Now go backwards from yesterday
    checkDate.setDate(checkDate.getDate() - 1);
    while (true) {
      const dateKey = formatDateKey(checkDate);
      const record = historyLog[dateKey];
      
      // If there are no routines, or no records, break
      if (!record || activeRoutinesCount === 0) {
        break;
      }

      // Check if all routines in history of that day were checked
      // Note: we've saved daily records. We assume 100% completion on that day means checked count >= total routines at that time
      // Let's count how many were checked.
      const checkedCount = Object.values(record).filter(Boolean).length;
      
      if (checkedCount > 0 && checkedCount >= Math.min(activeRoutinesCount, 2)) {
        streak += (streak === 0 && !todayCompleted) ? 0 : 1;
        // If we didn't complete today, yesterday starts a retrospective streak only if yesterday is complete
        if (streak === 0 && !todayCompleted) {
          streak = 1;
        }
      } else {
        break;
      }
      checkDate.setDate(checkDate.getDate() - 1);
    }

    return streak;
  };

  const currentStreak = calculateStreak();

  return (
    <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm shadow-gray-50">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
        <div>
          <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">나의 복용 기록</h3>
          <p className="text-lg font-bold text-gray-800 mt-1 flex items-center gap-1.5">
            {currentStreak > 0 ? (
              <>
                <span className="flex items-center gap-1 text-orange-500 font-extrabold font-display">
                  <Flame size={20} fill="currentColor" className="animate-pulse" />
                  {currentStreak}일 연속 킵잇!
                </span>
                <span className="text-sm text-gray-500 font-normal">건강한 습관이 쌓이고 있어요.</span>
              </>
            ) : (
              <>
                <span className="text-gray-700">오늘부터 킵잇 시작!</span>
                <span className="text-xs bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded-md">3초 체크</span>
              </>
            )}
          </p>
        </div>

        {/* Mini stats */}
        <div className="flex items-center gap-4 border-l border-gray-100 pl-4 hidden sm:flex">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Trophy size={16} />
            </div>
            <div>
              <p className="text-[10px] text-gray-400 font-bold">누적 달성일</p>
              <p className="text-xs font-mono font-bold text-gray-700">
                {Object.keys(historyLog).filter(dateKey => {
                  const record = historyLog[dateKey];
                  return record && Object.values(record).filter(Boolean).length > 0;
                }).length}일
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Week Grid */}
      <div className="grid grid-cols-7 gap-2.5">
        {days.map((date) => {
          const key = formatDateKey(date);
          const isToday = key === todayKey;
          const dayNum = date.getDate();
          const dayName = ['일', '월', '화', '수', '목', '금', '토'][date.getDay()];
          
          const record = historyLog[key];
          let status: 'empty' | 'partial' | 'full' = 'empty';
          let checkedCount = 0;
          
          if (record) {
            checkedCount = Object.keys(record).filter(id => record[id]).length;
            if (checkedCount > 0) {
              if (routines.length > 0 && checkedCount >= routines.length) {
                status = 'full';
              } else {
                status = 'partial';
              }
            }
          }

          return (
            <div 
              key={key} 
              className={`flex flex-col items-center py-2.5 px-1 rounded-2xl transition-all relative ${
                isToday 
                  ? 'bg-emerald-50/45 ring-2 ring-emerald-500/10 border border-emerald-200' 
                  : 'border border-gray-50 bg-gray-50/15'
              }`}
            >
              <span className={`text-[10px] font-bold ${isToday ? 'text-emerald-700' : 'text-gray-400'}`}>
                {dayName}
              </span>
              
              {/* Ring status indicator */}
              <div className="my-2 relative flex items-center justify-center">
                {status === 'full' ? (
                  <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-white shadow-sm shadow-emerald-100">
                    <Check size={14} strokeWidth={3.5} />
                  </div>
                ) : status === 'partial' ? (
                  <div className="w-8 h-8 rounded-full border-2 border-emerald-400 border-dashed bg-emerald-50/30 flex items-center justify-center text-emerald-600 font-mono text-[10px] font-bold">
                    {checkedCount}
                  </div>
                ) : (
                  <div className={`w-8 h-8 rounded-full border flex items-center justify-center text-xs font-semibold font-mono ${
                    isToday 
                      ? 'border-emerald-300 bg-white text-emerald-700 font-bold' 
                      : 'border-gray-200 bg-white text-gray-500'
                  }`}>
                    {dayNum}
                  </div>
                )}
              </div>

              {isToday && (
                <span className="absolute -bottom-1 px-1.5 py-0.5 bg-emerald-500 text-[8px] font-bold text-white rounded-full scale-90">
                  오늘
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
