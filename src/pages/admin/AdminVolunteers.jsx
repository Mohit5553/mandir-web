import { useEffect, useState } from 'react';
import { api } from '../../services/api';

const statusMap = {
  New: 'नया आवेदन',
  Contacted: 'संपर्क किया गया',
  Approved: 'स्वीकृत',
  Closed: 'समाप्त / पूर्ण'
};

const AdminVolunteers = () => {
  const [items, setItems] = useState([]);

  const fetchItems = () => api.getVolunteers().then(data => setItems(Array.isArray(data) ? data : []));

  useEffect(() => { fetchItems(); }, []);

  const updateStatus = async (id, status) => {
    await api.updateVolunteer(id, { status });
    fetchItems();
  };

  return (
    <div>
      <h1 style={{ marginBottom: '0.4rem' }}>स्वयंसेवक (Volunteers) अनुरोध एवं सेवा पंजीकरण</h1>
      <p className="text-light" style={{ marginBottom: '2rem' }}>मुख्य पृष्ठ से प्राप्त स्वयंसेवक सेवा आवेदनों की समीक्षा व प्रबंधन करें</p>

      <div className="content-card">
        <div className="table-scroll">
          {items.length === 0 ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>कोई स्वयंसेवक आवेदन प्राप्त नहीं हुआ है।</div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>
                  <th style={{ padding: '0.85rem 0.75rem' }}>आवेदक नाम</th>
                  <th style={{ padding: '0.85rem 0.75rem' }}>सेवा का प्रकार</th>
                  <th style={{ padding: '0.85rem 0.75rem' }}>संपर्क विवरण</th>
                  <th style={{ padding: '0.85rem 0.75rem' }}>उपलब्धता</th>
                  <th style={{ padding: '0.85rem 0.75rem' }}>संदेश / विवरण</th>
                  <th style={{ padding: '0.85rem 0.75rem' }}>स्थिति</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '0.95rem 0.75rem', fontWeight: 700 }}>{item.name}</td>
                    <td style={{ padding: '0.95rem 0.75rem' }}>{item.sevaType}</td>
                    <td style={{ padding: '0.95rem 0.75rem', color: '#475569' }}>
                      <div>{item.phone}</div>
                      <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>{item.email || 'उपलब्ध नहीं'}</div>
                    </td>
                    <td style={{ padding: '0.95rem 0.75rem' }}>{item.availability || 'उपलब्ध नहीं'}</td>
                    <td style={{ padding: '0.95rem 0.75rem', color: '#64748b', maxWidth: '260px' }}>{item.message || 'कोई संदेश नहीं'}</td>
                    <td style={{ padding: '0.95rem 0.75rem' }}>
                      <select value={item.status} onChange={e => updateStatus(item._id, e.target.value)} style={{ padding: '0.55rem 0.7rem', borderRadius: '10px', border: '1px solid #dbe3ee', fontWeight: 700 }}>
                        {Object.entries(statusMap).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminVolunteers;
