/* Live resume preview (right pane + print page) */

function LivePreview({ resume, regions, industries, compact = false }) {
  const r = resume;
  const region = regions.find(x => x.id === r.region_id);
  const industry = industries.find(x => x.id === r.industry_id);
  const fullName = [r.first_name, r.last_name].filter(Boolean).join(' ') || 'Untitled';

  // Group skills by category, preserve sort_order within
  const skillGroups = React.useMemo(() => {
    const groups = new Map();
    const sorted = [...r.skills].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
    for (const s of sorted) {
      const key = s.category || 'General';
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(s);
    }
    return [...groups.entries()];
  }, [r.skills]);

  const positionsSorted = [...r.positions].sort((a, b) => {
    const aD = a.start_date || '';
    const bD = b.start_date || '';
    return bD.localeCompare(aD);
  });
  const eduSorted = [...r.education].sort((a, b) => {
    const aD = a.start_date || '';
    const bD = b.start_date || '';
    return bD.localeCompare(aD);
  });

  return (
    <article className="resume-doc rk-fade-in" data-screen-label="Live preview">
      <header style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>
        {r.photo_url && (
          <img
            src={r.photo_url}
            alt={fullName}
            style={{
              width: 84, height: 84, borderRadius: 14, objectFit: 'cover',
              border: '1px solid oklch(0.88 0.005 270)', flexShrink: 0,
            }}
          />
        )}
        <div style={{ flex: 1, minWidth: 0 }}>
          <h1 className="resume-name">{fullName}</h1>
          <div className="resume-meta">
            {industry?.name}
            {industry && region && <span style={{ margin: '0 8px', color: 'oklch(0.78 0.005 270)' }}>·</span>}
            {region?.name}
          </div>
          {r.contacts.length > 0 && (
            <div className="resume-contact-row">
              {r.contacts.map(c => {
                const Ic = CONTACT_ICONS[c.type];
                const display = c.url
                  ? c.url.replace(/^https?:\/\//, '').replace(/\/$/, '')
                  : CONTACT_LABELS[c.type];
                return (
                  <a key={c.id} href={c.url || '#'}>
                    <Ic size={13} />
                    <span>{display}</span>
                  </a>
                );
              })}
            </div>
          )}
        </div>
      </header>

      {r.summary && (
        <>
          <h2 className="resume-section-title">About</h2>
          <p className="resume-summary" style={{ margin: 0 }}>{r.summary}</p>
        </>
      )}

      {positionsSorted.length > 0 && (
        <>
          <h2 className="resume-section-title">Experience</h2>
          <div className="resume-timeline">
            {positionsSorted.map(p => (
              <div key={p.id} className="resume-tl-item">
                <div className="resume-tl-head">
                  <div>
                    <div className="resume-tl-title">{p.job_title || 'Untitled role'}</div>
                    <div className="resume-tl-org">{p.organization || ''}</div>
                  </div>
                  <div className="resume-tl-date">{fmtDateRange(p.start_date, p.end_date, p.is_current)}</div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {eduSorted.length > 0 && (
        <>
          <h2 className="resume-section-title">Education</h2>
          <div className="resume-timeline">
            {eduSorted.map(e => (
              <div key={e.id} className="resume-tl-item">
                <div className="resume-tl-head">
                  <div className="resume-tl-title">{e.school_name || 'Untitled school'}</div>
                  <div className="resume-tl-date">{fmtDateRange(e.start_date, e.end_date, false)}</div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {skillGroups.length > 0 && (
        <>
          <h2 className="resume-section-title">Skills</h2>
          {skillGroups.map(([cat, skills]) => (
            <div key={cat} className="resume-skills-group">
              <div className="resume-skills-label">{cat}</div>
              <div>
                {skills.map(s => <span key={s.id} className="resume-skill-chip">{s.name}</span>)}
              </div>
            </div>
          ))}
        </>
      )}

      {/* Empty document hint */}
      {!r.summary && positionsSorted.length === 0 && eduSorted.length === 0 && skillGroups.length === 0 && (
        <p style={{ color: 'oklch(0.55 0.01 270)', fontSize: 12, margin: '24px 0 0' }}>
          Add content on the left to see it appear here.
        </p>
      )}
    </article>
  );
}

Object.assign(window, { LivePreview });
