# Supabase 연결 가이드

이 가이드는 Keep It 앱을 Supabase와 연결하는 방법을 설명합니다.

## 1단계: Supabase 프로젝트 생성

1. [Supabase](https://supabase.com)에 접속하고 로그인합니다
2. "New Project" 버튼을 클릭합니다
3. 프로젝트 이름을 입력합니다 (예: `keep-it`)
4. 강력한 데이터베이스 비밀번호를 설정합니다
5. 지역을 선택합니다 (권장: 서울/동경 등 가까운 지역)
6. "Create new project" 클릭

## 2단계: 데이터베이스 스키마 설정

프로젝트가 준비되면:

1. Supabase 대시보시로 이동합니다
2. 왼쪽 사이드바에서 "SQL Editor" 클릭
3. "+ New Query" 버튼 클릭
4. `supabase-schema.sql` 파일의 내용을 복사하여 에디터에 붙여넣기
5. "Run" 버튼 클릭하여 스키마 생성

또는 다음 명령어로 한 번에 실행:
```bash
# supabase-schema.sql 파일의 SQL을 Supabase SQL Editor에서 직접 실행
```

## 3단계: API 키 확인

1. Supabase 대시보드에서 "Settings" → "API" 메뉴로 이동
2. Project URL과 Anon Key를 찾습니다
3. `.env` 파일에서 다음을 업데이트합니다:

```env
SUPABASE_URL="your_project_url"
SUPABASE_ANON_KEY="your_anon_key"
VITE_SUPABASE_URL="your_project_url"
VITE_SUPABASE_ANON_KEY="your_anon_key"
```

## 4단계: 앱 시작

```bash
npm install
npm run dev
```

앱이 시작되면 Supabase가 자동으로 연결됩니다.

## 데이터베이스 테이블 설명

### profiles
사용자 프로필 정보 저장
- `id`: UUID 기본 키
- `user_id`: 사용자 고유 ID (TEXT, UNIQUE)
- `name`: 사용자 이름
- `gender`: 성별 (M/F)
- `age`: 나이
- `created_at`: 생성 날짜
- `updated_at`: 수정 날짜

### user_routines
사용자의 루틴/보충제 목록
- `id`: UUID 기본 키
- `user_id`: 사용자 ID (profiles와 연결)
- `name`: 루틴 이름 (보충제 이름)
- `time_of_day`: 시간대 (morning/afternoon/evening)
- `created_at`: 생성 날짜
- `updated_at`: 수정 날짜

### history
사용자의 루틴 완료 기록
- `id`: UUID 기본 키
- `user_id`: 사용자 ID
- `date`: 날짜 (YYYY-MM-DD 형식)
- `routine_id`: 루틴 ID
- `completed`: 완료 여부 (boolean)
- `created_at`: 생성 날짜

## RLS (Row Level Security) 정책

모든 테이블에 기본 RLS 정책이 적용되어 있습니다.
프로덕션 환경에서는 더 엄격한 정책으로 업데이트하는 것을 권장합니다.

## 문제 해결

### 테이블이 생성되지 않은 경우
1. Supabase 대시보드의 SQL Editor에서 스키마 SQL을 직접 실행
2. 오류 메시지 확인 및 필요시 권한 설정 확인

### 데이터가 동기화되지 않는 경우
1. 브라우저 콘솔에서 에러 메시지 확인
2. `.env` 파일의 API 키가 올바른지 확인
3. Supabase 대시보드에서 테이블 및 데이터 확인

### 권한 문제
1. Supabase Settings → Authentication 에서 사용자 관리 확인
2. RLS 정책이 올바르게 설정되었는지 확인

## 앱 기능

### 데이터 저장
- 사용자 프로필 (이름, 성별, 나이)
- 루틴/보충제 목록
- 완료 기록 (달력 뷰)

### 자동 동기화
- 앱은 자동으로 변경사항을 Supabase에 저장합니다
- 다른 기기에서도 같은 계정으로 접속하면 데이터를 불러올 수 있습니다

## 추가 정보

- [Supabase 공식 문서](https://supabase.com/docs)
- [Supabase JavaScript 클라이언트](https://github.com/supabase/supabase-js)
- [Row Level Security (RLS)](https://supabase.com/docs/guides/auth/row-level-security)
