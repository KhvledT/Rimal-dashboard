// ==========================================
// Authentication Event Manager
// ==========================================
// Decouples HTTP layer from authentication/navigation logic
// httpClient emits events, AuthContext handles them

export type AuthEventType = 'SESSION_EXPIRED' | 'REFRESH_FAILED' | 'UNAUTHORIZED';

export interface AuthEvent {
  type: AuthEventType;
  reason?: string;
}

type AuthEventListener = (event: AuthEvent) => void;

class AuthEventManager {
  private listeners: AuthEventListener[] = [];

  subscribe(listener: AuthEventListener): () => void {
    this.listeners.push(listener);
    // Return unsubscribe function
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  emit(event: AuthEvent): void {
    this.listeners.forEach(listener => {
      try {
        listener(event);
      } catch (error) {
        console.error('Error in auth event listener:', error);
      }
    });
  }

  // Convenience methods for common events
  emitSessionExpired(reason?: string): void {
    this.emit({ type: 'SESSION_EXPIRED', reason });
  }

  emitRefreshFailed(reason?: string): void {
    this.emit({ type: 'REFRESH_FAILED', reason });
  }

  emitUnauthorized(reason?: string): void {
    this.emit({ type: 'UNAUTHORIZED', reason });
  }
}

// Singleton instance
export const authEventManager = new AuthEventManager();
