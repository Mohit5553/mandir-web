import React, { useState, useEffect } from 'react';
import { UserPlus, Trash2, Edit2, X } from 'lucide-react';
import { api } from '../../services/api';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'Volunteer' });
  const [editingId, setEditingId] = useState(null);

  const fetchUsers = () => {
    setLoading(true);
    api.getUsers()
      .then(data => setUsers(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.updateUser(editingId, { name: form.name, role: form.role });
        setEditingId(null);
        alert('User updated successfully');
      } else {
        await api.register(form);
        alert('User registered successfully');
      }
      setForm({ name: '', email: '', password: '', role: 'Volunteer' });
      fetchUsers();
    } catch (error) {
      alert('Action failed: ' + error.message);
    }
  };

  const handleEdit = (u) => {
    setEditingId(u._id);
    setForm({ name: u.name, email: u.email, password: '', role: u.role });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      await api.deleteUser(id);
      fetchUsers();
    } catch (error) {
      alert('Delete failed');
    }
  };

  return (
    <div>
      <h1 style={{ marginBottom: '2rem' }}>User Management</h1>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) 2fr', gap: '2rem' }}>
        <div className="content-card" style={{ height: 'fit-content', position: 'sticky', top: '100px' }}>
          <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {editingId ? <Edit2 size={20} /> : <UserPlus size={20} />}
            {editingId ? 'Update User Role' : 'Register New User'}
          </h3>
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem' }}>Full Name</label>
              <input type="text" required className="form-input" style={{ width: '100%' }} value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
            </div>
            
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem' }}>Email Address</label>
              <input type="email" required disabled={!!editingId} className="form-input" style={{ width: '100%', opacity: editingId ? 0.6 : 1 }} value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
            </div>

            {!editingId && (
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem' }}>Password</label>
                <input type="password" required className="form-input" style={{ width: '100%' }} value={form.password} onChange={e => setForm({...form, password: e.target.value})} />
              </div>
            )}

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem' }}>Assign Role</label>
              <select className="form-input" style={{ width: '100%' }} value={form.role} onChange={e => setForm({...form, role: e.target.value})}>
                <option value="Admin">Admin</option>
                <option value="Trustee">Trustee</option>
                <option value="Volunteer">Volunteer</option>
              </select>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button type="submit" className="btn btn-primary" style={{ flexGrow: 1 }}>{editingId ? 'Update User' : 'Register User'}</button>
              {editingId && (
                <button type="button" onClick={() => { setEditingId(null); setForm({ name: '', email: '', password: '', role: 'Volunteer' }); }} className="btn btn-outline" style={{ padding: '0 1rem' }}>
                  <X size={20} />
                </button>
              )}
            </div>
          </form>
        </div>

        <div className="content-card">
          <h3 style={{ marginBottom: '1.5rem' }}>All Team Members ({users.length})</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ textAlign: 'left', borderBottom: '2px solid #f0f0ff', color: '#64748b' }}>
                <th style={{ padding: '1rem' }}>User Info</th>
                <th style={{ padding: '1rem' }}>Role</th>
                <th style={{ padding: '1rem' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u._id} style={{ borderBottom: '1px solid #f8fafc' }}>
                  <td style={{ padding: '1rem' }}>
                    <p style={{ fontWeight: 700, margin: 0, fontSize: '1rem' }}>{u.name}</p>
                    <p style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{u.email}</p>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{ 
                      padding: '0.25rem 0.75rem', 
                      borderRadius: '100px', 
                      fontSize: '0.75rem', 
                      fontWeight: 600,
                      background: u.role === 'Admin' ? '#fef2f2' : u.role === 'Trustee' ? '#f0f9ff' : '#f8fafc',
                      color: u.role === 'Admin' ? '#991b1b' : u.role === 'Trustee' ? '#075985' : '#475569',
                      border: '1px solid transparent'
                    }}>{u.role}</span>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                      <button onClick={() => handleEdit(u)} className="btn-icon" title="Edit User"><Edit2 size={16} /></button>
                      <button onClick={() => handleDelete(u._id)} className="btn-icon" style={{ borderColor: '#fee2e2' }} title="Delete User"><Trash2 size={16} color="#ef4444" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {loading && <p style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>Loading users...</p>}
        </div>
      </div>
    </div>
  );
};

export default AdminUsers;
