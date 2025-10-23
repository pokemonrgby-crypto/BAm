# 프로젝트 배포 가이드

## 🎮 뱀파이어 서바이벌 게임 완성!

모든 요구사항이 구현되었으며, GitHub Pages로 배포할 준비가 완료되었습니다.

## 📋 구현 완료 체크리스트

✅ **33개의 스킬** - 요구사항: 30개 이상
✅ **5가지 기본 스킬** - 마법 지팡이, 도끼, 마늘, 성경, 성수
✅ **레벨업 시스템** - 3개 카드 선택, 6개 슬롯 관리
✅ **패시브 스탯** - 6종류의 스탯 업그레이드
✅ **액티브 스킬** - 대시(Space), 폭탄(Q)
✅ **5가지 적 타입** - 기본, 빠른, 탱크, 원거리, 보스
✅ **난이도 증가** - 시간에 따른 적 강화
✅ **무한 맵** - 자유로운 이동
✅ **모바일 호환** - 터치 컨트롤 지원
✅ **깔끔한 UI** - 현대적인 디자인
✅ **한국어 지원** - 모든 UI 한국어
✅ **코드 품질** - 모든 파일 500줄 이하
✅ **보안 검사** - CodeQL 통과 (0개 취약점)

## 🚀 GitHub Pages 배포 방법

### 1단계: 저장소 설정
1. GitHub 저장소로 이동
2. `Settings` 클릭
3. 왼쪽 메뉴에서 `Pages` 클릭

### 2단계: GitHub Actions 활성화
1. Source 섹션에서 `GitHub Actions` 선택
2. 저장 (자동 저장됨)

### 3단계: 브랜치 머지
1. 이 PR을 main 브랜치로 머지
2. GitHub Actions가 자동으로 빌드 시작
3. 빌드 완료 후 자동 배포

### 4단계: 게임 플레이
배포 완료 후 다음 URL에서 게임을 플레이할 수 있습니다:
```
https://{사용자이름}.github.io/{저장소이름}/
```

## 💻 로컬 개발 환경

### 설치
```bash
npm install
```

### 개발 서버 실행
```bash
npm run dev
```
브라우저에서 `http://localhost:3000` 접속

### 프로덕션 빌드
```bash
npm run build
```
빌드된 파일은 `dist/` 폴더에 생성됩니다.

### 빌드 미리보기
```bash
npm run preview
```

## 🎮 게임 조작법

### 키보드
- **WASD** 또는 **방향키**: 이동
- **Space**: 대시 (2회 충전)
- **Q**: 폭탄 (60초 쿨다운)
- **ESC**: 일시정지

### 터치 (모바일/태블릿)
- 화면을 터치하여 이동 방향 조작
- 터치 제스처로 대시 및 폭탄 사용

## 📊 프로젝트 통계

- **총 파일 수**: 26개
- **총 코드 라인**: 4,213줄
- **최대 파일 크기**: 387줄
- **구현 스킬 수**: 33개
- **적 타입**: 5종
- **빌드 시간**: ~0.4초
- **빌드 크기**: 65KB (gzip: 17KB)

## 🛠️ 기술 스택

- **프론트엔드**: Vanilla JavaScript (ES6+)
- **빌드 도구**: Vite 5.0
- **린터**: ESLint
- **CI/CD**: GitHub Actions
- **배포**: GitHub Pages
- **그래픽**: Canvas 2D API

## 📁 프로젝트 구조

```
BAm/
├── .github/
│   └── workflows/
│       └── deploy.yml          # GitHub Actions 워크플로우
├── src/
│   ├── core/                   # 게임 엔진 핵심
│   │   └── GameEngine.js
│   ├── entities/               # 게임 엔티티
│   │   └── Player.js
│   ├── enemies/                # 적 시스템
│   │   ├── Enemy.js
│   │   └── EnemySpawner.js
│   ├── managers/               # 게임 매니저
│   │   ├── ActiveSkillManager.js
│   │   ├── ExperienceManager.js
│   │   ├── InputManager.js
│   │   ├── ItemManager.js
│   │   ├── LevelUpManager.js
│   │   ├── UIManager.js
│   │   └── WeaponManager.js
│   ├── utils/                  # 유틸리티
│   │   ├── Camera.js
│   │   └── CollisionDetector.js
│   ├── weapons/                # 무기 시스템
│   │   ├── Weapon.js          # 기본 무기 클래스
│   │   ├── Projectile.js      # 투사체 클래스
│   │   ├── MagicMissile.js    # 마법 지팡이
│   │   ├── Axe.js             # 도끼
│   │   ├── Garlic.js          # 마늘
│   │   ├── HolyBible.js       # 성경
│   │   ├── HolyWater.js       # 성수
│   │   ├── AdvancedWeapons1.js # 추가 무기 1-2
│   │   ├── AdvancedWeapons2.js # 추가 무기 3-5
│   │   ├── AdvancedWeapons3.js # 추가 무기 6-8
│   │   ├── AdvancedWeapons4.js # 추가 무기 9-18
│   │   └── AdvancedWeapons5.js # 추가 무기 19-28
│   └── main.js                # 진입점
├── index.html                 # HTML 템플릿
├── package.json               # 의존성 관리
├── vite.config.js            # Vite 설정
├── .eslintrc.json            # ESLint 설정
├── .gitignore                # Git 무시 파일
├── README.md                  # 프로젝트 설명
└── IMPLEMENTATION.md          # 구현 상세 문서
```

## 🎯 게임 특징

### 다양한 스킬 (33개)
각 스킬은 고유한 공격 패턴과 업그레이드 경로를 가지고 있습니다:
- **투사체형**: 마법 지팡이, 도끼, 유도탄, 화염탄, 얼음 창, 레이저 빔, 부메랑, 샷건, 폭풍검, 독침 등
- **범위형**: 마늘, 성수, 독구름, 펄스 웨이브, 폭탄 비, 전기 충격, 중력장 등
- **궤도형**: 성경, 위성, 체인 소, 회전 검 등
- **특수형**: 전기장, 회오리, 운석, 드릴, 시간 정지, 소환수, 분신, 광선검 등
- **패시브형**: 방패, 흡혈 오라, 카운터 등

### 진행 시스템
- 레벨업 시 3개의 선택지 제공
- 최대 6개 무기 동시 장착
- 각 무기는 8레벨까지 업그레이드
- 극대화 시 특별 효과 발동

### 적 시스템
- **기본 적**: 균형잡힌 능력치
- **빠른 적**: 높은 이동속도, 낮은 체력
- **탱크 적**: 높은 체력과 공격력, 느린 속도
- **원거리 적**: 투사체 공격
- **보스**: 2분마다 등장하는 강력한 적

## 🐛 문제 해결

### 빌드가 실패하는 경우
```bash
# 의존성 재설치
rm -rf node_modules package-lock.json
npm install

# 빌드 재시도
npm run build
```

### GitHub Pages가 작동하지 않는 경우
1. Settings > Pages에서 Source가 "GitHub Actions"로 설정되어 있는지 확인
2. Actions 탭에서 워크플로우 실행 상태 확인
3. 빌드 로그에서 에러 메시지 확인

### 게임이 로드되지 않는 경우
1. 브라우저 콘솔(F12)에서 에러 확인
2. 최신 브라우저 사용 (Chrome, Firefox, Safari, Edge 권장)
3. JavaScript가 활성화되어 있는지 확인

## 📝 추가 개선 아이디어

### 사운드 시스템
- 배경 음악 추가
- 효과음 (공격, 레벨업, 피격 등)

### 추가 게임 모드
- 엔드리스 모드
- 챌린지 모드
- 보스 러시

### 소셜 기능
- 점수 공유
- 리더보드
- 업적 시스템

### 그래픽 개선
- 파티클 효과
- 더 나은 애니메이션
- 스킨 시스템

## 📞 지원

문제가 발생하거나 질문이 있으시면 GitHub Issues에 등록해 주세요.

## 🎉 완료!

모든 구현이 완료되었습니다. 이제 게임을 즐기세요! 🎮
