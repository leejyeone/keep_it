@echo off
REM Supabase 데이터 마이그레이션 스크립트 (Windows)
REM 로컬 스토리지의 데이터를 Supabase로 옮길 수 있습니다

echo 🚀 Keep It - Supabase 마이그레이션 시작
echo =========================================

REM 1. Node.js 설치 확인
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Node.js가 설치되지 않았습니다.
    echo    https://nodejs.org 에서 설치하세요.
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
echo ✅ Node.js 설치됨: %NODE_VERSION%

REM 2. 패키지 설치 확인
if not exist "node_modules" (
    echo 📦 패키지 설치 중...
    call npm install
)

REM 3. .env 파일 확인
if not exist ".env" (
    echo ⚠️  .env 파일이 없습니다.
    echo    .env.example을 참고하여 .env 파일을 생성하세요.
    echo    SUPABASE_URL과 SUPABASE_ANON_KEY를 입력해야 합니다.
    pause
    exit /b 1
)

echo ✅ .env 파일 확인됨

REM 4. Supabase 데이터베이스 스키마 생성 안내
echo.
echo 📝 다음 단계를 수행하세요:
echo =========================================
echo 1. Supabase 대시보드 ^(https://supabase.com/dashboard^) 접속
echo 2. SQL Editor 선택
echo 3. supabase-schema.sql 파일의 내용을 복사하여 붙여넣기
echo 4. Run 버튼 클릭
echo.
echo 5. 그 후 다음 명령어를 실행하세요:
echo    npm run dev
echo.
echo 🎉 완료! 앱이 시작되면 자동으로 Supabase와 동기화됩니다.
echo.
pause
