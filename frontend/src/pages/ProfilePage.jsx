import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, CheckCircle2, DollarSign, ExternalLink, MapPin, Sparkles, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { portfolioService } from '../services/portfolioService';

const CATEGORIES = [
  'Development & IT',
  'Design & Creative',
  'Writing & Translation',
  'Data & AI',
  'Sales & Marketing',
  'Admin & Customer Support'
];

const ProfilePage = () => {
  const { user } = useAuth();

  const [form, setForm] = useState({
    title: user?.title || '',
    category: user?.category || 'Development & IT',
    experience: user?.experience || '3+ years',
    location: user?.location || 'Remote',
    hourlyRate: user?.hourlyRate || 45,
    bio: user?.bio || '',
    skills: (user?.skills || []).join(', ')
  });

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (user?.role !== 'freelancer') return;

    setSaving(true);
    setMessage('');
    setIsError(false);

    try {
      const skillsArray = form.skills
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      const payload = {
        title: form.title.trim(),
        category: form.category,
        experience: form.experience.trim(),
        location: form.location.trim(),
        hourlyRate: Number(form.hourlyRate) || 45,
        bio: form.bio.trim(),
        skills: skillsArray
      };

      const res = await portfolioService.updatePortfolio(payload);
      if (res?.data?.user) {
        localStorage.setItem('gighub_user', JSON.stringify(res.data.user));
      }
      setMessage('Profile and portfolio updated successfully!');
      setIsError(false);
    } catch (error) {
      console.error('Update error:', error);
      setMessage(error?.response?.data?.message || 'Unable to update your profile.');
      setIsError(true);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page-shell">
      <div className="section-heading">
        <div>
          <span className="eyebrow">Account & Settings</span>
          <h2>My Profile</h2>
        </div>
        {user?.role === 'freelancer' && (
          <Link to={`/freelancers/${user?._id || user?.id}`} className="button secondary tiny">
            <ExternalLink size={14} /> View Public Marketplace Profile
          </Link>
        )}
      </div>

      <div className="profile-edit-grid">
        {/* Left Column: Account Details */}
        <div className="panel account-panel">
          <div className="account-panel-header">
            <div className="account-avatar-circle">
              {user?.name ? user.name.slice(0, 2).toUpperCase() : 'GH'}
            </div>
            <div>
              <h3>{user?.name}</h3>
              <span className="badge-role">{user?.role}</span>
            </div>
          </div>

          <ul className="detail-list">
            <li>
              <span>Full Name</span>
              <strong>{user?.name}</strong>
            </li>
            <li>
              <span>Email Address</span>
              <strong>{user?.email}</strong>
            </li>
            <li>
              <span>Account Type</span>
              <strong style={{ textTransform: 'capitalize' }}>{user?.role}</strong>
            </li>
            <li>
              <span>Joined</span>
              <strong>{user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Active Member'}</strong>
            </li>
          </ul>

          <div className="account-tip-box">
            <Sparkles size={16} className="accent-icon" />
            <p className="tiny-note">
              {user?.role === 'freelancer'
                ? 'Your headline, rate, and skills are visible across the talent marketplace to prospective clients.'
                : 'As a client, your identity and job posts are backed by escrow safe-guarding and verified reviews.'}
            </p>
          </div>
        </div>

        {/* Right Column: Freelancer Editable Profile */}
        {user?.role === 'freelancer' ? (
          <div className="panel profile-edit-form-panel">
            <div className="form-panel-header">
              <h3>Marketplace Profile Settings</h3>
              <p className="muted">Keep your public profile up to date to attract high-value project inquiries.</p>
            </div>

            <form className="form-grid" onSubmit={handleSubmit}>
              <div className="field-group">
                <label htmlFor="title">Professional Headline</label>
                <input
                  id="title"
                  className="input"
                  placeholder="e.g. Senior Full-Stack Engineer | React & Node.js"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  required
                />
              </div>

              <div className="form-row-2col">
                <div className="field-group">
                  <label htmlFor="category">Specialization Domain</label>
                  <select
                    id="category"
                    className="select"
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div className="field-group">
                  <label htmlFor="hourlyRate">Hourly Consultation Rate ($/hr)</label>
                  <input
                    id="hourlyRate"
                    type="number"
                    min="5"
                    max="1000"
                    className="input"
                    value={form.hourlyRate}
                    onChange={(e) => setForm({ ...form, hourlyRate: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="form-row-2col">
                <div className="field-group">
                  <label htmlFor="experience">Years of Experience</label>
                  <input
                    id="experience"
                    className="input"
                    placeholder="e.g. 5+ years"
                    value={form.experience}
                    onChange={(e) => setForm({ ...form, experience: e.target.value })}
                  />
                </div>

                <div className="field-group">
                  <label htmlFor="location">Location / Timezone</label>
                  <input
                    id="location"
                    className="input"
                    placeholder="e.g. London, UK (Remote)"
                    value={form.location}
                    onChange={(e) => setForm({ ...form, location: e.target.value })}
                  />
                </div>
              </div>

              <div className="field-group">
                <label htmlFor="skills">Skills & Tools (Comma separated)</label>
                <input
                  id="skills"
                  className="input"
                  placeholder="React, Node.js, Express, MongoDB, TypeScript, Docker"
                  value={form.skills}
                  onChange={(e) => setForm({ ...form, skills: e.target.value })}
                  required
                />
              </div>

              <div className="field-group">
                <label htmlFor="bio">Professional Bio & Experience Summary</label>
                <textarea
                  id="bio"
                  className="textarea"
                  rows={5}
                  placeholder="Describe your background, core strengths, past projects, and how you help clients deliver results..."
                  value={form.bio}
                  onChange={(e) => setForm({ ...form, bio: e.target.value })}
                  required
                />
              </div>

              {message && (
                <div className={isError ? 'warning' : 'success-banner'}>
                  {message}
                </div>
              )}

              <div className="form-actions-row">
                <button type="submit" className="button primary" disabled={saving}>
                  {saving ? 'Saving Changes...' : 'Save Profile Changes'}
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="panel client-info-panel">
            <h3>Client Management Hub</h3>
            <p className="muted">As a client, you can discover freelancers, post project briefs, and manage milestones.</p>
            <div className="client-actions-grid">
              <Link to="/freelancers" className="quick-action-card">
                <User size={20} className="accent-icon" />
                <h4>Discover Talent</h4>
                <p>Browse qualified freelancers, review portfolios, and send direct messages.</p>
              </Link>
              <Link to="/gigs/create" className="quick-action-card">
                <Briefcase size={20} className="success-icon" />
                <h4>Post a Project Brief</h4>
                <p>Publish a new gig with milestone scopes and receive competitive proposals.</p>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
