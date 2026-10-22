<script setup lang="ts">
import { nextTick, ref, watch } from 'vue';
import { useAction } from '../composables/useAction';
import { useRoomStore } from '../stores/room';
import { useSessionStore } from '../stores/session';

const store = useRoomStore();
const session = useSessionStore();
const { error, run } = useAction();

const text = ref('');
const list = ref<HTMLElement | null>(null);

watch(
  () => store.messages.length,
  async () => {
    await nextTick();
    list.value?.scrollTo({ top: list.value.scrollHeight });
  },
);

const send = () =>
  run(async () => {
    if (!text.value.trim()) return;
    await store.sendMessage(text.value);
    text.value = '';
  });
</script>

<template>
  <section class="panel chat">
    <ul ref="list" class="messages">
      <li v-for="message in store.messages" :key="message.id" :class="{ mine: message.author.id === session.player?.id }">
        <strong>{{ message.author.name }}</strong> {{ message.text }}
      </li>
    </ul>
    <form class="row" @submit.prevent="send">
      <input v-model="text" maxlength="500" placeholder="Сообщение" />
      <button>Отправить</button>
    </form>
    <p v-if="error" class="error">{{ error }}</p>
  </section>
</template>
