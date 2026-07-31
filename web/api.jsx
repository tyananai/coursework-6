/* Real API client for the Go backend.
   Replaces mockApi.jsx. All methods mirror the mock's interface exactly so
   the rest of the app (editor, pages, ui) does not need changes.

   Key adapter concerns handled here:
   1. Unwrap { data: T, error: string|null } envelope from every response.
   2. UpdateUser is a full replacement on the server — _userCache provides
      merge-patch semantics so partial onPatch() calls don't wipe other fields.
   3. Backend omits null fields (omitempty) — normalizeResume fills them in.
   4. Date strings from <input type="month"> arrive as "YYYY-MM-DD"; Go's
      time.Time JSON parsing requires RFC3339 — toRFC3339() fixes this.
   5. No bulk-skills endpoint — bulkUpdateSkills fires parallel PUT calls.
   6. uploadPhoto must return a full resume (for onUserReplace); we call
      getResume() after the upload to get nested data.
   7. DELETE returns 204 No Content — req() handles the empty body. */

const BASE = '/api/v1';

let _token = null;
let _onUnauthorized = null;

// Per-user cache of top-level fields only, kept in sync across calls.
// Needed for merge-patch: onPatch sends one field at a time but the backend
// does a full PUT replace.
const _userCache = {};

function pickUserFields(u) {
  return {
    first_name:  u.first_name  ?? null,
    last_name:   u.last_name   ?? null,
    summary:     u.summary     ?? null,
    photo_url:   u.photo_url   ?? null,
    region_id:   u.region_id   ?? null,
    industry_id: u.industry_id ?? null,
  };
}

// Backend uses omitempty on nullable fields and omits empty slices.
// Fill everything in so the JSX components never see undefined.
function normalizeResume(u) {
  return {
    ...u,
    first_name:  u.first_name  ?? null,
    last_name:   u.last_name   ?? null,
    summary:     u.summary     ?? null,
    photo_url:   u.photo_url   ?? null,
    region_id:   u.region_id   ?? null,
    industry_id: u.industry_id ?? null,
    positions:   u.positions   || [],
    education:   u.education   || [],
    contacts:    u.contacts    || [],
    skills:      u.skills      || [],
  };
}

// Converts "YYYY-MM-DD" (from monthYearToIso helper) to RFC3339 so that Go's
// time.Time JSON unmarshalling succeeds. Already-RFC3339 strings pass through.
function toRFC3339(dateStr) {
  if (!dateStr) return null;
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr + 'T00:00:00Z';
  return dateStr;
}

// Only positions and education carry date fields that need normalising.
function normalizeDateFields(kind, body) {
  if (kind !== 'positions' && kind !== 'education') return body;
  return {
    ...body,
    start_date: toRFC3339(body.start_date),
    end_date:   toRFC3339(body.end_date),
  };
}

async function req(method, path, body) {
  const opts = { method, headers: {} };
  if (body !== undefined) {
    opts.body = JSON.stringify(body);
    opts.headers['Content-Type'] = 'application/json';
  }
  if (_token) opts.headers['Authorization'] = 'Bearer ' + _token;
  const res = await fetch(BASE + path, opts);
  if (res.status === 204) return null;
  if (res.status === 401) {
    if (_onUnauthorized) _onUnauthorized();
    throw new Error('unauthorized');
  }
  const j = await res.json();
  if (!res.ok) throw new Error(j.error || res.statusText);
  return j.data;
}

const api = {
  // No mock DB to reset.
  resetDB() {},

  setToken(t) { _token = t; },
  setOnUnauthorized(fn) { _onUnauthorized = fn; },

  login:    (email, password) => req('POST', '/auth/login',    { email, password }),
  register: (email, password) => req('POST', '/auth/register', { email, password }),

  regions:    () => req('GET', '/regions'),
  industries: () => req('GET', '/industries'),

  listResumes: async ({ region_id, industry_id } = {}) => {
    const p = new URLSearchParams();
    if (region_id)   p.set('region_id',   region_id);
    if (industry_id) p.set('industry_id', industry_id);
    const qs = p.toString() ? '?' + p.toString() : '';
    const list = await req('GET', '/users' + qs);
    return (list || []).map(normalizeResume);
  },

  getResume: async (id) => {
    const u = await req('GET', `/users/${id}`);
    const normalized = normalizeResume(u);
    _userCache[id] = pickUserFields(normalized);
    return normalized;
  },

  createUser: (body) => req('POST', '/users', body),

  // Merges the incoming patch with the cached user fields so that a partial
  // onPatch({ first_name: 'Alice' }) does not wipe last_name, photo_url, etc.
  updateUser: async (id, patch) => {
    const base   = _userCache[id] || {};
    const merged = { ...base, ...patch };
    const result = await req('PUT', `/users/${id}`, merged);
    if (result) _userCache[id] = pickUserFields(result);
    return result;
  },

  deleteUser: async (id) => {
    await req('DELETE', `/users/${id}`);
    delete _userCache[id];
  },

  addChild: (uid_, kind, body) =>
    req('POST', `/users/${uid_}/${kind}`, normalizeDateFields(kind, body)),

  updateChild: (uid_, kind, cid, patch) =>
    req('PUT', `/users/${uid_}/${kind}/${cid}`, normalizeDateFields(kind, patch)),

  deleteChild: async (uid_, kind, cid) => {
    await req('DELETE', `/users/${uid_}/${kind}/${cid}`);
  },

  // No bulk endpoint — update each skill's sort_order in parallel.
  bulkUpdateSkills: (uid_, skills) =>
    Promise.all(
      skills.map(s =>
        req('PUT', `/users/${uid_}/skills/${s.id}`, {
          name:       s.name,
          category:   s.category ?? null,
          sort_order: s.sort_order ?? 0,
        })
      )
    ),

  // After uploading, fetch the full resume so onSuccess gets nested data.
  uploadPhoto: async (uid_, file) => {
    const fd = new FormData();
    fd.append('photo', file);
    const headers = _token ? { Authorization: 'Bearer ' + _token } : {};
    const res = await fetch(`${BASE}/users/${uid_}/photo`, { method: 'POST', body: fd, headers });
    if (res.status === 401) {
      if (_onUnauthorized) _onUnauthorized();
      throw new Error('unauthorized');
    }
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      throw new Error((j && j.error) || 'Upload failed');
    }
    return api.getResume(uid_);
  },
};

Object.assign(window, { api });
