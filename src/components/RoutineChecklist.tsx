import { Trash2, Plus, CheckCircle2, Circle } from 'lucide-react';
import { RoutineItem, DailyRecord, TimeOfDay } from '../types';

interface RoutineChecklistProps {
  routines: RoutineItem[];
  todayRecord: DailyRecord;
  onToggleCheck: (routineId: string) => void;
  onRemoveRoutine: (routineId: string) => void;
  onOpenAddModal: () => void;
}

export default function RoutineChecklist({
  routines,
  todayRecord,
  onToggleCheck,
  onRemoveRoutine,
  onOpenAddModal
}: RoutineChecklistProps) {

  // Group routines by time of day
  const groupRoutines = () => {
    const groups: { [key in TimeOfDay]: RoutineItem[] } = {
      morning: [],
      afternoon: [],
      evening: [],
      any: []
    };
    
    routines.forEach(item => {
      groups[item.timeOfDay].push(item);
    });
    
    return groups;
  };

  const grouped = groupRoutines();

  const getTimeHeader = (time: TimeOfDay) => {
    switch (time) {
      case 'morning': return { label: '아침 루틴', emoji: '☀️', color: 'text-amber-500 bg-amber-50 border-amber-100/35' };
      case 'afternoon': return { label: '점심 루틴', emoji: '🌤️', color: 'text-orange-500 bg-orange-50 border-orange-100/35' };
      case 'evening': return { label: '저녁 루틴', emoji: '🌙', color: 'text-indigo-500 bg-indigo-50 border-indigo-100/35' };
      default: return { label: '언제나 편하게', emoji: '🕒', color: 'text-emerald-500 bg-emerald-50 border-emerald-100/35' };
    }
  };

  const hasRoutines = routines.length > 0;

  return (
    <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm shadow-gray-50/50">
      {/* Header and Add button */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">오늘의 영양제 체크리스트</h3>
          <p className="text-xs text-gray-500 mt-1">오늘 섭취한 영양제를 누르면 3초 만에 기록이 완료됩니다.</p>
        </div>
        
        <button
          id="btn-open-add-routine"
          onClick={onOpenAddModal}
          className="py-2 px-3.5 bg-gray-900 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1 hover:scale-[1.02]"
        >
          <Plus size={14} strokeWidth={2.5} />
          영양제 추가
        </button>
      </div>

      {!hasRoutines ? (
        /* Empty State */
        <div id="checklist-empty-state" className="flex flex-col items-center justify-center py-12 px-4 text-center border-2 border-dashed border-gray-100 rounded-2xl bg-gray-50/20">
          <span className="text-4xl mb-3 animate-float">🥣</span>
          <h4 className="font-bold text-sm text-gray-800">등록된 영양제 루틴이 없어요</h4>
          <p className="text-xs text-gray-400 mt-1.5 max-w-xs leading-relaxed">
            상단의 내 또래 추천 영양제를 추가하거나, <strong className="text-emerald-600">영양제 추가</strong> 버튼을 눌러 직접 나만의 복용 루틴을 만들어보세요!
          </p>
          <button
            id="btn-empty-add"
            onClick={onOpenAddModal}
            className="mt-4 text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 border border-emerald-200 hover:border-emerald-300 py-1.5 px-3 rounded-lg"
          >
            <Plus size={12} strokeWidth={2.5} />
            직접 루틴 추가하기
          </button>
        </div>
      ) : (
        /* Render grouped routines */
        <div className="space-y-6">
          {(['morning', 'afternoon', 'evening', 'any'] as TimeOfDay[]).map(timeKey => {
            const list = grouped[timeKey];
            if (list.length === 0) return null;
            const header = getTimeHeader(timeKey);

            return (
              <div key={timeKey} className="space-y-3">
                {/* Section header */}
                <div className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-lg border ${header.color}`}>
                  <span>{header.emoji}</span>
                  <span>{header.label}</span>
                </div>

                {/* Items List */}
                <div className="space-y-2.5">
                  {list.map((item) => {
                    const isChecked = !!todayRecord[item.id];

                    return (
                      <div
                        id={`routine-row-${item.id}`}
                        key={item.id}
                        className={`group relative flex items-center justify-between p-4 rounded-2xl border transition-all duration-200 ${
                          isChecked
                            ? 'border-emerald-100 bg-emerald-50/15'
                            : 'border-gray-100 hover:border-gray-200 bg-white'
                        }`}
                      >
                        {/* Left Side (Checkbox + Info) */}
                        <div 
                          className="flex items-center gap-3.5 cursor-pointer flex-1 select-none"
                          onClick={() => onToggleCheck(item.id)}
                        >
                          <div className="shrink-0 transition-transform active:scale-95 duration-100">
                            {isChecked ? (
                              <CheckCircle2 size={24} className="text-emerald-500 fill-emerald-50" />
                            ) : (
                              <Circle size={24} className="text-gray-300 group-hover:text-emerald-400 transition-colors" />
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span 
                                id={`routine-name-${item.id}`}
                                className={`text-sm font-extrabold transition-all truncate ${
                                  isChecked 
                                    ? 'text-gray-400 line-through' 
                                    : 'text-gray-800'
                                }`}
                              >
                                {item.name}
                              </span>
                              
                              {item.isCustom && (
                                <span className="text-[9px] font-bold text-gray-400 bg-gray-50 border border-gray-100 px-1.5 py-0.5 rounded-md">
                                  My
                                </span>
                              )}
                            </div>
                            
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-[10px] text-gray-400 font-mono">
                                🥣 {item.dosage}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Right Side (Status Indicator & Actions) */}
                        <div className="flex items-center gap-2 pl-4">
                          <button
                            id={`btn-toggle-row-${item.id}`}
                            onClick={() => onToggleCheck(item.id)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                              isChecked
                                ? 'bg-emerald-500 text-white shadow-sm shadow-emerald-100'
                                : 'bg-gray-50 hover:bg-emerald-50 text-gray-500 hover:text-emerald-700'
                            }`}
                          >
                            {isChecked ? '먹었어요!' : '먹기'}
                          </button>

                          <button
                            id={`btn-remove-row-${item.id}`}
                            onClick={() => onRemoveRoutine(item.id)}
                            title="루틴 삭제"
                            className="p-2 rounded-xl text-gray-300 hover:text-rose-500 hover:bg-rose-50 transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
