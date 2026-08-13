import { useEffect, useState } from 'react';
import { getUsers, updateUserRole } from '../api/users';
import type { AppUser, Role } from '../types';

export function UsersPage() {
  const [users, setUsers] = useState<AppUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadUsers();
  }, []);

  async function loadUsers() {
    try {
      const data = await getUsers();
      setUsers(data);
    } catch {
      setError('Could not load users.');
    } finally {
      setLoading(false);
    }
  }

  async function handleRoleChange(userId: string, role: Role) {
    try {
      await updateUserRole(userId, role);
      await loadUsers();
    } catch {
      setError('Could not update role.');
    }
  }

  if (loading) return <div className="text-gray-400">Loading users…</div>;

  return (
    <div>
      <h1 className="text-xl font-semibold mb-4">Users</h1>
      {error && <p className="text-violation-text bg-violation-bg text-sm rounded-lg px-3 py-2 mb-3 w-fit">{error}</p>}

      <div className="bg-graphite-card rounded-xl overflow-hidden">
        <div className="grid grid-cols-4 gap-2 px-4 py-2 text-xs text-gray-400">
          <span>Name</span>
          <span>Email</span>
          <span>Role</span>
          <span></span>
        </div>

        {users.map((u) => (
          <div key={u.id} className="grid grid-cols-4 gap-2 px-4 py-3 text-sm border-t border-graphite-border items-center">
            <span>{u.fullName}</span>
            <span className="text-gray-400">{u.email}</span>
            <RoleBadge role={u.roles[0]} />
            <select
              value={u.roles[0]}
              onChange={(e) => handleRoleChange(u.id, e.target.value as Role)}
              className="bg-graphite-input border border-graphite-border rounded-lg px-2 py-1 text-xs w-fit"
            >
              <option value="Driver">Driver</option>
              <option value="Dispatcher">Dispatcher</option>
              <option value="Admin">Admin</option>
            </select>
          </div>
        ))}
      </div>
    </div>
  );
}

function RoleBadge({ role }: { role: Role }) {
  const styles: Record<Role, string> = {
    Admin: 'bg-raspberry/20 text-raspberry',
    Dispatcher: 'bg-info/20 text-info',
    Driver: 'bg-compliant-bg text-compliant-text',
  };
  return <span className={`text-xs px-2 py-0.5 rounded-md w-fit ${styles[role]}`}>{role}</span>;
}