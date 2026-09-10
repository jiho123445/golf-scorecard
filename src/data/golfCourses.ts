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
  /** 코스별 실제 홀 거리(m) 배열. coursePars와 동일한 코스명 키를 사용하며, 확인된 코스부터 확장 */
  courseYardages?: Record<string, number[]>;
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
    courseYardages: {
      '드림': [388, 517, 424, 163, 550, 322, 401, 181, 386],
      '비전': [378, 215, 397, 515, 304, 367, 497, 158, 311],
      '챌린지': [510, 148, 358, 145, 369, 377, 495, 223, 506],
    },
  },
  {
    // Birch·Pine 홀별 거리는 공식 홈페이지 접속 불가 및 신뢰 가능한 소스를 찾지 못해 기본값(거리 미표시) 유지
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
    courseYardages: {
      '누리': [460, 360, 365, 135, 290, 330, 325, 140, 445],
      '하늘': [280, 146, 389, 260, 355, 135, 295, 515, 310],
    },
  },
  // 옛 '대명비발디파크 컨트리클럽'이 '소노펠리체 컨트리클럽'으로 개명되어 동일 시설이므로 통합.
  // ⚠️ 확인 필요: 최신 조사에서는 이 리조트가 EAST(18)+WEST(18)+마운틴(9)=45홀 구조로 운영 중이라는 결과가 나왔는데,
  //    기존에 등록된 '마운틴·레이크·실크 27홀' 구성과 다릅니다. '마운틴' 코스명/Par는 두 구조 모두에서 확인되어 반영했지만,
  //    전체 홀 수·코스 구성은 실제 운영 현황을 재확인 후 수정하는 게 안전합니다.
  {
    id: 'sonofelice-vivaldi', name: '소노펠리체 컨트리클럽', region: '강원특별자치도 홍천군', totalHoles: 27,
    courses: ['마운틴', '레이크', '실크'],
    aliases: ['소노펠리체', 'sonofelice', '비발디', '비발디파크', '비발디파크cc', '대명비발디파크', 'vivaldi'],
    coursePars: { '마운틴': P([4,4,3,5,5,4,3,5,3]) },
  },
  // 2025년 워터·스톤·트리 3코스 27홀로 확장 완료(기존 18홀에서 상향). 코스명만 확인됨 — 홀별 Par를 확인할 수 있는 소스를 찾지 못해 기본값 유지
  { id: 'cascadia', name: '카스카디아 골프클럽', region: '강원특별자치도 홍천군', totalHoles: 27, courses: ['워터', '스톤', '트리'], aliases: ['카스카디아', 'cascadia'] },
  {
    id: 'laviebel-olddune', name: '라비에벨 올드코스', region: '강원특별자치도 춘천시', totalHoles: 18,
    courses: ['OUT', 'IN'], aliases: ['라비에벨 올드'],
    coursePars: { 'OUT': P([5,4,4,3,5,4,3,4,4]), 'IN': P([4,5,3,4,4,5,4,3,4]) },
    courseYardages: { 'OUT': [474, 353, 326, 167, 470, 362, 172, 325, 362], 'IN': [301, 415, 116, 333, 326, 477, 327, 143, 356] },
  },
  {
    id: 'laviebel-dune', name: '라비에벨 듄스코스', region: '강원특별자치도 춘천시', totalHoles: 18,
    courses: ['OUT', 'IN'], aliases: ['라비에벨 듄스'],
    coursePars: { 'OUT': P([4,5,4,3,4,5,4,3,4]), 'IN': P([4,4,4,5,4,3,5,3,4]) },
    courseYardages: { 'OUT': [334, 455, 347, 165, 333, 484, 291, 137, 368], 'IN': [356, 295, 285, 482, 380, 179, 483, 127, 346] },
  },
  {
    // West/East 순서는 공식 홈페이지가 홀 상세를 비공개(회원 로그인)로 두어 순서를 확정할 수 없음 — 3개 독립 소스(리뷰·스코어카드 사이트)가 서로 일치하는 값
    id: 'jadepalace', name: '제이드팰리스 골프클럽', region: '강원특별자치도 춘천시', totalHoles: 18,
    courses: ['West', 'East'],
    coursePars: { 'West': P([4,4,5,3,4,3,4,4,5]), 'East': P([5,4,4,5,3,4,3,4,4]) },
  },
  {
    // 코쿤·템플·클라우드 3코스 27홀(파108), 공식 홈페이지 코스별 스코어카드 기준
    id: 'whistling-rock', name: '휘슬링락 컨트리클럽', region: '강원특별자치도 춘천시', totalHoles: 27,
    courses: ['코쿤', '템플', '클라우드'],
    coursePars: {
      '코쿤': P([4,5,4,4,3,4,5,3,4]),
      '템플': P([4,5,4,4,4,3,5,4,3]),
      '클라우드': P([4,5,4,3,4,4,5,3,4]),
    },
    // 거리는 공식 홈페이지가 야드(yard) 단위만 제공해 미터로 환산(×0.9144)했고, 회원/레귤러 티가 아닌 블랙(챔피언십) 티 기준이라 실제 플레이 거리보다 길게 표시될 수 있음
    courseYardages: {
      '코쿤': [313, 540, 430, 322, 163, 324, 564, 187, 375],
      '템플': [329, 521, 432, 401, 401, 149, 487, 349, 185],
      '클라우드': [330, 515, 374, 195, 334, 401, 494, 227, 465],
    },
  },
  {
    // 실제 4개 코스는 오크·메이플·파인·체리(Cherry)이며 '힐'이라는 코스는 존재하지 않아 명칭 정정. 파인·체리만 홀별 Par 확인됨(오크·메이플은 신뢰할 수 있는 소스를 찾지 못해 기본값 유지)
    id: 'oakvalley', name: '오크밸리 컨트리클럽', region: '강원특별자치도 원주시', totalHoles: 36,
    courses: ['오크', '메이플', '파인', '체리'], aliases: ['오크밸리', 'oak valley'],
    coursePars: { '파인': P([4,4,3,4,5,4,3,4,5]), '체리': P([4,3,4,4,4,3,5,4,5]) },
  },
  {
    // 목록상 '충청북도 충주시'로 잘못 분류되어 있었으나 실제 소재지는 강원특별자치도 원주시 문막읍. 파인·레이크·밸리·필드·마운틴 5코스 45홀, 공식 홈페이지 코스별 코스안내 기준
    id: 'century21', name: '센추리21 컨트리클럽', region: '강원특별자치도 원주시', totalHoles: 45,
    courses: ['파인', '레이크', '밸리', '필드', '마운틴'],
    coursePars: {
      '파인': P([4,3,5,4,4,3,5,4,4]),
      '레이크': P([4,5,3,4,4,3,5,4,4]),
      '밸리': P([4,4,3,5,3,4,4,4,5]),
      '필드': P([4,4,5,3,4,3,4,5,4]),
      '마운틴': P([3,4,5,4,3,4,5,4,4]),
    },
    // 거리는 공식 홈페이지가 야드 단위만 제공해 미터로 환산(×0.9144)함
    courseYardages: {
      '파인': [365, 190, 551, 283, 430, 200, 466, 362, 383],
      '레이크': [422, 531, 187, 323, 360, 190, 482, 362, 388],
      '밸리': [343, 413, 159, 530, 165, 329, 369, 409, 478],
      '필드': [411, 351, 465, 200, 309, 144, 341, 544, 463],
      '마운틴': [180, 275, 424, 271, 166, 265, 482, 337, 389],
    },
  },
  // 실제 구성은 남코스·북코스(각 18홀)이며 9홀 단위 하위 코스가 없어, 코스명/Par 자동입력은 지원하지 않음(홀 수 36은 정확함)
  { id: 'sungwoo', name: '웰리힐리 컨트리클럽', region: '강원특별자치도 횡성군', totalHoles: 36, aliases: ['웰리힐리', 'welihill'] },
  {
    id: 'high1', name: '하이원 컨트리클럽', region: '강원특별자치도 정선군', totalHoles: 18,
    courses: ['마운틴', '밸리'],
    coursePars: { '마운틴': P([4,4,4,5,5,3,4,3,4]), '밸리': P([4,5,4,4,3,5,3,4,5]) },
    courseYardages: { '마운틴': [285, 326, 295, 488, 478, 137, 361, 110, 332], '밸리': [294, 504, 298, 285, 154, 419, 157, 281, 414] },
  },
  {
    id: 'yongpyong', name: '용평 골프클럽', region: '강원특별자치도 평창군', totalHoles: 18,
    courses: ['산마루', '강나루'],
    coursePars: { '산마루': P([4,3,5,4,4,4,3,5,4]), '강나루': P([5,3,4,3,4,4,4,4,5]) },
    courseYardages: { '산마루': [343, 119, 449, 273, 305, 320, 119, 443, 357], '강나루': [460, 155, 283, 124, 338, 296, 306, 333, 428] },
  },
  { id: 'phoenix', name: '휘닉스 평창 골프클럽', region: '강원특별자치도 평창군', totalHoles: 18 },
  // 코스명(선라이즈·마운틴)만 확인됨 — 공식 홈페이지가 홀 상세를 접근 제한해 Par는 기본값 유지
  { id: 'plaza-seorak', name: '플라자CC 설악', region: '강원특별자치도 속초시', totalHoles: 18, courses: ['선라이즈', '마운틴'] },
  {
    // 설악·썬·밸리 3코스, 공식 홈페이지 코스안내 기준
    id: 'sorak-sunvalley', name: '설악썬밸리 골프리조트', region: '강원특별자치도 고성군', totalHoles: 27,
    courses: ['설악', '썬', '밸리'],
    coursePars: {
      '설악': P([4,5,4,3,5,4,3,4,4]),
      '썬': P([4,4,3,4,4,5,4,3,5]),
      '밸리': P([4,4,4,3,5,3,4,5,4]),
    },
    // 거리는 공식 홈페이지가 야드 단위만 제공해 미터로 환산(×0.9144)함
    courseYardages: {
      '설악': [347, 434, 375, 119, 526, 384, 110, 325, 338],
      '썬': [320, 325, 110, 315, 325, 480, 320, 133, 480],
      '밸리': [325, 274, 329, 114, 457, 105, 261, 462, 315],
    },
  },

  // 경기
  {
    // 동/서/남 3개 18홀 코스(각 OUT+IN)로 구성. Par는 공식 사이트에서 1회 추출한 값으로 2차 검증되지 않아 중간 신뢰도
    id: 'lakeside', name: '레이크사이드 컨트리클럽', region: '경기도 용인시', totalHoles: 54,
    courses: ['동코스 OUT', '동코스 IN', '서코스 OUT', '서코스 IN', '남코스 OUT', '남코스 IN'],
    coursePars: {
      '동코스 OUT': P([4,5,4,3,4,4,5,3,4]),
      '동코스 IN': P([4,4,3,4,5,4,3,4,5]),
      '서코스 OUT': P([5,4,3,4,4,3,4,5,4]),
      '서코스 IN': P([4,5,3,4,4,5,4,3,4]),
      '남코스 OUT': P([4,4,3,4,4,5,3,4,5]),
      '남코스 IN': P([4,5,3,4,5,3,4,4,4]),
    },
  },
  {
    // 동/서 2개 18홀 코스(각 OUT+IN). 두 독립 소스가 27홀 전부 일치해 신뢰도 높음
    id: '88cc', name: '88 컨트리클럽', region: '경기도 용인시', totalHoles: 36,
    courses: ['동코스 OUT', '동코스 IN', '서코스 OUT', '서코스 IN'],
    coursePars: {
      '동코스 OUT': P([4,4,5,3,4,3,4,5,4]),
      '동코스 IN': P([5,4,3,4,4,4,5,3,4]),
      '서코스 OUT': P([4,4,3,5,4,4,3,5,4]),
      '서코스 IN': P([5,4,4,3,4,3,4,4,5]),
    },
  },
  // 타이거코스·라이온코스(각 18홀) 2코스로 확인되었으나, 홀별 Par를 신뢰할 수 있는 소스를 찾지 못해(라이온코스 추정치는 합계가 파72와 불일치) 기본값 유지
  { id: 'hanwha-plaza-yongin', name: '플라자CC 용인', region: '경기도 용인시', totalHoles: 36 },
  {
    // 챔피언코스·마스터코스(각 18홀) 2코스. 챔피언코스만 Par 확인(단일 소스지만 기사 자체의 '파73' 서술과 합산 일치). 마스터코스는 소스를 찾지 못해 기본값 유지
    id: 'gold-cc', name: '골드 컨트리클럽', region: '경기도 용인시', totalHoles: 36,
    courses: ['챔피언코스 OUT', '챔피언코스 IN', '마스터코스 OUT', '마스터코스 IN'],
    coursePars: {
      '챔피언코스 OUT': P([4,3,5,3,4,3,5,4,5]),
      '챔피언코스 IN': P([4,3,4,4,5,3,5,5,4]),
    },
  },
  {
    id: 'blueone-yongin', name: '블루원 용인 컨트리클럽', region: '경기도 용인시', totalHoles: 27,
    courses: ['서코스', '중코스', '동코스'],
    coursePars: {
      '서코스': P([5,4,3,4,4,4,3,5,4]),
      '중코스': P([4,4,3,5,4,3,4,4,5]),
      '동코스': P([5,4,3,4,5,3,4,4,4]),
    },
  },
  {
    // 전/후반이 'OUT/IN'이 아닌 '레이크코스'·'마운틴코스'라는 실제 명칭으로 운영됨
    id: 'south-springs', name: '사우스스프링스 컨트리클럽', region: '경기도 이천시', totalHoles: 18,
    courses: ['레이크코스', '마운틴코스'],
    coursePars: { '레이크코스': P([4,5,4,4,3,4,5,3,4]), '마운틴코스': P([4,4,5,4,3,5,4,3,4]) },
  },
  {
    // 이스트·노스·웨스트 3코스 27홀(기존 18홀에서 확장), 공식 홈페이지 홀별 페이지 기준
    id: 'blackstone-icheon', name: '블랙스톤 이천 골프클럽', region: '경기도 이천시', totalHoles: 27,
    courses: ['이스트코스', '노스코스', '웨스트코스'],
    coursePars: {
      '이스트코스': P([5,4,4,3,4,4,3,4,5]),
      '노스코스': P([5,4,3,4,5,4,3,4,4]),
      '웨스트코스': P([4,4,4,3,4,5,3,4,5]),
    },
  },
  {
    // 전/후반이 '레이크코스'·'마운틴코스'라는 실제 명칭으로 운영됨(구 덕평CC)
    id: 'h1-club', name: 'H1 CLUB', region: '경기도 이천시', totalHoles: 18,
    courses: ['레이크코스', '마운틴코스'],
    coursePars: { '레이크코스': P([4,5,4,4,3,4,5,3,4]), '마운틴코스': P([4,4,4,4,3,5,4,3,5]) },
  },
  {
    // 스카이/밸리/레이크/마운틴 4코스 36홀. 스카이·밸리만 Par 확인(제3자 소스, 중간 신뢰도). 레이크·마운틴은 소스를 찾지 못해 기본값 유지
    id: 'skyvalley', name: '스카이밸리 컨트리클럽', region: '경기도 여주시', totalHoles: 36,
    courses: ['스카이코스', '밸리코스', '레이크코스', '마운틴코스'],
    coursePars: {
      '스카이코스': P([4,5,4,3,5,4,3,4,4]),
      '밸리코스': P([4,5,3,4,4,4,3,5,4]),
    },
  },
  // 동/서 2코스로 확인되었으나 홀별 Par 소스를 찾지 못해 기본값 유지
  { id: 'ferrum', name: '페럼클럽', region: '경기도 여주시', totalHoles: 18, courses: ['동코스', '서코스'] },
  // 파인/메이플/체리/퍼시몬 4코스로 확인되었으나 홀별 Par 소스를 찾지 못해 기본값 유지
  { id: 'solmoro', name: '솔모로 컨트리클럽', region: '경기도 여주시', totalHoles: 36, courses: ['파인코스', '메이플코스', '체리코스', '퍼시몬코스'] },
  // 해슬리코스(전반)·PGA코스(후반) 2개 구간으로 확인되었으나 홀별 Par 소스를 찾지 못해 기본값 유지
  { id: 'haesley', name: '해슬리 나인브릿지', region: '경기도 여주시', totalHoles: 18, courses: ['해슬리코스', 'PGA코스'] },
  {
    // 실제 소재지는 경기도 용인시 처인구 백암면(퍼블릭 18홀) — 기존 '여주시 27홀'은 오기로 확인됨.
    // 전/후반이 'SUN'·'POINT'라는 실제 명칭으로 운영됨. SUN코스 9번홀은 공식 스코어카드·방송 클립에서 파6로 확인되나, 앱의 Par 데이터 모델(3/4/5)로는 표현할 수 없어 SUN코스는 제외하고 POINT코스만 반영
    id: 'sunning-point', name: '써닝포인트 컨트리클럽', region: '경기도 용인시', totalHoles: 18,
    courses: ['SUN', 'POINT'],
    coursePars: { 'POINT': P([4,4,3,4,5,4,3,4,5]) },
  },
  {
    // 전/후반이 '팜파스'·'밸리'라는 실제 명칭으로 운영됨
    id: 'golf-club-q', name: '골프클럽Q', region: '경기도 안성시', totalHoles: 18,
    courses: ['팜파스', '밸리'],
    coursePars: { '팜파스': P([4,5,4,3,5,4,3,4,4]), '밸리': P([5,4,4,4,3,4,3,4,5]) },
  },
  // 북/서/남/동 4코스로 확인됨(북+서=클래식코스, 남+동=챌린저코스) — 홀별 Par 소스를 찾지 못해 기본값 유지
  { id: 'ansung-benest', name: '안성베네스트 골프클럽', region: '경기도 안성시', totalHoles: 36, courses: ['북코스', '서코스', '남코스', '동코스'] },
  {
    id: 'anseong-cc', name: '안성 컨트리클럽', region: '경기도 안성시', totalHoles: 18,
    courses: ['OUT', 'IN'],
    coursePars: { 'OUT': P([4,4,3,4,5,5,3,4,4]), 'IN': P([4,4,3,5,4,3,5,4,4]) },
  },
  { id: 'new-korea', name: '뉴코리아 컨트리클럽', region: '경기도 고양시', totalHoles: 18 },
  // 문화코스·예술코스(각 18홀) 2코스로 확인되었으나 홀별 Par 소스를 찾지 못해 기본값 유지
  { id: 'new-seoul', name: '뉴서울 컨트리클럽', region: '경기도 광주시', totalHoles: 36, courses: ['문화코스 OUT', '문화코스 IN', '예술코스 OUT', '예술코스 IN'] },
  { id: 'namseoul', name: '남서울 컨트리클럽', region: '경기도 성남시', totalHoles: 18 },
  {
    id: 'eastvalley', name: '이스트밸리 컨트리클럽', region: '경기도 광주시', totalHoles: 27,
    courses: ['동코스', '서코스', '남코스'],
    coursePars: { '동코스': P([4,5,4,3,4,5,3,4,4]), '서코스': P([4,5,3,4,4,5,4,3,4]), '남코스': P([5,4,3,4,3,4,5,4,4]) },
  },
  {
    id: 'wellington', name: '웰링턴 컨트리클럽', region: '경기도 이천시', totalHoles: 27,
    courses: ['GRIFFIN', 'PHOENIX', 'WYVERN'],
    coursePars: { 'GRIFFIN': P([4,5,4,4,3,5,4,3,4]), 'PHOENIX': P([4,4,3,4,5,3,4,4,5]), 'WYVERN': P([4,5,3,4,5,4,3,4,4]) },
  },
  {
    // 회원제 27홀(서/중/동) + 대중제(퍼블릭) 9홀 = 총 36홀
    id: 'adonis', name: '포천아도니스 컨트리클럽', region: '경기도 포천시', totalHoles: 36,
    courses: ['서코스', '중코스', '동코스', 'PUBLIC'],
    coursePars: {
      '서코스': P([4,5,3,4,4,5,3,4,4]),
      '중코스': P([4,4,3,4,5,4,4,3,5]),
      '동코스': P([4,5,3,4,4,5,4,3,4]),
      'PUBLIC': P([4,4,3,5,4,3,4,5,4]),
    },
  },

  // 충청
  {
    id: 'woojunghills', name: '우정힐스 컨트리클럽', region: '충청남도 천안시', totalHoles: 18,
    courses: ['OUT', 'IN'],
    coursePars: { 'OUT': P([4,4,4,3,5,4,3,5,4]), 'IN': P([4,5,4,3,4,4,3,4,5]) },
  },
  // 파인코스·레이크코스 2코스로 확인되었으나, 조사된 홀별 Par가 소스마다 서로 달라(합산도 36과 불일치) 신뢰할 수 없어 기본값 유지
  { id: 'imperial-lake', name: '임페리얼레이크 컨트리클럽', region: '충청북도 충주시', totalHoles: 18 },
  // 레이크코스·힐코스 2코스로 확인되었으나 홀별 Par 소스를 찾지 못해 기본값 유지
  { id: 'kingsdale', name: '킹스데일 골프클럽', region: '충청북도 충주시', totalHoles: 18, courses: ['레이크코스', '힐코스'] },
  {
    // 전/후반이 'SKY(계백장군)'·'HILL(의자왕)'이라는 실제 명칭으로 운영됨
    id: 'lotte-buyeo', name: '롯데스카이힐 부여', region: '충청남도 부여군', totalHoles: 18,
    courses: ['SKY(계백장군)', 'HILL(의자왕)'],
    coursePars: { 'SKY(계백장군)': P([4,4,4,4,3,5,4,3,5]), 'HILL(의자왕)': P([4,4,3,5,4,3,5,4,4]) },
  },
  // 마운틴·오션·밸리 3코스로 확인되었으나 홀별 Par 소스를 찾지 못해 기본값 유지
  { id: 'goldenbay', name: '골든베이 골프앤리조트', region: '충청남도 태안군', totalHoles: 27, courses: ['마운틴코스', '오션코스', '밸리코스'] },

  // 영남
  {
    // 동/서 2코스. 공식 사이트에 스코어카드가 없어 제3자 홀 소개 페이지를 종합했고, 18홀 중 2홀은 나머지 홀 파 합산(36)에 맞춰 역산한 값이라 중간 신뢰도
    id: 'blueone-sangju', name: '블루원 상주 골프리조트', region: '경상북도 상주시', totalHoles: 18,
    courses: ['동코스', '서코스'],
    coursePars: { '동코스': P([4,4,5,4,3,4,3,5,4]), '서코스': P([4,5,4,4,5,3,4,3,4]) },
  },
  {
    // 실제 구성은 천마코스·화랑코스(각 18홀)이며 9홀 단위 독립 코스 4개가 아님
    id: 'gyeongju-silla', name: '경주신라 컨트리클럽', region: '경상북도 경주시', totalHoles: 36,
    courses: ['천마코스 OUT', '천마코스 IN', '화랑코스 OUT', '화랑코스 IN'],
    coursePars: {
      '천마코스 OUT': P([4,5,3,4,4,5,3,4,4]),
      '천마코스 IN': P([4,5,4,3,4,4,4,3,5]),
      '화랑코스 OUT': P([4,4,3,5,4,3,5,4,4]),
      '화랑코스 IN': P([4,5,4,3,5,4,3,4,4]),
    },
  },
  // 2022년 블루코스(9홀) 추가로 27홀로 확장. 마우나·블루·오션 3코스명은 확인됐으나 홀별 Par 소스를 찾지 못해 기본값 유지
  { id: 'mauna-ocean', name: '마우나오션 리조트 골프클럽', region: '경상북도 경주시', totalHoles: 27, courses: ['마우나코스', '블루코스', '오션코스'] },
  { id: 'gimcheon-podo', name: '김천포도 컨트리클럽', region: '경상북도 김천시', totalHoles: 18 }, // 구 '베네치아CC'가 재개장하며 개명
  { id: 'pal-gong', name: '팔공 컨트리클럽', region: '대구광역시 동구', totalHoles: 18 },
  {
    // 파크·레이크·캐년 3코스. 파크코스만 홀별 Par 확인됨(레이크·캐년은 소스를 찾지 못해 기본값 유지)
    id: 'bay-side', name: '베이사이드 골프클럽', region: '부산광역시 기장군', totalHoles: 27,
    courses: ['파크코스', '레이크코스', '캐년코스'],
    coursePars: { '파크코스': P([4,4,5,4,3,4,3,4,5]) },
  },
  { id: 'busan-cc', name: '부산 컨트리클럽', region: '부산광역시 금정구', totalHoles: 18 },
  {
    id: 'dongbusan', name: '동부산 컨트리클럽', region: '부산광역시 기장군', totalHoles: 27,
    courses: ['힐코스', '레이크코스', '밸리코스'],
    coursePars: { '힐코스': P([4,5,3,4,5,4,4,3,4]), '레이크코스': P([4,3,5,3,4,4,4,5,4]), '밸리코스': P([4,5,4,3,4,5,3,4,4]) },
  },
  {
    // 골든·로얄·실크 3코스 27홀 챔피언십 코스
    id: 'haeundae', name: '해운대 컨트리클럽', region: '부산광역시 기장군', totalHoles: 27,
    courses: ['로얄코스', '실크코스', '골든코스'],
    coursePars: { '로얄코스': P([4,5,3,4,4,5,4,4,3]), '실크코스': P([4,3,4,4,4,5,4,3,5]), '골든코스': P([5,3,4,5,4,4,3,4,4]) },
  },

  // 호남
  {
    // 동악·섬진·설산 3코스 27홀(실제 소재지는 전남 곡성군이나 명칭은 '광주'로 유지)
    id: 'gwangju-cc', name: '광주 컨트리클럽', region: '광주광역시', totalHoles: 27,
    courses: ['동악코스', '섬진코스', '설산코스'],
    coursePars: { '동악코스': P([4,4,5,4,3,5,4,3,4]), '섬진코스': P([4,4,3,5,4,5,4,3,4]), '설산코스': P([4,4,3,5,4,3,5,4,4]) },
  },
  // 어등·송정·하남 3코스 27홀 — 코스명은 확인됐으나 홀별 Par 소스를 찾지 못해 기본값 유지
  { id: 'eodeungsan', name: '어등산 컨트리클럽', region: '광주광역시', totalHoles: 27, courses: ['어등코스', '송정코스', '하남코스'] },
  {
    // 공식 명칭은 Gold(회원제)·Lake(회원제)·Hill(대중제)·Valley(대중제) 4코스 36홀
    id: 'gold-lake', name: '골드레이크 컨트리클럽', region: '전라남도 나주시', totalHoles: 36,
    courses: ['GOLD', 'LAKE', 'HILL', 'VALLEY'],
    coursePars: {
      'GOLD': P([5,4,3,4,4,5,3,4,4]),
      'LAKE': P([4,3,5,4,4,3,4,4,5]),
      'HILL': P([4,5,4,3,4,5,3,4,4]),
      'VALLEY': P([4,3,4,5,4,4,4,3,5]),
    },
  },
  {
    // 스프링·썸머·어텀 3코스 27홀
    id: 'hwasun', name: '화순 컨트리클럽', region: '전라남도 화순군', totalHoles: 27,
    courses: ['스프링코스', '썸머코스', '어텀코스'],
    coursePars: { '스프링코스': P([4,5,3,4,3,4,4,4,5]), '썸머코스': P([4,4,4,3,5,4,3,5,4]), '어텀코스': P([5,4,4,4,3,4,5,3,4]) },
  },
  // 다산·베아채·장보고 3코스로 확인되었으나 홀별 Par 소스를 찾지 못해 기본값 유지
  { id: 'dasan-beach', name: '다산베아채 골프앤리조트', region: '전라남도 강진군', totalHoles: 27, courses: ['다산코스', '베아채코스', '장보고코스'] },
  {
    // 전반 마운틴코스, 후반 레이크코스라는 실제 명칭으로 운영됨
    id: 'seokjeong', name: '석정힐 컨트리클럽', region: '전북특별자치도 고창군', totalHoles: 18,
    courses: ['마운틴코스', '레이크코스'],
    coursePars: { '마운틴코스': P([4,5,4,5,3,4,3,4,4]), '레이크코스': P([4,4,4,5,3,4,4,3,5]) },
  },
  { id: 'golfzon-muju', name: '무주덕유산 컨트리클럽', region: '전북특별자치도 무주군', totalHoles: 18 },

  // 제주
  { id: 'nine-bridges', name: '나인브릿지 제주', region: '제주특별자치도 서귀포시', totalHoles: 18 },
  // 회원제 18홀(East·West) + 대중제(퍼블릭) 9홀 = 총 27홀. 제3자 소스 간 코스명(North vs South)·Par 데이터가 서로 충돌해 신뢰할 수 없어 기본값 유지
  { id: 'pinx', name: '핀크스 골프클럽', region: '제주특별자치도 서귀포시', totalHoles: 27 },
  // 회원제 18홀(SKY+PALM) + 대중제 18홀(LAKE+VALLEY) = 총 36홀 — 코스명만 확인됨, 홀별 Par 소스를 찾지 못해 기본값 유지
  { id: 'haevichi-jeju', name: '해비치 컨트리클럽 제주', region: '제주특별자치도 서귀포시', totalHoles: 36, courses: ['SKY', 'PALM', 'LAKE', 'VALLEY'] },
  {
    id: 'lotte-jeju', name: '롯데스카이힐 제주 컨트리클럽', region: '제주특별자치도 서귀포시', totalHoles: 36,
    courses: ['SKY', 'HILL', 'OCEAN', 'FOREST'],
    coursePars: {
      'SKY': P([4,4,4,5,3,4,4,3,5]),
      'HILL': P([5,3,4,4,3,4,4,5,4]),
      'OCEAN': P([4,4,4,4,3,5,4,3,5]),
      'FOREST': P([5,4,4,3,4,5,4,3,5]), // 공식 스코어카드 2회 추출 모두 파37로 특이하게 확인됨(9홀 기준 이례적)
    },
  },
  // 회원제 18홀 + 대중제 18홀 = 총 36홀
  { id: 'eli-jeju', name: '엘리시안 제주 컨트리클럽', region: '제주특별자치도 제주시', totalHoles: 36 },
  // West·North·East·South 4코스 36홀 — 코스명은 공식 홈페이지에서 확인됐으나 홀별 Par 소스를 찾지 못해 기본값 유지
  { id: 'cypress', name: '사이프러스 골프앤리조트', region: '제주특별자치도 서귀포시', totalHoles: 36, courses: ['WEST', 'NORTH', 'EAST', 'SOUTH'] },
  { id: 'tedivalley', name: '테디밸리 골프앤리조트', region: '제주특별자치도 서귀포시', totalHoles: 18 },
  // 전반 한라코스, 후반 해안코스라는 실제 명칭으로 운영됨(한국관광공사 운영 공식 사이트 확인) — 홀별 Par 소스를 찾지 못해 기본값 유지
  { id: 'jungmun', name: '중문 골프클럽', region: '제주특별자치도 서귀포시', totalHoles: 18, courses: ['한라코스', '해안코스'] },
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
