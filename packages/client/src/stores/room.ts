import { MIN_PLAYERS, type ChatMessage, type GameAction, type RoomSnapshot } from '@atlantis/shared';
import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import { createSocket, unwrap, type AppSocket } from '../net/socket';
import { useSessionStore } from './session';

export const useRoomStore = defineStore('room', () => {
  const sessionStore = useSessionStore();
  const room = ref<RoomSnapshot | null>(null);
  const messages = ref<ChatMessage[]>([]);
  let socket: AppSocket | null = null;

  const isHost = computed(() => room.value?.hostId === sessionStore.player?.id);
  const isMyTurn = computed(() => room.value?.game?.activePlayerId === sessionStore.player?.id);
  const canStart = computed(() => (room.value?.members.length ?? 0) >= MIN_PLAYERS);

  function connect(): AppSocket {
    if (socket) return socket;
    if (!sessionStore.session) throw new Error('Сначала введите имя');

    const s = createSocket(sessionStore.session.token);
    s.on('connect', () => {
      // Реконнект: возвращаемся в комнату и получаем актуальное состояние.
      if (room.value) void join(room.value.id).catch(() => (room.value = null));
    });
    s.on('connect_error', (error) => {
      if (error.message === 'unauthorized') sessionStore.signOut();
    });
    s.on('room:updated', (snapshot) => (room.value = snapshot));
    s.on('chat:message', (message) => messages.value.push(message));
    return (socket = s);
  }

  const currentRoomId = (): string => {
    if (!room.value) throw new Error('Вы не в комнате');
    return room.value.id;
  };

  async function createRoom(): Promise<string> {
    return unwrap(await connect().emitWithAck('room:create')).id;
  }

  async function join(roomId: string): Promise<void> {
    const joined = unwrap(await connect().emitWithAck('room:join', { roomId }));
    room.value = joined.room;
    messages.value = joined.history;
  }

  function leave(): void {
    socket?.emit('room:leave');
    room.value = null;
    messages.value = [];
  }

  const startGame = async () =>
    unwrap(await connect().emitWithAck('game:start', { roomId: currentRoomId() }));

  const sendAction = async (action: GameAction) =>
    unwrap(await connect().emitWithAck('game:action', { roomId: currentRoomId(), action }));

  const sendMessage = async (text: string) =>
    unwrap(await connect().emitWithAck('chat:send', { roomId: currentRoomId(), text }));

  return { room, messages, isHost, isMyTurn, canStart, createRoom, join, leave, startGame, sendAction, sendMessage };
});
