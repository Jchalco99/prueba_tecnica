import * as React from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { authApi } from './entities/user/api/auth.api';
import type { AuthSession, User } from './entities/user/model/types';
import { AuthPage } from './pages/auth/ui/auth-page';
import { EquiposPage } from './pages/equipos/ui/equipos-page';
import {
  clearStoredToken,
  getStoredToken,
  setStoredToken,
  UNAUTHORIZED_EVENT,
} from './shared/api/http-client';
import { Skeleton } from './shared/ui/skeleton';

const USER_STORAGE_KEY = 'flota_auth_user';

function getStoredUser(): User | null {
  if (typeof window === 'undefined') {
    return null;
  }
  try {
    const raw = window.localStorage.getItem(USER_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as User) : null;
  } catch {
    return null;
  }
}

function setStoredUser(user: User | null): void {
  if (typeof window === 'undefined') {
    return;
  }
  if (user) {
    window.localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
  } else {
    window.localStorage.removeItem(USER_STORAGE_KEY);
  }
}

export function App() {
  const [darkMode, setDarkMode] = React.useState<boolean>(() => {
    if (typeof window === 'undefined') {
      return false;
    }
    return window.localStorage.getItem('flota_theme') === 'dark';
  });

  const [user, setUser] = React.useState<User | null>(() =>
    getStoredToken() ? getStoredUser() : null,
  );
  const [checkingSession, setCheckingSession] = React.useState<boolean>(() =>
    Boolean(getStoredToken()),
  );

  React.useEffect(() => {
    const root = document.documentElement;
    if (darkMode) {
      root.classList.add('dark');
      window.localStorage.setItem('flota_theme', 'dark');
    } else {
      root.classList.remove('dark');
      window.localStorage.setItem('flota_theme', 'light');
    }
  }, [darkMode]);

  const handleLogout = React.useCallback(() => {
    clearStoredToken();
    setStoredUser(null);
    setUser(null);
  }, []);

  React.useEffect(() => {
    const onUnauthorized = () => {
      handleLogout();
    };
    window.addEventListener(UNAUTHORIZED_EVENT, onUnauthorized);
    return () => {
      window.removeEventListener(UNAUTHORIZED_EVENT, onUnauthorized);
    };
  }, [handleLogout]);

  React.useEffect(() => {
    const token = getStoredToken();
    if (!token) {
      setStoredUser(null);
      return;
    }

    let active = true;
    authApi
      .me()
      .then(({ user: verifiedUser }) => {
        if (active) {
          setUser(verifiedUser);
          setStoredUser(verifiedUser);
        }
      })
      .catch(() => {
        if (active) {
          handleLogout();
        }
      })
      .finally(() => {
        if (active) {
          setCheckingSession(false);
        }
      });

    return () => {
      active = false;
    };
  }, [handleLogout]);

  const handleAuthenticated = (session: AuthSession) => {
    setStoredToken(session.token);
    setStoredUser(session.user);
    setUser(session.user);
  };

  if (checkingSession) {
    return (
      <div
        role="status"
        aria-live="polite"
        className="flex min-h-dvh flex-col items-center justify-center gap-3 bg-background px-4 text-foreground"
      >
        <Skeleton className="h-6 w-48" />
        <p className="text-sm text-muted-foreground">
          Verificando sesion activa...
        </p>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={
            user ? (
              <Navigate to="/" replace />
            ) : (
              <AuthPage
                darkMode={darkMode}
                onToggleDarkMode={() => setDarkMode((prev) => !prev)}
                onAuthenticated={handleAuthenticated}
              />
            )
          }
        />
        <Route
          path="/"
          element={
            user ? (
              <EquiposPage
                key={user.id}
                user={user}
                darkMode={darkMode}
                onToggleDarkMode={() => setDarkMode((prev) => !prev)}
                onLogout={handleLogout}
              />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
