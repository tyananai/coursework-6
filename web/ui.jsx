/* Reusable UI primitives: Button, Field, Avatar, Toast, Tabs, Section, Skeleton, ConfirmPop */

const cls = (...xs) => xs.filter(Boolean).join(' ');

function Button({ variant, size, leftIcon, rightIcon, loading, children, ...rest }) {
  return (
    <button className="btn focusable" data-variant={variant} data-size={size} disabled={loading || rest.disabled} {...rest}>
      {loading ? <Spinner size={size === 'sm' ? 12 : 14} /> : leftIcon}
      {children}
      {rightIcon}
    </button>
  );
}
function Spinner({ size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" style={{ animation: 'rk-spin 0.8s linear infinite' }}>
      <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="2.5" strokeDasharray="40 60" strokeLinecap="round" opacity="0.9" />
    </svg>
  );
}

function Field({ label, hint, error, children, right }) {
  return (
    <label className="field">
      {(label || right) && (
        <div className="row" style={{ justifyContent: 'space-between', alignItems: 'baseline' }}>
          {label && <span className="field-label">{label}</span>}
          {right}
        </div>
      )}
      {children}
      {hint && !error && <span className="field-hint">{hint}</span>}
      {error && <span className="field-error">{error}</span>}
    </label>
  );
}

function Input(props) {
  return <input className="input" {...props} />;
}
function Textarea(props) {
  return <textarea className="textarea" {...props} />;
}
function Select({ children, ...rest }) {
  return <select className="select" {...rest}>{children}</select>;
}

function Toggle({ on, onChange, label }) {
  return (
    <div className="row" style={{ gap: 10, cursor: 'pointer', userSelect: 'none' }} onClick={() => onChange(!on)}>
      <div className="toggle" data-on={String(!!on)}>
        <div className="toggle-thumb" />
      </div>
      {label && <span style={{ fontSize: 13, color: 'var(--ink-2)' }}>{label}</span>}
    </div>
  );
}

function Avatar({ name = '', url, size = 36, hueSeed }) {
  const initials = name
    .split(/\s+/).filter(Boolean).slice(0, 2)
    .map(s => s[0]?.toUpperCase() || '').join('') || '·';
  // Bronze-leaning palette: copper, bronze, deep tea, slate, midnight, mauve, olive
  const AVATAR_HUES = [60, 50, 200, 230, 260, 320, 95];
  const hue = (() => {
    if (hueSeed != null) return hueSeed;
    let h = 0;
    for (const c of name) h = (h * 31 + c.charCodeAt(0)) >>> 0;
    return AVATAR_HUES[h % AVATAR_HUES.length];
  })();
  return (
    <div className="avatar" style={{ width: size, height: size, fontSize: size * 0.40, '--avh': hue }}>
      {url ? <img src={url} alt={name} /> : initials}
    </div>
  );
}

function Tabs({ value, onChange, options }) {
  return (
    <div className="tabs">
      {options.map(o => (
        <button key={o.value} className="tab" data-active={value === o.value} onClick={() => onChange(o.value)}>
          {o.label}
        </button>
      ))}
    </div>
  );
}

function Section({ icon, title, subtitle, right, defaultOpen = true, open: controlledOpen, onOpenChange, children, savingState }) {
  const [internalOpen, setInternalOpen] = React.useState(defaultOpen);
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen = (v) => {
    const next = typeof v === 'function' ? v(open) : v;
    if (onOpenChange) onOpenChange(next);
    else setInternalOpen(next);
  };
  return (
    <div className="section rk-fade-in">
      <div className="section-head" data-open={open} onClick={() => setOpen(o => !o)}>
        <span className="section-chev"><IconChevR size={14} /></span>
        <span style={{ display: 'inline-flex', color: 'var(--muted)' }}>{icon}</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
            <span style={{ fontWeight: 600, fontSize: 14 }}>{title}</span>
            {savingState && <SavingDot state={savingState} />}
          </div>
          {subtitle && <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 1 }}>{subtitle}</div>}
        </div>
        <div onClick={(e) => e.stopPropagation()}>{right}</div>
      </div>
      <div style={{
        maxHeight: open ? 4000 : 0,
        overflow: 'hidden',
        transition: 'max-height .35s cubic-bezier(.22,1,.36,1)',
      }}>
        <div className="section-body" style={{ borderTop: '1px solid var(--border)', paddingTop: 16 }}>
          {children}
        </div>
      </div>
    </div>
  );
}

function SavingDot({ state }) {
  const label =
    state === 'saving' ? 'Saving…' :
    state === 'saved'  ? 'Saved' :
    state === 'error'  ? 'Failed' : '';
  if (!state) return null;
  return (
    <span className="row" style={{ gap: 6, fontSize: 11, color: 'var(--muted)' }}>
      <span className="savedot" data-state={state} />
      {label}
    </span>
  );
}

function Skeleton({ w = '100%', h = 12, r = 8, style }) {
  return <div className="skel" style={{ width: w, height: h, borderRadius: r, ...style }} />;
}

/* ===== Toast system ===== */
const ToastCtx = React.createContext({ push: () => {} });
function ToastProvider({ children }) {
  const [toasts, setToasts] = React.useState([]);
  const push = React.useCallback((msg, tone = 'info', ttl = 2200) => {
    const id = Math.random().toString(36).slice(2);
    setToasts(t => [...t, { id, msg, tone }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), ttl);
  }, []);
  return (
    <ToastCtx.Provider value={{ push }}>
      {children}
      <div className="toast-stack">
        {toasts.map(t => (
          <div key={t.id} className="toast" data-tone={t.tone}>
            <span className="toast-dot" />
            <span style={{ fontSize: 13, color: 'var(--ink)' }}>{t.msg}</span>
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}
const useToast = () => React.useContext(ToastCtx);

/* ===== Confirm popover ===== */
function ConfirmPop({ open, anchorRect, message, onConfirm, onCancel, confirmLabel = 'Delete' }) {
  if (!open || !anchorRect) return null;
  const style = {
    top: anchorRect.bottom + 6,
    left: Math.max(8, anchorRect.right - 240),
    width: 240,
  };
  return (
    <>
      <div onClick={onCancel} style={{ position: 'fixed', inset: 0, zIndex: 49 }} />
      <div className="pop" style={{ position: 'fixed', ...style }}>
        <div style={{ fontSize: 13, color: 'var(--ink-2)', marginBottom: 10 }}>{message}</div>
        <div className="row" style={{ gap: 8, justifyContent: 'flex-end' }}>
          <Button size="sm" variant="ghost" onClick={onCancel}>Cancel</Button>
          <Button size="sm" variant="danger" onClick={onConfirm}>{confirmLabel}</Button>
        </div>
      </div>
    </>
  );
}

/* Hook: confirm with anchor */
function useConfirm() {
  const [state, setState] = React.useState({ open: false });
  const ask = (e, opts) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setState({ open: true, anchorRect: rect, ...opts });
  };
  const close = () => setState({ open: false });
  const node = (
    <ConfirmPop
      open={state.open}
      anchorRect={state.anchorRect}
      message={state.message}
      confirmLabel={state.confirmLabel}
      onCancel={close}
      onConfirm={() => { state.onConfirm?.(); close(); }}
    />
  );
  return [node, ask];
}

/* ===== Date helpers ===== */
function fmtMonth(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(d)) return '';
  return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}
function fmtDateRange(start, end, isCurrent) {
  const s = start ? fmtMonth(start) : '';
  const e = isCurrent ? 'Present' : (end ? fmtMonth(end) : '');
  if (!s && !e) return '';
  return [s, e].filter(Boolean).join(' – ');
}
function monthYearToIso(my) {
  // my: "YYYY-MM"
  if (!my) return null;
  return my + '-01';
}
function isoToMonthYear(iso) {
  if (!iso) return '';
  return iso.slice(0, 7);
}

/* Validation helpers (mirror Zod) */
const VAL = {
  url: (v) => {
    if (!v) return null;
    try { new URL(v); return null; } catch { return 'Must be a valid URL'; }
  },
  emailLike: (v) => {
    if (!v) return null;
    // accept "you@x.com" OR a URL like mailto:you@x.com OR https://...
    if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return null;
    try { new URL(v); return null; } catch { return 'Enter an email or URL'; }
  },
  nameLen: (v) => (v && v.length > 100) ? 'Max 100 characters' : null,
  summaryLen: (v) => (v && v.length > 2000) ? 'Max 2000 characters' : null,
  skillName: (v) => {
    if (!v || !v.trim()) return 'Name is required';
    if (v.length > 100) return 'Max 100 characters';
    return null;
  },
};

/* ===== AvatarUpload =====
 * Reusable avatar with file-picker upload.
 * - Default: large circle with initials gradient
 * - With photo: shows image
 * - Hover: dark overlay + camera icon + "Change photo"
 * - Click: native file picker (jpeg/png/webp)
 * - On file: 5MB client guard, spinner overlay, POST multipart, then onSuccess(updatedUser)
 *
 * If userId is missing (wizard pre-create flow), the component falls back to
 * onLocalPick(file, dataUrl) so the parent can hold the file until the user is created. */
function AvatarUpload({ userId, currentPhotoUrl, firstName, lastName, size = 84, onSuccess, onLocalPick, allowRemove = false }) {
  const inputRef = React.useRef(null);
  const [uploading, setUploading] = React.useState(false);
  const [hover, setHover] = React.useState(false);
  const toast = useToast();

  const fullName = `${firstName || ''} ${lastName || ''}`.trim();

  const pick = () => {
    if (uploading) return;
    inputRef.current?.click();
  };

  const onChange = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = ''; // reset so re-picking same file works
    if (!file) return;

    const ok = ['image/jpeg', 'image/png', 'image/webp'];
    if (!ok.includes(file.type)) {
      toast.push('Upload failed — max 5 MB, JPEG/PNG/WebP only', 'error');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.push('Upload failed — max 5 MB, JPEG/PNG/WebP only', 'error');
      return;
    }

    // Pre-create flow (wizard): no user yet, just hand back a local preview
    if (!userId && onLocalPick) {
      const dataUrl = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      onLocalPick(file, dataUrl);
      return;
    }

    setUploading(true);
    try {
      const updated = await api.uploadPhoto(userId, file);
      onSuccess?.(updated);
      toast.push('Photo updated', 'success');
    } catch (err) {
      toast.push('Upload failed — max 5 MB, JPEG/PNG/WebP only', 'error');
    } finally {
      setUploading(false);
    }
  };

  const remove = async (e) => {
    e.stopPropagation();
    if (!userId) { onLocalPick?.(null, null); return; }
    try {
      const updated = await api.updateUser(userId, { photo_url: null });
      onSuccess?.(updated);
    } catch {
      toast.push('Could not remove photo', 'error');
    }
  };

  const initials = fullName
    .split(/\s+/).filter(Boolean).slice(0, 2)
    .map(s => s[0]?.toUpperCase() || '').join('') || '·';
  const AVATAR_HUES = [60, 50, 200, 230, 260, 320, 95];
  let h = 0;
  for (const c of fullName) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  const hue = AVATAR_HUES[h % AVATAR_HUES.length];

  return (
    <div style={{ display: 'inline-block', position: 'relative' }}>
      <button
        type="button"
        onClick={pick}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        disabled={uploading}
        aria-label="Upload profile photo"
        style={{
          position: 'relative',
          width: size, height: size, borderRadius: 999,
          padding: 0, border: 'none', cursor: uploading ? 'wait' : 'pointer',
          background: currentPhotoUrl ? 'transparent' : `linear-gradient(135deg, oklch(0.62 0.10 ${hue}), oklch(0.46 0.12 ${hue}))`,
          overflow: 'hidden',
          color: 'oklch(0.98 0.01 ' + hue + ')',
          fontSize: size * 0.40, fontWeight: 500,
          fontFamily: 'var(--font-display)',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 0 0 1px var(--border)',
          transition: 'box-shadow .15s ease',
        }}
      >
        {currentPhotoUrl
          ? <img src={currentPhotoUrl} alt={fullName} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
          : <span>{initials}</span>
        }

        {/* hover overlay */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'rgba(15, 16, 24, 0.55)',
          color: 'white',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          gap: 4,
          opacity: (hover && !uploading) ? 1 : 0,
          transition: 'opacity .15s ease',
          pointerEvents: 'none',
        }}>
          <IconImage size={size > 60 ? 20 : 16} />
          {size > 60 && <span style={{ fontSize: 10.5, fontWeight: 500, letterSpacing: '0.02em' }}>Change photo</span>}
        </div>

        {/* uploading overlay */}
        {uploading && (
          <div style={{
            position: 'absolute', inset: 0,
            background: 'rgba(15, 16, 24, 0.6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'white',
          }}>
            <Spinner size={size > 60 ? 24 : 18} />
          </div>
        )}
      </button>

      {/* hidden file input */}
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={onChange}
        style={{ display: 'none' }}
      />

      {/* optional remove pill, shown when there's a photo */}
      {allowRemove && currentPhotoUrl && !uploading && (
        <button
          type="button"
          onClick={remove}
          title="Remove photo"
          style={{
            position: 'absolute', bottom: -2, right: -2,
            width: 24, height: 24, borderRadius: 999,
            background: 'var(--surface)', border: '1px solid var(--border)',
            color: 'var(--ink-2)', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <IconX size={11} />
        </button>
      )}
    </div>
  );
}

Object.assign(window, { AvatarUpload });

Object.assign(window, {
  cls, Button, Spinner, Field, Input, Textarea, Select, Toggle,
  Avatar, Tabs, Section, SavingDot, Skeleton, ToastProvider, useToast,
  ConfirmPop, useConfirm, fmtMonth, fmtDateRange, monthYearToIso, isoToMonthYear,
  VAL,
});
