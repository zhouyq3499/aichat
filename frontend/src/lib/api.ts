const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8080';

export type ChatRoom = {
  roomId: number;
  chatMessage?: any[];
};

export async function getRooms(): Promise<ChatRoom[]> {
  const res = await fetch(`${API_BASE}/rooms`);
  if (!res.ok) {
    const txt = await res.text().catch(() => res.statusText);
    throw new Error(`getRooms failed: ${txt}`);
  }
  return res.json();
}

export async function chat(roomId: number | string, userPrompt: string): Promise<string> {
  const url = `${API_BASE}/${roomId}/chat?userPrompt=${encodeURIComponent(userPrompt)}`;
  const res = await fetch(url, { method: 'POST' });
  if (!res.ok) {
    const txt = await res.text().catch(() => res.statusText);
    throw new Error(`chat failed: ${txt}`);
  }
  return res.text();
}

export default { getRooms, chat };