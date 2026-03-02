import { ExternalLink, Edit2, Trash2, Github } from 'lucide-react';
import TagBadge from '../TagBadge/TagBadge';
import './LeadTable.css';

const LeadTable = ({ leads, onUpdate, onDelete, isLoading }) => {
  if (isLoading) {
    return (
      <div className="table-loading">
        <div className="spinner"></div>
        <p>Loading leads...</p>
      </div>
    );
  }

  if (!leads || leads.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-icon-wrapper">
          <Github className="empty-icon" size={48} />
        </div>
        <h3>No leads found</h3>
        <p>Your saved prospects will appear here.</p>
      </div>
    );
  }

  return (
    <div className="table-container">
      <table className="lead-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Role & Company</th>
            <th>Location</th>
            <th>Tags</th>
            <th className="text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {leads.map((lead) => (
            <tr key={lead.id}>
              <td>
                <div className="lead-name-cell">
                  <span className="lead-name">{lead.name}</span>
                </div>
              </td>
              <td>
                <div className="lead-role">
                  <span className="role-title">{lead.title}</span>
                  {lead.company && <span className="company-name">@ {lead.company}</span>}
                </div>
              </td>
              <td className="text-muted">{lead.location || '—'}</td>
              <td>
                <div className="tags-container">
                  {lead.tags?.length > 0 ? (
                    lead.tags.map(tag => <TagBadge key={tag} name={tag} />)
                  ) : (
                    <span className="text-muted text-sm">—</span>
                  )}
                </div>
              </td>
              <td>
                <div className="action-buttons">
                  <a 
                    href={lead.linkedin_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="icon-btn"
                    title="View LinkedIn"
                  >
                    <ExternalLink size={16} />
                  </a>
                  <button className="icon-btn text-danger" onClick={() => onDelete(lead.id)} title="Delete Lead">
                    <Trash2 size={16} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default LeadTable;
