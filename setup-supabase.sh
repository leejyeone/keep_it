#!/bin/bash

# Supabase 데이터 마이그레이션 스크립트
# 로컬 스토리지의 데이터를 Supabase로 옮길 수 있습니다

echo "🚀 Keep It - Supabase 마이그레이션 시작"
echo "========================================="

# 1. Node.js 설치 확인
if ! command -v node &> /dev/null; then
    echo "❌ Node.js가 설치되지 않았습니다."
    echo "   https://nodejs.org 에서 설치하세요."
    exit 1
fi

echo "✅ Node.js 설치됨: $(node --version)"

# 2. 패키지 설치 확인
if [ ! -d "node_modules" ]; then
    echo "📦 패키지 설치 중..."
    npm install
fi

# 3. .env 파일 확인
if [ ! -f ".env" ]; then
    echo "⚠️  .env 파일이 없습니다."
    echo "   .env.example을 참고하여 .env 파일을 생성하세요."
    echo "   SUPABASE_URL과 SUPABASE_ANON_KEY를 입력해야 합니다."
    exit 1
fi

echo "✅ .env 파일 확인됨"

# 4. Supabase 데이터베이스 스키마 생성 안내
echo ""
echo "📝 다음 단계를 수행하세요:"
echo "========================================="
echo "1. Supabase 대시보드 (https://supabase.com/dashboard) 접속"
echo "2. SQL Editor 선택"
echo "3. supabase-schema.sql 파일의 내용을 복사하여 붙여넣기"
echo "4. Run 버튼 클릭"
echo ""
echo "5. 그 후 다음 명령어를 실행하세요:"
echo "   npm run dev"
echo ""
echo "🎉 완료! 앱이 시작되면 자동으로 Supabase와 동기화됩니다."
