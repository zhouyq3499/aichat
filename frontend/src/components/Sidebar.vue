// 文件: Sidebar.vue (已修复)
<template>
  <div class="w-64 bg-white border-r border-gray-200 flex flex-col h-full shadow-sm">
    <div class="p-4 border-b border-gray-200">
      <h2 class="text-lg font-bold text-gray-800 mb-3">历史对话</h2>
      <button
        @click="$emit('new-conversation')"
        class="w-full px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors duration-200 flex items-center justify-center gap-2 font-medium"
      >
        <Plus class="w-4 h-4" />
        新对话
      </button>
    </div>

    <div class="flex-1 overflow-y-auto p-2">
      <div v-if="loading" class="text-center text-gray-400 mt-8">
        <p class="text-sm">加载中...</p>
      </div>
      <div v-else-if="conversations.length === 0" class="text-center text-gray-400 mt-8">
        <p class="text-sm">暂无对话记录</p>
      </div>
      <div v-else class="space-y-1">
        <div
          v-for="conversation in conversations"
          :key="conversation.id"
          :class="[
            'group px-3 py-3 rounded-lg transition-all duration-200 cursor-pointer flex items-between justify-between',
            currentConversationId === conversation.id // ⭐ 修复: 模板中的比较是安全的，因为 currentConversationId 可能是 null
              ? 'bg-blue-50 border-2 border-blue-500'
              : 'hover:bg-gray-50 border-2 border-transparent'
          ]"
          @click="$emit('select-conversation', conversation.id)"
        >
          <div class="flex-1 min-w-0 flex items-start gap-2">
            <MessageSquare class="w-4 h-4 mt-1 flex-shrink-0 text-gray-500" />
            <div class="flex-1">
              <p class="text-sm font-medium text-gray-800 truncate">
                {{ conversation.title || '未命名对话' }}
              </p>
              <div class="flex items-center gap-2 mt-1">
                <span v-if="conversation.room_id" class="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                  房间 #{{ conversation.room_id }}
                </span>
                <p class="text-xs text-gray-500">
                  {{ formatDate(conversation.updated_at) }}
                </p>
              </div>
            </div>
          </div>
          <button
            @click.stop="handleDelete(conversation.id)"
            class="ml-2 p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-red-100 text-red-500 transition-all"
            title="删除对话"
          >
            <Trash2 class="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { MessageSquare, Plus, Trash2 } from 'lucide-vue-next';
import { supabase, Conversation } from '../lib/supabase';

// ⭐ 修复: 将类型定义为 string | null
interface Props {
  currentConversationId: string | null; 
}

defineProps<Props>();

defineEmits<{
  'select-conversation': [id: string]
  'new-conversation':  []
}>()

const conversations = ref<Conversation[]>([]);
const loading = ref(true);
let subscription: any;

const loadConversations = async () => {
  try {
    const { data, error } = await supabase
      .from('conversations')
      .select('*')
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Error loading conversations:', error);
      return;
    }

    conversations.value = data || [];
  } finally {
    loading.value = false;
  }
};

const handleDelete = async (id: string) => {
  if (!window.confirm('确定要删除这个对话吗？')) {
    return;
  }

  const { error } = await supabase
    .from('conversations')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting conversation:', error);
    alert('删除失败');
    return;
  }

  loadConversations();
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('zh-CN', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

onMounted(() => {
  loadConversations();

  subscription = supabase
    .channel('conversations_changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'conversations',
      },
      () => {
        loadConversations();
      }
    )
    .subscribe();
});

onUnmounted(() => {
  if (subscription) {
    subscription.unsubscribe();
  }
});
</script>