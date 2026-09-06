export type GolfCourse = {
  id: string;
  name: string;
  region: string;
  address?: string;
  totalHoles: number;
  courses?: string[];
};

/**
 * 내장 골프장 데이터.
 * 구조는 전국 공공데이터/공식 골프장 정보를 지속적으로 확장할 수 있도록 설계했다.
 * courses가 없는 18홀 골프장은 단일 코스로 취급한다.
 */
export const golfCourses: GolfCourse[] = [
  // 강원
  { id: 'sonofelice-vivaldi', name: '소노펠리체 컨트리클럽', region: '강원특별자치도 홍천군', totalHoles: 27, courses: ['마운틴', '레이크', '실크'] },
  { id: 'viva-cc', name: '비발디파크 컨트리클럽', region: '강원특별자치도 홍천군', totalHoles: 27, courses: ['마운틴', '레이크', '밸리'] },
  { id: 'hongcheon-cc', name: '홍천 컨트리클럽', region: '강원특별자치도 홍천군', totalHoles: 18, courses: ['OUT', 'IN'] },
  { id: 'laviebel-olddune', name: '라비에벨 올드코스', region: '강원특별자치도 춘천시', totalHoles: 18 },
  { id: 'laviebel-dune', name: '라비에벨 듄스코스', region: '강원특별자치도 춘천시', totalHoles: 18 },
  { id: 'jadepalace', name: '제이드팰리스 골프클럽', region: '강원특별자치도 춘천시', totalHoles: 18 },
  { id: 'whistling-rock', name: '휘슬링락 컨트리클럽', region: '강원특별자치도 춘천시', totalHoles: 18 },
  { id: 'bellavista', name: '벨라스톤 컨트리클럽', region: '강원특별자치도 횡성군', totalHoles: 18 },
  { id: 'oakvalley', name: '오크밸리 컨트리클럽', region: '강원특별자치도 원주시', totalHoles: 36, courses: ['오크', '메이플', '파인', '힐'] },
  { id: 'sungwoo', name: '웰리힐리 컨트리클럽', region: '강원특별자치도 횡성군', totalHoles: 36 },
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
  { id: 'golfzon-sunwoon', name: '골프존카운티 선운', region: '전북특별자치도 고창군', totalHoles: 18 },
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
  return value.toLowerCase().replace(/[\s\-_.()]/g, '');
}

export function searchGolfCourses(query: string, region = '전체') {
  const keyword = normalizeGolfSearch(query);
  return golfCourses.filter((course) => {
    const regionMatches = region === '전체' || course.region.startsWith(region);
    if (!regionMatches) return false;
    if (!keyword) return true;
    return normalizeGolfSearch(`${course.name}${course.region}`).includes(keyword);
  });
}
