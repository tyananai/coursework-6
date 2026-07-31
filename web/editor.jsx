/* Resume Editor page — flagship feature.
   Two-column split (editor + live preview), 5 sections.
   All edits go through optimistic update + mock API + saving indicator. */

/* ===== Auto-save indicator hook =====
 * Each section gets its own saving state (saving|saved|error|null).
 * mutate(kind, fn) runs the API call optimistically and pings the indicator. */
function useSectionSaver() {
  const [states, setStates] = React.useState({});
  const setState = (k, v) => setStates(s => ({ ...s, [k]: v }));
  const ping = (k, status, ttl = 1400) => {
    setState(k, status);
    if (status === 'saved') setTimeout(() => setState(k, null), ttl);
  };
  const run = async (k, fn) => {
    ping(k, 'saving');
    try {
      const v = await fn();
      ping(k, 'saved');
      return v;
    } catch (e) {
      ping(k, 'error', 2400);
      throw e;
    }
  };
  return { states, run };
}

/* ===== Section: Profile ===== */
function ProfileSection({ resume, regions, industries, onPatch, onUserReplace, savingState }) {
  const summaryLen = (resume.summary || '').length;

  return (
    <Section
      icon={<IconUser size={15} />}
      title="Profile"
      subtitle="Your headline details"
      savingState={savingState}
    >
      <div style={{ display: 'flex', gap: 18, alignItems: 'flex-start' }}>
        <div style={{ width: 84, flexShrink: 0 }}>
          <AvatarUpload
            userId={resume.id}
            currentPhotoUrl={resume.photo_url}
            firstName={resume.first_name}
            lastName={resume.last_name}
            size={84}
            allowRemove
            onSuccess={(u) => onUserReplace(u)}
          />
        </div>

        <div className="grid-2" style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <Field label="First name">
            <Input
              value={resume.first_name || ''}
              maxLength={100}
              onChange={e => onPatch({ first_name: e.target.value })}
              placeholder="Avery"
            />
          </Field>
          <Field label="Last name">
            <Input
              value={resume.last_name || ''}
              maxLength={100}
              onChange={e => onPatch({ last_name: e.target.value })}
              placeholder="Okafor"
            />
          </Field>
          <Field label="Region">
            <Select value={resume.region_id || ''} onChange={e => onPatch({ region_id: e.target.value || null })}>
              <option value="">Choose a region…</option>
              {regions.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
            </Select>
          </Field>
          <Field label="Industry">
            <Select value={resume.industry_id || ''} onChange={e => onPatch({ industry_id: e.target.value || null })}>
              <option value="">Choose an industry…</option>
              {industries.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
            </Select>
          </Field>
        </div>
      </div>

      <div style={{ marginTop: 14 }}>
        <Field
          label="Summary"
          right={<span style={{ fontSize: 11, color: summaryLen > 2000 ? 'oklch(0.55 0.20 25)' : 'var(--muted)', fontVariantNumeric: 'tabular-nums' }}>
            {summaryLen} / 2000
          </span>}
        >
          <Textarea
            value={resume.summary || ''}
            onChange={e => onPatch({ summary: e.target.value })}
            placeholder="A short paragraph about how you work, what you've built, and what you're looking for next."
            style={{ minHeight: 110 }}
          />
        </Field>
      </div>
    </Section>
  );
}

/* ===== Section: Positions ===== */
function PositionsSection({ resume, onAdd, onUpdate, onDelete, savingState }) {
  const [open, setOpen] = React.useState(true);
  const [adding, setAdding] = React.useState(false);
  const [editingId, setEditingId] = React.useState(null);

  const startAdd = () => { setOpen(true); setEditingId(null); setAdding(true); };

  // Sort positions: current first, then by start_date descending
  const sortedPositions = React.useMemo(() => {
    return [...resume.positions].sort((a, b) => {
      if (a.is_current && !b.is_current) return -1;
      if (!a.is_current && b.is_current) return 1;
      return (b.start_date || '').localeCompare(a.start_date || '');
    });
  }, [resume.positions]);

  return (
    <Section
      icon={<IconBriefcase size={15} />}
      title="Work experience"
      subtitle={`${resume.positions.length} position${resume.positions.length === 1 ? '' : 's'}`}
      savingState={savingState}
      open={open}
      onOpenChange={setOpen}
      right={
        !adding ? (
          <Button size="sm" leftIcon={<IconPlus size={13} />} onClick={startAdd}>
            Add
          </Button>
        ) : null
      }
    >
      <div className="stack" style={{ gap: 10 }}>
        {adding && (
          <PositionForm
            position={{ job_title: '', organization: '', start_date: null, end_date: null, is_current: false }}
            onCancel={() => setAdding(false)}
            onSave={async (data) => { await onAdd(data); setAdding(false); }}
          />
        )}
        {resume.positions.length === 0 && !adding && (
          <EmptyHint
            icon={<IconBriefcase size={18} />}
            label="Add your first position"
            onClick={startAdd}
          />
        )}
        {sortedPositions.map(p =>
          editingId === p.id ? (
            <PositionForm
              key={p.id}
              position={p}
              onCancel={() => setEditingId(null)}
              onSave={async (data) => { await onUpdate(p.id, data); setEditingId(null); }}
            />
          ) : (
            <PositionCard
              key={p.id}
              position={p}
              onEdit={() => setEditingId(p.id)}
              onDelete={() => onDelete(p.id)}
            />
          )
        )}
      </div>
    </Section>
  );
}

function PositionCard({ position, onEdit, onDelete }) {
  const [confirmNode, askConfirm] = useConfirm();
  return (
    <div className="card card-hover rk-fade-in" style={{ padding: '12px 14px', borderRadius: 12 }}>
      <div className="row" style={{ gap: 12 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="row" style={{ gap: 8 }}>
            <div style={{ fontWeight: 600, fontSize: 13.5 }}>{position.job_title || 'Untitled role'}</div>
            {position.is_current && <span className="badge" data-tone="success">Current</span>}
          </div>
          <div style={{ color: 'var(--muted)', fontSize: 12.5 }}>
            {position.organization || '—'}
            {position.organization && (position.start_date || position.end_date || position.is_current) && (
              <span style={{ margin: '0 8px', color: 'var(--faint)' }}>·</span>
            )}
            <span style={{ fontVariantNumeric: 'tabular-nums' }}>
              {fmtDateRange(position.start_date, position.end_date, position.is_current) || 'No dates'}
            </span>
          </div>
        </div>
        <div className="row" style={{ gap: 2 }}>
          <button className="icon-btn" onClick={onEdit} aria-label="Edit"><IconEdit size={14} /></button>
          <button
            className="icon-btn"
            data-tone="danger"
            aria-label="Delete"
            onClick={(e) => askConfirm(e, {
              message: 'Delete this position?',
              onConfirm: onDelete,
            })}
          ><IconTrash size={14} /></button>
        </div>
      </div>
      {confirmNode}
    </div>
  );
}

function PositionForm({ position, onSave, onCancel }) {
  const [v, setV] = React.useState({
    job_title: position.job_title || '',
    organization: position.organization || '',
    start_date: isoToMonthYear(position.start_date) || '',
    end_date: isoToMonthYear(position.end_date) || '',
    is_current: !!position.is_current,
  });
  const [saving, setSaving] = React.useState(false);

  const save = async (e) => {
    e?.preventDefault?.();
    setSaving(true);
    await onSave({
      job_title: v.job_title.trim() || null,
      organization: v.organization.trim() || null,
      start_date: monthYearToIso(v.start_date),
      end_date: v.is_current ? null : monthYearToIso(v.end_date),
      is_current: !!v.is_current,
    });
    setSaving(false);
  };

  return (
    <form
      className="card rk-pop-in"
      style={{ padding: 14, borderRadius: 12, background: 'var(--surface-2)' }}
      onSubmit={save}
      onKeyDown={(e) => { if (e.key === 'Escape') onCancel(); }}
    >
      <div className="grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <Field label="Job title">
          <Input autoFocus value={v.job_title} maxLength={200} onChange={e => setV({ ...v, job_title: e.target.value })} placeholder="Senior Designer" />
        </Field>
        <Field label="Organization">
          <Input value={v.organization} maxLength={200} onChange={e => setV({ ...v, organization: e.target.value })} placeholder="Acme Inc." />
        </Field>
        <Field label="Start">
          <Input type="month" value={v.start_date} onChange={e => setV({ ...v, start_date: e.target.value })} />
        </Field>
        <Field label="End">
          <Input
            type="month"
            value={v.is_current ? '' : v.end_date}
            disabled={v.is_current}
            onChange={e => setV({ ...v, end_date: e.target.value })}
            style={v.is_current ? { opacity: 0.4 } : null}
          />
        </Field>
      </div>
      <div className="row" style={{ justifyContent: 'space-between', marginTop: 12 }}>
        <Toggle on={v.is_current} onChange={(on) => setV({ ...v, is_current: on, end_date: on ? '' : v.end_date })} label="Currently working here" />
        <div className="row" style={{ gap: 6 }}>
          <Button size="sm" variant="ghost" type="button" onClick={onCancel}>Cancel</Button>
          <Button size="sm" variant="primary" type="submit" loading={saving}>Save</Button>
        </div>
      </div>
    </form>
  );
}

/* ===== Section: Education ===== */
function EducationSection({ resume, onAdd, onUpdate, onDelete, savingState }) {
  const [open, setOpen] = React.useState(true);
  const [adding, setAdding] = React.useState(false);
  const [editingId, setEditingId] = React.useState(null);

  const startAdd = () => { setOpen(true); setEditingId(null); setAdding(true); };

  const sortedEdu = React.useMemo(() =>
    [...resume.education].sort((a, b) => (b.start_date || '').localeCompare(a.start_date || '')),
    [resume.education]);

  return (
    <Section
      icon={<IconBook size={15} />}
      title="Education"
      subtitle={`${resume.education.length} item${resume.education.length === 1 ? '' : 's'}`}
      savingState={savingState}
      open={open}
      onOpenChange={setOpen}
      right={!adding && (
        <Button size="sm" leftIcon={<IconPlus size={13} />} onClick={startAdd}>Add</Button>
      )}
    >
      <div className="stack" style={{ gap: 10 }}>
        {adding && (
          <EducationForm
            edu={{ school_name: '', start_date: null, end_date: null }}
            onCancel={() => setAdding(false)}
            onSave={async (data) => { await onAdd(data); setAdding(false); }}
          />
        )}
        {resume.education.length === 0 && !adding && (
          <EmptyHint icon={<IconBook size={18} />} label="Add a school, degree, or program" onClick={startAdd} />
        )}
        {sortedEdu.map(e =>
          editingId === e.id ? (
            <EducationForm
              key={e.id}
              edu={e}
              onCancel={() => setEditingId(null)}
              onSave={async (data) => { await onUpdate(e.id, data); setEditingId(null); }}
            />
          ) : (
            <EducationCard
              key={e.id}
              edu={e}
              onEdit={() => setEditingId(e.id)}
              onDelete={() => onDelete(e.id)}
            />
          )
        )}
      </div>
    </Section>
  );
}

function EducationCard({ edu, onEdit, onDelete }) {
  const [confirmNode, askConfirm] = useConfirm();
  return (
    <div className="card card-hover rk-fade-in" style={{ padding: '12px 14px', borderRadius: 12 }}>
      <div className="row" style={{ gap: 12 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 600, fontSize: 13.5 }}>{edu.school_name || 'Untitled school'}</div>
          <div style={{ color: 'var(--muted)', fontSize: 12.5, fontVariantNumeric: 'tabular-nums' }}>
            {fmtDateRange(edu.start_date, edu.end_date, false) || 'No dates'}
          </div>
        </div>
        <div className="row" style={{ gap: 2 }}>
          <button className="icon-btn" onClick={onEdit} aria-label="Edit"><IconEdit size={14} /></button>
          <button className="icon-btn" data-tone="danger" aria-label="Delete"
            onClick={(e) => askConfirm(e, { message: 'Delete this education entry?', onConfirm: onDelete })}
          ><IconTrash size={14} /></button>
        </div>
      </div>
      {confirmNode}
    </div>
  );
}

function EducationForm({ edu, onSave, onCancel }) {
  const [v, setV] = React.useState({
    school_name: edu.school_name || '',
    start_date: isoToMonthYear(edu.start_date) || '',
    end_date: isoToMonthYear(edu.end_date) || '',
  });
  const [saving, setSaving] = React.useState(false);

  const save = async (e) => {
    e?.preventDefault?.();
    setSaving(true);
    await onSave({
      school_name: v.school_name.trim() || null,
      start_date: monthYearToIso(v.start_date),
      end_date: monthYearToIso(v.end_date),
    });
    setSaving(false);
  };

  return (
    <form
      className="card rk-pop-in"
      style={{ padding: 14, borderRadius: 12, background: 'var(--surface-2)' }}
      onSubmit={save}
      onKeyDown={(e) => { if (e.key === 'Escape') onCancel(); }}
    >
      <Field label="School / program">
        <Input autoFocus value={v.school_name} maxLength={200} onChange={e => setV({ ...v, school_name: e.target.value })} placeholder="University of …" />
      </Field>
      <div className="grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 10 }}>
        <Field label="Start">
          <Input type="month" value={v.start_date} onChange={e => setV({ ...v, start_date: e.target.value })} />
        </Field>
        <Field label="End">
          <Input type="month" value={v.end_date} onChange={e => setV({ ...v, end_date: e.target.value })} />
        </Field>
      </div>
      <div className="row" style={{ gap: 6, marginTop: 12, justifyContent: 'flex-end' }}>
        <Button size="sm" variant="ghost" type="button" onClick={onCancel}>Cancel</Button>
        <Button size="sm" variant="primary" type="submit" loading={saving}>Save</Button>
      </div>
    </form>
  );
}

/* ===== Section: Skills (with drag-to-reorder) ===== */
function SkillsSection({ resume, onBulkUpdate, onAdd, onDelete, savingState }) {
  const [open, setOpen] = React.useState(true);
  const skills = resume.skills;
  // group by category
  const grouped = React.useMemo(() => {
    const map = new Map();
    const sorted = [...skills].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
    for (const s of sorted) {
      const key = s.category || 'General';
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(s);
    }
    return [...map.entries()];
  }, [skills]);

  const allCategories = [...new Set(skills.map(s => s.category).filter(Boolean))];

  const [adding, setAdding] = React.useState(false);
  const [newSkill, setNewSkill] = React.useState({ name: '', category: '' });
  const [nameErr, setNameErr] = React.useState(null);

  const addSkill = () => {
    const err = VAL.skillName(newSkill.name);
    if (err) { setNameErr(err); return; }
    const cat = newSkill.category.trim() || null;
    const inCat = skills.filter(s => (s.category || null) === cat);
    const order = inCat.length;
    onAdd({ name: newSkill.name.trim(), category: cat, sort_order: order });
    setNewSkill({ name: '', category: newSkill.category });
    setNameErr(null);
  };

  // Drag state: dragging skill id, hovering target id (within same category)
  const [drag, setDrag] = React.useState({ id: null, overId: null });

  const handleDrop = (group, sourceId, targetId) => {
    if (!sourceId || sourceId === targetId) return;
    const src = group.findIndex(s => s.id === sourceId);
    const tgt = group.findIndex(s => s.id === targetId);
    if (src < 0 || tgt < 0) return;
    const newGroup = [...group];
    const [moved] = newGroup.splice(src, 1);
    newGroup.splice(tgt, 0, moved);
    // Reassign sort_order within this category, then merge with other skills
    const cat = moved.category;
    const newGroupWithOrder = newGroup.map((s, i) => ({ ...s, sort_order: i }));
    const others = skills.filter(s => (s.category || null) !== (cat || null));
    onBulkUpdate([...others, ...newGroupWithOrder]);
  };

  return (
    <Section
      icon={<IconSparkles size={15} />}
      title="Skills"
      subtitle={`${skills.length} skill${skills.length === 1 ? '' : 's'} · drag chips to reorder`}
      savingState={savingState}
      open={open}
      onOpenChange={setOpen}
      right={!adding && (
        <Button size="sm" leftIcon={<IconPlus size={13} />} onClick={() => { setOpen(true); setAdding(true); }}>Add</Button>
      )}
    >
      <div className="stack" style={{ gap: 16 }}>
        {grouped.length === 0 && !adding && (
          <EmptyHint icon={<IconSparkles size={18} />} label="Add your first skill" onClick={() => { setOpen(true); setAdding(true); }} />
        )}
        {grouped.map(([cat, group]) => (
          <div key={cat}>
            <div style={{
              fontSize: 11, fontWeight: 600, color: 'var(--muted)',
              letterSpacing: '0.06em', textTransform: 'uppercase',
              marginBottom: 8,
            }}>{cat}</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {group.map(s => (
                <SkillChip
                  key={s.id}
                  skill={s}
                  dragging={drag.id === s.id}
                  over={drag.overId === s.id && drag.id && drag.id !== s.id}
                  onDragStart={() => setDrag({ id: s.id, overId: null })}
                  onDragOver={(e) => {
                    e.preventDefault();
                    if (drag.id && drag.overId !== s.id) setDrag(d => ({ ...d, overId: s.id }));
                  }}
                  onDrop={() => { handleDrop(group, drag.id, s.id); setDrag({ id: null, overId: null }); }}
                  onDragEnd={() => setDrag({ id: null, overId: null })}
                  onDelete={() => onDelete(s.id)}
                />
              ))}
            </div>
          </div>
        ))}

        {adding && (
          <div className="card rk-pop-in" style={{ padding: 14, borderRadius: 12, background: 'var(--surface-2)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr auto', gap: 10, alignItems: 'end' }}>
              <Field label="Name" error={nameErr}>
                <Input
                  autoFocus
                  value={newSkill.name}
                  onChange={e => { setNewSkill({ ...newSkill, name: e.target.value }); setNameErr(null); }}
                  onKeyDown={(e) => { if (e.key === 'Enter') addSkill(); if (e.key === 'Escape') setAdding(false); }}
                  placeholder="e.g. Figma"
                  maxLength={100}
                />
              </Field>
              <Field label="Category">
                <Input
                  value={newSkill.category}
                  list="skill-cats"
                  onChange={e => setNewSkill({ ...newSkill, category: e.target.value })}
                  placeholder="Tools, Languages…"
                />
                <datalist id="skill-cats">
                  {allCategories.map(c => <option key={c} value={c} />)}
                </datalist>
              </Field>
              <div className="row" style={{ gap: 6 }}>
                <Button size="sm" variant="ghost" type="button" onClick={() => setAdding(false)}>Cancel</Button>
                <Button size="sm" variant="primary" type="button" onClick={addSkill}>Add</Button>
              </div>
            </div>
            <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 8 }}>
              Tip: press Enter to add quickly.
            </div>
          </div>
        )}
      </div>
    </Section>
  );
}

function SkillChip({ skill, dragging, over, onDragStart, onDragOver, onDrop, onDragEnd, onDelete }) {
  return (
    <div
      className="chip"
      draggable
      data-dragging={dragging}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
      onDragEnd={onDragEnd}
      style={{
        boxShadow: over ? '0 0 0 2px var(--accent)' : 'none',
        cursor: 'grab',
      }}
    >
      <span className="chip-drag"><IconGripV size={12} /></span>
      <span>{skill.name}</span>
      <span className="chip-x" onClick={onDelete} title="Remove"><IconX size={11} /></span>
    </div>
  );
}

/* ===== Section: Contacts ===== */
function ContactsSection({ resume, onAdd, onUpdate, onDelete, savingState }) {
  const usedTypes = new Set(resume.contacts.map(c => c.type));
  const availableTypes = CONTACT_TYPES.filter(t => !usedTypes.has(t));
  const [open, setOpen] = React.useState(true);
  const [addMenu, setAddMenu] = React.useState(false);

  const openAddMenu = () => { setOpen(true); setAddMenu(true); };

  return (
    <Section
      icon={<IconLink size={15} />}
      title="Contact links"
      subtitle={`${resume.contacts.length}/${CONTACT_TYPES.length} added`}
      savingState={savingState}
      open={open}
      onOpenChange={setOpen}
      right={availableTypes.length > 0 && (
        <div style={{ position: 'relative' }}>
          <Button size="sm" leftIcon={<IconPlus size={13} />} onClick={() => { setOpen(true); setAddMenu(v => !v); }}>Add</Button>
          {addMenu && (
            <>
              <div onClick={() => setAddMenu(false)} style={{ position: 'fixed', inset: 0, zIndex: 49 }} />
              <div className="pop" style={{ position: 'absolute', top: 'calc(100% + 6px)', right: 0, zIndex: 50, padding: 6, minWidth: 180 }}>
                {availableTypes.map(t => {
                  const Ic = CONTACT_ICONS[t];
                  return (
                    <button
                      key={t}
                      className="row"
                      style={{
                        width: '100%', gap: 8, padding: '8px 10px',
                        background: 'transparent', border: 'none',
                        borderRadius: 8, cursor: 'pointer', color: 'var(--ink)',
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-2)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      onClick={() => {
                        onAdd({ type: t, url: '' });
                        setAddMenu(false);
                      }}
                    >
                      <Ic size={14} />
                      <span style={{ fontSize: 13 }}>{CONTACT_LABELS[t]}</span>
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>
      )}
    >
      <div className="stack" style={{ gap: 8 }}>
        {resume.contacts.length === 0 && (
          <EmptyHint icon={<IconLink size={18} />} label="Add a link to your work" onClick={openAddMenu} />
        )}
        {resume.contacts.map(c => (
          <ContactRow
            key={c.id}
            contact={c}
            onUpdate={(patch) => onUpdate(c.id, patch)}
            onDelete={() => onDelete(c.id)}
          />
        ))}
      </div>
    </Section>
  );
}

function ContactRow({ contact, onUpdate, onDelete }) {
  const Ic = CONTACT_ICONS[contact.type];
  const [val, setVal] = React.useState(contact.url || '');
  const [err, setErr] = React.useState(null);
  React.useEffect(() => { setVal(contact.url || ''); }, [contact.url]);

  const commit = () => {
    const trimmed = val.trim();
    const e = contact.type === 'email' ? VAL.emailLike(trimmed) : VAL.url(trimmed);
    setErr(e);
    if (!e && trimmed !== (contact.url || '')) onUpdate({ type: contact.type, url: trimmed || null });
  };

  const [confirmNode, askConfirm] = useConfirm();
  return (
    <div className="row card" style={{ gap: 10, padding: '8px 10px 8px 12px', borderRadius: 10 }}>
      <Ic size={16} />
      <span style={{ fontSize: 12.5, color: 'var(--muted)', width: 70 }}>{CONTACT_LABELS[contact.type]}</span>
      <div style={{ flex: 1 }}>
        <Input
          value={val}
          onChange={e => { setVal(e.target.value); if (err) setErr(null); }}
          onBlur={commit}
          onKeyDown={(e) => { if (e.key === 'Enter') e.currentTarget.blur(); }}
          placeholder={CONTACT_PLACEHOLDER[contact.type]}
          style={{ borderColor: err ? 'oklch(0.55 0.20 25 / 0.6)' : undefined }}
        />
        {err && <div className="field-error" style={{ marginTop: 4 }}>{err}</div>}
      </div>
      <button className="icon-btn" data-tone="danger" aria-label="Delete"
        onClick={(e) => askConfirm(e, { message: 'Remove this contact?', onConfirm: onDelete })}
      ><IconTrash size={14} /></button>
      {confirmNode}
    </div>
  );
}

/* ===== Empty hint ===== */
function EmptyHint({ icon, label, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        width: '100%', padding: '20px 16px',
        background: 'transparent',
        border: '1.5px dashed var(--border-strong)',
        borderRadius: 12,
        color: 'var(--muted)',
        cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
        transition: 'all .15s ease',
      }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--ink-2)'; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-strong)'; e.currentTarget.style.color = 'var(--muted)'; }}
    >
      {icon}
      <span style={{ fontSize: 13 }}>{label}</span>
      <span style={{ color: 'var(--accent)', fontSize: 13 }}>+ Add</span>
    </button>
  );
}

/* ===== Editor Page ===== */
function ResumeEditorPage({ id, navigate }) {
  const [resume, setResume] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [regions, setRegions] = React.useState([]);
  const [industries, setIndustries] = React.useState([]);
  const [deleteConfirmNode, askDeleteConfirm] = useConfirm();
  const toast = useToast();
  const saver = useSectionSaver();

  React.useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      try {
        const [r, regs, inds] = await Promise.all([
          api.getResume(id), api.regions(), api.industries(),
        ]);
        if (!alive) return;
        setResume(r); setRegions(regs); setIndustries(inds);
      } catch (e) {
        toast.push('Could not load resume', 'error');
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [id]);

  // Debounced profile patch
  const profileTimer = React.useRef(null);
  const optimisticPatch = (patch) => {
    setResume(r => ({ ...r, ...patch }));
    clearTimeout(profileTimer.current);
    saver.run('profile', () => new Promise(res => {
      profileTimer.current = setTimeout(async () => {
        const updated = await api.updateUser(id, patch);
        setResume(r => ({ ...r, ...updated }));
        res();
      }, 350);
    })).catch(() => toast.push('Could not save profile', 'error'));
  };

  // Position handlers
  const addPosition = async (data) => {
    const prev = resume;
    const tempId = 'tmp_' + Math.random().toString(36).slice(2);
    const optimistic = { id: tempId, user_id: id, ...data };
    setResume(r => ({ ...r, positions: [optimistic, ...r.positions] }));
    try {
      const created = await saver.run('positions', () => api.addChild(id, 'positions', data));
      setResume(r => ({ ...r, positions: r.positions.map(p => p.id === tempId ? created : p) }));
      toast.push('Position added', 'success');
    } catch (e) {
      setResume(prev); toast.push('Could not add position', 'error');
    }
  };
  const updatePosition = async (pid, data) => {
    const prev = resume;
    setResume(r => ({ ...r, positions: r.positions.map(p => p.id === pid ? { ...p, ...data } : p) }));
    try { await saver.run('positions', () => api.updateChild(id, 'positions', pid, data)); }
    catch { setResume(prev); toast.push('Could not save position', 'error'); }
  };
  const deletePosition = async (pid) => {
    const prev = resume;
    setResume(r => ({ ...r, positions: r.positions.filter(p => p.id !== pid) }));
    try {
      await saver.run('positions', () => api.deleteChild(id, 'positions', pid));
      toast.push('Position removed', 'success');
    } catch { setResume(prev); toast.push('Could not delete', 'error'); }
  };

  // Education
  const addEdu = async (data) => {
    const tempId = 'tmp_' + Math.random().toString(36).slice(2);
    setResume(r => ({ ...r, education: [{ id: tempId, user_id: id, ...data }, ...r.education] }));
    try {
      const created = await saver.run('education', () => api.addChild(id, 'education', data));
      setResume(r => ({ ...r, education: r.education.map(e => e.id === tempId ? created : e) }));
    } catch { toast.push('Could not save', 'error'); }
  };
  const updateEdu = async (eid, data) => {
    setResume(r => ({ ...r, education: r.education.map(e => e.id === eid ? { ...e, ...data } : e) }));
    try { await saver.run('education', () => api.updateChild(id, 'education', eid, data)); }
    catch { toast.push('Could not save', 'error'); }
  };
  const deleteEdu = async (eid) => {
    setResume(r => ({ ...r, education: r.education.filter(e => e.id !== eid) }));
    try { await saver.run('education', () => api.deleteChild(id, 'education', eid)); }
    catch { toast.push('Could not delete', 'error'); }
  };

  // Skills
  const addSkill = async (data) => {
    const tempId = 'tmp_' + Math.random().toString(36).slice(2);
    setResume(r => ({ ...r, skills: [...r.skills, { id: tempId, user_id: id, ...data }] }));
    try {
      const created = await saver.run('skills', () => api.addChild(id, 'skills', data));
      setResume(r => ({ ...r, skills: r.skills.map(s => s.id === tempId ? created : s) }));
    } catch { toast.push('Could not save', 'error'); }
  };
  const deleteSkill = async (sid) => {
    setResume(r => ({ ...r, skills: r.skills.filter(s => s.id !== sid) }));
    try { await saver.run('skills', () => api.deleteChild(id, 'skills', sid)); }
    catch { toast.push('Could not delete', 'error'); }
  };
  const bulkUpdateSkills = async (newSkills) => {
    setResume(r => ({ ...r, skills: newSkills }));
    try { await saver.run('skills', () => api.bulkUpdateSkills(id, newSkills)); }
    catch { toast.push('Could not reorder', 'error'); }
  };

  // Contacts
  const addContact = async (data) => {
    const tempId = 'tmp_' + Math.random().toString(36).slice(2);
    setResume(r => ({ ...r, contacts: [...r.contacts, { id: tempId, user_id: id, ...data }] }));
    try {
      const created = await saver.run('contacts', () => api.addChild(id, 'contacts', data));
      setResume(r => ({ ...r, contacts: r.contacts.map(c => c.id === tempId ? created : c) }));
    } catch { toast.push('Could not save', 'error'); }
  };
  const updateContact = async (cid, data) => {
    setResume(r => ({ ...r, contacts: r.contacts.map(c => c.id === cid ? { ...c, ...data } : c) }));
    try { await saver.run('contacts', () => api.updateChild(id, 'contacts', cid, data)); }
    catch { toast.push('Could not save', 'error'); }
  };
  const deleteContact = async (cid) => {
    setResume(r => ({ ...r, contacts: r.contacts.filter(c => c.id !== cid) }));
    try { await saver.run('contacts', () => api.deleteChild(id, 'contacts', cid)); }
    catch { toast.push('Could not delete', 'error'); }
  };

  const deleteUser = async () => {
    try {
      await api.deleteUser(id);
      toast.push('Resume deleted', 'success');
      navigate('/');
    } catch { toast.push('Could not delete', 'error'); }
  };

  if (loading || !resume) {
    return (
      <div className="editor-pane" style={{ padding: 28 }}>
        <Skeleton w={220} h={26} style={{ marginBottom: 14 }} />
        <Skeleton w="60%" h={14} style={{ marginBottom: 32 }} />
        {[1, 2, 3].map(i => (
          <div key={i} className="card" style={{ padding: 20, marginBottom: 14 }}>
            <Skeleton w={160} h={16} style={{ marginBottom: 16 }} />
            <Skeleton w="100%" h={10} style={{ marginBottom: 8 }} />
            <Skeleton w="80%" h={10} />
          </div>
        ))}
      </div>
    );
  }

  const fullName = [resume.first_name, resume.last_name].filter(Boolean).join(' ') || 'Untitled resume';
  const overallSaving =
    Object.values(saver.states).find(v => v === 'error') ? 'error' :
    Object.values(saver.states).find(v => v === 'saving') ? 'saving' :
    Object.values(saver.states).find(v => v === 'saved') ? 'saved' : null;

  return (
    <div className="stack" style={{ flex: 1, minHeight: 0 }} data-screen-label="03 Resume Editor">
      {/* Sub-header */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 20,
        background: 'color-mix(in oklab, var(--bg), transparent 8%)',
        backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)',
        borderBottom: '1px solid var(--border)',
      }} className="no-print rk-subheader">
        <div className="row rk-subheader-inner" style={{ padding: '12px 28px', gap: 14, maxWidth: 1500, margin: '0 auto' }}>
          <button
            className="btn"
            data-variant="ghost"
            data-size="sm"
            onClick={() => navigate('/')}
            style={{ marginLeft: -8 }}
          >
            <IconArrowL size={13} />
            <span className="hide-mobile">All resumes</span>
          </button>
          <div style={{ width: 1, height: 18, background: 'var(--border)' }} className="hide-mobile" />
          <Avatar size={28} name={fullName} url={resume.photo_url} />
          <div className="stack" style={{ minWidth: 0, flex: 1 }}>
            <div className="truncate" style={{
              fontFamily: 'var(--font-display)', fontWeight: 600,
              fontSize: 16, letterSpacing: '-0.02em',
            }}>{fullName}</div>
            <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 1, letterSpacing: '0.02em' }}>
              In draft · saved just now
            </div>
          </div>

          <div className="spacer hide-mobile" />

          <SavingDot state={overallSaving} />

          <Button size="sm" leftIcon={<IconEye size={13} />} onClick={() => navigate(`/resumes/${id}/preview`)}>
            <span className="hide-mobile">Preview</span>
          </Button>
          <Button
            size="sm"
            variant="danger"
            leftIcon={<IconTrash size={13} />}
            onClick={(e) => askDeleteConfirm(e, {
              message: 'Delete this resume? All work history, education, skills, and contacts will be lost. This cannot be undone.',
              confirmLabel: 'Delete forever',
              onConfirm: deleteUser,
            })}
          ><span className="hide-mobile">Delete</span></Button>
        </div>
      </div>

      <div className="split">
        <div className="editor-pane">
          <div style={{ maxWidth: 720, margin: '0 auto' }}>
            <ProfileSection
              resume={resume} regions={regions} industries={industries}
              onPatch={optimisticPatch}
              onUserReplace={(u) => setResume(r => ({ ...r, ...u }))}
              savingState={saver.states.profile}
            />
            <PositionsSection
              resume={resume}
              onAdd={addPosition} onUpdate={updatePosition} onDelete={deletePosition}
              savingState={saver.states.positions}
            />
            <EducationSection
              resume={resume}
              onAdd={addEdu} onUpdate={updateEdu} onDelete={deleteEdu}
              savingState={saver.states.education}
            />
            <SkillsSection
              resume={resume}
              onAdd={addSkill} onDelete={deleteSkill}
              onBulkUpdate={bulkUpdateSkills}
              savingState={saver.states.skills}
            />
            <ContactsSection
              resume={resume}
              onAdd={addContact} onUpdate={updateContact} onDelete={deleteContact}
              savingState={saver.states.contacts}
            />

            <div style={{ textAlign: 'center', color: 'var(--faint)', fontSize: 11, padding: '28px 0 8px' }}>
              That's everything. Changes save automatically.
            </div>
          </div>
        </div>

        <div className="preview-pane">
          <div className="row" style={{ justifyContent: 'space-between', marginBottom: 14, maxWidth: 720, margin: '0 auto 14px' }}>
            <div style={{ fontSize: 11, color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              Live preview
            </div>
            <Button size="sm" leftIcon={<IconPrinter size={13} />} onClick={() => printResume()}>Download PDF</Button>
          </div>
          <LivePreview resume={resume} regions={regions} industries={industries} />
        </div>
      </div>

      {deleteConfirmNode}
    </div>
  );
}

Object.assign(window, { ResumeEditorPage });
