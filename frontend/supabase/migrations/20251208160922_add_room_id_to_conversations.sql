/*
  # 为对话表添加房间号字段

  1. 修改的表
    - `conversations`
      - 新增 `room_id` (integer, 唯一) - 房间号，每个对话对应一个唯一房间号

  2. 安全性
    - 保持现有的RLS策略
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'conversations' AND column_name = 'room_id'
  ) THEN
    ALTER TABLE conversations ADD COLUMN room_id integer UNIQUE;
  END IF;
END $$;
