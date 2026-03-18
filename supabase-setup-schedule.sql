-- ============================================
-- QuickFigure: 일정 맞추기 (Schedule Finder) 테이블 설정
-- Supabase SQL Editor에서 실행하세요
-- ============================================

-- ============================================
-- 1. schedule_rooms (방 정보)
-- ============================================
CREATE TABLE IF NOT EXISTS schedule_rooms (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  room_code text NOT NULL UNIQUE,
  title text NOT NULL,
  creator_name text NOT NULL,
  dates jsonb NOT NULL DEFAULT '[]'::jsonb,
  time_range_start integer NOT NULL DEFAULT 9,
  time_range_end integer NOT NULL DEFAULT 22,
  time_slot_minutes integer NOT NULL DEFAULT 30,
  created_at timestamptz DEFAULT now(),
  expires_at timestamptz DEFAULT (now() + interval '7 days'),
  is_active boolean DEFAULT true,

  -- 유효성 검사
  CONSTRAINT valid_time_range CHECK (time_range_start >= 0 AND time_range_start <= 23),
  CONSTRAINT valid_time_end CHECK (time_range_end >= 0 AND time_range_end <= 23),
  CONSTRAINT valid_time_order CHECK (time_range_end > time_range_start),
  CONSTRAINT valid_time_slot CHECK (time_slot_minutes IN (30, 60))
);

-- room_code로 빠른 조회를 위한 인덱스
CREATE INDEX IF NOT EXISTS idx_schedule_rooms_room_code ON schedule_rooms (room_code);

-- 만료된 방 정리용 인덱스
CREATE INDEX IF NOT EXISTS idx_schedule_rooms_expires_at ON schedule_rooms (expires_at) WHERE is_active = true;

-- ============================================
-- 2. schedule_participants (참가자)
-- ============================================
CREATE TABLE IF NOT EXISTS schedule_participants (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id uuid NOT NULL REFERENCES schedule_rooms(id) ON DELETE CASCADE,
  nickname text NOT NULL,
  joined_at timestamptz DEFAULT now(),

  -- 같은 방에 같은 닉네임 불가
  UNIQUE(room_id, nickname)
);

-- room_id로 참가자 조회 인덱스
CREATE INDEX IF NOT EXISTS idx_schedule_participants_room_id ON schedule_participants (room_id);

-- ============================================
-- 3. schedule_votes (투표 데이터)
-- ============================================
CREATE TABLE IF NOT EXISTS schedule_votes (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id uuid NOT NULL REFERENCES schedule_rooms(id) ON DELETE CASCADE,
  participant_id uuid NOT NULL REFERENCES schedule_participants(id) ON DELETE CASCADE,
  date date NOT NULL,
  time_slot text NOT NULL,
  available boolean NOT NULL DEFAULT true,
  voted_at timestamptz DEFAULT now(),

  -- 중복 투표 방지
  UNIQUE(participant_id, date, time_slot)
);

-- room_id로 투표 조회 인덱스
CREATE INDEX IF NOT EXISTS idx_schedule_votes_room_id ON schedule_votes (room_id);

-- participant_id로 투표 조회 인덱스
CREATE INDEX IF NOT EXISTS idx_schedule_votes_participant_id ON schedule_votes (participant_id);

-- ============================================
-- 4. RLS (Row Level Security) 설정
-- ============================================

-- RLS 활성화
ALTER TABLE schedule_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE schedule_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE schedule_votes ENABLE ROW LEVEL SECURITY;

-- 기존 정책 삭제 (재실행 안전)
DROP POLICY IF EXISTS "Allow public insert rooms" ON schedule_rooms;
DROP POLICY IF EXISTS "Allow public select rooms" ON schedule_rooms;
DROP POLICY IF EXISTS "Allow public insert participants" ON schedule_participants;
DROP POLICY IF EXISTS "Allow public select participants" ON schedule_participants;
DROP POLICY IF EXISTS "Allow public insert votes" ON schedule_votes;
DROP POLICY IF EXISTS "Allow public update votes" ON schedule_votes;
DROP POLICY IF EXISTS "Allow public select votes" ON schedule_votes;

-- schedule_rooms: 누구나 방 생성 가능
CREATE POLICY "Allow public insert rooms"
  ON schedule_rooms
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- schedule_rooms: 누구나 room_code로 조회 가능
CREATE POLICY "Allow public select rooms"
  ON schedule_rooms
  FOR SELECT
  TO anon
  USING (true);

-- schedule_participants: 누구나 참가 가능
CREATE POLICY "Allow public insert participants"
  ON schedule_participants
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- schedule_participants: 누구나 room_id로 참가자 조회 가능
CREATE POLICY "Allow public select participants"
  ON schedule_participants
  FOR SELECT
  TO anon
  USING (true);

-- schedule_votes: 누구나 투표 가능
CREATE POLICY "Allow public insert votes"
  ON schedule_votes
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- schedule_votes: 투표 수정 가능 (가능→불가능 변경 등)
CREATE POLICY "Allow public update votes"
  ON schedule_votes
  FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

-- schedule_votes: 누구나 room_id로 투표 결과 조회 가능
CREATE POLICY "Allow public select votes"
  ON schedule_votes
  FOR SELECT
  TO anon
  USING (true);

-- ============================================
-- 5. 확인: 테이블 구조 출력
-- ============================================
SELECT 'schedule_rooms' AS table_name, column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'schedule_rooms'
ORDER BY ordinal_position;

SELECT 'schedule_participants' AS table_name, column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'schedule_participants'
ORDER BY ordinal_position;

SELECT 'schedule_votes' AS table_name, column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'schedule_votes'
ORDER BY ordinal_position;
