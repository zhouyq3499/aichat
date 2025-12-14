/*
  # AI脑筋急转弯游戏数据库架构

  1. 新建表
    - `conversations` - 存储对话会话
      - `id` (uuid, 主键)
      - `title` (text) - 对话标题
      - `created_at` (timestamptz) - 创建时间
      - `updated_at` (timestamptz) - 更新时间
    
    - `messages` - 存储消息记录
      - `id` (uuid, 主键)
      - `conversation_id` (uuid) - 关联对话ID
      - `role` (text) - 消息角色 ('user' 或 'assistant')
      - `content` (text) - 消息内容
      - `created_at` (timestamptz) - 创建时间

  2. 安全性
    - 启用conversations和messages表的RLS
    - 允许所有用户读取和创建数据(简化版，实际应用中应添加认证)
*/

CREATE TABLE IF NOT EXISTS conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL DEFAULT '新对话',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('user', 'assistant')),
  content text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all to read conversations"
  ON conversations
  FOR SELECT
  USING (true);

CREATE POLICY "Allow all to insert conversations"
  ON conversations
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow all to update conversations"
  ON conversations
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow all to delete conversations"
  ON conversations
  FOR DELETE
  USING (true);

CREATE POLICY "Allow all to read messages"
  ON messages
  FOR SELECT
  USING (true);

CREATE POLICY "Allow all to insert messages"
  ON messages
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow all to update messages"
  ON messages
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow all to delete messages"
  ON messages
  FOR DELETE
  USING (true);

CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);
CREATE INDEX IF NOT EXISTS idx_conversations_created_at ON conversations(created_at DESC);