import { Link, useLocation } from 'react-router-dom';
import { Home, Users, History, Settings, LogOut, UserCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import logoImg from '../../assets/logo.png';
import './Sidebar.css';

const Sidebar = () => {
  const location = useLocation();
  const { user, logout } = useAuth();

  const menuItems = [
    { path: '/', label: 'Dashboard', icon: Home },
    { path: '/leads', label: 'My Leads', icon: Users },
    { path: '/history', label: 'History', icon: History },
    { path: '/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="logo-container">
          <img src={logoImg} alt="LeadDork Logo" className="logo-image" />
          <h1 className="logo-text">Lead<span>Dork</span></h1>
        </div>
      </div>
      
      <nav className="sidebar-nav">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
          >
            <item.icon size={20} className="nav-icon" />
            <span className="nav-label">{item.label}</span>
          </Link>
        ))}
      </nav>

      <div className="sidebar-footer">
        {user && (
          <div className="user-profile">
            <div className="avatar">
              {user.avatar_url ? (
                <img src={user.avatar_url} alt={user.name} />
              ) : (
                <div className="avatar-placeholder">{user.name?.[0] || 'U'}</div>
              )}
            </div>
            <div className="user-info">
              <span className="user-name">{user.name}</span>
              <span className="user-role">{user.role || 'User'}</span>
            </div>
          </div>
        )}
        <button className="logout-button" onClick={logout}>
          <LogOut size={20} className="nav-icon" />
          <span className="nav-label">Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
