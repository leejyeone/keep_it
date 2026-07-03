import { Zap, Shield, Sun, Activity, Eye, Heart, Sparkles, Droplet, Bone, Clock, Plus, Check } from 'lucide-react';
import { Supplement, RoutineItem } from '../types';

interface SupplementRecommendListProps {
  recommendations: Supplement[];
  routines: RoutineItem[];
  onAddRoutine: (supplement: Supplement) => void;
}

export default function SupplementRecommendList({ recommendations, routines, onAddRoutine }: SupplementRecommendListProps) {
  
  const getIcon = (type: string) => {
    switch (type) {
      case 'zap': return <Zap size={20} className="text-amber-500" />;
      case 'shield': return <Shield size={20} className="text-blue-500" />;
      case 'sun': return <Sun size={20} className="text-orange-500" />;
      case 'activity': return <Activity size={20} className="text-emerald-500" />;
      case 'eye': return <Eye size={20} className="text-teal-500" />;
      case 'heart': return <Heart size={20} className="text-rose-500" />;
      case 'sparkles': return <Sparkles size={20} className="text-pink-500" />;
      case 'droplet': return <Droplet size={20} className="text-red-500" />;
      case 'bone': return <Bone size={20} className="text-amber-700" />;
      case 'clock': return <Clock size={20} className="text-indigo-500" />;
      default: return <Zap size={20} className="text-emerald-500" />;
    }
  };

  const getTimeLabel = (time: string) => {
    switch (time) {
      case 'morning': return '☀️ 아침 식전/식후';
      case 'afternoon': return '🌤️ 점심 식후';
      case 'evening': return '🌙 저녁 식후/취침전';
      default: return '🕒 편할 때 언제나';
    }
  };

  const isAlreadyInRoutine = (name: string) => {
    return routines.some((r) => r.name === name);
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">내 또래 필수 추천 영양제</h3>
        <p className="text-xs text-gray-500 mt-1">성별과 연령대를 고려한 맞춤 추천 목록입니다. 원클릭으로 추가해보세요.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {recommendations.map((sup) => {
          const added = isAlreadyInRoutine(sup.name);
          return (
            <div 
              id={`recommend-card-${sup.id}`}
              key={sup.id}
              className={`bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex flex-col justify-between transition-all duration-300 ${
                added 
                  ? 'bg-gray-50/20 opacity-90' 
                  : 'hover:-translate-y-1 hover:shadow-md hover:shadow-gray-100 hover:border-gray-200'
              }`}
            >
              <div>
                {/* Header */}
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2 bg-gray-50 rounded-xl">
                    {getIcon(sup.iconType)}
                  </div>
                  <span className="text-[10px] font-bold text-gray-400 bg-gray-50 px-2.5 py-1 rounded-lg">
                    {getTimeLabel(sup.defaultTime)}
                  </span>
                </div>

                {/* Info */}
                <h4 className="font-extrabold text-base text-gray-900">{sup.name}</h4>
                <p className="text-xs text-gray-500 mt-1.5 leading-relaxed font-medium">
                  {sup.description}
                </p>

                {/* Benefits */}
                <ul className="mt-4 space-y-1.5 border-t border-gray-50 pt-3">
                  {sup.benefits.map((benefit, idx) => (
                    <li key={idx} className="text-[10px] text-gray-600 flex items-start gap-1 font-medium">
                      <span className="text-emerald-500 font-bold">•</span>
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Action Button */}
              <button
                id={`btn-add-recommend-${sup.id}`}
                onClick={() => !added && onAddRoutine(sup)}
                disabled={added}
                className={`w-full mt-5 py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  added
                    ? 'bg-gray-100 text-gray-400 cursor-default'
                    : 'bg-emerald-50 hover:bg-emerald-500 text-emerald-700 hover:text-white border border-emerald-100 hover:border-emerald-500 shadow-sm shadow-emerald-50'
                }`}
              >
                {added ? (
                  <>
                    <Check size={12} strokeWidth={3} />
                    내 루틴에 추가됨
                  </>
                ) : (
                  <>
                    <Plus size={12} strokeWidth={3} />
                    내 루틴에 추가
                  </>
                )}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
