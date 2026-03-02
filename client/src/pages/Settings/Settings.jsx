import { useState, useEffect } from 'react';
import { Save, UserCircle } from 'lucide-react';
import { usersApi } from '../../services/api';
import './Settings.css';

const Settings = () => {
  const [profile, setProfile] = useState({ name: '', role: '', avatar_url: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const data = await usersApi.getProfile();
      if (data.success) {
        setProfile(data.user);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setMessage(null);
      const data = await usersApi.updateProfile(profile);
      if (data.success) {
        setProfile(data.user);
        setMessage({ type: 'success', text: 'Profile updated successfully!' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.error || 'Failed to update string' });
    } finally {
      setSaving(false);
      setTimeout(() => setMessage(null), 3000);
    }
  };

  if (loading) {
    return <div className="settings-page fade-in"><div className="table-loading">Loading settings...</div></div>;
  }

  return (
    <div className="settings-page fade-in">
      <h1 className="page-title">Profile Settings</h1>
      <p className="page-subtitle">Customize how you appear globally across the application.</p>

      {message && (
        <div className={`toast-banner ${message.type}`}>
          {message.text}
        </div>
      )}

      <div className="settings-card">
        <div className="settings-card-header">
          <div className="avatar-preview">
            {profile.avatar_url ? (
              <img src={profile.avatar_url} alt="Avatar" className="avatar-img" />
            ) : (
              <UserCircle size={64} className="text-muted" />
            )}
          </div>
          <div>
            <h3>Your Avatar</h3>
            <p className="text-muted text-sm">Provide a public URL to your image.</p>
          </div>
        </div>

        <form onSubmit={handleSave} className="settings-form">
          <div className="form-group">
            <label>Avatar Image URL</label>
            <input 
              type="url" 
              value={profile.avatar_url || ''} 
              onChange={e => setProfile({...profile, avatar_url: e.target.value})}
              placeholder="https://..."
            />
          </div>
          
          <div className="form-group">
            <label>Full Name</label>
            <input 
              type="text" 
              required
              value={profile.name || ''} 
              onChange={e => setProfile({...profile, name: e.target.value})}
            />
          </div>

          <div className="form-group">
            <label>Title / Role</label>
            <input 
              type="text" 
              value={profile.role || ''} 
              onChange={e => setProfile({...profile, role: e.target.value})}
              placeholder="e.g. Lead Sales Recruiter"
            />
          </div>

          <div className="form-actions">
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Saving...' : <><Save size={16} /> Save Changes</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Settings;
