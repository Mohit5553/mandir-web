import { useEffect, useState } from 'react';
import { api } from '../../services/api';

const statuses = ['New', 'Contacted', 'Approved', 'Closed'];

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
      <h1 style={{ marginBottom: '0.4rem' }}>Volunteer Requests</h1>
      <p className="text-light" style={{ marginBottom: '2rem' }}>Review seva registrations submitted from the home page.</p>

      <div className="content-card">
        <div className="table-scroll">
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>
                <th style={{ padding: '0.85rem 0.75rem' }}>Name</th>
                <th style={{ padding: '0.85rem 0.75rem' }}>Seva Type</th>
                <th style={{ padding: '0.85rem 0.75rem' }}>Contact</th>
                <th style={{ padding: '0.85rem 0.75rem' }}>Availability</th>
                <th style={{ padding: '0.85rem 0.75rem' }}>Message</th>
                <th style={{ padding: '0.85rem 0.75rem' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '0.95rem 0.75rem', fontWeight: 700 }}>{item.name}</td>
                  <td style={{ padding: '0.95rem 0.75rem' }}>{item.sevaType}</td>
                  <td style={{ padding: '0.95rem 0.75rem', color: '#475569' }}>
                    <div>{item.phone}</div>
                    <div>{item.email || '-'}</div>
                  </td>
                  <td style={{ padding: '0.95rem 0.75rem' }}>{item.availability || '-'}</td>
                  <td style={{ padding: '0.95rem 0.75rem', color: '#64748b', maxWidth: '260px' }}>{item.message || '-'}</td>
                  <td style={{ padding: '0.95rem 0.75rem' }}>
                    <select value={item.status} onChange={e => updateStatus(item._id, e.target.value)} style={{ padding: '0.55rem 0.7rem', borderRadius: '10px', border: '1px solid #dbe3ee' }}>
                      {statuses.map((status) => <option key={status} value={status}>{status}</option>)}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminVolunteers;
