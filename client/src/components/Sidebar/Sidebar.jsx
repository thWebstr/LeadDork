import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Search, Users, Clock, Settings, Binoculars, UserCircle } from 'lucide-react';
import { usersApi } from '../../services/api';
import './Sidebar.css';

const Sidebar = () => {
  const location = useLocation();
  const [profile, setProfile] = useState({ name: 'Loading...', role: '...' });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await usersApi.getProfile();
        if (data.success) {
          setProfile(data.user);
        }
      } catch (err) {
        console.error("Sidebar profile fetch error", err);
      }
    };
    fetchProfile();
  }, []);

  const navItems = [
    { path: '/', label: 'Search', icon: Search },
    { path: '/leads', label: 'Saved Leads', icon: Users },
    { path: '/history', label: 'History', icon: Clock },
    { path: '/settings', label: 'Settings', icon: Settings }
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="logo-container">
          <Binoculars className="logo-icon" size={24} />
          <h1 className="logo-text">Lead<span>Dork</span></h1>
        </div>
      </div>
      
      <nav className="sidebar-nav">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <Link 
              key={item.path} 
              to={item.path} 
              className={`nav-item ${isActive ? 'active' : ''}`}
            >
              <Icon size={20} className="nav-icon" />
              <span className="nav-label">{item.label}</span>
            </Link>
          );
        })}
      </nav>
      
      <div className="sidebar-footer">
        <div className="user-profile">
          <div className="avatar">
            {profile.avatar_url ? (
              <img src={profile.avatar_url} alt="A" style={{width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%'}} />
            ) : (
               <UserCircle size={24} />
            )}
          </div>
          <div className="user-info">
            <span className="user-name">{profile.name}</span>
            <span className="user-role">{profile.role || 'Guest'}</span>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
