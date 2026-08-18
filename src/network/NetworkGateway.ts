import type { ModeId } from '../types/game.js';

export interface MatchSession {
  id: string;
  mode: ModeId;
  transport: 'local';
}

export interface NetworkGateway {
  openMatch(mode: ModeId): MatchSession;
  closeMatch(sessionId: string): void;
}

export class LocalNetworkGateway implements NetworkGateway {
  private current: MatchSession | null = null;

  openMatch(mode: ModeId): MatchSession {
    this.current = { id: `local_${Date.now()}`, mode, transport: 'local' };
    return this.current;
  }

  closeMatch(sessionId: string): void {
    if (this.current?.id === sessionId) this.current = null;
  }
}
