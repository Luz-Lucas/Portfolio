'use client';

import { useState, useTransition } from 'react';
import type { ReactNode } from 'react';
import type { ExperienceItem, SiteContent, SkillGroup } from '@/content/types';
import type { ContentKey } from '@/lib/content';
import { moveItem, without } from '@/lib/list';
import { saveContent, type ActionResult } from './actions';
import { ImageUpload } from './ImageUpload';

function useSave(key: ContentKey) {
  const [pending, start] = useTransition();
  const [result, setResult] = useState<ActionResult | null>(null);
  const save = (value: unknown) => start(async () => setResult(await saveContent(key, value)));
  const status = pending ? (
    <span className="admin-status">Salvando...</span>
  ) : result ? (
    <span className={result.ok ? 'admin-ok' : 'admin-error'}>{result.ok ? 'Salvo' : result.error}</span>
  ) : null;
  return { save, pending, status };
}

export function Card({ title, children, onSave, pending, status }: {
  title: string;
  children: ReactNode;
  onSave: () => void;
  pending: boolean;
  status: ReactNode;
}) {
  return (
    <form
      className="admin-card"
      onSubmit={(e) => {
        e.preventDefault();
        onSave();
      }}
    >
      <h2>{title}</h2>
      {children}
      <div className="admin-actions">
        <button type="submit" className="admin-primary" disabled={pending}>
          Salvar
        </button>
        {status}
      </div>
    </form>
  );
}

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="admin-field">
      <span>{label}</span>
      {children}
    </label>
  );
}

/** Botões ↑ ↓ ✕ para listas editáveis. */
export function RowControls({ index, length, onMove, onRemove }: {
  index: number;
  length: number;
  onMove: (from: number, to: number) => void;
  onRemove: (i: number) => void;
}) {
  return (
    <span className="admin-row-controls">
      <button type="button" aria-label="Subir" disabled={index === 0} onClick={() => onMove(index, index - 1)}>
        ↑
      </button>
      <button type="button" aria-label="Descer" disabled={index === length - 1} onClick={() => onMove(index, index + 1)}>
        ↓
      </button>
      <button type="button" aria-label="Remover" onClick={() => onRemove(index)}>
        ✕
      </button>
    </span>
  );
}


export function ReadmeForm({ initial }: { initial: SiteContent['readme'] }) {
  const [body, setBody] = useState(initial.body);
  const s = useSave('readme');
  return (
    <Card title="Leia-me.txt" onSave={() => s.save({ body })} {...s}>
      <Field label="Texto (aceita **negrito** e [links](https://...))">
        <textarea rows={6} value={body} onChange={(e) => setBody(e.target.value)} />
      </Field>
    </Card>
  );
}

export function AboutForm({ initial }: { initial: SiteContent['about'] }) {
  const [about, setAbout] = useState(initial);
  const s = useSave('about');
  const set = (k: keyof typeof about) => (e: { target: { value: string } }) => setAbout({ ...about, [k]: e.target.value });
  return (
    <Card title="Sobre mim" onSave={() => s.save({ ...about, photoUrl: about.photoUrl || null })} {...s}>
      <div className="admin-grid">
        <Field label="Nome">
          <input value={about.name} onChange={set('name')} />
        </Field>
        <Field label="Cargo">
          <input value={about.role} onChange={set('role')} />
        </Field>
        <Field label="Localização">
          <input value={about.location} onChange={set('location')} />
        </Field>
        <Field label="Disponibilidade">
          <input value={about.availability} onChange={set('availability')} />
        </Field>
      </div>
      <Field label="URL da foto">
        <input value={about.photoUrl ?? ''} onChange={set('photoUrl')} placeholder="https://..." />
      </Field>
      <ImageUpload purpose="photo" onUploaded={(url) => setAbout((a) => ({ ...a, photoUrl: url }))} />
      <Field label="Bio">
        <textarea rows={6} value={about.bio} onChange={set('bio')} />
      </Field>
    </Card>
  );
}

export function ContactForm({ initial }: { initial: SiteContent['contact'] }) {
  const [c, setC] = useState(initial);
  const s = useSave('contact');
  const set = (k: keyof typeof c) => (e: { target: { value: string } }) => setC({ ...c, [k]: e.target.value });
  return (
    <Card title="Contato e links" onSave={() => s.save(c)} {...s}>
      <div className="admin-grid">
        <Field label="E-mail">
          <input type="email" value={c.email} onChange={set('email')} />
        </Field>
        <Field label="LinkedIn">
          <input value={c.linkedin} onChange={set('linkedin')} />
        </Field>
        <Field label="GitHub">
          <input value={c.github} onChange={set('github')} />
        </Field>
      </div>
    </Card>
  );
}

export function SkillsForm({ initial }: { initial: SkillGroup[] }) {
  const [groups, setGroups] = useState(initial);
  const s = useSave('skills');
  const setGroup = (gi: number, g: SkillGroup) => setGroups(groups.map((x, i) => (i === gi ? g : x)));

  return (
    <Card title="Skills" onSave={() => s.save(groups)} {...s}>
      {groups.map((g, gi) => (
        <fieldset key={gi} className="admin-group">
          <legend>
            <input aria-label="Nome do grupo" value={g.group} onChange={(e) => setGroup(gi, { ...g, group: e.target.value })} />
            <RowControls
              index={gi}
              length={groups.length}
              onMove={(a, b) => setGroups(moveItem(groups, a, b))}
              onRemove={(i) => setGroups(without(groups, i))}
            />
          </legend>
          {g.items.map((item, ii) => {
            const setItem = (patch: Partial<typeof item>) =>
              setGroup(gi, { ...g, items: g.items.map((x, j) => (j === ii ? { ...x, ...patch } : x)) });
            return (
              <div key={ii} className="admin-row">
                <input aria-label="Skill" value={item.name} onChange={(e) => setItem({ name: e.target.value })} />
                <select
                  aria-label="Nível"
                  value={item.level}
                  onChange={(e) => setItem({ level: Number(e.target.value) as typeof item.level })}
                >
                  {[1, 2, 3, 4, 5].map((n) => (
                    <option key={n} value={n}>
                      Nível {n}
                    </option>
                  ))}
                </select>
                <input
                  aria-label="Anos"
                  type="number"
                  min={0}
                  placeholder="anos"
                  value={item.years ?? ''}
                  onChange={(e) => setItem({ years: e.target.value === '' ? undefined : Number(e.target.value) })}
                />
                <RowControls
                  index={ii}
                  length={g.items.length}
                  onMove={(a, b) => setGroup(gi, { ...g, items: moveItem(g.items, a, b) })}
                  onRemove={(i) => setGroup(gi, { ...g, items: without(g.items, i) })}
                />
              </div>
            );
          })}
          <button type="button" onClick={() => setGroup(gi, { ...g, items: [...g.items, { name: '', level: 3 }] })}>
            + skill
          </button>
        </fieldset>
      ))}
      <button type="button" onClick={() => setGroups([...groups, { group: 'Novo grupo', items: [] }])}>
        + grupo
      </button>
    </Card>
  );
}

const EMPTY_EXPERIENCE: ExperienceItem = { kind: 'job', title: '', org: '', start: '', end: null, description: '' };

export function ExperienceForm({ initial }: { initial: ExperienceItem[] }) {
  const [items, setItems] = useState(initial);
  const s = useSave('experience');
  const setItem = (i: number, patch: Partial<ExperienceItem>) =>
    setItems(items.map((x, j) => (j === i ? { ...x, ...patch } : x)));

  return (
    <Card title="Experiência e formação" onSave={() => s.save(items)} {...s}>
      {items.map((e, i) => (
        <fieldset key={i} className="admin-group">
          <legend>
            <select aria-label="Tipo" value={e.kind} onChange={(ev) => setItem(i, { kind: ev.target.value as ExperienceItem['kind'] })}>
              <option value="job">Emprego</option>
              <option value="education">Formação</option>
            </select>
            <RowControls
              index={i}
              length={items.length}
              onMove={(a, b) => setItems(moveItem(items, a, b))}
              onRemove={(j) => setItems(without(items, j))}
            />
          </legend>
          <div className="admin-grid">
            <Field label="Título">
              <input value={e.title} onChange={(ev) => setItem(i, { title: ev.target.value })} />
            </Field>
            <Field label="Organização">
              <input value={e.org} onChange={(ev) => setItem(i, { org: ev.target.value })} />
            </Field>
            <Field label="Início (AAAA-MM)">
              <input value={e.start} onChange={(ev) => setItem(i, { start: ev.target.value })} placeholder="2023-01" />
            </Field>
            <Field label="Fim (vazio = atual)">
              <input
                value={e.end ?? ''}
                onChange={(ev) => setItem(i, { end: ev.target.value || null })}
                placeholder="2024-06"
              />
            </Field>
          </div>
          <Field label="Descrição">
            <textarea rows={3} value={e.description} onChange={(ev) => setItem(i, { description: ev.target.value })} />
          </Field>
        </fieldset>
      ))}
      <button type="button" onClick={() => setItems([...items, EMPTY_EXPERIENCE])}>
        + item
      </button>
    </Card>
  );
}
