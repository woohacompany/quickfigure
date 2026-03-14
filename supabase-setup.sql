-- ============================================
-- QuickFigure: email_subscribers 테이블 설정
-- Supabase SQL Editor에서 실행하세요
-- ============================================

-- 1. 테이블 생성 (이미 있으면 건너뜀)
CREATE TABLE IF NOT EXISTS email_subscribers (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  email text NOT NULL UNIQUE,
  subscribed_at timestamptz DEFAULT now(),
  source text NOT NULL DEFAULT 'homepage',
  is_active boolean DEFAULT true,
  language text NOT NULL DEFAULT 'ko'
);

-- 2. RLS 활성화
ALTER TABLE email_subscribers ENABLE ROW LEVEL SECURITY;

-- 3. 기존 정책 삭제 (재실행 안전)
DROP POLICY IF EXISTS "Allow public insert" ON email_subscribers;
DROP POLICY IF EXISTS "Allow public select own" ON email_subscribers;

-- 4. INSERT 정책: 누구나 구독 가능 (anon key로)
CREATE POLICY "Allow public insert"
  ON email_subscribers
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- 5. SELECT는 차단 (관리자만 서비스키로 조회)
-- anon에게 SELECT를 허용하지 않으므로 이메일 목록 유출 방지

-- 확인: 테이블 구조 출력
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'email_subscribers'
ORDER BY ordinal_position;
