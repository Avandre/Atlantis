<script setup lang="ts">
import { computed } from 'vue';
import { useAction } from '../composables/useAction';
import { useRoomStore } from '../stores/room';

const store = useRoomStore();
const { error, run } = useAction();

const game = computed(() => store.room?.game);
const activeName = computed(() => store.room?.members.find((m) => m.id === game.value?.activePlayerId)?.name);
</script>

<template>
  <section v-if="game" class="stack">
    <h2>Ход {{ game.turn }}</h2>
    <p>{{ store.isMyTurn ? 'Ваш ход' : `Ходит ${activeName}` }}</p>
    <button :disabled="!store.isMyTurn" @click="run(() => store.sendAction({ type: 'end_turn' }))">
      Завершить ход
    </button>
    <p v-if="error" class="error">{{ error }}</p>
  </section>
</template>
