import { useState } from 'react';
import { useLeads } from '../../hooks/useLeads';
import LeadTable from '../../components/LeadTable/LeadTable';
import { Plus } from 'lucide-react';
import './Leads.css';

const Leads = () => {
  const { leads, loading, error, removeLead, addLead } = useLeads();
  const [showModal, setShowModal] = useState(false);
  
  // Dummy form state for the rapid add modal
  const [formData, setFormData] = useState({
    name: '', url: '', title: '', company: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    await addLead({
      name: formData.name,
      linkedin_url: formData.url,
      title: formData.title,
      company: formData.company,
      tags: ['new']
    });
    setShowModal(false);
    setFormData({name: '', url: '', title: '', company: ''});
  };

  return (
    <div className="leads-page fade-in">
      <div className="page-header flex-between">
        <div>
          <h1 className="page-title">Saved Leads</h1>
          <p className="page-subtitle">Manage and track your scraped prospects.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={18} /> Add Lead
        </button>
      </div>

      {error && <div className="error-banner">{error}</div>}

      <LeadTable 
        leads={leads} 
        isLoading={loading} 
        onDelete={removeLead} 
      />

      {/* Simple Add Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h2 className="modal-title">Track New Prospect</h2>
            <form onSubmit={handleSubmit} className="add-form">
              <input required type="text" placeholder="Full Name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              <input required type="url" placeholder="LinkedIn URL" value={formData.url} onChange={e => setFormData({...formData, url: e.target.value})} />
              <input type="text" placeholder="Job Title" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
              <input type="text" placeholder="Company" value={formData.company} onChange={e => setFormData({...formData, company: e.target.value})} />
              <div className="modal-actions">
                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Lead</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Leads;
