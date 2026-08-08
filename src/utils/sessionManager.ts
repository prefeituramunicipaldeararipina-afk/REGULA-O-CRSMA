import { PerfilUsuario, Usuario } from '../types';

export interface ActiveSession {
  sessionId: string;
  userId: string;
  userName: string;
  userEmail: string;
  unidade: string;
  perfil: PerfilUsuario;
  loggedInAt: string;
  lastHeartbeat: number;
  tabId: string;
}

export const MAX_SESSIONS_PER_PERFIL: Record<PerfilUsuario, number> = {
  SOLICITANTE: 50,
  REGULADOR: 50,
  ADMINISTRADOR: 50,
};

const LOCAL_STORAGE_KEY_SESSIONS = 'crsma_active_sessions_v3';
const LOCAL_STORAGE_KEY_CURRENT_SESSION = 'crsma_current_session_id_v3';

// Unique identifier for the current browser tab
const CURRENT_TAB_ID = typeof window !== 'undefined'
  ? `tab-${Math.random().toString(36).substring(2, 9)}`
  : 'tab-server';

// Stale session threshold (10 minutes without heartbeat)
const STALE_SESSION_THRESHOLD_MS = 10 * 60 * 1000;

export function generateSessionId(): string {
  return `sess-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
}

export function getCurrentTabId(): string {
  return CURRENT_TAB_ID;
}

export function getActiveSessions(): ActiveSession[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY_SESSIONS);
    if (!raw) return [];
    const sessions: ActiveSession[] = JSON.parse(raw);
    const now = Date.now();

    // Filter out expired / stale sessions
    const validSessions = sessions.filter(
      (s) => now - s.lastHeartbeat < STALE_SESSION_THRESHOLD_MS
    );

    // If any stale sessions were pruned, save updated list
    if (validSessions.length !== sessions.length) {
      localStorage.setItem(LOCAL_STORAGE_KEY_SESSIONS, JSON.stringify(validSessions));
      window.dispatchEvent(new Event('crsma_sessions_updated'));
    }

    return validSessions;
  } catch (e) {
    console.error('Error reading active sessions:', e);
    return [];
  }
}

export function saveActiveSessions(sessions: ActiveSession[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY_SESSIONS, JSON.stringify(sessions));
    // Dispatch custom event for current window and trigger storage event
    window.dispatchEvent(new Event('crsma_sessions_updated'));
  } catch (e) {
    console.error('Error saving active sessions:', e);
  }
}

export function getSessionsByPerfil(perfil: PerfilUsuario): ActiveSession[] {
  const all = getActiveSessions();
  return all.filter((s) => s.perfil === perfil);
}

export function checkLoginCapacity(perfil: PerfilUsuario, userId?: string, excludeSessionId?: string): {
  allowed: boolean;
  currentCount: number;
  maxLimit: number;
  message?: string;
} {
  const activeSessions = getActiveSessions();
  // Filter sessions matching this perfil, excluding current session if re-logging in
  const perfilSessions = activeSessions.filter((s) => {
    if (excludeSessionId && s.sessionId === excludeSessionId) return false;
    return s.perfil === perfil;
  });

  const maxLimit = MAX_SESSIONS_PER_PERFIL[perfil];
  const currentCount = perfilSessions.length;

  if (currentCount >= maxLimit) {
    let roleLabel = 'Solicitante';
    if (perfil === 'REGULADOR') roleLabel = 'Regulador';
    if (perfil === 'ADMINISTRADOR') roleLabel = 'Administrador';

    return {
      allowed: false,
      currentCount,
      maxLimit,
      message: `Limite de ${maxLimit} logins simultâneos atingido para o Perfil ${roleLabel} (${currentCount}/${maxLimit}). Por favor, aguarde o encerramento de uma sessão ativa para entrar.`,
    };
  }

  return {
    allowed: true,
    currentCount,
    maxLimit,
  };
}

export function loginUserSession(user: Usuario): {
  success: boolean;
  session?: ActiveSession;
  error?: string;
} {
  const capacity = checkLoginCapacity(user.perfil, user.id);
  if (!capacity.allowed) {
    return {
      success: false,
      error: capacity.message,
    };
  }

  const newSession: ActiveSession = {
    sessionId: generateSessionId(),
    userId: user.id,
    userName: user.nome,
    userEmail: user.email,
    unidade: user.unidadeOuOrgao,
    perfil: user.perfil,
    loggedInAt: new Date().toISOString(),
    lastHeartbeat: Date.now(),
    tabId: CURRENT_TAB_ID,
  };

  const currentSessions = getActiveSessions();
  // Remove any previous session for the same tab or same sessionId
  const updatedSessions = currentSessions.filter((s) => s.tabId !== CURRENT_TAB_ID);
  updatedSessions.push(newSession);

  saveActiveSessions(updatedSessions);
  localStorage.setItem(LOCAL_STORAGE_KEY_CURRENT_SESSION, newSession.sessionId);

  return {
    success: true,
    session: newSession,
  };
}

export function logoutCurrentSession(): void {
  if (typeof window === 'undefined') return;
  const currentSessionId = localStorage.getItem(LOCAL_STORAGE_KEY_CURRENT_SESSION);
  if (currentSessionId) {
    removeSessionById(currentSessionId);
  }
  localStorage.removeItem(LOCAL_STORAGE_KEY_CURRENT_SESSION);
  window.dispatchEvent(new Event('crsma_sessions_updated'));
}

export function removeSessionById(sessionId: string): void {
  const currentSessions = getActiveSessions();
  const updated = currentSessions.filter((s) => s.sessionId !== sessionId);
  saveActiveSessions(updated);
}

export function getCurrentSession(): ActiveSession | null {
  if (typeof window === 'undefined') return null;
  const currentSessionId = localStorage.getItem(LOCAL_STORAGE_KEY_CURRENT_SESSION);
  if (!currentSessionId) return null;

  const activeSessions = getActiveSessions();
  const found = activeSessions.find((s) => s.sessionId === currentSessionId);
  return found || null;
}

export function sendHeartbeat(sessionId: string): void {
  const currentSessions = getActiveSessions();
  let updated = false;
  const newSessions = currentSessions.map((s) => {
    if (s.sessionId === sessionId) {
      updated = true;
      return { ...s, lastHeartbeat: Date.now() };
    }
    return s;
  });

  if (updated) {
    saveActiveSessions(newSessions);
  }
}

export function clearAllSessionsForRole(perfil: PerfilUsuario): void {
  const currentSessions = getActiveSessions();
  const updated = currentSessions.filter((s) => s.perfil !== perfil);
  saveActiveSessions(updated);
}
