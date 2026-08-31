import { useState, useEffect } from 'react';
import { UserPlus, Trash2, Edit2, X, ShieldCheck, Plus, Save, Users } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { api } from '../../services/api';
import { hasPermission } from '../../hooks/usePermission';

/* ─── RBAC Badge config ──────────────────────────────────────── */
const BADGE = {
  view:   { bg: '#f0fdf4', color: '#15803d', border: '#bbf7d0' },
  create: { bg: '#eff6ff', color: '#1d4ed8', border: '#bfdbfe' },
  update: { bg: '#fff7ed', color: '#c2410c', border: '#fed7aa' },
  delete: { bg: '#fef2f2', color: '#991b1b', border: '#fecaca' },
};
const ACTIONS = ['view', 'create', 'update', 'delete'];

const ALL_MENUS = [
  'डैशबोर्ड', 'उपयोगकर्ता', 'भूमिकाएं', 'ट्रस्ट प्रबंधन', 'दान प्रबंधन',
  'घटनाएँ', 'समाचार', 'गैलरी', 'होमपेज बैनर', 'वेबसाइट सामग्री',
  'स्वयंसेवक अनुरोध', 'लाइव स्ट्रीम', 'सूचनाएँ', 'संपर्क संदेश', 'रिपोर्ट्स'
];

const emptyRole = () => ({
  name: '',
  permissions: ALL_MENUS.map(menu => ({ menu, view: false, create: false, update: false, delete: false }))
});

/* ─── Role badge pill ────────────────────────────────────────── */
const rolePill = (roleName) => {
  const presets = {
    'Super Admin': { label: 'मुख्य प्रशासक (Super Admin)', bg: '#fff7ed', color: '#c2410c', border: '#fed7aa' },
    'Chief Trustee': { label: 'मुख्य ट्रस्टी (Chief Trustee)', bg: '#f0fdf4', color: '#15803d', border: '#bbf7d0' },
  };
  const p = presets[roleName] || { label: roleName, bg: '#f1f5f9', color: '#475569', border: '#e2e8f0' };
  return (
    <span style={{
      padding: '0.25rem 0.85rem', borderRadius: '999px', fontSize: '0.75rem',
      fontWeight: 700, background: p.bg, color: p.color, border: `1px solid ${p.border}`,
      whiteSpace: 'nowrap'
    }}>{p.label}</span>
  );
};

/* ═══════════════════════════════════════════════════════════════
   COMBINED USERS + ROLES PAGE
   ═══════════════════════════════════════════════════════════════ */
const AdminUsersRoles = () => {
  const loggedInUser = JSON.parse(localStorage.getItem('adminUser') || '{}');
  const isSuperAdmin = loggedInUser.role === 'Super Admin';

  const navigate = useNavigate();
  const location = useLocation();
  const path = location.pathname.toLowerCase();

  /* ── Permission checks ──────────────────────────────────────── */
  const canViewUsers = hasPermission('Users', 'view');
  const canCreateUsers = hasPermission('Users', 'create');
  const canUpdateUsers = hasPermission('Users', 'update');
  const canDeleteUsers = hasPermission('Users', 'delete');

  const canViewRoles = hasPermission('Roles', 'view');
  const canCreateRoles = hasPermission('Roles', 'create');
  const canUpdateRoles = hasPermission('Roles', 'update');
  const canDeleteRoles = hasPermission('Roles', 'delete');

  /* ── Tab state ──────────────────────────────────────────────── */
  const [activeTab, setActiveTab] = useState(() => {
    if (path.includes('roles') && canViewRoles) return 'roles';
    if (canViewUsers) return 'users';
    if (canViewRoles) return 'roles';
    return '';
  });

  useEffect(() => {
    if (path.includes('roles') && canViewRoles) {
      setActiveTab('roles');
    } else if (path.includes('users') && canViewUsers) {
      setActiveTab('users');
    }
  }, [path, canViewUsers, canViewRoles]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    navigate(`/admin/${tab}`);
  };

  /* ── Users state ─────────────────────────────────────────────── */
  const [users, setUsers]           = useState([]);
  const [customRoles, setCustomRoles] = useState([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [userForm, setUserForm]     = useState({ name: '', email: '', password: '', role: 'Super Admin' });
  const [editingUserId, setEditingUserId] = useState(null);
  const [userMsg, setUserMsg]       = useState('');

  /* ── Roles state ─────────────────────────────────────────────── */
  const [roles, setRoles]           = useState([]);
  const [rolesLoading, setRolesLoading] = useState(true);
  const [showRoleForm, setShowRoleForm] = useState(false);
  const [editingRoleId, setEditingRoleId] = useState(null);
  const [roleForm, setRoleForm]     = useState(emptyRole());
  const [saving, setSaving]         = useState(false);
  const [roleMsg, setRoleMsg]       = useState('');

  /* ── Fetch helpers ───────────────────────────────────────────── */
  const fetchUsers = () => {
    setUsersLoading(true);
    api.getUsers()
      .then(d => setUsers(Array.isArray(d) ? d : []))
      .finally(() => setUsersLoading(false));
  };
  const fetchRoles = () => {
    setRolesLoading(true);
    api.getRoles()
      .then(d => { const r = Array.isArray(d) ? d : []; setRoles(r); setCustomRoles(r); })
      .finally(() => setRolesLoading(false));
  };

  useEffect(() => {
    if (canViewUsers) fetchUsers();
    if (canViewRoles) fetchRoles();
  }, [canViewUsers, canViewRoles]);

  /* ─────────────── USERS HANDLERS ────────────────────────────── */
  const handleUserSubmit = async (e) => {
    e.preventDefault();
    setUserMsg('');
    try {
      if (editingUserId) {
        const payload = { name: userForm.name, role: userForm.role, requesterId: loggedInUser._id };
        if (userForm.password.trim()) payload.password = userForm.password;
        await api.updateUser(editingUserId, payload);
        setEditingUserId(null);
        setUserMsg('✅ User updated successfully.');
      } else {
        await api.register(userForm);
        setUserMsg('✅ User registered successfully.');
      }
      setUserForm({ name: '', email: '', password: '', role: 'Super Admin' });
      fetchUsers();
    } catch (err) {
      setUserMsg('❌ Action failed: ' + err.message);
    }
  };

  const handleUserEdit = (u) => {
    setEditingUserId(u._id);
    setUserForm({ name: u.name, email: u.email, password: '', role: u.role });
  };

  const handleUserDelete = async (id) => {
    if (!window.confirm('Delete this user?')) return;
    await api.deleteUser(id);
    fetchUsers();
  };

  /* ─────────────── ROLES HANDLERS ────────────────────────────── */
  const openCreateRole = () => {
    setRoleForm(emptyRole());
    setEditingRoleId(null);
    setRoleMsg('');
    setShowRoleForm(true);
  };

  const openEditRole = (role) => {
    const merged = ALL_MENUS.map(menu => {
      const p = role.permissions.find(x => x.menu === menu);
      return { menu, view: p?.view||false, create: p?.create||false, update: p?.update||false, delete: p?.delete||false };
    });
    setRoleForm({ name: role.name, permissions: merged });
    setEditingRoleId(role._id);
    setRoleMsg('');
    setShowRoleForm(true);
  };

  const handlePermChange = (menu, action, val) => {
    setRoleForm(prev => ({
      ...prev,
      permissions: prev.permissions.map(p => p.menu === menu ? { ...p, [action]: val } : p)
    }));
  };

  const toggleAllForMenu = (menu, checked) => {
    setRoleForm(prev => ({
      ...prev,
      permissions: prev.permissions.map(p =>
        p.menu === menu ? { ...p, view: checked, create: checked, update: checked, delete: checked } : p
      )
    }));
  };

  const handleRoleSubmit = async (e) => {
    e.preventDefault();
    if (!roleForm.name.trim()) { setRoleMsg('भूमिका का नाम आवश्यक है।'); return; }
    setSaving(true);
    const res = editingRoleId
      ? await api.updateRole(editingRoleId, roleForm)
      : await api.createRole(roleForm);
    setSaving(false);
    if (res._id || res.name) {
      setRoleMsg(editingRoleId ? '✅ भूमिका अद्यतन हो गई!' : '✅ नई भूमिका बन गई!');
      setShowRoleForm(false);
      setEditingRoleId(null);
      fetchRoles();
    } else {
      setRoleMsg(res.message || '❌ सहेजने में विफल।');
    }
  };

  const handleRoleDelete = async (id, name) => {
    if (!window.confirm(`क्या आप निश्चित रूप से भूमिका "${name}" को हटाना चाहते हैं?`)) return;
    await api.deleteRole(id);
    fetchRoles();
  };

  const permSummary = (role) => {
    let v=0,c=0,u=0,d=0;
    (role.permissions || []).forEach(p => { if(p.view)v++; if(p.create)c++; if(p.update)u++; if(p.delete)d++; });
    return {v,c,u,d};
  };

  /* ─── SHARED STYLES ─────────────────────────────────────────── */
  const tabStyle = (active) => ({
    padding: '0.6rem 1.6rem',
    borderRadius: '10px',
    border: 'none',
    cursor: 'pointer',
    fontWeight: 700,
    fontSize: '0.92rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    transition: 'all 0.18s',
    background: active ? 'var(--color-primary)' : 'transparent',
    color: active ? '#fff' : '#64748b',
    boxShadow: active ? '0 4px 14px rgba(255,107,0,0.25)' : 'none',
  });

  /* ══════════════════════ RENDER ══════════════════════════════ */
  return (
    <div>
      {/* ── Page Title + Tab Switcher ─────────────────────────── */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ marginBottom: '1.25rem' }}>टीम सदस्य एवं अनुमति नियंत्रण (RBAC)</h1>
        <div style={{
          display: 'inline-flex',
          background: '#f1f5f9',
          borderRadius: '14px',
          padding: '5px',
          gap: '4px',
        }}>
          {canViewUsers && (
            <button style={tabStyle(activeTab === 'users')} onClick={() => handleTabChange('users')}>
              <Users size={17} /> टीम सदस्य (Users)
            </button>
          )}
          {canViewRoles && (
            <button style={tabStyle(activeTab === 'roles')} onClick={() => handleTabChange('roles')}>
              <ShieldCheck size={17} /> भूमिकाएं एवं अनुमतियां (Roles)
            </button>
          )}
        </div>
      </div>

      {/* ══════════════════ USERS TAB ══════════════════════════ */}
      {activeTab === 'users' && canViewUsers && (
        <div>
          {userMsg && (
            <div style={{
              marginBottom: '1.25rem', padding: '0.8rem 1.2rem', borderRadius: '10px',
              background: userMsg.includes('✅') ? '#f0fdf4' : '#fef2f2',
              color:      userMsg.includes('✅') ? '#15803d'  : '#991b1b',
              border: `1px solid ${userMsg.includes('✅') ? '#bbf7d0' : '#fecaca'}`,
              fontWeight: 600,
            }}>{userMsg}</div>
          )}
          <div style={{
            display: 'grid',
            gridTemplateColumns: (canCreateUsers || (editingUserId && canUpdateUsers)) ? 'minmax(300px,1fr) 2fr' : '1fr',
            gap: '2rem'
          }}>
            {/* Register / Edit form */}
            {(canCreateUsers || (editingUserId && canUpdateUsers)) && (
              <div className="content-card" style={{ height: 'fit-content', position: 'sticky', top: '100px' }}>
                <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  {editingUserId ? <Edit2 size={20} color="var(--color-primary)" /> : <UserPlus size={20} />}
                  {editingUserId ? 'सदस्य विवरण अद्यतन करें' : 'नया टीम सदस्य जोड़ें'}
                </h3>
                <form onSubmit={handleUserSubmit}>
                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display:'block', marginBottom:'0.5rem', fontWeight:600 }}>पूरा नाम *</label>
                    <input type="text" required className="form-input" style={{ width:'100%' }}
                      placeholder="नाम दर्ज करें"
                      value={userForm.name} onChange={e => setUserForm({...userForm, name: e.target.value})} />
                  </div>
                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display:'block', marginBottom:'0.5rem', fontWeight:600 }}>ईमेल पता *</label>
                    <input type="email" required disabled={!!editingUserId} className="form-input"
                      placeholder="ईमेल दर्ज करें"
                      style={{ width:'100%', opacity: editingUserId ? 0.6 : 1 }}
                      value={userForm.email} onChange={e => setUserForm({...userForm, email: e.target.value})} />
                  </div>
                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display:'block', marginBottom:'0.5rem', fontWeight:600 }}>
                      {editingUserId ? 'नया पासवर्ड (ऐच्छिक)' : 'पासवर्ड *'}
                    </label>
                    {editingUserId && !isSuperAdmin && editingUserId !== loggedInUser._id ? (
                      <div style={{ padding:'0.75rem', border:'1px solid #fee2e2', borderRadius:'8px', background:'#fef2f2', color:'#991b1b', fontSize:'0.85rem' }}>
                        केवल मुख्य प्रशासक ही पासवर्ड रीसेट कर सकते हैं।
                      </div>
                    ) : (
                      <input type="password" required={!editingUserId} className="form-input" style={{ width:'100%' }}
                        value={userForm.password} onChange={e => setUserForm({...userForm, password: e.target.value})}
                        placeholder={editingUserId ? 'अपरिवर्तित रखने हेतु खाली छोड़ें' : 'पासवर्ड दर्ज करें'} />
                    )}
                  </div>
                  <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ display:'block', marginBottom:'0.5rem', fontWeight:600 }}>भूमिका आवंटित करें</label>
                    <select className="form-input" style={{ width:'100%' }}
                      value={userForm.role} onChange={e => setUserForm({...userForm, role: e.target.value})}>
                      <option value="Super Admin">मुख्य प्रशासक (Super Admin)</option>
                      {customRoles.map(r => <option key={r._id} value={r.name}>{r.name}</option>)}
                    </select>
                  </div>
                  <div style={{ display:'flex', gap:'0.5rem' }}>
                    <button type="submit" className="btn btn-primary" style={{ flexGrow:1 }}>
                      {editingUserId ? 'अद्यतन करें' : 'सदस्य जोड़ें'}
                    </button>
                    {editingUserId && (
                      <button type="button" className="btn btn-outline" style={{ padding:'0 1rem' }}
                        onClick={() => { setEditingUserId(null); setUserForm({ name:'', email:'', password:'', role:'Super Admin' }); }}>
                        <X size={18} />
                      </button>
                    )}
                  </div>
                </form>
              </div>
            )}

            {/* Team members table */}
            <div className="content-card table-scroll">
              <h3 style={{ marginBottom:'1.5rem', display:'flex', alignItems:'center', gap:'0.5rem' }}>
                <Users size={18} color="var(--color-primary)" /> सभी मंदिर टीम सदस्य ({users.length})
              </h3>
              {usersLoading ? (
                <p style={{ textAlign:'center', color:'#94a3b8', padding:'2rem' }}>सदस्य सूची लोड हो रही है...</p>
              ) : (
                <table style={{ width:'100%', borderCollapse:'collapse' }}>
                  <thead>
                    <tr style={{ textAlign:'left', borderBottom:'2px solid #f0f0f0', color:'#64748b', fontSize:'0.82rem' }}>
                      <th style={{ padding:'0.75rem 1rem' }}>सदस्य विवरण</th>
                      <th style={{ padding:'0.75rem 1rem' }}>भूमिका</th>
                      {(canUpdateUsers || canDeleteUsers) && <th style={{ padding:'0.75rem 1rem' }}>कार्रवाई</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(u => (
                      <tr key={u._id} style={{ borderBottom:'1px solid #f8fafc' }}>
                        <td style={{ padding:'0.9rem 1rem' }}>
                          <div style={{ fontWeight:700, fontSize:'0.95rem' }}>{u.name}</div>
                          <div style={{ fontSize:'0.8rem', color:'#94a3b8' }}>{u.email}</div>
                        </td>
                        <td style={{ padding:'0.9rem 1rem' }}>{rolePill(u.role)}</td>
                        {(canUpdateUsers || canDeleteUsers) && (
                          <td style={{ padding:'0.9rem 1rem' }}>
                            <div style={{ display:'flex', gap:'0.5rem' }}>
                              {canUpdateUsers && (
                                <button onClick={() => handleUserEdit(u)} className="btn-icon" title="संपादित करें"><Edit2 size={15} /></button>
                              )}
                              {canDeleteUsers && (
                                <button onClick={() => handleUserDelete(u._id)} className="btn-icon" style={{ borderColor:'#fee2e2' }} title="हटाएं">
                                  <Trash2 size={15} color="#ef4444" />
                                </button>
                              )}
                            </div>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════ ROLES TAB ══════════════════════════ */}
      {activeTab === 'roles' && canViewRoles && (
        <div>
          {/* Toolbar */}
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.5rem', flexWrap:'wrap', gap:'1rem' }}>
            <p style={{ color:'#64748b', margin:0, fontSize:'0.9rem' }}>
              नई भूमिकाएं बनाएं और प्रत्येक सेक्शन के लिए <strong>देखें (View)</strong>, <strong>जोड़ें (Create)</strong>, <strong>अद्यतन (Update)</strong>, और <strong>हटाएं (Delete)</strong> अनुमतियां सेट करें।
            </p>
            {!showRoleForm && canCreateRoles && (
              <button className="btn btn-primary" onClick={openCreateRole} style={{ display:'flex', alignItems:'center', gap:'0.5rem' }}>
                <Plus size={17} /> नई भूमिका बनाएं
              </button>
            )}
          </div>

          {roleMsg && (
            <div style={{
              marginBottom:'1.25rem', padding:'0.8rem 1.2rem', borderRadius:'10px',
              background: roleMsg.includes('✅') ? '#f0fdf4' : '#fef2f2',
              color:      roleMsg.includes('✅') ? '#15803d'  : '#991b1b',
              border:`1px solid ${roleMsg.includes('✅') ? '#bbf7d0' : '#fecaca'}`,
              fontWeight:600
            }}>{roleMsg}</div>
          )}

          {/* Role Form */}
          {showRoleForm && (
            <div className="content-card" style={{ marginBottom:'2rem' }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.5rem' }}>
                <h3 style={{ margin:0, display:'flex', alignItems:'center', gap:'0.5rem' }}>
                  {editingRoleId ? <Edit2 size={20} color="var(--color-primary)" /> : <Plus size={20} />}
                  {editingRoleId ? 'भूमिका संपादित करें' : 'नई भूमिका बनाएं'}
                </h3>
                <button onClick={() => { setShowRoleForm(false); setEditingRoleId(null); }} className="btn-icon"><X size={18} /></button>
              </div>

              <form onSubmit={handleRoleSubmit}>
                {/* Name */}
                <div style={{ marginBottom:'1.5rem' }}>
                  <label style={{ fontWeight:700, display:'block', marginBottom:'0.5rem' }}>
                    भूमिका का नाम <span style={{ color:'#ef4444' }}>*</span>
                  </label>
                  <input type="text" required className="form-input"
                    placeholder="जैसे: सामग्री संपादक, लेखापाल, इवेंट प्रबंधक..."
                    style={{ maxWidth:'400px', width:'100%' }}
                    value={roleForm.name} onChange={e => setRoleForm({ ...roleForm, name: e.target.value })} />
                </div>

                {/* Permission Matrix */}
                <div style={{ marginBottom:'1.5rem' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:'0.75rem', marginBottom:'0.85rem', flexWrap:'wrap' }}>
                    <span style={{ fontWeight:700 }}>सेक्शन अनुमतियां (Permissions Matrix)</span>
                  </div>

                  <div style={{ border:'1px solid var(--border-color)', borderRadius:'12px', overflow:'hidden' }}>
                    {/* Header */}
                    <div style={{ display:'grid', gridTemplateColumns:'1fr 55px 75px 75px 80px 75px', padding:'0.7rem 1rem', background:'#f8fafc', borderBottom:'1px solid var(--border-color)', fontWeight:700, fontSize:'0.75rem', color:'#475569', alignItems:'center', gap:'0.2rem' }}>
                      <span>सेक्शन नाम</span>
                      <span style={{ textAlign:'center' }}>सभी</span>
                      <span style={{ textAlign:'center', color:BADGE.view.color }}>देखें (View)</span>
                      <span style={{ textAlign:'center', color:BADGE.create.color }}>जोड़ें (Create)</span>
                      <span style={{ textAlign:'center', color:BADGE.update.color }}>अद्यतन (Update)</span>
                      <span style={{ textAlign:'center', color:BADGE.delete.color }}>हटाएं (Delete)</span>
                    </div>

                    {roleForm.permissions.map((p, idx) => {
                      const allChecked = p.view && p.create && p.update && p.delete;
                      return (
                        <div key={p.menu} style={{ display:'grid', gridTemplateColumns:'1fr 55px 75px 75px 80px 75px', padding:'0.6rem 1rem', borderBottom: idx < roleForm.permissions.length-1 ? '1px solid #f1f5f9' : 'none', alignItems:'center', gap:'0.2rem', background: idx%2===0 ? '#fff' : '#fafafa' }}>
                          <span style={{ fontWeight:500, fontSize:'0.88rem', color:'#334155' }}>{p.menu}</span>
                          <div style={{ textAlign:'center' }}>
                            <input type="checkbox" checked={allChecked} title="Toggle all" onChange={e => toggleAllForMenu(p.menu, e.target.checked)} style={{ width:'16px', height:'16px', cursor:'pointer', accentColor:'#6366f1' }} />
                          </div>
                          {ACTIONS.map(action => (
                            <div key={action} style={{ textAlign:'center' }}>
                              <input type="checkbox" checked={p[action]} onChange={e => handlePermChange(p.menu, action, e.target.checked)} style={{ width:'16px', height:'16px', cursor:'pointer', accentColor:BADGE[action].color }} />
                            </div>
                          ))}
                        </div>
                      );
                    })}
                  </div>

                  {/* Quick select */}
                  <div style={{ marginTop:'0.85rem', display:'flex', gap:'0.5rem', flexWrap:'wrap', alignItems:'center' }}>
                    <span style={{ fontSize:'0.78rem', color:'#94a3b8' }}>त्वरित चयन:</span>
                    <button type="button" style={{ padding:'0.25rem 0.7rem', borderRadius:'999px', fontSize:'0.72rem', fontWeight:700, background:BADGE.view.bg, color:BADGE.view.color, border:`1px solid ${BADGE.view.border}`, cursor:'pointer' }}
                      onClick={() => setRoleForm(prev => ({ ...prev, permissions: prev.permissions.map(p => ({ ...p, view: true })) }))}>
                      ✓ सभी देखें (View)
                    </button>
                    <button type="button" style={{ padding:'0.25rem 0.7rem', borderRadius:'999px', fontSize:'0.72rem', fontWeight:700, background:BADGE.create.bg, color:BADGE.create.color, border:`1px solid ${BADGE.create.border}`, cursor:'pointer' }}
                      onClick={() => setRoleForm(prev => ({ ...prev, permissions: prev.permissions.map(p => ({ ...p, create: true })) }))}>
                      ✓ सभी जोड़ें (Create)
                    </button>
                    <button type="button" style={{ padding:'0.25rem 0.7rem', borderRadius:'999px', fontSize:'0.72rem', fontWeight:700, background:BADGE.update.bg, color:BADGE.update.color, border:`1px solid ${BADGE.update.border}`, cursor:'pointer' }}
                      onClick={() => setRoleForm(prev => ({ ...prev, permissions: prev.permissions.map(p => ({ ...p, update: true })) }))}>
                      ✓ सभी अद्यतन (Update)
                    </button>
                    <button type="button" style={{ padding:'0.25rem 0.7rem', borderRadius:'999px', fontSize:'0.72rem', fontWeight:700, background:BADGE.delete.bg, color:BADGE.delete.color, border:`1px solid ${BADGE.delete.border}`, cursor:'pointer' }}
                      onClick={() => setRoleForm(prev => ({ ...prev, permissions: prev.permissions.map(p => ({ ...p, delete: true })) }))}>
                      ✓ सभी हटाएं (Delete)
                    </button>
                    <button type="button" style={{ padding:'0.25rem 0.7rem', borderRadius:'999px', fontSize:'0.72rem', fontWeight:700, background:'#f1f5f9', color:'#64748b', border:'1px solid #e2e8f0', cursor:'pointer' }}
                      onClick={() => setRoleForm(prev => ({ ...prev, permissions: prev.permissions.map(p => ({ ...p, view:false, create:false, update:false, delete:false })) }))}>
                      ✕ साफ़ करें
                    </button>
                  </div>
                </div>

                <div style={{ display:'flex', gap:'0.75rem' }}>
                  <button type="submit" className="btn btn-primary" disabled={saving} style={{ display:'flex', alignItems:'center', gap:'0.5rem' }}>
                    <Save size={17} /> {saving ? 'सहेजा जा रहा है...' : editingRoleId ? 'भूमिका अद्यतन करें' : 'भूमिका सुरक्षित करें'}
                  </button>
                  <button type="button" className="btn btn-outline" onClick={() => { setShowRoleForm(false); setEditingRoleId(null); }}>रद्द करें</button>
                </div>
              </form>
            </div>
          )}

          {/* Roles Grid */}
          {rolesLoading ? (
            <p style={{ textAlign:'center', color:'#94a3b8', padding:'3rem' }}>भूमिकाएं लोड हो रही हैं...</p>
          ) : roles.length === 0 ? (
            <div className="content-card" style={{ textAlign:'center', padding:'4rem' }}>
              <ShieldCheck size={52} color="#e2e8f0" style={{ marginBottom:'1rem' }} />
              <h3 style={{ color:'#94a3b8', marginBottom:'0.5rem' }}>कोई कस्टम भूमिका नहीं मिली</h3>
              <p style={{ color:'#cbd5e1', marginBottom:'1.5rem' }}>अनुमतियां निर्धारित करने के लिए पहली भूमिका बनाएं।</p>
              {canCreateRoles && <button className="btn btn-primary" onClick={openCreateRole}><Plus size={15} /> नई भूमिका बनाएं</button>}
            </div>
          ) : (
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(360px, 1fr))', gap:'1.25rem' }}>
              {roles.map(role => {
                const { v,c,u,d } = permSummary(role);
                const active = role.permissions.filter(p => p.view||p.create||p.update||p.delete);
                return (
                  <div key={role._id} className="content-card" style={{ border:'1px solid var(--border-color)' }}>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'0.85rem' }}>
                      <div>
                        <h3 style={{ margin:0, fontSize:'1.05rem', display:'flex', alignItems:'center', gap:'0.4rem' }}>
                          <ShieldCheck size={17} color="var(--color-primary)" /> {role.name}
                        </h3>
                        <p style={{ margin:'0.2rem 0 0', color:'#94a3b8', fontSize:'0.75rem' }}>
                          रचना तिथि {new Date(role.createdAt).toLocaleDateString('hi-IN')}
                        </p>
                      </div>
                      <div style={{ display:'flex', gap:'0.4rem' }}>
                        {canUpdateRoles && (isSuperAdmin || role.name.toLowerCase() !== 'admin') && (
                          <button onClick={() => openEditRole(role)} className="btn-icon" title="संपादित करें"><Edit2 size={14} /></button>
                        )}
                        {canDeleteRoles && (isSuperAdmin || role.name.toLowerCase() !== 'admin') && (
                          <button onClick={() => handleRoleDelete(role._id, role.name)} className="btn-icon" style={{ borderColor:'#fee2e2' }} title="हटाएं"><Trash2 size={14} color="#ef4444" /></button>
                        )}
                      </div>
                    </div>

                    <div style={{ display:'flex', gap:'0.35rem', flexWrap:'wrap', marginBottom:'0.85rem' }}>
                      {[{l:`${v} देखें`,...BADGE.view},{l:`${c} जोड़ें`,...BADGE.create},{l:`${u} अद्यतन`,...BADGE.update},{l:`${d} हटाएं`,...BADGE.delete}].map(b=>(
                        <span key={b.l} style={{ padding:'0.18rem 0.6rem', borderRadius:'999px', fontSize:'0.68rem', fontWeight:700, background:b.bg, color:b.color, border:`1px solid ${b.border}` }}>{b.l}</span>
                      ))}
                    </div>

                    {active.length > 0 ? (
                      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.2rem' }}>
                        {active.map(p => (
                          <div key={p.menu} style={{ display:'flex', alignItems:'center', gap:'0.35rem', padding:'0.25rem 0.45rem', borderRadius:'6px', background:'#f8fafc', fontSize:'0.75rem' }}>
                            <span style={{ flex:1, color:'#334155', fontWeight:500 }}>{p.menu}</span>
                            {p.view   && <span style={{ fontWeight:800, fontSize:'0.6rem', color:BADGE.view.color }}>देखें</span>}
                            {p.create && <span style={{ fontWeight:800, fontSize:'0.6rem', color:BADGE.create.color }}>जोड़ें</span>}
                            {p.update && <span style={{ fontWeight:800, fontSize:'0.6rem', color:BADGE.update.color }}>अद्यतन</span>}
                            {p.delete && <span style={{ fontWeight:800, fontSize:'0.6rem', color:BADGE.delete.color }}>हटाएं</span>}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p style={{ color:'#cbd5e1', fontSize:'0.8rem', textAlign:'center' }}>कोई अनुमति आवंटित नहीं है।</p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminUsersRoles;
