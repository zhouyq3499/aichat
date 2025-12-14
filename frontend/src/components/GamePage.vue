<template>
  <div class="flex h-screen bg-gray-50">
    <Sidebar
      :current-conversation-id="currentConversationId"
      @select-conversation="handleSelectConversation"
      @new-conversation="handleNewConversation"
    />

    <div class="flex-1 flex flex-col">
      <div class="bg-white border-b border-gray-200 px-6 py-4 shadow-sm">
        <div class="flex items-center justify-between mb-4">
          <h1 class="text-2xl font-bold text-gray-800">AI 脑筋急转弯</h1>
          <button
            @click="$emit('endGame')"
            class="px-6 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors duration-200 font-medium"
          >
            返回首页
          </button>
        </div>
        <div class="text-lg font-semibold text-gray-700">
          房间号: <span class="text-blue-600">{{ roomId ?? '——' }}</span>
        </div>
      </div>

      <div class="flex-1 overflow-y-auto px-6 py-6 space-y-4">
        <div v-if="messages.length === 0" class="text-center text-gray-400 mt-20">
          <p class="text-lg">点击下方"开始游戏"按钮或输入"start"开始游戏</p>
        </div>

        <div
          v-for="message in messages"
          :key="message.id"
          :class="['flex items-start gap-3', message.role === 'user' ? 'flex-row-reverse' : '']"
        >
          <div
            :class="[
              'flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center',
              message.role === 'user' ? 'bg-blue-500' : 'bg-green-500'
            ]"
          >
            <User v-if="message.role === 'user'" class="w-5 h-5 text-white" />
            <Bot v-else class="w-5 h-5 text-white" />
          </div>

          <div
            :class="[
              'max-w-2xl px-4 py-3 rounded-2xl',
              message.role === 'user'
                ? 'bg-blue-500 text-white'
                : 'bg-white border border-gray-200 text-gray-800'
            ]"
          >
            <p class="whitespace-pre-wrap leading-relaxed">{{ message.content }}</p>
          </div>
        </div>

        <div v-if="isLoading" class="flex items-start gap-3">
          <div class="flex-shrink-0 w-10 h-10 rounded-full bg-green-500 flex items-center justify-center">
            <Bot class="w-5 h-5 text-white" />
          </div>
          <div class="bg-white border border-gray-200 px-4 py-3 rounded-2xl">
            <div class="flex gap-1">
              <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0ms"></div>
              <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 150ms"></div>
              <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 300ms"></div>
            </div>
          </div>
        </div>

        <div ref="messagesEndRef" />
      </div>

      <div class="bg-white border-t border-gray-200 px-6 py-4 shadow-lg">
        <div class="flex gap-3 mb-3">
          <button
            @click="handleStartGame"
            :disabled="startButtonDisabled"
            :class="[
              'flex items-center gap-2 px-6 py-2 rounded-lg font-medium transition-colors duration-200',
              startButtonDisabled
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-green-500 hover:bg-green-600 text-white'
            ]"
          >
            <Play class="w-5 h-5" />
            开始游戏
          </button>

          <button
            @click="handleResetGame"
            :disabled="!gameStarted || gameFinished"
            :class="[
              'flex items-center gap-2 px-6 py-2 rounded-lg font-medium transition-colors duration-200',
              !gameStarted || gameFinished
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-red-500 hover:bg-red-600 text-white'
            ]"
          >
            <StopCircle class="w-5 h-5" />
            结束游戏
          </button>
        </div>

        <div class="flex gap-3">
          <input
            v-model="inputValue"
            type="text"
            @keydown="handleKeyPress"
            :placeholder="gameStarted ? '请输入内容' : '或输入&quot;start&quot;开始游戏'"
            :disabled="isLoading"
            class="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
          />
          <button
            @click="handleSendMessage"
            :disabled="!inputValue.trim() || isLoading"
            class="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors duration-200 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2 font-medium"
          >
            <Send class="w-5 h-5" />
            发送
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUpdated, nextTick } from 'vue';
import { Send, User, Bot, Play, StopCircle } from 'lucide-vue-next';
import { supabase, Message, Conversation } from '../lib/supabase';
import api from '../lib/api';
import Sidebar from './Sidebar.vue';

defineEmits<{
  endGame: [];
}>();

const roomId = ref<number | null>(null);
const messages = ref<Message[]>([]);
const inputValue = ref('');
const isLoading = ref(false);
const gameStarted = ref(false);
const gameFinished = ref(false);
const startButtonDisabled = ref(false);
// 🚀 修复 TypeScript 错误: 允许 currentConversationId 为 string 或 null
const currentConversationId = ref<string | null>(null); 
const currentConversation = ref<Conversation | null>(null);
const messagesEndRef = ref<HTMLDivElement>();

const scrollToBottom = () => {
  nextTick(() => messagesEndRef.value?.scrollIntoView({ behavior: 'smooth' }));
};

onUpdated(() => scrollToBottom());

/* ----------------- 生命周期 ----------------- */
onMounted(() => {
  // 修复类型错误：确保在调用 loadConversation 时 currentConversationId.value 不为 null
  if (currentConversationId.value) {
    loadConversation(currentConversationId.value);
  }
});

/* ----------------- 按钮状态控制 ----------------- */
const updateButtonState = () => {
  // 按钮禁用状态依赖于 gameStarted 和 gameFinished
  startButtonDisabled.value = gameStarted.value && !gameFinished.value;
};

/* ----------------- 聊天相关 ----------------- */
const loadConversation = async (conversationId: string) => {
  try {
    const { data: conversation, error: convError } = await supabase
      .from('conversations')
      .select('*')
      // 修复类型错误: conversationId 此时保证是 string
      .eq('id', conversationId)
      .single();

    if (convError) {
      console.error('Error loading conversation:', convError);
      return;
    }

    currentConversation.value = conversation;
    if (conversation.room_id) roomId.value = conversation.room_id;

    const { data: msgs, error: msgError } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (msgError) {
      console.error('Error loading messages:', msgError);
      return;
    }

    messages.value = msgs || [];
    gameFinished.value = msgs?.some((m) => m.content.includes('[Game Finished]')) ?? false;
    // 优化: 只有当有消息且游戏未结束时，才认为是游戏进行中
    gameStarted.value = msgs && msgs.length > 0 && !gameFinished.value; 
    updateButtonState();
  } catch (e) {
    console.error(e);
  }
};

const createNewConversation = async () => {
  try {
    const newRoomId = Math.floor(Math.random() * 1000000);
    const { data, error } = await supabase
      .from('conversations')
      .insert([{ title: '新对话', room_id: newRoomId }])
      .select()
      .single();

    if (error) {
      console.error('Error creating conversation:', error);
      return null;
    }
    return data;
  } catch (e) {
    console.error(e);
    return null;
  }
};

const saveMessage = async (conversationId: string, role: 'user' | 'assistant', content: string) => {
  try {
    // 修复类型错误: conversationId 此时保证是 string
    const { data, error } = await supabase
      .from('messages')
      .insert([{ conversation_id: conversationId, role, content }])
      .select()
      .single();

    if (error) {
      console.error('Error saving message:', error);
      return null;
    }
    return data;
  } catch (e) {
    console.error(e);
    return null;
  }
};

const updateConversationTitle = async (conversationId: string, title: string) => {
  try {
    // 修复类型错误: conversationId 此时保证是 string
    if (!conversationId) return;
    await supabase
      .from('conversations')
      .update({ title, updated_at: new Date().toISOString() })
      .eq('id', conversationId);
  } catch (e) {
    console.error(e);
  }
};

/* ----------------- 事件处理 ----------------- */
const handleSelectConversation = async (id: string) => {
  currentConversationId.value = id;
  await loadConversation(id);
  scrollToBottom();
};

const handleStartGame = async () => {
  if (startButtonDisabled.value || isLoading.value) return;
  isLoading.value = true;

  try {
    let conversationId = currentConversationId.value;
    let currentRoomId = roomId.value;

    if (!conversationId) {
      const newConv = await createNewConversation();
      if (!newConv) throw new Error('Failed to create conversation');
      conversationId = newConv.id;
      currentRoomId = newConv.room_id;
      // 修复类型错误: 确保赋值给 currentConversationId.value
      currentConversationId.value = conversationId;
      currentConversation.value = newConv;
      roomId.value = currentRoomId;
    }

    if (!currentRoomId || !conversationId) throw new Error('Room ID or Conversation ID unavailable');

    const userMsg = await saveMessage(conversationId, 'user', 'Start');
    if (!userMsg) throw new Error('Save user message failed');

    const reply = await api.chat(currentRoomId, 'Start');
    const aiMsg = await saveMessage(conversationId, 'assistant', reply);
    if (!aiMsg) throw new Error('Save AI message failed');

    messages.value.push(userMsg, aiMsg);
    gameStarted.value = true;
    gameFinished.value = reply.includes('[Game Finished]');
    updateButtonState();
    await updateConversationTitle(conversationId, 'Start');
  } catch (e: any) {
    console.error(e);
    alert('连接后端失败，请确保后端服务运行在 http://localhost:8080');
  } finally {
    isLoading.value = false;
  }
};

const handleSendMessage = async () => {
  const text = inputValue.value.trim();
  // 修复类型错误: 确保 non-null
  if (!text || isLoading.value || !roomId.value || !currentConversationId.value) return;

  if (text.toLowerCase() === 'start') {
    await handleStartGame();
    inputValue.value = '';
    return;
  }

  isLoading.value = true;
  inputValue.value = '';

  try {
    // 修复类型错误: 使用非空断言 '!'
    const userMsg = await saveMessage(currentConversationId.value!, 'user', text);
    if (!userMsg) throw new Error('Save user message failed');
    messages.value.push(userMsg);

    const reply = await api.chat(roomId.value!, text);
    // 修复类型错误: 使用非空断言 '!'
    const aiMsg = await saveMessage(currentConversationId.value!, 'assistant', reply);
    if (!aiMsg) throw new Error('Save AI message failed');
    messages.value.push(aiMsg);


    if (reply.includes('[Game Finished]')) {
      gameFinished.value = true;
      // 🚀 关键修复: 确保 AI 结束游戏时，将 gameStarted 设为 false
      gameStarted.value = false; 
      updateButtonState();
      await nextTick();   // 确保 UI 刷新
    }

    const title = messages.value[0]?.content || text;
    // 修复类型错误: 使用非空断言 '!'
    await updateConversationTitle(currentConversationId.value!, title);
  } catch (e: any) {
    console.error(e);
    alert('发送消息失败');
  } finally {
    isLoading.value = false;
  }
};

const handleKeyPress = (e: KeyboardEvent) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    if (!gameStarted.value) {
      if (inputValue.value.trim().toLowerCase() === 'start') {
        handleStartGame();
        inputValue.value = '';
      }
    } else {
      handleSendMessage();
    }
  }
};

const handleNewConversation = async () => {
  try {
    const newConv = await createNewConversation();
    if (newConv) {
      currentConversationId.value = newConv.id;
      currentConversation.value = newConv;
      roomId.value = newConv.room_id;
      messages.value = [];
      gameStarted.value = false;
      gameFinished.value = false;
      updateButtonState();
      await loadConversation(newConv.id);
      scrollToBottom();
    }
  } catch (e) {
    console.error(e);
    alert('创建新对话失败');
  }
};

// 🚀 关键修复: 恢复异步逻辑，确保手动结束游戏时，按钮状态和聊天记录都能正确更新。
const handleResetGame = async () => {
  // 检查是否已开始且未结束
  if (!gameStarted.value || gameFinished.value || isLoading.value) return;

  const text = 'End Game'; // 发送给 AI 的特殊指令
  isLoading.value = true;

  try {
    // 确保 non-null
    if (!currentConversationId.value || !roomId.value) {
      throw new Error('对话或房间信息缺失');
    }
    
    // 1. 发送用户消息
    const userMsg = await saveMessage(currentConversationId.value, 'user', text);
    if (!userMsg) throw new Error('Save user message failed');
    messages.value.push(userMsg);

    // 2. 调用 API 获取最终答案
    const reply = await api.chat(roomId.value, text); 
    const aiMsg = await saveMessage(currentConversationId.value, 'assistant', reply);
    if (!aiMsg) throw new Error('Save AI message failed');
    messages.value.push(aiMsg);

    // 3. 标记游戏结束并更新 UI
    gameFinished.value = true;
    gameStarted.value = false; 
    updateButtonState();
    await nextTick(); // 确保 UI 刷新

    // 4. 更新对话标题
    const title = messages.value[0]?.content || text;
    await updateConversationTitle(currentConversationId.value, title);

  } catch (e: any) {
    console.error(e);
    alert('结束游戏失败或无法连接后端');
  } finally {
    isLoading.value = false;
  }
};
</script>