import { useState, useEffect } from 'react';

export function useAuth() {
  const [user, setUser] = useState<{ id: string, email?: string, is_anonymous: boolean } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mimic session check
    const storedUser = localStorage.getItem('secure_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    } else {
      // Auto-sign in anonymously if no user
      const guest = { id: 'guest_' + Math.random().toString(36).substr(2, 9), is_anonymous: true };
      setUser(guest);
      localStorage.setItem('secure_user', JSON.stringify(guest));
    }
    setLoading(false);
  }, []);

  const signInAnonymously = async () => {
    const guest = { id: 'guest_' + Math.random().toString(36).substr(2, 9), is_anonymous: true };
    setUser(guest);
    localStorage.setItem('secure_user', JSON.stringify(guest));
  };

  const signOut = async () => {
    localStorage.removeItem('secure_user');
    setUser(null);
  };

  return { user, loading, signInAnonymously, signOut };
}
