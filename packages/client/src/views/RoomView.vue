<script setup lang="ts">
import { onBeforeUnmount, ref, watch } from 'vue';
import ChatPanel from '../components/ChatPanel.vue';
import GameBoard from '../components/GameBoard.vue';
import PlayerList from '../components/PlayerList.vue';
import { useAction } from '../composables/useAction';
import { useRoomStore } from '../stores/room';

const props = defineProps<{ id: string }>();
const store = useRoomStore();
const { error, run } = useAction();
const link = location.href;

watch(() => props.id, (id) => run(() => store.join(id)), { immediate: true });
onBeforeUnmount(() => store.leave());
</script>

<template>
  <main class="page">
    <p v-if="error" class="error">{{ error }} <RouterLink to="/">В лобби</RouterLink></p>

    <div v-else-if="store.room" class="room">
      <section class="panel stack">
        <h1>Комната {{ store.room.id }}</h1>
        <PlayerList :room="store.room" />

        <template v-if="store.room.status === 'lobby'">
          <p class="muted">Ссылка для друзей: {{ link }}</p>
          <button v-if="store.isHost" :disabled="!store.canStart" @click="run(store.startGame)">
            Начать игру
          </button>
          <p v-else class="muted">Ждём, пока хост начнёт игру.</p>
        </template>
        <GameBoard v-else />
      </section>

      <ChatPanel />
    </div>
  </main>
</template>
