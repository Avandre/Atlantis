<script setup lang="ts">
import { ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAction } from '../composables/useAction';
import { useRoomStore } from '../stores/room';
import { useSessionStore } from '../stores/session';

const session = useSessionStore();
const roomStore = useRoomStore();
const router = useRouter();
const route = useRoute();
const { error, run } = useAction();

const name = ref('');
const code = ref('');

async function signIn() {
  await session.signIn(name.value);
  const redirect = route.query.redirect;
  if (typeof redirect === 'string') await router.push(redirect);
}

async function createRoom() {
  await router.push({ name: 'room', params: { id: await roomStore.createRoom() } });
}

async function joinRoom() {
  await router.push({ name: 'room', params: { id: code.value.trim().toUpperCase() } });
}
</script>

<template>
  <main class="page">
    <h1>Atlantis</h1>

    <form v-if="!session.player" class="panel row" @submit.prevent="run(signIn)">
      <input v-model="name" placeholder="Ваше имя" minlength="2" maxlength="24" required />
      <button>Войти</button>
    </form>

    <section v-else class="panel stack">
      <p>Вы играете как <strong>{{ session.player.name }}</strong></p>
      <button @click="run(createRoom)">Создать комнату</button>
      <form class="row" @submit.prevent="run(joinRoom)">
        <input v-model="code" placeholder="Код комнаты" maxlength="5" required />
        <button>Присоединиться</button>
      </form>
    </section>

    <p v-if="error" class="error">{{ error }}</p>
  </main>
</template>
