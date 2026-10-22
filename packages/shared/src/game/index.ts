/**
 * Правила игры — чистые функции без IO.
 * Сервер вызывает их как источник истины, клиент может использовать для подсказок и предпросчёта.
 * Чтобы сделать настоящую игру, меняем только этот модуль.
 */
export const MIN_PLAYERS = 2;
export const MAX_PLAYERS = 4;

export type GameState = {
  playerOrder: string[];
  turn: number;
  activePlayerId: string;
};

export type GameAction = { type: 'end_turn' };

export type Result<T> = { ok: true; value: T } | { ok: false; error: string };

export function createGame(playerIds: string[]): GameState {
  const [first] = playerIds;
  if (!first) throw new Error('Нужен хотя бы один игрок');
  return { playerOrder: playerIds, turn: 1, activePlayerId: first };
}

export function applyAction(state: GameState, playerId: string, action: GameAction): Result<GameState> {
  if (playerId !== state.activePlayerId) return { ok: false, error: 'Сейчас не ваш ход' };

  switch (action.type) {
    case 'end_turn':
      return { ok: true, value: nextTurn(state) };
  }
}

function nextTurn(state: GameState): GameState {
  const index = state.playerOrder.indexOf(state.activePlayerId);
  const next = state.playerOrder[(index + 1) % state.playerOrder.length];
  if (!next) throw new Error('Пустой порядок ходов');
  return { ...state, turn: state.turn + 1, activePlayerId: next };
}
