# Happy Golf v7.1.1 — 공식 거리 데이터 감사

## 원칙
- 기존 스코어 입력/저장/통계/UI 로직은 변경하지 않는다.
- 거리 데이터만 `src/data/golfCourses.ts`에 보강한다.
- 공식 골프장 홈페이지에서 홀별 거리값을 직접 확인한 경우만 입력한다.
- 공식 페이지가 야드(yd)로만 제공하는 경우 앱의 미터 표시를 위해 1yd = 0.9144m로 환산하고 반올림한다.
- 공식 페이지에서 티 구분 없이 홀별 기준 거리만 제공하는 경우 `official` 값으로 저장하며, 티별 숫자를 추정하지 않는다.
- 확인되지 않은 골프장의 기존 추정/비공식 거리 데이터는 제거한다.

## 이번 버전에 공식 자료로 검증하여 반영한 골프장
1. 세이지우드 홍천 — 드림/비전/챌린지
2. 힐드로사이 컨트리클럽 — Birch/Pine (공식 코스소개 홀별 기준거리)
3. 비콘힐스 골프클럽 — 누리/하늘
4. 소노펠리체 컨트리클럽 — 비발디파크 EAST/WEST/MOUNTAIN
5. 카스카디아 골프클럽 — Stone/Tree/Water (공식 야드값을 m 환산)
6. 블루원 용인 컨트리클럽 — West/Middle/East
7. 해슬리 나인브릿지 — HAESLEY/PGA
8. 써닝포인트 컨트리클럽 — SUN/POINT

## 공식 출처
- 힐드로사이: https://www.hilldeloci.co.kr/course/introduction
- 비콘힐스: https://www.beaconhills.co.kr/Course/NuriCourseInfo.aspx
- 소노펠리체: https://www.sonofelicecc.com/course.sonoCourseInfo.dp/dmparse.dm
- 소노펠리체 WEST: https://www.sonofelicecc.com/course.vivaldiCCCourseInfo.dp/dmparse.dm
- 소노펠리체 MOUNTAIN: https://www.sonofelicecc.com/course.vivaldiCourseInfo.dp/dmparse.dm
- 카스카디아: https://cascadia.kr/swp/golfclub
- 블루원 용인: https://yi.blueone.com/club-introduction/information?type=0
- 해슬리 나인브릿지: https://haesley.com/new/introduce/course/plan.asp
- 써닝포인트: https://www.sunningpoint.com/course/course-info.asp

## 주의
공식 홈페이지에서 현재 홀별 값을 직접 확인하지 못한 나머지 등록 골프장은 임의의 값을 채우지 않았다. 이 원칙을 유지해야 상업 배포 시 거리 데이터의 출처와 신뢰성을 설명할 수 있다.
