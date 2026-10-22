import type { Session } from '@atlantis/shared';
import { defineStore } from 'pinia';
import { computed, ref } from 'vue';

const STORAGE_KEY = 'atlantis:session';

function load(): Session | null {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null');
  } catch {
    return null;
  }
}

export const useSessionStore = defineStore('session', () => {
  const session = ref<Session | null>(load());
  const player = computed(() => session.value?.player ?? null);

  async function signIn(name: string): Promise<void> {
    const response = await fetch('/api/session', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ name }),
    });
    if (!response.ok) throw new Error(((await response.json()) as { error: string }).error);
    session.value = (await response.json()) as Session;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session.value));
  }

  function signOut(): void {
    session.value = null;
    localStorage.removeItem(STORAGE_KEY);
  }

  return { session, player, signIn, signOut };
});
