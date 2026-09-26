import { useEffect, useState } from 'react';
import { listUsers, createUser, updateUser, deleteUser } from '../services/authService';
import { fetchDigitalIdForUser, updateDigitalIdForUser } from '../../digital-id/services/digitalIdService';
import { useToast } from '../../../shared/components/ToastProvider';
import { useConfirm } from '../../../shared/components/ConfirmProvider';
import FieldTooltip from '../../../shared/components/FieldTooltip';

/**
 * Client-side mirror of the server's user validation rules
 * (server/features/auth/controllers/authController.js), so invalid input
 * is caught before a request is sent. Keep the two in sync.
 */
const ROLES = ['user', 'admin'];
const USERNAME_PATTERN = /^[A-Za-z0-9._-]{3,50}$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 8;

function validateUsername(value) {
  if (!value) return 'Username is required.';
  if (!USERNAME_PATTERN.test(value)) {
    return 'Username must be 3-50 characters: letters, numbers, dots, dashes or underscores.';
  }
  return null;
}

function validateEmail(value) {
  if (!value) return 'Email is required.';
  if (value.length > 191 || !EMAIL_PATTERN.test(value)) {
    return 'Enter a valid email address.';
  }
  return null;
}

/** `required: false` for the edit form, where a blank password means "keep the current one". */
function validatePassword(value, { required = true } = {}) {
  if (!value) {
    return required ? 'Password is required.' : null;
  }
  if (value.length < MIN_PASSWORD_LENGTH) {
    return `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`;
  }
  return null;
}

function validateRole(value) {
  if (value && !ROLES.includes(value)) {
    return 'Role must be "user" or "admin".';
  }
  return null;
}

/** Best-effort match of a server error message to the field it concerns, for the tooltip. */
function fieldForServerError(message = '') {
  const m = message.toLowerCase();
  if (m.includes('username')) return 'username';
  if (m.includes('email')) return 'email';
  if (m.includes('password')) return 'password';
  if (m.includes('role')) return 'role';
  return null;
}

const EMPTY_FORM = { username: '', email: '', password: '', role: 'user', full_name: '' };

export default function AdminDashboard() {
  const { notify } = useToast();
  const confirm = useConfirm();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);

  const [form, setForm] = useState(EMPTY_FORM);
  const [createErrors, setCreateErrors] = useState({});
  const [creating, setCreating] = useState(false);

  const [editId, setEditId] = useState(null);
  const [editForm, setEditForm] = useState(EMPTY_FORM);
  const [editErrors, setEditErrors] = useState({});
  const [savingId, setSavingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const [cardEditId, setCardEditId] = useState(null);
  const [cardForm, setCardForm] = useState({
    organization: '',
    position: '',
    website_link: '',
    contact_website: '',
  });
  const [cardLoading, setCardLoading] = useState(false);
  const [cardSavingId, setCardSavingId] = useState(null);

  useEffect(() => {
    loadUsers();
  }, []);

  async function loadUsers() {
    setLoading(true);
    setLoadError(null);
    try {
      const data = await listUsers();
      setUsers(data);
    } catch (err) {
      setLoadError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function setCreateField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setCreateErrors((prev) => (prev[field] ? { ...prev, [field]: null } : prev));
  }

  function setEditField(field, value) {
    setEditForm((prev) => ({ ...prev, [field]: value }));
    setEditErrors((prev) => (prev[field] ? { ...prev, [field]: null } : prev));
  }

  async function handleCreate(e) {
    e.preventDefault();
    const errors = {
      username: validateUsername(form.username.trim()),
      email: validateEmail(form.email.trim()),
      password: validatePassword(form.password),
      role: validateRole(form.role),
    };
    setCreateErrors(errors);
    if (Object.values(errors).some(Boolean)) {
      notify('Fix the highlighted fields before creating this user.', { type: 'error' });
      return;
    }

    setCreating(true);
    try {
      const created = await createUser(
        form.username.trim(),
        form.email.trim(),
        form.password,
        form.role,
        form.full_name.trim(),
      );
      notify(`User "${created.username}" created.`, { type: 'success' });
      setForm(EMPTY_FORM);
      setCreateErrors({});
      await loadUsers();
    } catch (err) {
      const field = fieldForServerError(err.message);
      if (field) {
        setCreateErrors((prev) => ({ ...prev, [field]: err.message }));
      }
      notify(err.message, { type: 'error' });
    } finally {
      setCreating(false);
    }
  }

  async function handleUpdate(id) {
    const errors = {
      username: editForm.username ? validateUsername(editForm.username.trim()) : null,
      email: editForm.email ? validateEmail(editForm.email.trim()) : null,
      password: validatePassword(editForm.password, { required: false }),
      role: validateRole(editForm.role),
    };
    setEditErrors(errors);
    if (Object.values(errors).some(Boolean)) {
      notify('Fix the highlighted fields before saving.', { type: 'error' });
      return;
    }

    setSavingId(id);
    try {
      const updates = {};
      if (editForm.username) updates.username = editForm.username.trim();
      if (editForm.email) updates.email = editForm.email.trim();
      if (editForm.password) updates.password = editForm.password;
      if (editForm.role) updates.role = editForm.role;
      if (editForm.full_name !== undefined) updates.full_name = editForm.full_name.trim();

      const updated = await updateUser(id, updates);
      notify(`User "${updated.username}" updated.`, { type: 'success' });
      setEditId(null);
      setEditErrors({});
      await loadUsers();
    } catch (err) {
      const field = fieldForServerError(err.message);
      if (field) {
        setEditErrors((prev) => ({ ...prev, [field]: err.message }));
      }
      notify(err.message, { type: 'error' });
    } finally {
      setSavingId(null);
    }
  }

  async function handleDelete(id, username) {
    const confirmed = await confirm({
      title: 'Delete user',
      message: `Delete "${username}"? This cannot be undone.`,
      confirmLabel: 'Delete',
      tone: 'danger',
    });
    if (!confirmed) return;
    setDeletingId(id);
    try {
      await deleteUser(id);
      notify(`User "${username}" deleted.`, { type: 'success' });
      if (editId === id) {
        setEditId(null);
        setEditErrors({});
      }
      await loadUsers();
    } catch (err) {
      notify(err.message, { type: 'error' });
    } finally {
      setDeletingId(null);
    }
  }

  function startEdit(user) {
    setCardEditId(null);
    setEditId(user.id);
    setEditErrors({});
    setEditForm({
      username: user.username,
      email: user.email,
      password: '',
      role: user.role,
      full_name: user.full_name || '',
    });
  }

  function cancelEdit() {
    setEditId(null);
    setEditErrors({});
  }

  function setCardField(field, value) {
    setCardForm((prev) => ({ ...prev, [field]: value }));
  }

  async function startCardEdit(user) {
    setEditId(null);
    setCardEditId(user.id);
    setCardLoading(true);
    try {
      const data = await fetchDigitalIdForUser(user.id);
      setCardForm({
        organization: data.organization ?? '',
        position: data.position ?? '',
        website_link: data.websiteLink ?? '',
        contact_website: data.contact?.website ?? '',
      });
    } catch (err) {
      notify(err.message, { type: 'error' });
      setCardEditId(null);
    } finally {
      setCardLoading(false);
    }
  }

  function cancelCardEdit() {
    setCardEditId(null);
  }

  async function handleCardSave(id) {
    setCardSavingId(id);
    try {
      await updateDigitalIdForUser(id, cardForm);
      notify('Card details updated.', { type: 'success' });
      setCardEditId(null);
    } catch (err) {
      notify(err.message, { type: 'error' });
    } finally {
      setCardSavingId(null);
    }
  }

  return (
    <div className="min-h-svh bg-cream px-6 py-14">
      <div className="mx-auto max-w-3xl">
        <h1 className="font-serif text-3xl font-semibold text-ink">Admin Dashboard</h1>
        <p className="mt-2 text-sm text-ink-soft">Manage users and their access.</p>

        {loadError && <p role="alert" className="mt-4 text-sm text-maroon-light">{loadError}</p>}

        <form onSubmit={handleCreate} className="mt-8 rounded-2xl border border-line bg-paper p-6">
          <h2 className="font-serif text-lg font-semibold text-ink">Create user</h2>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-1">
              <span className="text-sm font-medium text-ink">Username</span>
              <input
                type="text"
                value={form.username}
                onChange={(e) => setCreateField('username', e.target.value)}
                required
                minLength={3}
                maxLength={50}
                pattern="[A-Za-z0-9._\-]+"
                title="Letters, numbers, dots, dashes or underscores"
                autoComplete="off"
                disabled={creating}
                className="rounded-lg border border-line bg-paper px-3 py-2 text-sm text-ink outline-none transition focus:border-gold focus:ring-1 focus:ring-gold disabled:opacity-60"
              />
              <FieldTooltip message={createErrors.username} />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-sm font-medium text-ink">Email</span>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setCreateField('email', e.target.value)}
                required
                disabled={creating}
                className="rounded-lg border border-line bg-paper px-3 py-2 text-sm text-ink outline-none transition focus:border-gold focus:ring-1 focus:ring-gold disabled:opacity-60"
              />
              <FieldTooltip message={createErrors.email} />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-sm font-medium text-ink">Password</span>
              <input
                type="password"
                value={form.password}
                onChange={(e) => setCreateField('password', e.target.value)}
                required
                minLength={8}
                placeholder="At least 8 characters"
                autoComplete="new-password"
                disabled={creating}
                className="rounded-lg border border-line bg-paper px-3 py-2 text-sm text-ink outline-none transition focus:border-gold focus:ring-1 focus:ring-gold disabled:opacity-60"
              />
              <FieldTooltip message={createErrors.password} />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-sm font-medium text-ink">Full name</span>
              <input
                type="text"
                value={form.full_name}
                onChange={(e) => setCreateField('full_name', e.target.value)}
                disabled={creating}
                className="rounded-lg border border-line bg-paper px-3 py-2 text-sm text-ink outline-none transition focus:border-gold focus:ring-1 focus:ring-gold disabled:opacity-60"
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-sm font-medium text-ink">Role</span>
              <select
                value={form.role}
                onChange={(e) => setCreateField('role', e.target.value)}
                disabled={creating}
                className="rounded-lg border border-line bg-paper px-3 py-2 text-sm text-ink outline-none transition focus:border-gold focus:ring-1 focus:ring-gold disabled:opacity-60"
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
              <FieldTooltip message={createErrors.role} />
            </label>
          </div>
          <button
            type="submit"
            disabled={creating}
            className="mt-4 rounded-lg bg-ink px-4 py-2.5 text-sm font-medium text-paper transition hover:bg-ink/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold disabled:cursor-not-allowed disabled:opacity-60"
          >
            {creating ? 'Creating…' : 'Create user'}
          </button>
        </form>

        <div className="mt-8 rounded-2xl border border-line bg-paper">
          <div className="border-b border-line px-6 py-4">
            <h2 className="font-serif text-lg font-semibold text-ink">Users</h2>
          </div>
          {loading ? (
            <p className="px-6 py-4 text-sm text-ink-soft">Loading users...</p>
          ) : (
            <ul className="divide-y divide-line">
              {users.map((u) => {
                const rowBusy = savingId === u.id || deletingId === u.id || cardSavingId === u.id;
                return (
                  <li key={u.id} className="flex flex-col gap-3 px-6 py-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-sm font-medium text-ink">{u.full_name || u.username}</p>
                      <p className="text-xs text-ink-soft">@{u.username} · {u.email} · {u.role}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => startEdit(u)}
                        disabled={rowBusy}
                        className="rounded-lg border border-line px-3 py-1.5 text-xs font-medium text-ink-soft transition hover:border-gold/60 hover:text-ink disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => (cardEditId === u.id ? cancelCardEdit() : startCardEdit(u))}
                        disabled={rowBusy}
                        className="rounded-lg border border-line px-3 py-1.5 text-xs font-medium text-ink-soft transition hover:border-gold/60 hover:text-ink disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {cardEditId === u.id && cardLoading ? 'Loading…' : 'Card details'}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(u.id, u.username)}
                        disabled={rowBusy}
                        className="rounded-lg border border-line px-3 py-1.5 text-xs font-medium text-maroon-light transition hover:bg-maroon-light/10 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {deletingId === u.id ? 'Deleting…' : 'Delete'}
                      </button>
                    </div>
                    {editId === u.id && (
                      <div className="mt-3 w-full rounded-lg border border-line bg-paper p-4 sm:mt-0 sm:w-auto">
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                          <label className="flex flex-col gap-1">
                            <span className="text-xs font-medium text-ink">Username</span>
                            <input
                              type="text"
                              value={editForm.username}
                              onChange={(e) => setEditField('username', e.target.value)}
                              disabled={savingId === u.id}
                              className="rounded-lg border border-line bg-paper px-3 py-2 text-sm text-ink outline-none transition focus:border-gold focus:ring-1 focus:ring-gold disabled:opacity-60"
                            />
                            <FieldTooltip message={editErrors.username} />
                          </label>
                          <label className="flex flex-col gap-1">
                            <span className="text-xs font-medium text-ink">Email</span>
                            <input
                              type="email"
                              value={editForm.email}
                              onChange={(e) => setEditField('email', e.target.value)}
                              disabled={savingId === u.id}
                              className="rounded-lg border border-line bg-paper px-3 py-2 text-sm text-ink outline-none transition focus:border-gold focus:ring-1 focus:ring-gold disabled:opacity-60"
                            />
                            <FieldTooltip message={editErrors.email} />
                          </label>
                          <label className="flex flex-col gap-1">
                            <span className="text-xs font-medium text-ink">Password</span>
                            <input
                              type="password"
                              value={editForm.password}
                              onChange={(e) => setEditField('password', e.target.value)}
                              placeholder="Leave blank to keep"
                              autoComplete="new-password"
                              disabled={savingId === u.id}
                              className="rounded-lg border border-line bg-paper px-3 py-2 text-sm text-ink outline-none transition focus:border-gold focus:ring-1 focus:ring-gold disabled:opacity-60"
                            />
                            <FieldTooltip message={editErrors.password} />
                          </label>
                          <label className="flex flex-col gap-1">
                            <span className="text-xs font-medium text-ink">Role</span>
                            <select
                              value={editForm.role}
                              onChange={(e) => setEditField('role', e.target.value)}
                              disabled={savingId === u.id}
                              className="rounded-lg border border-line bg-paper px-3 py-2 text-sm text-ink outline-none transition focus:border-gold focus:ring-1 focus:ring-gold disabled:opacity-60"
                            >
                              <option value="user">User</option>
                              <option value="admin">Admin</option>
                            </select>
                            <FieldTooltip message={editErrors.role} />
                          </label>
                          <label className="flex flex-col gap-1 sm:col-span-2">
                            <span className="text-xs font-medium text-ink">Full name</span>
                            <input
                              type="text"
                              value={editForm.full_name}
                              onChange={(e) => setEditField('full_name', e.target.value)}
                              disabled={savingId === u.id}
                              className="rounded-lg border border-line bg-paper px-3 py-2 text-sm text-ink outline-none transition focus:border-gold focus:ring-1 focus:ring-gold disabled:opacity-60"
                            />
                          </label>
                        </div>
                        <div className="mt-3 flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleUpdate(u.id)}
                            disabled={savingId === u.id}
                            className="rounded-lg bg-ink px-3 py-1.5 text-xs font-medium text-paper transition hover:bg-ink/90 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {savingId === u.id ? 'Saving…' : 'Save'}
                          </button>
                          <button
                            type="button"
                            onClick={cancelEdit}
                            disabled={savingId === u.id}
                            className="rounded-lg border border-line px-3 py-1.5 text-xs font-medium text-ink-soft transition hover:text-ink disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}

                    {cardEditId === u.id && (
                      <div className="mt-3 w-full rounded-lg border border-line bg-paper p-4 sm:mt-0 sm:w-auto">
                        <p className="mb-3 text-xs text-ink-soft">
                          Company name, position, and the two card links — hidden from this person's own edit
                          form, editable here only.
                        </p>
                        {cardLoading ? (
                          <p className="text-sm text-ink-soft">Loading…</p>
                        ) : (
                          <>
                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                              <label className="flex flex-col gap-1">
                                <span className="text-xs font-medium text-ink">Company name</span>
                                <input
                                  type="text"
                                  value={cardForm.organization}
                                  onChange={(e) => setCardField('organization', e.target.value)}
                                  disabled={cardSavingId === u.id}
                                  className="rounded-lg border border-line bg-paper px-3 py-2 text-sm text-ink outline-none transition focus:border-gold focus:ring-1 focus:ring-gold disabled:opacity-60"
                                />
                              </label>
                              <label className="flex flex-col gap-1">
                                <span className="text-xs font-medium text-ink">Position</span>
                                <input
                                  type="text"
                                  value={cardForm.position}
                                  onChange={(e) => setCardField('position', e.target.value)}
                                  disabled={cardSavingId === u.id}
                                  className="rounded-lg border border-line bg-paper px-3 py-2 text-sm text-ink outline-none transition focus:border-gold focus:ring-1 focus:ring-gold disabled:opacity-60"
                                />
                              </label>
                              <label className="flex flex-col gap-1 sm:col-span-2">
                                <span className="text-xs font-medium text-ink">
                                  Website link (QR code on the front)
                                </span>
                                <input
                                  type="url"
                                  placeholder="https://www.example.com"
                                  value={cardForm.website_link}
                                  onChange={(e) => setCardField('website_link', e.target.value)}
                                  disabled={cardSavingId === u.id}
                                  className="rounded-lg border border-line bg-paper px-3 py-2 text-sm text-ink outline-none transition focus:border-gold focus:ring-1 focus:ring-gold disabled:opacity-60"
                                />
                              </label>
                              <label className="flex flex-col gap-1 sm:col-span-2">
                                <span className="text-xs font-medium text-ink">Link (shown on the card)</span>
                                <input
                                  type="text"
                                  value={cardForm.contact_website}
                                  onChange={(e) => setCardField('contact_website', e.target.value)}
                                  disabled={cardSavingId === u.id}
                                  className="rounded-lg border border-line bg-paper px-3 py-2 text-sm text-ink outline-none transition focus:border-gold focus:ring-1 focus:ring-gold disabled:opacity-60"
                                />
                              </label>
                            </div>
                            <div className="mt-3 flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => handleCardSave(u.id)}
                                disabled={cardSavingId === u.id}
                                className="rounded-lg bg-ink px-3 py-1.5 text-xs font-medium text-paper transition hover:bg-ink/90 disabled:cursor-not-allowed disabled:opacity-60"
                              >
                                {cardSavingId === u.id ? 'Saving…' : 'Save'}
                              </button>
                              <button
                                type="button"
                                onClick={cancelCardEdit}
                                disabled={cardSavingId === u.id}
                                className="rounded-lg border border-line px-3 py-1.5 text-xs font-medium text-ink-soft transition hover:text-ink disabled:cursor-not-allowed disabled:opacity-50"
                              >
                                Cancel
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}