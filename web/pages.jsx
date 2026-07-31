/* List page, New wizard, Preview page, plus TopNav */

/* ===== Top Nav ===== */
function TopNav({ navigate, route, regions, industries, filters, setFilters, onNewResume }) {
  const auth = useAuth();
  return (
    <div className="topnav no-print">
      <div className="topnav-inner">
        <a href="#/" onClick={(e) => { e.preventDefault(); navigate('/'); }} className="logo">
          <span className="logo-mark" aria-hidden="true">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <text
                x="12" y="17"
                textAnchor="middle"
                fontFamily="'Space Grotesk', system-ui, sans-serif"
                fontSize="16"
                fontWeight="700"
                letterSpacing="-0.02em"
                fill="currentColor"
              >R</text>
            </svg>
          </span>
          <span className="logo-name">Resume<em>kit</em></span>
        </a>

        {route === 'list' && (
          <>
            <div style={{ width: 1, height: 18, background: 'var(--border)', margin: '0 4px' }} />
            <Select
              value={filters.region_id || ''}
              onChange={(e) => setFilters({ ...filters, region_id: e.target.value || null })}
              style={{ width: 200, padding: '7px 28px 7px 12px', fontSize: 13 }}
            >
              <option value="">All regions</option>
              {regions.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
            </Select>
            <Select
              value={filters.industry_id || ''}
              onChange={(e) => setFilters({ ...filters, industry_id: e.target.value || null })}
              style={{ width: 200, padding: '7px 28px 7px 12px', fontSize: 13 }}
            >
              <option value="">All industries</option>
              {industries.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
            </Select>
          </>
        )}

        <div className="spacer" />

        {auth.user && (
          <span style={{
            fontSize: 12, color: 'var(--muted)',
            maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            {auth.user.email}
          </span>
        )}
        {auth.user
          ? <Button variant="ghost" size="sm" onClick={auth.logout}>Sign out</Button>
          : <Button variant="ghost" size="sm" onClick={auth.openModal}>Sign in</Button>
        }

        <Button variant="accent" size="sm" leftIcon={<IconPlus size={13} />} onClick={onNewResume}>
          New resume
        </Button>
      </div>
    </div>
  );
}

function ThemeToggle() { return null; }

/* ===== List page ===== */
function ResumesListPage({ navigate }) {
  const [resumes, setResumes] = React.useState(null);
  const [regions, setRegions] = React.useState([]);
  const [industries, setIndustries] = React.useState([]);
  const [filters, setFilters] = React.useState({ region_id: null, industry_id: null });
  const toast = useToast();

  React.useEffect(() => {
    (async () => {
      const [r, regs, inds] = await Promise.all([
        api.listResumes(filters), api.regions(), api.industries(),
      ]);
      setResumes(r); setRegions(regs); setIndustries(inds);
    })();
  }, [filters.region_id, filters.industry_id]);

  return (
    <>
      <TopNav
        navigate={navigate} route="list" regions={regions} industries={industries}
        filters={filters} setFilters={setFilters}
        onNewResume={() => navigate('/resumes/new')}
      />
      <div data-screen-label="01 Resume list" style={{ maxWidth: 1400, margin: '0 auto', padding: '40px 24px 80px', width: '100%' }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 28, gap: 16, flexWrap: 'wrap' }}>
          <div>
            <h1 style={{
              fontFamily: 'var(--font-display)',
              fontSize: 40, fontWeight: 600, letterSpacing: '-0.03em',
              margin: 0, color: 'var(--ink)', lineHeight: 1.05,
            }}>
              Your resumes
            </h1>
            <p style={{ color: 'var(--muted)', margin: '10px 0 0', fontSize: 14, maxWidth: '52ch', lineHeight: 1.55 }}>
              Every version of every story you've told about what you do.
            </p>
          </div>
          {resumes && resumes.length > 0 && (
            <div style={{ fontSize: 11.5, color: 'var(--muted)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              <span style={{ fontWeight: 600, color: 'var(--ink-2)', fontVariantNumeric: 'tabular-nums', fontSize: 13 }}>{resumes.length}</span> on file
            </div>
          )}
        </div>

        {resumes === null ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}>
            <div style={{
              width: 24, height: 24, borderRadius: '50%',
              border: '2px solid var(--border-strong)',
              borderTopColor: 'var(--accent)',
              animation: 'rk-spin 0.7s linear infinite',
            }} />
          </div>
        ) : resumes.length === 0 ? (
          <EmptyState onNew={() => navigate('/resumes/new')} hasFilters={!!(filters.region_id || filters.industry_id)} onClear={() => setFilters({ region_id: null, industry_id: null })} />
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
            {resumes.map((r, i) => (
              <ResumeCard
                key={r.id}
                resume={r}
                regions={regions}
                industries={industries}
                onOpen={() => navigate(`/resumes/${r.id}`)}
                style={{ animationDelay: `${i * 40}ms` }}
              />
            ))}
            <NewResumeCard onClick={() => navigate('/resumes/new')} />
          </div>
        )}
      </div>
    </>
  );
}

function ResumeCard({ resume, regions, industries, onOpen, style }) {
  const region = regions.find(r => r.id === resume.region_id);
  const industry = industries.find(i => i.id === resume.industry_id);
  const fullName = [resume.first_name, resume.last_name].filter(Boolean).join(' ') || 'Untitled resume';

  const currentRole = resume.positions.find(p => p.is_current)
    || [...resume.positions].sort((a, b) => (b.start_date || '').localeCompare(a.start_date || ''))[0];

  return (
    <div
      className="card card-hover rk-fade-in"
      style={{ padding: 20, cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: 14, ...style }}
      onClick={onOpen}
    >
      <div className="row" style={{ gap: 12, alignItems: 'flex-start' }}>
        <Avatar size={48} name={fullName} url={resume.photo_url} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 600, fontSize: 15.5, letterSpacing: '-0.01em' }} className="truncate">
            {fullName}
          </div>
          {currentRole ? (
            <div style={{ color: 'var(--ink-2)', fontSize: 12.5, marginTop: 2 }} className="truncate">
              {currentRole.job_title || 'Untitled role'}
              {currentRole.organization ? ` · ${currentRole.organization}` : ''}
            </div>
          ) : (
            <div style={{ color: 'var(--muted)', fontSize: 12.5, marginTop: 2, fontStyle: 'italic' }} className="truncate">
              No experience added yet
            </div>
          )}
        </div>
      </div>

      {(industry || region) && (
        <div className="row" style={{ gap: 6, flexWrap: 'wrap' }}>
          {industry && <span className="badge" data-tone="accent">{industry.name}</span>}
          {region && (
            <span className="badge">
              <IconMapPin size={11} />
              {region.name}
            </span>
          )}
        </div>
      )}

      {resume.summary ? (
        <p className="clamp-2" style={{ color: 'var(--muted)', fontSize: 12.5, lineHeight: 1.55, margin: 0 }}>
          {resume.summary}
        </p>
      ) : (
        <p style={{ color: 'var(--faint)', fontSize: 12.5, lineHeight: 1.55, margin: 0, fontStyle: 'italic' }}>
          No summary yet.
        </p>
      )}

      <div className="row" style={{ marginTop: 'auto', paddingTop: 6, gap: 14, justifyContent: 'space-between', borderTop: '1px solid var(--border)' }}>
        <div className="row" style={{ gap: 10, color: 'var(--muted)', paddingTop: 10 }}>
          {resume.contacts.length > 0
            ? resume.contacts.slice(0, 6).map(c => {
                const Ic = CONTACT_ICONS[c.type];
                return <Ic key={c.id} size={13} />;
              })
            : <span style={{ fontSize: 11, color: 'var(--faint)' }}>No contacts</span>
          }
        </div>
        <div className="row" style={{ gap: 6, fontSize: 11, color: 'var(--muted)', paddingTop: 10, fontVariantNumeric: 'tabular-nums' }}>
          <IconSparkles size={11} />
          <span>{resume.skills.length} skill{resume.skills.length === 1 ? '' : 's'}</span>
        </div>
      </div>
    </div>
  );
}

function NewResumeCard({ onClick }) {
  return (
    <button
      onClick={onClick}
      className="card card-hover rk-fade-in focusable"
      style={{
        background: 'transparent',
        border: '1.5px dashed var(--border-strong)',
        color: 'var(--muted)',
        cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        gap: 10, minHeight: 200,
        flexDirection: 'column',
      }}
    >
      <div style={{
        width: 44, height: 44, borderRadius: 12,
        background: 'var(--surface-2)', border: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: 'var(--ink-2)',
      }}>
        <IconPlus size={20} />
      </div>
      <div style={{ fontWeight: 600, color: 'var(--ink)' }}>Start a new resume</div>
      <div style={{ fontSize: 12 }}>Three steps, two minutes</div>
    </button>
  );
}

function EmptyState({ onNew, hasFilters, onClear }) {
  return (
    <div style={{
      maxWidth: 520, margin: '60px auto', textAlign: 'center',
      padding: '40px 24px',
    }}>
      <div style={{
        width: 96, height: 96, margin: '0 auto 24px',
        position: 'relative',
      }}>
        {/* stylized stack of papers */}
        <div style={{ position: 'absolute', inset: 0, transform: 'rotate(-6deg)', borderRadius: 14, background: 'var(--surface)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }} />
        <div style={{ position: 'absolute', inset: 4, transform: 'rotate(3deg)', borderRadius: 14, background: 'var(--surface)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }} />
        <div style={{ position: 'absolute', inset: 8, borderRadius: 12, background: 'var(--surface)', border: '1px solid var(--border-strong)', boxShadow: 'var(--shadow-md)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)' }}>
          <IconFileText size={28} />
        </div>
      </div>
      <h2 style={{ margin: '0 0 8px', fontWeight: 600, fontSize: 18 }}>
        {hasFilters ? 'No resumes match those filters.' : 'No resumes yet.'}
      </h2>
      <p style={{ color: 'var(--muted)', margin: '0 0 20px' }}>
        {hasFilters ? 'Try clearing the filters or making a new one.' : 'Create your first resume — it takes about two minutes.'}
      </p>
      <div className="row" style={{ gap: 8, justifyContent: 'center' }}>
        {hasFilters && <Button onClick={onClear}>Clear filters</Button>}
        <Button variant="accent" leftIcon={<IconPlus size={13} />} onClick={onNew}>Create resume</Button>
      </div>
    </div>
  );
}

/* ===== New Resume Wizard ===== */
function NewResumePage({ navigate }) {
  const [step, setStep] = React.useState(0);
  const [regions, setRegions] = React.useState([]);
  const [industries, setIndustries] = React.useState([]);
  const [v, setV] = React.useState({
    first_name: '', last_name: '',
    photo_file: null,         // File object held until create
    photo_preview: null,      // data URL for the preview avatar
    region_id: '', industry_id: '',
    summary: '',
  });
  const [errs, setErrs] = React.useState({});
  const [creating, setCreating] = React.useState(false);
  const toast = useToast();

  React.useEffect(() => {
    (async () => {
      setRegions(await api.regions());
      setIndustries(await api.industries());
    })();
  }, []);

  const validateStep = () => {
    const e = {};
    if (step === 0) {
      if (v.first_name && v.first_name.length > 100) e.first_name = 'Max 100 characters';
      if (v.last_name && v.last_name.length > 100) e.last_name = 'Max 100 characters';
    }
    if (step === 1) {
      if (v.summary && v.summary.length > 2000) e.summary = 'Max 2000 characters';
    }
    setErrs(e);
    return Object.keys(e).length === 0;
  };

  const next = () => { if (validateStep()) setStep(s => Math.min(2, s + 1)); };
  const back = () => setStep(s => Math.max(0, s - 1));

  const create = async () => {
    setCreating(true);
    try {
      const u = await api.createUser({
        first_name: v.first_name.trim() || null,
        last_name: v.last_name.trim() || null,
        photo_url: null, // photo is uploaded as a separate multipart request
        region_id: v.region_id || null,
        industry_id: v.industry_id || null,
        summary: v.summary.trim() || null,
      });
      // If the user picked a photo in step 1, upload it now that we have an id
      if (v.photo_file) {
        try { await api.uploadPhoto(u.id, v.photo_file); }
        catch { toast.push('Resume created, but photo upload failed', 'error'); }
      }
      toast.push('Resume created', 'success');
      navigate(`/resumes/${u.id}`);
    } catch (e) {
      toast.push('Could not create resume', 'error');
      setCreating(false);
    }
  };

  const region = regions.find(r => r.id === v.region_id);
  const industry = industries.find(i => i.id === v.industry_id);
  const fullName = [v.first_name, v.last_name].filter(Boolean).join(' ') || 'Untitled';

  return (
    <>
      <TopNav navigate={navigate} route="new" regions={regions} industries={industries} filters={{}} setFilters={() => {}} onNewResume={() => {}} />
      <div data-screen-label="02 New Resume Wizard" style={{ maxWidth: 620, margin: '32px auto 80px', width: '100%', padding: '0 24px' }}>
        <button
          className="btn"
          data-variant="ghost"
          data-size="sm"
          onClick={() => navigate('/')}
          style={{ marginLeft: -8, marginBottom: 12 }}
        >
          <IconArrowL size={13} /> Back
        </button>

        <h1 style={{
          fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 600,
          letterSpacing: '-0.025em', margin: '0 0 6px', lineHeight: 1.1,
        }}>
          New resume
        </h1>
        <p style={{ color: 'var(--muted)', margin: '0 0 28px', fontSize: 14, lineHeight: 1.55 }}>
          The basics now — polish everything in the editor.
        </p>

        {/* progress */}
        <div style={{ marginBottom: 24 }}>
          <div className="row" style={{ justifyContent: 'space-between', marginBottom: 8 }}>
            {['Basics', 'About', 'Confirm'].map((label, i) => (
              <div key={label} className="row" style={{ gap: 8 }}>
                <span className="step-bullet" data-state={i === step ? 'current' : i < step ? 'done' : 'todo'}>
                  {i < step ? <IconCheck size={11} /> : i + 1}
                </span>
                <span style={{ fontSize: 12, color: i === step ? 'var(--ink)' : 'var(--muted)', fontWeight: i === step ? 600 : 400 }}>
                  {label}
                </span>
              </div>
            ))}
          </div>
          <div className="progress-track">
            <div className="progress-fill" style={{ width: `${((step + 1) / 3) * 100}%` }} />
          </div>
        </div>

        <div className="card rk-fade-in" style={{ padding: 24 }} key={step}>
          {step === 0 && (
            <div className="stack" style={{ gap: 14 }}>
              <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                <AvatarUpload
                  userId={null}
                  currentPhotoUrl={v.photo_preview}
                  firstName={v.first_name}
                  lastName={v.last_name}
                  size={72}
                  allowRemove
                  onLocalPick={(file, dataUrl) => setV({ ...v, photo_file: file, photo_preview: dataUrl })}
                />
                <div style={{ flex: 1, paddingTop: 6 }}>
                  <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--ink-2)', marginBottom: 4 }}>
                    Profile photo
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--muted)' }}>
                    Click the avatar to upload a JPEG, PNG, or WebP (max 5 MB). Optional — you can add one later.
                  </div>
                </div>
              </div>
              <div className="grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <Field label="First name" error={errs.first_name}>
                  <Input autoFocus value={v.first_name} maxLength={100} onChange={e => setV({ ...v, first_name: e.target.value })} placeholder="Avery" />
                </Field>
                <Field label="Last name" error={errs.last_name}>
                  <Input value={v.last_name} maxLength={100} onChange={e => setV({ ...v, last_name: e.target.value })} placeholder="Okafor" />
                </Field>
              </div>
              <div className="grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <Field label="Region">
                  <Select value={v.region_id} onChange={e => setV({ ...v, region_id: e.target.value })}>
                    <option value="">Choose…</option>
                    {regions.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                  </Select>
                </Field>
                <Field label="Industry">
                  <Select value={v.industry_id} onChange={e => setV({ ...v, industry_id: e.target.value })}>
                    <option value="">Choose…</option>
                    {industries.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                  </Select>
                </Field>
              </div>
            </div>
          )}

          {step === 1 && (
            <Field
              label="Tell us about you"
              hint="A short paragraph — the kind of work you do, how you do it, and what you're looking for next."
              error={errs.summary}
              right={<span style={{ fontSize: 11, color: 'var(--muted)', fontVariantNumeric: 'tabular-nums' }}>{v.summary.length} / 2000</span>}
            >
              <Textarea autoFocus value={v.summary} onChange={e => setV({ ...v, summary: e.target.value })} style={{ minHeight: 160 }} placeholder="I’m a backend engineer focused on…" />
            </Field>
          )}

          {step === 2 && (
            <div className="stack" style={{ gap: 14 }}>
              <div style={{ fontSize: 12, color: 'var(--muted)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                Preview
              </div>
              <div className="row" style={{ gap: 14 }}>
                <Avatar size={64} name={fullName} url={v.photo_preview} />
                <div className="stack" style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 20, fontWeight: 700, letterSpacing: '-0.01em' }}>{fullName}</div>
                  <div style={{ color: 'var(--muted)', fontSize: 13 }}>
                    {industry?.name || 'No industry'}{region ? ` · ${region.name}` : ''}
                  </div>
                </div>
              </div>
              {v.summary && (
                <p style={{ color: 'var(--ink-2)', fontSize: 13.5, lineHeight: 1.55, margin: 0, padding: 14, background: 'var(--surface-2)', borderRadius: 10 }}>
                  {v.summary}
                </p>
              )}
              <div style={{ fontSize: 12, color: 'var(--muted)' }}>
                You'll add work experience, education, skills, and contact links on the next screen.
              </div>
            </div>
          )}

          <div className="row" style={{ justifyContent: 'space-between', marginTop: 22 }}>
            <Button variant="ghost" onClick={back} disabled={step === 0} leftIcon={<IconArrowL size={13} />}>Back</Button>
            {step < 2 ? (
              <Button variant="primary" onClick={next} rightIcon={<IconArrowR size={13} />}>Continue</Button>
            ) : (
              <Button variant="accent" loading={creating} onClick={create} rightIcon={!creating && <IconCheck size={13} />}>Create resume</Button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

/* ===== Preview page (print/read-only) ===== */
function PreviewPage({ id, navigate }) {
  const [resume, setResume] = React.useState(null);
  const [regions, setRegions] = React.useState([]);
  const [industries, setIndustries] = React.useState([]);

  React.useEffect(() => {
    (async () => {
      const [r, regs, inds] = await Promise.all([
        api.getResume(id), api.regions(), api.industries(),
      ]);
      setResume(r); setRegions(regs); setIndustries(inds);
    })();
  }, [id]);

  if (!resume) {
    return <div style={{ padding: 40 }}><Skeleton w="60%" h={20} /></div>;
  }
  return (
    <div data-screen-label="04 Preview" style={{ background: 'var(--surface-2)', minHeight: '100vh' }}>
      <div className="no-print" style={{
        position: 'sticky', top: 0, zIndex: 10,
        background: 'color-mix(in oklab, var(--bg), transparent 8%)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid var(--border)',
        padding: '12px 24px',
        display: 'flex', alignItems: 'center', gap: 12, maxWidth: 1400, margin: '0 auto',
      }}>
        <Button size="sm" variant="ghost" leftIcon={<IconArrowL size={13} />} onClick={() => navigate(`/resumes/${id}`)}>Back to editor</Button>
        <div className="spacer" />
        <Button size="sm" leftIcon={<IconPrinter size={13} />} onClick={() => printResume()}>Print / PDF</Button>
      </div>
      <div style={{ padding: '40px 24px 80px' }}>
        <LivePreview resume={resume} regions={regions} industries={industries} />
      </div>
    </div>
  );
}

Object.assign(window, {
  TopNav, ResumesListPage, ResumeCard, NewResumeCard, EmptyState,
  NewResumePage, PreviewPage, ThemeToggle,
});
