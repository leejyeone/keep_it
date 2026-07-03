import { useState, FormEvent } from 'react';
import { X, Plus, AlertCircle } from 'lucide-react';
import { TimeOfDay } from '../types';

interface AddCustomModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (name: string, timeOfDay: TimeOfDay, dosage: string) => void;
}

export default function AddCustomModal({ isOpen, onClose, onAdd }: AddCustomModalProps) {
  const [name, setName] = useState('');
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>('any');
  const [dosage, setDosage] = useState('1캡슐');
  const [customDosage, setCustomDosage] = useState('');
  const [useCustomDosage, setUseCustomDosage] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('영양제 이름을 입력해주세요.');
      return;
    }

    const finalDosage = useCustomDosage ? customDosage.trim() : dosage;
    if (useCustomDosage && !finalDosage) {
      setError('섭취량을 입력해주세요.');
      return;
    }

    onAdd(name.trim(), timeOfDay, finalDosage || '1알');
    
    // Reset fields
    setName('');
    setTimeOfDay('any');
    setDosage('1캡슐');
    setCustomDosage('');
    setUseCustomDosage(false);
    setError('');
    onClose();
  };

  const dosagePresets = ['1캡슐', '2캡슐', '1정', '1포', '1구미', '20ml'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Content card */}
      <div 
        id="add-custom-modal"
        className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden relative z-10 animate-float-short"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-50">
          <h3 className="font-bold text-lg text-gray-900 flex items-center gap-2">
            <span className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg text-sm">➕</span>
            나만의 영양제 추가하기
          </h3>
          <button 
            id="close-modal-btn"
            onClick={onClose} 
            className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Supplement Name */}
          <div className="space-y-2">
            <label id="lbl-custom-name" className="text-xs font-semibold uppercase tracking-wider text-gray-400 block">
              영양제 이름
            </label>
            <input
              id="input-custom-name"
              type="text"
              placeholder="예: 비타민C, 오메가3, 임팩타민"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setError('');
              }}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all text-sm font-medium"
              autoFocus
            />
          </div>

          {/* Intake Time */}
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-gray-400 block">
              추천 복용 시간
            </label>
            <div className="grid grid-cols-4 gap-2">
              {([
                { key: 'morning', label: '아침', emoji: '☀️' },
                { key: 'afternoon', label: '점심', emoji: '🌤️' },
                { key: 'evening', label: '저녁', emoji: '🌙' },
                { key: 'any', label: '아무때나', emoji: '🕒' }
              ] as { key: TimeOfDay; label: string; emoji: string }[]).map((time) => (
                <button
                  id={`btn-time-select-${time.key}`}
                  key={time.key}
                  type="button"
                  onClick={() => setTimeOfDay(time.key)}
                  className={`py-3 px-1.5 rounded-xl border text-xs font-semibold transition-all flex flex-col items-center gap-1 ${
                    timeOfDay === time.key
                      ? 'border-emerald-500 bg-emerald-50/50 text-emerald-700 font-bold'
                      : 'border-gray-100 bg-gray-50/30 text-gray-500 hover:border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <span>{time.emoji}</span>
                  <span>{time.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Dosage Selector */}
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-gray-400 block">
              섭취량
            </label>
            
            {!useCustomDosage ? (
              <div className="space-y-2">
                <div className="grid grid-cols-3 gap-2">
                  {dosagePresets.map((preset) => (
                    <button
                      id={`btn-dosage-preset-${preset}`}
                      key={preset}
                      type="button"
                      onClick={() => {
                        setDosage(preset);
                        setError('');
                      }}
                      className={`py-2 rounded-xl border text-xs font-medium transition-all ${
                        dosage === preset
                          ? 'border-emerald-500 bg-emerald-50/50 text-emerald-700 font-bold'
                          : 'border-gray-100 bg-gray-50/30 text-gray-500 hover:border-gray-200'
                      }`}
                    >
                      {preset}
                    </button>
                  ))}
                </div>
                <button
                  id="btn-dosage-use-custom"
                  type="button"
                  onClick={() => {
                    setUseCustomDosage(true);
                    setError('');
                  }}
                  className="text-xs text-emerald-600 hover:text-emerald-700 font-semibold flex items-center gap-1 mt-1"
                >
                  <span>✍️ 직접 입력하기</span>
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="relative">
                  <input
                    id="input-dosage-custom"
                    type="text"
                    placeholder="예: 2정씩 3회, 취침전 1알"
                    value={customDosage}
                    onChange={(e) => {
                      setCustomDosage(e.target.value);
                      setError('');
                    }}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all text-sm font-medium"
                  />
                  <button
                    id="btn-dosage-preset-return"
                    type="button"
                    onClick={() => {
                      setUseCustomDosage(false);
                      setError('');
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-gray-400 hover:text-gray-600"
                  >
                    목록 선택
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Error notice */}
          {error && (
            <div id="modal-error" className="flex items-center gap-1.5 text-xs font-medium text-rose-500 bg-rose-50 border border-rose-100 rounded-xl py-2 px-3">
              <AlertCircle size={14} />
              <span>{error}</span>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              id="cancel-modal-btn"
              type="button"
              onClick={onClose}
              className="flex-1 py-3 px-4 bg-gray-50 hover:bg-gray-100 text-gray-500 hover:text-gray-700 text-sm font-semibold rounded-xl transition-all"
            >
              취소
            </button>
            <button
              id="submit-modal-btn"
              type="submit"
              className="flex-1 py-3 px-4 bg-gray-900 hover:bg-emerald-600 text-white text-sm font-semibold rounded-xl shadow-lg shadow-gray-100 hover:shadow-emerald-100 transition-all flex items-center justify-center gap-1"
            >
              <Plus size={16} />
              루틴에 추가
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
