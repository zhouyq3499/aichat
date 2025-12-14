<template>
  <HomePage v-if="!isGameActive" @start-game="handleStartGame" />
  <GamePage v-else @end-game="handleEndGame" />
</template>

<script setup lang="ts">
import { ref } from 'vue';
import HomePage from './components/HomePage.vue';
import GamePage from './components/GamePage.vue';

const isGameActive = ref(false);

const handleStartGame = () => {
  isGameActive.value = true;
};

const handleEndGame = () => {
  isGameActive.value = false;
};
</script>
