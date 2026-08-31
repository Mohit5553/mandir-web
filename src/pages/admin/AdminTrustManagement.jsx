import { useEffect, useState } from 'react';
import { Edit2, FolderPlus, Image as ImageIcon, Trash2, UserPlus, X } from 'lucide-react';
import { api } from '../../services/api';

const emptyCategory = { name: '', displayType: 'roleName', order: '' };
const emptyRole = { name: '', order: '' };
const emptyMember = { role: '', name: '', email: '', phone: '', photoUrl: '', joinDate: '', category: 'office', order: '' };

const AdminTrustManagement = () => {
  const [categories, setCategories] = useState([]);
  const [roles, setRoles] = useState([]);
  const [members, setMembers] = useState([]);
  const [categoryForm, setCategoryForm] = useState(emptyCategory);
  const [roleForm, setRoleForm] = useState(emptyRole);
  const [memberForm, setMemberForm] = useState(emptyMember);
  const [editingCategoryId, setEditingCategoryId] = useState(null);
  const [editingRoleId, setEditingRoleId] = useState(null);
  const [editingMemberId, setEditingMemberId] = useState(null);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [showRoleForm, setShowRoleForm] = useState(false);
  const [showMemberForm, setShowMemberForm] = useState(false);
  const [activeTab, setActiveTab] = useState('members');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const fetchTrust = async () => {
    const data = await api.getTrustManagement();
    if (data?.message) {
      setMessage(data.message);
    } else if (data) {
      const nextCategories = Array.isArray(data.categories) ? data.categories : [];
      const nextRoles = Array.isArray(data.roles) ? data.roles : [];
      setCategories(nextCategories);
      setRoles(nextRoles);
      setMembers(Array.isArray(data.members) ? data.members : []);
      setMemberForm(prev => ({
        ...prev,
        category: prev.category || nextCategories[0]?.key || 'office',
        role: prev.role || nextRoles[0]?.name || ''
      }));
    }
  };

  useEffect(() => { fetchTrust(); }, []);

  const inputStyle = {
    width: '100%',
    padding: '0.75rem',
    borderRadius: 'var(--radius-sm)',
    border: '1px solid var(--border-color)',
    fontSize: '1rem'
  };

  const sortedCategories = [...categories].sort((a, b) => (a.order || 0) - (b.order || 0));
  const sortedRoles = [...roles].sort((a, b) => (a.order || 0) - (b.order || 0));
  const sortedMembers = [...members].sort((a, b) => (a.order || 0) - (b.order || 0));

  const compressImage = (file) => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        const MAX = 500;
        let { width, height } = img;
        if (width > MAX || height > MAX) {
          if (width > height) {
            height = (height / width) * MAX;
            width = MAX;
          } else {
            width = (width / height) * MAX;
            height = MAX;
          }
        }
        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.78));
      };

      img.src = URL.createObjectURL(file);
    });
  };

  const handlePhotoChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const photoUrl = await compressImage(file);
    setMemberForm(prev => ({ ...prev, photoUrl }));
  };

  const resetCategoryForm = () => {
    setCategoryForm(emptyCategory);
    setEditingCategoryId(null);
    setShowCategoryForm(false);
  };

  const resetRoleForm = () => {
    setRoleForm(emptyRole);
    setEditingRoleId(null);
    setShowRoleForm(false);
  };

  const resetMemberForm = () => {
    setMemberForm({ ...emptyMember, category: sortedCategories[0]?.key || 'office', role: sortedRoles[0]?.name || '' });
    setEditingMemberId(null);
    setShowMemberForm(false);
  };

  const handleCategorySubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const payload = {
      ...categoryForm,
      order: Number(categoryForm.order) || 0
    };

    if (editingCategoryId) {
      await api.updateTrustCategory(editingCategoryId, payload);
    } else {
      await api.addTrustCategory(payload);
    }

    await fetchTrust();
    setMessage(editingCategoryId ? 'Category updated' : 'Category added');
    resetCategoryForm();
    setLoading(false);
  };

  const handleEditCategory = (category) => {
    setEditingCategoryId(category._id);
    setShowCategoryForm(true);
    setCategoryForm({
      name: category.name || '',
      displayType: category.displayType || 'roleName',
      order: category.order || ''
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteCategory = async (category) => {
    if (!window.confirm(`Delete category "${category.name}"?`)) return;
    const response = await api.deleteTrustCategory(category._id);
    if (response?.message && response.message !== 'Category deleted') {
      setMessage(response.message);
    } else {
      setMessage('Category deleted');
      await fetchTrust();
    }
  };

  const handleRoleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const payload = {
      ...roleForm,
      order: Number(roleForm.order) || 0
    };

    if (editingRoleId) {
      await api.updateTrustRole(editingRoleId, payload);
    } else {
      await api.addTrustRole(payload);
    }

    await fetchTrust();
    setMessage(editingRoleId ? 'Designation updated' : 'Designation added');
    resetRoleForm();
    setLoading(false);
  };

  const handleEditRole = (role) => {
    setEditingRoleId(role._id);
    setShowRoleForm(true);
    setRoleForm({
      name: role.name || '',
      order: role.order || ''
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteRole = async (role) => {
    if (!window.confirm(`Delete designation "${role.name}"?`)) return;
    const response = await api.deleteTrustRole(role._id);
    if (response?.message && response.message !== 'Role deleted') {
      setMessage(response.message);
    } else {
      setMessage('Designation deleted');
      await fetchTrust();
    }
  };

  const handleMemberSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const payload = {
      ...memberForm,
      joinDate: memberForm.joinDate || undefined,
      order: Number(memberForm.order) || 0
    };

    if (editingMemberId) {
      await api.updateTrustMember(editingMemberId, payload);
    } else {
      await api.addTrustMember(payload);
    }

    await fetchTrust();
    setMessage(editingMemberId ? 'Member updated' : 'Member added');
    resetMemberForm();
    setLoading(false);
  };

  const handleEditMember = (member) => {
    setEditingMemberId(member._id);
    setShowMemberForm(true);
    setMemberForm({
      role: member.role || '',
      name: member.name || '',
      email: member.email || '',
      phone: member.phone || '',
      photoUrl: member.photoUrl || '',
      joinDate: member.joinDate ? new Date(member.joinDate).toISOString().slice(0, 10) : '',
      category: member.category || sortedCategories[0]?.key || 'office',
      order: member.order || ''
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteMember = async (memberId) => {
    if (!window.confirm('Delete this member?')) return;
    await api.deleteTrustMember(memberId);
    await fetchTrust();
    setMessage('Member deleted');
  };

  const getJoinDate = (member) => {
    if (member.joinDate) {
      return new Date(member.joinDate).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
    }

    const objectId = String(member._id || '');
    if (!/^[a-f\d]{24}$/i.test(objectId)) return 'N/A';
    const timestamp = parseInt(objectId.slice(0, 8), 16) * 1000;
    return new Date(timestamp).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const renderMember = (member) => (
    <div key={member._id} className="admin-member-card">
      <div className="admin-member-card-top">
        <button type="button" className="btn-icon" title="Edit" onClick={() => handleEditMember(member)}><Edit2 size={15} /></button>
        <button type="button" className="btn-icon" title="Delete" style={{ borderColor: '#fee2e2' }} onClick={() => handleDeleteMember(member._id)}><Trash2 size={15} color="#ef4444" /></button>
      </div>
      <div className="admin-member-card-body">
        {member.photoUrl ? (
          <img src={member.photoUrl} alt={member.name} className="admin-member-photo" />
        ) : (
          <div className="admin-member-photo admin-member-photo-empty">
            <ImageIcon size={20} />
          </div>
        )}
        <div className="admin-member-role">{member.role}</div>
        <div className="admin-member-name">{member.name}</div>
        {member.phone && <div className="admin-member-join-date">Phone: {member.phone}</div>}
        {member.email && <div className="admin-member-join-date">{member.email}</div>}
        <div className="admin-member-join-date">Join Date: {getJoinDate(member)}</div>
      </div>
    </div>
  );

  return (
    <div className="trust-management-page">
      <div className="page-toolbar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.2rem' }}>ट्रस्ट प्रबंधन (पदाधिकारी एवं ट्रस्टी)</h1>
          <p className="text-light">ट्रस्ट के मुख्य सदस्यों, पदनामों एवं श्रेणियों का प्रबंधन करें</p>
        </div>
      </div>

      {message && <div className="alert alert-info" style={{ marginBottom: '1.5rem' }}>{message}</div>}

      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
        <button
          className={`btn ${activeTab === 'members' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => setActiveTab('members')}
        >
          सदस्य सूची ({members.length})
        </button>
        <button
          className={`btn ${activeTab === 'roles' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => setActiveTab('roles')}
        >
          पदनाम सूची ({roles.length})
        </button>
        <button
          className={`btn ${activeTab === 'categories' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => setActiveTab('categories')}
        >
          श्रेणियां ({categories.length})
        </button>
      </div>

      {activeTab === 'categories' && (
        <div style={{ display: 'grid', gap: '1.5rem' }}>
          <div className="content-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ margin: 0 }}>श्रेणी प्रबंधन</h2>
              {!showCategoryForm && <button className="btn btn-primary" onClick={() => { resetCategoryForm(); setShowCategoryForm(true); }}><FolderPlus size={18} /> नई श्रेणी जोड़ें</button>}
            </div>
          </div>
          {showCategoryForm && (
          <div className="content-card">
            <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><FolderPlus size={20} color="var(--color-primary)" /> {editingCategoryId ? 'श्रेणी संपादित करें' : 'नई श्रेणी जोड़ें'}</h3>
            <form onSubmit={handleCategorySubmit}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>श्रेणी का नाम *</label>
              <input required placeholder="जैसे: पदाधिकारी एवं ट्रस्टी" style={{ ...inputStyle, marginBottom: '1rem' }} value={categoryForm.name} onChange={e => setCategoryForm({ ...categoryForm, name: e.target.value })} />

              <div className="admin-inline-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>प्रदर्शन प्रारूप</label>
                  <select style={inputStyle} value={categoryForm.displayType} onChange={e => setCategoryForm({ ...categoryForm, displayType: e.target.value })}>
                    <option value="roleName">पदनाम : नाम (Role: Name)</option>
                    <option value="namesOnly">केवल नाम (Names only)</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>क्रम संख्या (Order)</label>
                  <input type="number" min="0" style={inputStyle} value={categoryForm.order} onChange={e => setCategoryForm({ ...categoryForm, order: e.target.value })} />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button type="submit" className="btn btn-primary" disabled={loading} style={{ flex: 1 }}>
                  {editingCategoryId ? 'श्रेणी अद्यतन करें' : 'श्रेणी जोड़ें'}
                </button>
                <button type="button" className="btn btn-outline" onClick={resetCategoryForm}><X size={20} /></button>
              </div>
            </form>
          </div>
          )}
          <div className="content-card">
            <div className="admin-category-grid">
              {sortedCategories.map(category => (
              <div key={category._id || category.key} className="admin-category-card">
                <div style={{ fontWeight: 800, color: 'var(--color-primary)' }}>{category.order || '-'}</div>
                <div style={{ minWidth: 0, overflow: 'hidden' }}>
                  <div style={{ fontWeight: 700, wordBreak: 'break-word', whiteSpace: 'normal' }}>{category.name}</div>
                  <div style={{ color: '#64748b', fontSize: '0.9rem' }}>{category.displayType === 'namesOnly' ? 'केवल नाम' : 'पदनाम : नाम'}</div>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button type="button" className="btn-icon" title="संपादित करें" onClick={() => handleEditCategory(category)}><Edit2 size={16} /></button>
                  <button type="button" className="btn-icon" title="हटाएं" style={{ borderColor: '#fee2e2' }} onClick={() => handleDeleteCategory(category)}><Trash2 size={16} color="#ef4444" /></button>
                </div>
              </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'roles' && (
        <div style={{ display: 'grid', gap: '1.5rem' }}>
          <div className="content-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ margin: 0 }}>पदनाम (Designations) प्रबंधन</h2>
              {!showRoleForm && <button className="btn btn-primary" onClick={() => { resetRoleForm(); setShowRoleForm(true); }}><FolderPlus size={18} /> नया पदनाम जोड़ें</button>}
            </div>
          </div>
          {showRoleForm && (
          <div className="content-card">
            <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><FolderPlus size={20} color="var(--color-primary)" /> {editingRoleId ? 'पदनाम संपादित करें' : 'नया पदनाम जोड़ें'}</h3>
            <form onSubmit={handleRoleSubmit}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>पदनाम का नाम *</label>
              <input required placeholder="जैसे: मुख्य संरक्षक, अध्यक्ष, सचिव, कोषाध्यक्ष" style={{ ...inputStyle, marginBottom: '1rem' }} value={roleForm.name} onChange={e => setRoleForm({ ...roleForm, name: e.target.value })} />

              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>क्रम संख्या (Order)</label>
              <input type="number" min="0" style={{ ...inputStyle, marginBottom: '1rem' }} value={roleForm.order} onChange={e => setRoleForm({ ...roleForm, order: e.target.value })} />

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button type="submit" className="btn btn-primary" disabled={loading} style={{ flex: 1 }}>
                  {editingRoleId ? 'पदनाम अद्यतन करें' : 'पदनाम जोड़ें'}
                </button>
                <button type="button" className="btn btn-outline" onClick={resetRoleForm}><X size={20} /></button>
              </div>
            </form>
          </div>
          )}
          <div className="content-card">
            <div className="admin-category-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))' }}>
              {sortedRoles.map(role => (
              <div key={role._id || role.key} className="admin-category-card" style={{ padding: '0.85rem 1rem' }}>
                <div style={{ fontWeight: 800, color: 'var(--color-primary)' }}>{role.order || '-'}</div>
                <div style={{ fontWeight: 700, minWidth: 0, wordBreak: 'break-word', whiteSpace: 'normal' }}>{role.name}</div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button type="button" className="btn-icon" title="संपादित करें" onClick={() => handleEditRole(role)}><Edit2 size={16} /></button>
                  <button type="button" className="btn-icon" title="हटाएं" style={{ borderColor: '#fee2e2' }} onClick={() => handleDeleteRole(role)}><Trash2 size={16} color="#ef4444" /></button>
                </div>
              </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'members' && (
        <div style={{ display: 'grid', gap: '1.5rem' }}>
          <div className="content-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h2 style={{ margin: 0 }}>ट्रस्ट सदस्य रिकॉर्ड</h2>
                <p style={{ color: '#64748b', margin: '0.25rem 0 0' }}>{members.length} सदस्य वेबसाइट पर प्रदर्शित हैं</p>
              </div>
              {!showMemberForm && <button className="btn btn-primary" onClick={() => { resetMemberForm(); setShowMemberForm(true); }}><UserPlus size={18} /> नया सदस्य जोड़ें</button>}
            </div>
          </div>
          {showMemberForm && (
          <div className="content-card">
            <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><UserPlus size={20} color="var(--color-primary)" /> {editingMemberId ? 'सदस्य विवरण अद्यतन करें' : 'नया सदस्य जोड़ें'}</h3>
            <form onSubmit={handleMemberSubmit} className="admin-member-form-two-column">
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>पदनाम *</label>
              <select required style={{ ...inputStyle, marginBottom: '1rem' }} value={memberForm.role} onChange={e => setMemberForm({ ...memberForm, role: e.target.value })}>
                {sortedRoles.map(role => (
                  <option key={role._id || role.key} value={role.name}>{role.name}</option>
                ))}
              </select>

              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>सदस्य का नाम *</label>
              <input required placeholder="सदस्य का नाम दर्ज करें" style={{ ...inputStyle, marginBottom: '1rem' }} value={memberForm.name} onChange={e => setMemberForm({ ...memberForm, name: e.target.value })} />

              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>ईमेल पता</label>
              <input type="email" placeholder="member@example.com" style={{ ...inputStyle, marginBottom: '1rem' }} value={memberForm.email} onChange={e => setMemberForm({ ...memberForm, email: e.target.value })} />

              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>संपर्क मोबाइल नंबर</label>
              <input type="tel" placeholder="10-अंकीय मोबाइल नंबर" style={{ ...inputStyle, marginBottom: '1rem' }} value={memberForm.phone} onChange={e => setMemberForm({ ...memberForm, phone: e.target.value })} />

              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>जुड़ने की तिथि</label>
              <input type="date" style={{ ...inputStyle, marginBottom: '1rem' }} value={memberForm.joinDate} onChange={e => setMemberForm({ ...memberForm, joinDate: e.target.value })} />

              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>फोटो (Photo)</label>
              <input type="file" accept="image/*" style={{ ...inputStyle, marginBottom: '1rem' }} onChange={handlePhotoChange} />
              {memberForm.photoUrl && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem', padding: '0.75rem', border: '1px solid #f0f0f0', borderRadius: '12px' }}>
                  <img src={memberForm.photoUrl} alt="Member preview" style={{ width: '72px', height: '72px', borderRadius: '50%', objectFit: 'cover' }} />
                  <button type="button" className="btn btn-outline" onClick={() => setMemberForm({ ...memberForm, photoUrl: '' })}>फोटो हटाएं</button>
                </div>
              )}

              <div className="admin-inline-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>श्रेणी *</label>
                  <select required style={inputStyle} value={memberForm.category} onChange={e => setMemberForm({ ...memberForm, category: e.target.value })}>
                    {sortedCategories.map(category => (
                      <option key={category._id || category.key} value={category.key}>{category.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>क्रम संख्या (Order)</label>
                  <input type="number" min="0" style={inputStyle} value={memberForm.order} onChange={e => setMemberForm({ ...memberForm, order: e.target.value })} />
                </div>
              </div>

              <div className="admin-member-form-actions" style={{ display: 'flex', gap: '0.5rem' }}>
                <button type="submit" className="btn btn-primary" disabled={loading || sortedCategories.length === 0} style={{ flex: 1 }}>
                  {editingMemberId ? 'सदस्य अद्यतन करें' : 'सदस्य सुरक्षित करें'}
                </button>
                <button type="button" className="btn btn-outline" onClick={resetMemberForm}><X size={20} /></button>
              </div>
            </form>
          </div>
          )}

          <div className="content-card">
            {sortedCategories.map(category => {
              const categoryMembers = sortedMembers.filter(member => member.category === category.key);
              return (
                <div key={category._id || category.key} style={{ marginTop: '1.5rem' }}>
                  <h3 style={{ marginBottom: '1rem' }}>{category.name} ({categoryMembers.length})</h3>
                  {categoryMembers.length === 0 ? (
                    <div style={{ padding: '1.5rem', textAlign: 'center', color: '#94a3b8', border: '1px dashed #e2e8f0', borderRadius: '12px' }}>
                      इस श्रेणी में कोई सदस्य शामिल नहीं है।
                    </div>
                  ) : (
                    <div className="admin-member-grid">
                      {categoryMembers.map(renderMember)}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminTrustManagement;
