import { Trophy, X, Sparkles, Heart } from 'lucide-react';

interface EncouragementModalProps {
  isOpen: boolean;
  onClose: () => void;
  streakDays: number;
}

export default function EncouragementModal({ isOpen, onClose, streakDays }: EncouragementModalProps) {
  if (!isOpen) return null;

  const encouragementQuotes = [
    "꾸준함은 가장 정직한 영양소입니다! 오늘도 멋지게 해내셨어요.",
    "나를 위한 3초의 투자, 건강한 내일의 활력으로 돌아옵니다.",
    "오늘 챙겨 먹은 영양제들이 자는 동안 당신의 면역력을 든든히 지켜줄 거예요.",
    "습관이 몸을 만듭니다. 벌써 이만큼이나 해내고 계시네요!",
    "작은 실천이 모여 큰 건강을 만듭니다. 내일도 기분 좋게 킵잇 해요!",
    "건강을 향한 지름길은 없습니다. 매일 체크하는 당신이 오늘의 챔피언!"
  ];

  // Pick a random encouragement quote based on streakDays or current date
  const randomQuoteIndex = streakDays % encouragementQuotes.length;
  const quote = encouragementQuotes[randomQuoteIndex];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-gray-900/40 backdrop-blur-md"
        onClick={onClose}
      />

      {/* Card Content */}
      <div 
        id="encouragement-modal"
        className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-gray-100 p-8 text-center relative z-10 overflow-hidden animate-float-short"
      >
        {/* Floating elements inside modal */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-full blur-3xl -mr-12 -mt-12 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-amber-50 rounded-full blur-3xl -ml-12 -mb-12 pointer-events-none" />

        <button 
          id="btn-close-encouragement"
          onClick={onClose} 
          className="absolute right-5 top-5 p-1.5 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-all"
        >
          <X size={18} />
        </button>

        {/* Big Celebration Icon */}
        <div className="relative inline-flex items-center justify-center p-5 bg-gradient-to-tr from-emerald-100 to-teal-50 text-emerald-600 rounded-3xl mb-5 animate-bounce">
          <Trophy size={40} className="stroke-emerald-600 fill-emerald-50" />
          <span className="absolute -top-1 -right-1 text-base">🎉</span>
          <span className="absolute -bottom-1 -left-1 text-base">🌟</span>
        </div>

        {/* Headings */}
        <h3 className="text-2xl font-black text-gray-900 tracking-tight">
          오늘의 영양제 복용 완료! 🥳
        </h3>
        
        <p className="text-xs font-bold text-emerald-600 mt-2 bg-emerald-50 border border-emerald-100/50 inline-block px-3.5 py-1 rounded-full">
          {streakDays > 0 ? `현재 🔥 ${streakDays}일째 완벽히 지속 중!` : '첫 시작을 완벽하게 끝마쳤어요!'}
        </p>

        {/* Divider */}
        <div className="w-10 h-1 bg-emerald-500 rounded-full mx-auto my-5" />

        {/* Quote */}
        <div className="bg-gray-50/50 rounded-2xl p-4 border border-gray-100/50 mb-6 relative">
          <span className="absolute -top-3 left-4 text-xs font-bold text-gray-400 bg-white px-2">
            오늘의 킵잇 한마디
          </span>
          <p className="text-xs text-gray-600 leading-relaxed font-semibold italic">
            "{quote}"
          </p>
        </div>

        <div className="flex flex-col gap-2">
          {/* Action button */}
          <button
            id="btn-confirm-encouragement"
            onClick={onClose}
            className="w-full py-3.5 px-6 bg-gray-900 hover:bg-emerald-600 text-white font-bold text-sm rounded-2xl shadow-lg shadow-gray-200 hover:shadow-emerald-100 transition-all flex items-center justify-center gap-2"
          >
            <Sparkles size={16} />
            완료하고 킵잇하기
          </button>
          
          <div className="flex items-center justify-center gap-1 text-[10px] text-gray-400 mt-1 font-semibold">
            <Heart size={10} className="text-rose-400 fill-rose-400" />
            <span>매일 3초, 건강한 루틴의 힘</span>
          </div>
        </div>
      </div>
    </div>
  );
}
