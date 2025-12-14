<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 flex items-center justify-center p-4">
    <div class="text-center">
      <div class="mb-8 flex justify-center">
        <div class="bg-blue-500 p-6 rounded-full shadow-lg">
          <Brain class="w-16 h-16 text-white" />
        </div>
      </div>

      <h1 class="text-5xl font-bold text-gray-800 mb-12">
        AI 脑筋急转弯
      </h1>

      <button
        @click="$emit('startGame')"
        class="px-12 py-4 bg-blue-500 hover:bg-blue-600 text-white text-xl font-semibold rounded-full shadow-lg transition-all duration-300 transform hover:scale-105 hover:shadow-xl"
      >
        开始游戏
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Brain } from 'lucide-vue-next';

defineEmits<{
  startGame: [];
}>();
</script>
