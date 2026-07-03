import { Gender, AgeGroup, Supplement } from './types';

export const ALL_SUPPLEMENTS: { [key: string]: Supplement } = {
  vitamin_b: {
    id: 'vitamin_b',
    name: '비타민B군',
    description: '피로 회복과 하루 활력 충전을 위한 필수 영양소',
    benefits: ['에너지 대사 활성화', '피로 유발 물질 억제', '신경 안정 및 에너지 촉진'],
    iconType: 'zap',
    defaultTime: 'morning'
  },
  probiotics: {
    id: 'probiotics',
    name: '유산균',
    description: '장내 유익균 증가 및 유해균 억제로 소화 건강과 면역력 증진',
    benefits: ['배변 활동 원활', '장내 환경 개선', '면역 활성 유도'],
    iconType: 'shield',
    defaultTime: 'morning'
  },
  vitamin_d: {
    id: 'vitamin_d',
    name: '비타민D',
    description: '햇빛 노출이 적은 현대인을 위해 뼈의 골밀도 향상과 면역 강화',
    benefits: ['칼슘 흡수 촉진', '뼈 및 치아 건강', '면역력 보강'],
    iconType: 'sun',
    defaultTime: 'morning'
  },
  milk_thistle: {
    id: 'milk_thistle',
    name: '밀크씨슬',
    description: '간의 실리마린 성분이 지친 간 세포 보호 및 피로 개선',
    benefits: ['간 기능 보호', '항산화 활성', '피로 물질 분해 지원'],
    iconType: 'activity',
    defaultTime: 'evening'
  },
  lutein: {
    id: 'lutein',
    name: '루테인',
    description: '스마트폰과 PC 화면에 지친 현대인의 황반 색소 밀도 유지 및 피로 경감',
    benefits: ['망막 건강 보호', '눈의 피로도 완화', '시각 노화 예방'],
    iconType: 'eye',
    defaultTime: 'afternoon'
  },
  omega_3: {
    id: 'omega_3',
    name: '오메가3',
    description: '혈액 속 노폐물을 줄여 혈행을 돕고 건조한 안구를 개선하는 정제 어유',
    benefits: ['혈행 개선 및 중성지질 저하', '눈 건조감 예방', '두뇌 인지 기능 지원'],
    iconType: 'heart',
    defaultTime: 'afternoon'
  },
  collagen: {
    id: 'collagen',
    name: '콜라겐',
    description: '피부 깊숙이 스며들어 탄탄한 피부 장벽과 관절 재생 촉진',
    benefits: ['피부 탄력 및 주름 개선', '머리카락 및 손톱 생기 충전', '뼈 마디 지지'],
    iconType: 'sparkles',
    defaultTime: 'evening'
  },
  iron_folate: {
    id: 'iron_folate',
    name: '철분/엽산',
    description: '체내 산소를 구석구석 배달하고 여성의 세포 생성과 혈액 조성을 도움',
    benefits: ['체내 산소 수송', '적혈구 촉진', '세포 분열 및 에너지 증강'],
    iconType: 'droplet',
    defaultTime: 'morning'
  },
  calcium_magnesium: {
    id: 'calcium_magnesium',
    name: '칼슘+마그네슘',
    description: '흡수율을 높인 이상적인 결합으로 뼈를 지탱하고 근육 이완과 숙면을 유도',
    benefits: ['치아 및 뼈 구성', '근육 수축 및 이완 조절', '신경 안정 및 피로감 완화'],
    iconType: 'bone',
    defaultTime: 'evening'
  },
  coq10: {
    id: 'coq10',
    name: '코엔자임Q10',
    description: '에너지 생산 공장을 가동해 노화를 막는 강력한 항산화 및 혈압 케어',
    benefits: ['강력한 항산화 작용', '높은 혈압 감소 지원', '세포막 에너지 공급'],
    iconType: 'clock',
    defaultTime: 'morning'
  }
};

export function getRecommendations(gender: Gender, age: number): Supplement[] {
  let ageGroup: AgeGroup = '20s';
  if (age < 30) {
    ageGroup = '20s';
  } else if (age < 40) {
    ageGroup = '30s';
  } else {
    ageGroup = '40s_50s';
  }

  if (ageGroup === '40s_50s') {
    return [ALL_SUPPLEMENTS.calcium_magnesium, ALL_SUPPLEMENTS.omega_3, ALL_SUPPLEMENTS.coq10];
  }
  
  if (ageGroup === '20s') {
    return [ALL_SUPPLEMENTS.vitamin_b, ALL_SUPPLEMENTS.probiotics, ALL_SUPPLEMENTS.vitamin_d];
  }
  
  if (ageGroup === '30s') {
    if (gender === 'M') {
      return [ALL_SUPPLEMENTS.milk_thistle, ALL_SUPPLEMENTS.lutein, ALL_SUPPLEMENTS.omega_3];
    } else {
      return [ALL_SUPPLEMENTS.collagen, ALL_SUPPLEMENTS.iron_folate, ALL_SUPPLEMENTS.probiotics];
    }
  }
  
  return [];
}
