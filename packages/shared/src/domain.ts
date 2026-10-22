import type { GameState } from './game';

export type Player = { id: string; name: string };
export type Session = { token: string; player: Player };

export type RoomStatus = 'lobby' | 'playing' | 'finished';

export type RoomSnapshot = {
  id: string;
  hostId: string;
  status: RoomStatus;
  members: Player[];
  game: GameState | null;
};

export type ChatMessage = {
  id: string;
  author: Player;
  text: string;
  sentAt: string;
};
