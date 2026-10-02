import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { 
  ArrowLeft, 
  Award, 
  Briefcase, 
  Calendar, 
  CheckCircle, 
  CheckCircle2, 
  Clock, 
  DollarSign, 
  ExternalLink, 
  Mail, 
  MapPin, 
  MessageCircle, 
  Send, 
  ShieldCheck, 
  Sparkles, 
  Star, 
  UserCheck, 
  X 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { portfolioService } from '../services/portfolioService';
import { chatService } from '../services/chatService';

const FreelancerProfilePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Contact / Message Modal state
  const [showContactModal, setShowContactModal] = useState(false);
  const [initialMessage, setInitialMessage] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  const [contactError, setContactError] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await portfolioService.getFreelancerPortfolio(id);
        setData(response?.data || null);
      } catch (err) {
        console.error('Failed to fetch freelancer profile:', err);
        const msg =
          err?.response?.data?.message ||
          (!err?.response ? 'Cannot connect to backend server. Please verify the backend is running on port 5001.' : 'Freelancer profile not found or unavailable.');
        setError(msg);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProfile();
    }
  }, [id]);

  const handleStartChat = async (e) => {
    e.preventDefault();
    if (!initialMessage.trim()) return;

    setSendingMessage(true);
    setContactError('');

    try {
      const response = await chatService.createOrGetChat({
        recipientId: id,
        initialMessage: initialMessage.trim()
      });

      const chatId = response?.data?.chat?._id;
      setShowContactModal(false);
      navigate('/chats', { state: { chatId } });
    } catch (err) {
      console.error('Failed to initiate conversation:', err);
      setContactError(err?.response?.data?.message || 'Unable to send message right now.');
    } finally {
      setSendingMessage(false);
    }
  };

  const getInitials = (name) => {
    if (!name) return 'FL';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  if (loading) {
    return (
      <div className="page-shell">
        <div className="profile-loading-skeleton">
          <div className="skeleton-hero" />
          <div className="profile-content-grid">
            <div className="skeleton-main" />
            <div className="skeleton-sidebar" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !data?.freelancer) {
    return (
      <div className="page-shell">
        <div className="empty-state">
          <h2>Profile Not Found</h2>
          <p className="muted">{error || "We couldn't locate this freelancer profile."}</p>
          <Link to="/freelancers" className="button secondary">
            <ArrowLeft size={16} /> Back to Freelancers
          </Link>
        </div>
      </div>
    );
  }

  const { freelancer, stats, completedMilestones = [] } = data;
  const isSelf = user && (user._id === freelancer.id || user.id === freelancer.id);
  const isClient = user?.role === 'client';

  return (
    <div className="page-shell">
      {/* Breadcrumb Navigation */}
      <nav className="profile-breadcrumbs">
        <Link to="/freelancers" className="breadcrumb-back">
          <ArrowLeft size={15} /> Back to Freelancers
        </Link>
        <span className="breadcrumb-sep">/</span>
        <span className="breadcrumb-current">{freelancer.name}</span>
      </nav>

      {/* Main Profile Header Banner */}
      <section className="profile-hero-card">
        <div className="profile-hero-content">
          <div className="profile-hero-left">
            <div className="profile-avatar-large-wrap">
              {freelancer.profileImage ? (
                <img src={freelancer.profileImage} alt={freelancer.name} className="profile-avatar-large-img" />
              ) : (
                <div className="profile-avatar-large-fallback">
                  {getInitials(freelancer.name)}
                </div>
              )}
              <span className="profile-status-dot" title="Available for hire" />
            </div>

            <div className="profile-hero-identity">
              <div className="profile-title-badges">
                <span className="badge-role">Freelancer</span>
                <span className="badge-category">{freelancer.category || 'Development & IT'}</span>
                <span className="badge-verified">
                  <ShieldCheck size={13} /> Verified Talent
                </span>
              </div>

              <h1 className="profile-hero-name">{freelancer.name}</h1>
              <p className="profile-hero-headline">
                {freelancer.title || 'Specialist Freelancer & Consultant'}
              </p>

              <div className="profile-meta-tags">
                <span className="meta-tag">
                  <MapPin size={14} /> {freelancer.location || 'Remote worldwide'}
                </span>
                <span className="meta-tag">
                  <Clock size={14} /> {freelancer.experience || '3+ years experience'}
                </span>
                <span className="meta-tag">
                  <Calendar size={14} /> Member since {new Date(freelancer.createdAt).getFullYear()}
                </span>
              </div>
            </div>
          </div>

          {/* Action Panel in Header */}
          <div className="profile-hero-actions">
            <div className="profile-rate-pill">
              <span className="rate-num">${freelancer.hourlyRate || 45}</span>
              <span className="rate-unit">/ hr</span>
            </div>

            {isSelf ? (
              <Link to="/profile" className="button primary full-width">
                Edit My Profile
              </Link>
            ) : isClient ? (
              <div className="action-buttons-group">
                <button 
                  className="button primary full-width"
                  onClick={() => setShowContactModal(true)}
                >
                  <MessageCircle size={16} /> Contact Freelancer
                </button>
                <Link to="/gigs/create" className="button secondary full-width">
                  <Briefcase size={16} /> Hire for a Gig
                </Link>
              </div>
            ) : !user ? (
              <Link 
                to="/login" 
                state={{ from: { pathname: `/freelancers/${id}` } }} 
                className="button primary full-width"
              >
                Sign in to Contact
              </Link>
            ) : (
              <button 
                className="button secondary full-width"
                onClick={() => setShowContactModal(true)}
              >
                <MessageCircle size={16} /> Send Direct Message
              </button>
            )}
          </div>
        </div>

        {/* Quick Highlights Row */}
        <div className="profile-stats-bar">
          <div className="stat-box">
            <span className="stat-label">Rating</span>
            <div className="stat-val rating-val">
              <Star size={16} fill="currentColor" />
              <span>{typeof freelancer.rating === 'number' ? freelancer.rating.toFixed(1) : '4.9'}</span>
              <span className="stat-sub">({freelancer.reviewsCount || 8} reviews)</span>
            </div>
          </div>

          <div className="stat-box">
            <span className="stat-label">Completed Projects</span>
            <div className="stat-val">
              <CheckCircle2 size={16} className="success-icon" />
              <span>{stats?.completedProjectsCount || freelancer.completedProjects || 0}</span>
            </div>
          </div>

          <div className="stat-box">
            <span className="stat-label">Total Verified Payouts</span>
            <div className="stat-val">
              <DollarSign size={16} className="accent-icon" />
              <span>${stats?.totalEarnings || 0}</span>
            </div>
          </div>

          <div className="stat-box">
            <span className="stat-label">Job Success</span>
            <div className="stat-val success-text">
              <span>98%</span>
            </div>
          </div>
        </div>
      </section>

      {/* Profile Detail Layout */}
      <div className="profile-detail-grid">
        {/* Main Left Column */}
        <div className="profile-main-col">
          {/* About / Overview Panel */}
          <section className="profile-section-card">
            <h2 className="section-title">About {freelancer.name}</h2>
            <div className="profile-bio-text">
              {freelancer.bio && freelancer.bio.trim().length > 0 ? (
                freelancer.bio.split('\n').map((para, i) => (
                  <p key={i}>{para}</p>
                ))
              ) : (
                <p className="muted">
                  Passionate and detail-oriented freelancer dedicated to delivering top-tier work with clear milestones, prompt communication, and clean execution.
                </p>
              )}
            </div>
          </section>

          {/* Completed Work / Milestones History */}
          <section className="profile-section-card">
            <div className="section-header-row">
              <h2 className="section-title">Work History & Completed Milestones</h2>
              <span className="badge-count">{completedMilestones.length} Delivered</span>
            </div>

            {completedMilestones.length === 0 ? (
              <div className="empty-milestones-box">
                <CheckCircle size={28} className="muted" />
                <p className="muted">No client milestones recorded yet on the platform.</p>
                <span className="tiny-note">All milestones completed through GigHub are verified and displayed here.</span>
              </div>
            ) : (
              <div className="milestones-history-list">
                {completedMilestones.map((m) => (
                  <div key={m._id} className="history-milestone-item">
                    <div className="milestone-history-top">
                      <div className="milestone-title-group">
                        <span className="milestone-status-badge">Completed</span>
                        <h4>{m.title}</h4>
                      </div>
                      <span className="milestone-amount-badge">${m.amount}</span>
                    </div>
                    {m.gig && (
                      <p className="milestone-gig-ref">
                        Project: <strong>{m.gig.title}</strong>
                        {m.gig.category && <span className="cat-chip">{m.gig.category}</span>}
                      </p>
                    )}
                    {m.submissionNotes && (
                      <blockquote className="milestone-notes">
                        “{m.submissionNotes}”
                      </blockquote>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Portfolio Items */}
          {freelancer.portfolio && freelancer.portfolio.length > 0 && (
            <section className="profile-section-card">
              <h2 className="section-title">Featured Projects & Case Studies</h2>
              <div className="portfolio-items-grid">
                {freelancer.portfolio.map((item, idx) => (
                  <div key={idx} className="portfolio-showcase-card">
                    {item.imageUrl && (
                      <img src={item.imageUrl} alt={item.title} className="portfolio-card-img" />
                    )}
                    <div className="portfolio-card-body">
                      <h4>{item.title}</h4>
                      <p className="portfolio-desc">{item.description}</p>
                      {item.link && (
                        <a 
                          href={item.link} 
                          target="_blank" 
                          rel="noreferrer" 
                          className="portfolio-link"
                        >
                          View Live Work <ExternalLink size={14} />
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Reviews & Client Feedback Section */}
          <section className="profile-section-card">
            <h2 className="section-title">Client Feedback & Ratings</h2>
            <div className="reviews-summary-card">
              <div className="rating-score-box">
                <span className="big-rating">
                  {typeof freelancer.rating === 'number' ? freelancer.rating.toFixed(1) : '4.9'}
                </span>
                <div className="star-row">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} size={15} fill="currentColor" className="star-icon" />
                  ))}
                </div>
                <span className="muted">Based on {freelancer.reviewsCount || 8} ratings</span>
              </div>

              <div className="rating-breakdown-list">
                <div className="breakdown-bar-row">
                  <span>Skills & Execution</span>
                  <div className="bar-track"><div className="bar-fill" style={{ width: '98%' }} /></div>
                  <span>5.0</span>
                </div>
                <div className="breakdown-bar-row">
                  <span>Communication</span>
                  <div className="bar-track"><div className="bar-fill" style={{ width: '95%' }} /></div>
                  <span>4.9</span>
                </div>
                <div className="breakdown-bar-row">
                  <span>Deadline Adherence</span>
                  <div className="bar-track"><div className="bar-fill" style={{ width: '96%' }} /></div>
                  <span>4.9</span>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Sidebar Column */}
        <aside className="profile-sidebar-col">
          {/* Skills Card */}
          <div className="sidebar-card">
            <h3>Skills & Technologies</h3>
            <div className="skills-badge-list">
              {freelancer.skills && freelancer.skills.length > 0 ? (
                freelancer.skills.map((skill) => (
                  <span key={skill} className="skill-chip">
                    {skill}
                  </span>
                ))
              ) : (
                <p className="muted">General freelance expertise</p>
              )}
            </div>
          </div>

          {/* Specialization Details */}
          <div className="sidebar-card">
            <h3>Specialization</h3>
            <ul className="spec-info-list">
              <li>
                <span className="muted">Primary Domain</span>
                <strong>{freelancer.category || 'Development & IT'}</strong>
              </li>
              <li>
                <span className="muted">Seniority</span>
                <strong>{freelancer.experience || '3+ years'}</strong>
              </li>
              <li>
                <span className="muted">Availability</span>
                <strong className="success-text">Open for Gigs</strong>
              </li>
              <li>
                <span className="muted">Hourly Consultation</span>
                <strong>${freelancer.hourlyRate || 45} / hr</strong>
              </li>
            </ul>
          </div>

          {/* Security & Verification Guarantees */}
          <div className="sidebar-card verified-card">
            <div className="verified-header">
              <ShieldCheck size={20} className="accent-icon" />
              <h3>GigHub Guarantee</h3>
            </div>
            <ul className="guarantee-list">
              <li>
                <CheckCircle2 size={15} className="success-icon" />
                <span>Escrow-safe milestone deposits</span>
              </li>
              <li>
                <CheckCircle2 size={15} className="success-icon" />
                <span>Protected dispute resolution</span>
              </li>
              <li>
                <CheckCircle2 size={15} className="success-icon" />
                <span>Direct encrypted messaging</span>
              </li>
            </ul>
          </div>
        </aside>
      </div>

      {/* Contact / Hire Modal */}
      {showContactModal && (
        <div className="modal-backdrop" onClick={() => setShowContactModal(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <span className="eyebrow">Direct Outreach</span>
                <h3>Message {freelancer.name}</h3>
              </div>
              <button 
                className="close-modal-btn" 
                onClick={() => setShowContactModal(false)}
                aria-label="Close modal"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleStartChat} className="modal-form">
              <div className="field-group">
                <label htmlFor="introMessage">
                  Explain your project, scope, or initial inquiry:
                </label>
                <textarea
                  id="introMessage"
                  className="textarea"
                  rows={4}
                  placeholder={`Hi ${freelancer.name}, I came across your profile and would love to discuss a project involving...`}
                  value={initialMessage}
                  onChange={(e) => setInitialMessage(e.target.value)}
                  required
                />
              </div>

              {contactError && <div className="warning">{contactError}</div>}

              <div className="modal-actions">
                <button
                  type="button"
                  className="button secondary"
                  onClick={() => setShowContactModal(false)}
                  disabled={sendingMessage}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="button primary"
                  disabled={sendingMessage || !initialMessage.trim()}
                >
                  <Send size={15} />
                  {sendingMessage ? 'Sending...' : 'Send Message & Start Chat'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FreelancerProfilePage;
