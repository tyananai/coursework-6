/* Auth context, provider, and modal */

const AuthCtx = React.createContext(null);

window.useAuth = function useAuth() {
  return React.useContext(AuthCtx) || { user: null, openModal() {}, logout() {} };
};

function AuthModal({ onClose, onSuccess, dismissable }) {
  const [tab, setTab]         = React.useState('login');
  const [email, setEmail]     = React.useState('');
  const [password, setPass]   = React.useState('');
  const [confirm, setConfirm] = React.useState('');
  const [error, setError]     = React.useState('');
  const [loading, setLoading] = React.useState(false);

  function switchTab(t) { setTab(t); setError(''); }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (tab === 'register' && password !== confirm) {
      setError('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      const data = tab === 'login'
        ? await api.login(email, password)
        : await api.register(email, password);
      const payload = JSON.parse(atob(data.token.split('.')[1]));
      onSuccess(data.token, email, payload.account_id);
    } catch (err) {
      const msg = err.message || 'Something went wrong';
      if (msg === 'conflict') setError('This email is already registered');
      else if (msg === 'unauthorized') setError('Invalid email or password');
      else setError(msg);
    } finally {
      setLoading(false);
    }
  }

  const tabBtn = (id, label) => (
    <button
      type="button"
      onClick={() => switchTab(id)}
      style={{
        padding: '10px 18px',
        border: 'none',
        background: 'none',
        cursor: 'pointer',
        fontSize: 14,
        fontWeight: 500,
        fontFamily: 'var(--font-body)',
        color: tab === id ? 'var(--accent)' : 'var(--muted)',
        borderBottom: tab === id ? '2px solid var(--accent)' : '2px solid transparent',
        transition: 'color 120ms, border-color 120ms',
      }}
    >{label}</button>
  );

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 100,
        background: 'oklch(0.20 0.04 255 / 0.38)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
      onClick={dismissable ? onClose : undefined}
    >
      <div
        className="card"
        style={{ width: 400, padding: 32, position: 'relative', animation: 'rk-pop-in 180ms ease' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Close button — only when modal can be dismissed */}
        {dismissable && (
          <button
            type="button"
            onClick={onClose}
            style={{
              position: 'absolute', top: 14, right: 14,
              width: 28, height: 28, border: 'none', background: 'none',
              cursor: 'pointer', color: 'var(--faint)', borderRadius: 6,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 18, lineHeight: 1,
            }}
            aria-label="Close"
          >×</button>
        )}

        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24 }}>
          <span style={{
            width: 28, height: 28, borderRadius: 7,
            background: 'var(--accent)', color: 'var(--accent-ink)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15,
          }}>R</span>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 16, color: 'var(--ink)' }}>
            Resume<em style={{ fontStyle: 'italic', fontWeight: 400 }}>kit</em>
          </span>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', marginBottom: 24, marginLeft: -4 }}>
          {tabBtn('login', 'Sign in')}
          {tabBtn('register', 'Sign up')}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Field label="Email">
            <Input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              autoFocus
            />
          </Field>
          <Field label="Password">
            <Input
              type="password"
              value={password}
              onChange={e => setPass(e.target.value)}
              placeholder="Min 8 characters"
              required
            />
          </Field>
          {tab === 'register' && (
            <Field label="Confirm password">
              <Input
                type="password"
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                placeholder="Repeat password"
                required
              />
            </Field>
          )}
          {error && (
            <p style={{ margin: 0, fontSize: 13, color: 'oklch(0.50 0.20 25)', lineHeight: 1.4 }}>
              {error}
            </p>
          )}
          <Button type="submit" variant="accent" loading={loading} style={{ width: '100%', justifyContent: 'center' }}>
            {tab === 'login' ? 'Sign in' : 'Create account'}
          </Button>
        </form>
      </div>
    </div>
  );
}

function loadSavedSession() {
  try {
    const tok = localStorage.getItem('rk_token');
    if (!tok) return { token: null, user: null };
    // Check client-side expiry before trusting the session
    const payload = JSON.parse(atob(tok.split('.')[1]));
    const expired = !payload.exp || payload.exp * 1000 < Date.now();
    const wrongFormat = !payload.account_id;
    if (expired || wrongFormat) {
      localStorage.removeItem('rk_token');
      localStorage.removeItem('rk_user');
      return { token: null, user: null };
    }
    const usr = JSON.parse(localStorage.getItem('rk_user'));
    if (!usr) return { token: null, user: null };
    return { token: tok, user: usr };
  } catch {
    return { token: null, user: null };
  }
}

window.AuthProvider = function AuthProvider({ children }) {
  const saved = React.useMemo(loadSavedSession, []);
  const [token, setToken] = React.useState(saved.token);
  const [user, setUser] = React.useState(saved.user);
  const [modalOpen, setModalOpen] = React.useState(!saved.token);

  function logout() {
    try {
      localStorage.removeItem('rk_token');
      localStorage.removeItem('rk_user');
    } catch {}
    api.setToken(null);
    api.setOnUnauthorized(null);
    setToken(null);
    setUser(null);
    setModalOpen(true);
  }

  // Restore saved session token synchronously on mount
  React.useEffect(() => {
    if (saved.token) {
      api.setToken(saved.token);
      api.setOnUnauthorized(logout);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  function handleSuccess(tok, email, userId) {
    try {
      localStorage.setItem('rk_token', tok);
      localStorage.setItem('rk_user', JSON.stringify({ id: userId, email }));
    } catch {}
    // Set synchronously so child effects see the token immediately
    api.setToken(tok);
    api.setOnUnauthorized(logout);
    setToken(tok);
    setUser({ id: userId, email });
    setModalOpen(false);
  }

  return (
    <AuthCtx.Provider value={{ user, token, logout, openModal: () => setModalOpen(true) }}>
      {user ? children : <div style={{ minHeight: '100vh', background: 'var(--bg)' }} />}
      {modalOpen && (
        <AuthModal
          onClose={() => setModalOpen(false)}
          onSuccess={handleSuccess}
          dismissable={false}
        />
      )}
    </AuthCtx.Provider>
  );
};
