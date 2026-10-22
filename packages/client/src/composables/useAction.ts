import { ref } from 'vue';

/** Запускает действие и складывает текст ошибки в `error` — для кнопок и форм. */
export function useAction() {
  const error = ref('');

  async function run(action: () => Promise<unknown>): Promise<void> {
    error.value = '';
    try {
      await action();
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Что-то пошло не так';
    }
  }

  return { error, run };
}
