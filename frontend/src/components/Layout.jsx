import { useState } from 'react';
import { Link, NavLink, Outlet } from 'react-router-dom';
import { Bell, BriefcaseBusiness, CircleUserRound, LayoutDashboard, LogOut, Menu, MessageSquareText, MessageCircleMore, UserRound, Users, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const navItems = {
  client: [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/freelancers', label: 'Freelancers', icon: Users },
    { to: '/gigs', label: 'My Gigs', icon: BriefcaseBusiness },
    { to: '/chats', label: 'Messages', icon: MessageCircleMore },
    { to: '/disputes', label: 'Disputes', icon: MessageSquareText },
    { to: '/profile', label: 'Profile', icon: UserRound }
  ],
  freelancer: [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/gigs', label: 'Find Work', icon: BriefcaseBusiness },
    { to: '/freelancers', label: 'Freelancers', icon: Users },
    { to: '/chats', label: 'Messages', icon: MessageCircleMore },
    { to: '/disputes', label: 'Disputes', icon: MessageSquareText },
    { to: '/profile', label: 'Profile', icon: UserRound }
  ]
};

const Layout = () => {
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const roleLinks = user?.role ? navItems[user.role] || navItems.client : navItems.client;

  const handleLogout = () => {
    logout();
    window.location.href = '/';
  };

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand-wrap">
          <button className="mobile-toggle" onClick={() => setMobileOpen((prev) => !prev)} aria-label="Toggle navigation">
            {mobileOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
          <Link to="/" className="brand-link">
            <span className="brand-mark">G</span>
            <span>GigHub</span>
          </Link>
        </div>

        <nav className={`nav desktop-nav ${user ? 'nav-auth' : ''}`}>
          {user ? (
            <>
              {roleLinks.map(({ to, label, icon: Icon }) => (
                <NavLink key={to} to={to} className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                  <Icon size={16} />
                  {label}
                </NavLink>
              ))}
            </>
          ) : (
            <>
              <NavLink to="/" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                Home
              </NavLink>
              <NavLink to="/freelancers" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                Freelancers
              </NavLink>
              <NavLink to="/login" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                Login
              </NavLink>
            </>
          )}
        </nav>

        <div className="header-actions">
          {user ? (
            <>
              <button className="icon-button" aria-label="Notifications">
                <Bell size={18} />
              </button>
              <div className="user-pill">
                <CircleUserRound size={18} />
                <span>{user.name}</span>
                <span className="role-indicator">{user.role}</span>
              </div>
              <button className="logout-button" onClick={handleLogout}>
                <LogOut size={16} />
                Logout
              </button>
            </>
          ) : (
            <div className="auth-buttons">
              <Link to="/login" className="button secondary tiny">Login</Link>
              <Link to="/register" className="button primary tiny">Join Now</Link>
            </div>
          )}
        </div>
      </header>

      {mobileOpen && user && (
        <div className="mobile-panel">
          {roleLinks.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to} className={({ isActive }) => `mobile-link ${isActive ? 'active' : ''}`} onClick={() => setMobileOpen(false)}>
              <Icon size={16} />
              {label}
            </NavLink>
          ))}
        </div>
      )}

      <main className="page-wrap">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
