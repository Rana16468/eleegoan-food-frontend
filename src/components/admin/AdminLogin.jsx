import { useState } from 'react';
import { Link } from 'react-router';
import ConnectionStatus from '../common/ConnectionStatus';
import ThemeToggle from '../common/ThemeToggle';

const AdminLogin = ({ socket, onLoginSuccess, onShowNotification, theme, onToggleTheme }) => {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const handleSubmit = (event) => {
    event.preventDefault();
    if (!password.trim()) return onShowNotification('Please enter the admin password.', 'error');
    if (!socket?.connected) return onShowNotification('The admin service is offline. Please try again shortly.', 'error');
    setLoading(true);
    socket.emit('adminLogin', { password }, (response) => {
      setLoading(false);
      if (!response.success) { setPassword(''); return onShowNotification(response.message || 'Invalid password.', 'error'); }
      localStorage.setItem('isAdmin', 'true');
      onShowNotification('Welcome to the operations desk.', 'success');
      onLoginSuccess();
    });
  };
  return <main className="admin-login"><section className="route-card admin-login__card"><div className="admin-topbar__inner" style={{ width: '100%', minHeight: 0, padding: 0, marginBottom: 28 }}><div className="admin-brand"><span className="admin-brand__mark">◈</span><div><h1>FoodTrack Ops</h1><p>Operations workspace</p></div></div><ThemeToggle theme={theme} onToggle={onToggleTheme} /></div><ConnectionStatus connected={socket?.connected} /><span className="route-kicker" style={{ display: 'block', marginTop: 28 }}>Secure access</span><h2 className="route-title">Welcome back</h2><p className="route-subtitle">Sign in to monitor orders, manage fulfilment, and keep the kitchen moving.</p><form className="route-fields" onSubmit={handleSubmit} style={{ marginTop: 26 }}><div className="route-field"><label htmlFor="admin-password">Admin password</label><input id="admin-password" type="password" className="route-input" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Enter your password" autoFocus /></div><button className="route-submit" type="submit" disabled={loading}>{loading ? 'Signing in...' : 'Enter operations desk'}</button></form><Link className="route-button" style={{ width: '100%', marginTop: 10, textDecoration: 'none' }} to="/">Back to customer menu</Link></section></main>;
};

export default AdminLogin;
