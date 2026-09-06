export type HolePar = 3 | 4 | 5;

export type GolfCourse = {
  id: string;
  name: string;
  region: string;
  address?: string;
  totalHoles: number;
  courses?: string[];
  aliases?: string[];
  /** 코스별 실제 홀 Par 배열. 공식 정보가 확인된 코스부터 확장 */
  coursePars?: Record<string, HolePar[]>;
};

const P = (values: number[]) => values as HolePar[];

/**
 * 내장 골프장 데이터.
 * aliases를 별도로 두어 CC/GC/컨트리클럽, 띄어쓰기, 영문 표기 차이로 검색이 누락되지 않도록 한다.
 * coursePars가 있는 경우 실제 코스의 홀별 Par를 새 라운드에 자동 반영한다.
 */
export const golfCourses: GolfCourse[] = [
  // 강원특별자치도 · 홍천 (우선 보강)
  {
    id: 'sagewood-hongcheon', name: '세이지우드 홍천', region: '강원특별자치도 홍천군', address: '강원특별자치도 홍천군 두촌면 광석로 898-160', totalHoles: 27,
    courses: ['드림', '비전', '챌린지'], aliases: ['세이지우드', '세이지우드cc', '세이지우드 cc', 'sagewood', 'sagewood hongcheon'],
    coursePars: {
      '드림': P([4,5,4,3,5,4,4,3,4]),
      '비전': P([4,3,4,5,4,4,5,3,4]),
      '챌린지': P([5,3,4,3,4,4,5,3,5]),
    },
  },
  {
    id: 'hilldeloci', name: '힐드로사이 컨트리클럽', region: '강원특별자치도 홍천군', address: '강원특별자치도 홍천군 남면 한서로 2840', totalHoles: 18,
    courses: ['Birch', 'Pine'], aliases: ['힐드로사이드', '힐드로사이', '힐드로사이cc', '힐드로사이드cc', 'hilldeloci', 'hill de loci'],
    coursePars: {
      'Birch': P([4,5,4,4,3,4,3,4,5]),
      'Pine': P([4,5,4,3,5,3,4,4,4]),
    },
  },
  {
    id: 'beaconhills', name: '비콘힐스 골프클럽', region: '강원특별자치도 홍천군', address: '강원특별자치도 홍천군 홍천읍 높은터로 533', totalHoles: 18,
    courses: ['누리', '하늘'], aliases: ['비콘힐스', '비콘힐스cc', '비콘힐스gc', '비콘힐스 골프장', 'beaconhills', 'beacon hills', '홍천컨트리클럽'],
    // 비콘힐스 공식 코스제원 기준: 누리 9홀 Par 36 + 하늘 9홀 Par 36 = 총 Par 72
    coursePars: {
      '누리': P([5,4,4,3,4,4,4,3,5]),
      '하늘': P([4,3,5,4,4,3,4,5,4]),
    },
  },
  { id: 'sonofelice-vivaldi', name: '소노펠리체 컨트리클럽', region: '강원특별자치도 홍천군', totalHoles: 27, courses: ['마운틴', '레이크', '실크'], aliases: ['소노펠리체', 'sonofelice'] },
  { id: 'viva-cc', name: '비발디파크 컨트리클럽', region: '강원특별자치도 홍천군', totalHoles: 27, courses: ['마운틴', '레이크', '밸리'], aliases: ['비발디', '비발디파크', 'vivaldi'] },
  { id: 'cascadia', name: '카스카디아 골프클럽', region: '강원특별자치도 홍천군', totalHoles: 18, aliases: ['카스카디아', 'cascadia'] },
  { id: 'hongcheon-cc', name: '홍천 컨트리클럽', region: '강원특별자치도 홍천군', totalHoles: 18, courses: ['OUT', 'IN'], aliases: ['홍천cc'] },
  { id: 'laviebel-olddune', name: '라비에벨 올드코스', region: '강원특별자치도 춘천시', totalHoles: 18, aliases: ['라비에벨 올드'] },
  { id: 'laviebel-dune', name: '라비에벨 듄스코스', region: '강원특별자치도 춘천시', totalHoles: 18, aliases: ['라비에벨 듄스'] },
  { id: 'jadepalace', name: '제이드팰리스 골프클럽', region: '강원특별자치도 춘천시', totalHoles: 18 },
  { id: 'whistling-rock', name: '휘슬링락 컨트리클럽', region: '강원특별자치도 춘천시', totalHoles: 18 },
  { id: 'oakvalley', name: '오크밸리 컨트리클럽', region: '강원특별자치도 원주시', totalHoles: 36, courses: ['오크', '메이플', '파인', '힐'], aliases: ['오크밸리', 'oak valley'] },
  { id: 'sungwoo', name: '웰리힐리 컨트리클럽', region: '강원특별자치도 횡성군', totalHoles: 36, aliases: ['웰리힐리', 'welihill'] },
  { id: 'high1', name: '하이원 컨트리클럽', region: '강원특별자치도 정선군', totalHoles: 18 },
  { id: 'yongpyong', name: '용평 골프클럽', region: '강원특별자치도 평창군', totalHoles: 18 },
  { id: 'phoenix', name: '휘닉스 평창 골프클럽', region: '강원특별자치도 평창군', totalHoles: 18 },
  { id: 'plaza-seorak', name: '플라자CC 설악', region: '강원특별자치도 속초시', totalHoles: 18 },
  { id: 'sorak-sunvalley', name: '설악썬밸리 골프리조트', region: '강원특별자치도 고성군', totalHoles: 27 },

  // 경기
  { id: 'lakeside', name: '레이크사이드 컨트리클럽', region: '경기도 용인시', totalHoles: 54 },
  { id: '88cc', name: '88 컨트리클럽', region: '경기도 용인시', totalHoles: 36 },
  { id: 'hanwha-plaza-yongin', name: '플라자CC 용인', region: '경기도 용인시', totalHoles: 36 },
  { id: 'gold-cc', name: '골드 컨트리클럽', region: '경기도 용인시', totalHoles: 36 },
  { id: 'blueone-yongin', name: '블루원 용인 컨트리클럽', region: '경기도 용인시', totalHoles: 27 },
  { id: 'south-springs', name: '사우스스프링스 컨트리클럽', region: '경기도 이천시', totalHoles: 18 },
  { id: 'blackstone-icheon', name: '블랙스톤 이천 골프클럽', region: '경기도 이천시', totalHoles: 18 },
  { id: 'h1-club', name: 'H1 CLUB', region: '경기도 이천시', totalHoles: 18 },
  { id: 'skyvalley', name: '스카이밸리 컨트리클럽', region: '경기도 여주시', totalHoles: 36 },
  { id: 'ferrum', name: '페럼클럽', region: '경기도 여주시', totalHoles: 18 },
  { id: 'solmoro', name: '솔모로 컨트리클럽', region: '경기도 여주시', totalHoles: 36 },
  { id: 'haesley', name: '해슬리 나인브릿지', region: '경기도 여주시', totalHoles: 18 },
  { id: 'sunning-point', name: '써닝포인트 컨트리클럽', region: '경기도 여주시', totalHoles: 27 },
  { id: 'ansung-benest', name: '안성베네스트 골프클럽', region: '경기도 안성시', totalHoles: 36 },
  { id: 'anseong-cc', name: '안성 컨트리클럽', region: '경기도 안성시', totalHoles: 18 },
  { id: 'new-korea', name: '뉴코리아 컨트리클럽', region: '경기도 고양시', totalHoles: 18 },
  { id: 'new-seoul', name: '뉴서울 컨트리클럽', region: '경기도 광주시', totalHoles: 36 },
  { id: 'namseoul', name: '남서울 컨트리클럽', region: '경기도 성남시', totalHoles: 18 },
  { id: 'gyeonggi', name: '경기 컨트리클럽', region: '경기도 광주시', totalHoles: 27 },
  { id: 'eastvalley', name: '이스트밸리 컨트리클럽', region: '경기도 광주시', totalHoles: 27 },
  { id: 'wellington', name: '웰링턴 컨트리클럽', region: '경기도 이천시', totalHoles: 27 },
  { id: 'adonis', name: '포천아도니스 컨트리클럽', region: '경기도 포천시', totalHoles: 27 },

  // 충청
  { id: 'woojunghills', name: '우정힐스 컨트리클럽', region: '충청남도 천안시', totalHoles: 18 },
  { id: 'century21', name: '센추리21 컨트리클럽', region: '충청북도 충주시', totalHoles: 27 },
  { id: 'imperial-lake', name: '임페리얼레이크 컨트리클럽', region: '충청북도 충주시', totalHoles: 18 },
  { id: 'kingsdale', name: '킹스데일 골프클럽', region: '충청북도 충주시', totalHoles: 18 },
  { id: 'lotte-buyeo', name: '롯데스카이힐 부여', region: '충청남도 부여군', totalHoles: 18 },
  { id: 'goldenbay', name: '골든베이 골프앤리조트', region: '충청남도 태안군', totalHoles: 27 },

  // 영남
  { id: 'blueone-sangju', name: '블루원 상주 골프리조트', region: '경상북도 상주시', totalHoles: 18 },
  { id: 'gyeongju-silla', name: '경주신라 컨트리클럽', region: '경상북도 경주시', totalHoles: 36 },
  { id: 'mauna-ocean', name: '마우나오션 리조트 골프클럽', region: '경상북도 경주시', totalHoles: 18 },
  { id: 'golf-club-q', name: '골프클럽Q', region: '경상북도 경주시', totalHoles: 18 },
  { id: 'gimcheon-podo', name: '김천포도 컨트리클럽', region: '경상북도 김천시', totalHoles: 18 },
  { id: 'pal-gong', name: '팔공 컨트리클럽', region: '대구광역시 동구', totalHoles: 18 },
  { id: 'bay-side', name: '베이사이드 골프클럽', region: '부산광역시 기장군', totalHoles: 27 },
  { id: 'busan-cc', name: '부산 컨트리클럽', region: '부산광역시 금정구', totalHoles: 18 },
  { id: 'dongbusan', name: '동부산 컨트리클럽', region: '부산광역시 기장군', totalHoles: 27 },
  { id: 'haeundae', name: '해운대 컨트리클럽', region: '부산광역시 기장군', totalHoles: 18 },

  // 호남
  { id: 'gwangju-cc', name: '광주 컨트리클럽', region: '광주광역시', totalHoles: 18 },
  { id: 'eodeungsan', name: '어등산 컨트리클럽', region: '광주광역시', totalHoles: 18 },
  { id: 'gold-lake', name: '골드레이크 컨트리클럽', region: '전라남도 나주시', totalHoles: 18 },
  { id: 'hwasun', name: '화순 컨트리클럽', region: '전라남도 화순군', totalHoles: 18 },
  { id: 'dasan-beach', name: '다산베아채 골프앤리조트', region: '전라남도 강진군', totalHoles: 27 },
  { id: 'seokjeong', name: '석정힐 컨트리클럽', region: '전북특별자치도 고창군', totalHoles: 18 },
  { id: 'golfzon-muju', name: '무주덕유산 컨트리클럽', region: '전북특별자치도 무주군', totalHoles: 18 },

  // 제주
  { id: 'nine-bridges', name: '나인브릿지 제주', region: '제주특별자치도 서귀포시', totalHoles: 18 },
  { id: 'pinx', name: '핀크스 골프클럽', region: '제주특별자치도 서귀포시', totalHoles: 18 },
  { id: 'haevichi-jeju', name: '해비치 컨트리클럽 제주', region: '제주특별자치도 서귀포시', totalHoles: 36 },
  { id: 'lotte-jeju', name: '롯데스카이힐 제주 컨트리클럽', region: '제주특별자치도 서귀포시', totalHoles: 36 },
  { id: 'eli-jeju', name: '엘리시안 제주 컨트리클럽', region: '제주특별자치도 제주시', totalHoles: 27 },
  { id: 'cypress', name: '사이프러스 골프앤리조트', region: '제주특별자치도 서귀포시', totalHoles: 27 },
  { id: 'tedivalley', name: '테디밸리 골프앤리조트', region: '제주특별자치도 서귀포시', totalHoles: 18 },
  { id: 'jungmun', name: '중문 골프클럽', region: '제주특별자치도 서귀포시', totalHoles: 18 },
];

export const golfRegions = Array.from(new Set(golfCourses.map((course) => course.region.split(' ')[0])));

export function normalizeGolfSearch(value: string) {
  return value.toLowerCase().replace(/[\s\-_.()·]/g, '').replace(/컨트리클럽|골프클럽|골프장|cc|gc/g, '');
}

export function searchGolfCourses(query: string, region = '전체') {
  const keyword = normalizeGolfSearch(query);
  return golfCourses.filter((course) => {
    const regionMatches = region === '전체' || course.region.startsWith(region);
    if (!regionMatches) return false;
    if (!keyword) return true;
    const searchable = [course.name, course.region, course.address ?? '', ...(course.aliases ?? [])]
      .map(normalizeGolfSearch)
      .join(' ');
    return searchable.includes(keyword);
  });
}
