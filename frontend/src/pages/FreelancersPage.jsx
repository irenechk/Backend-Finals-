import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Briefcase, 
  CheckCircle2, 
  Clock, 
  DollarSign, 
  MapPin, 
  Search, 
  Sparkles, 
  Star, 
  Users, 
  X 
} from 'lucide-react';
import { portfolioService } from '../services/portfolioService';

const CATEGORIES = [
  'All',
  'Development & IT',
  'Design & Creative',
  'Writing & Translation',
  'Data & AI',
  'Sales & Marketing'
];

const FreelancersPage = () => {
  const [freelancers, setFreelancers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filters
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedSkill, setSelectedSkill] = useState('');

  const fetchFreelancers = async () => {
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (search.trim()) params.search = search.trim();
      if (selectedCategory && selectedCategory !== 'All') params.category = selectedCategory;
      if (selectedSkill.trim()) params.skill = selectedSkill.trim();

      const response = await portfolioService.getAllFreelancers(params);
      setFreelancers(response?.data?.freelancers || []);
    } catch (err) {
      console.error('Failed to fetch freelancers:', err);
      const msg =
        err?.response?.data?.message ||
        (!err?.response ? 'Cannot connect to backend server. Please verify the backend is running on port 5001.' : 'Unable to load freelancers. Please try again.');
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchFreelancers();
    }, 250);

    return () => clearTimeout(timer);
  }, [search, selectedCategory, selectedSkill]);

  const clearFilters = () => {
    setSearch('');
    setSelectedCategory('All');
    setSelectedSkill('');
  };

  const getInitials = (name) => {
    if (!name) return 'FL';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <div className="page-shell">
      {/* Marketplace Header */}
      <section className="marketplace-hero">
        <div className="marketplace-header-copy">
          <span className="eyebrow">Talent Directory</span>
          <h1>Hire top freelance specialists</h1>
          <p>
            Discover verified software engineers, product designers, AI specialists, and technical creators ready to build your next project.
          </p>
        </div>

        {/* Search & Filter Bar */}
        <div className="marketplace-controls">
          <div className="search-input-wrap">
            <Search className="search-icon" size={18} />
            <input
              type="text"
              className="search-input"
              placeholder="Search freelancers by name, skill, or keyword..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button 
                className="clear-search-btn" 
                onClick={() => setSearch('')} 
                aria-label="Clear search"
              >
                <X size={15} />
              </button>
            )}
          </div>

          <div className="category-scroll-row">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                className={`filter-pill ${selectedCategory === cat ? 'active' : ''}`}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {selectedSkill && (
          <div className="active-filter-banner">
            <span>Filtered by skill: <strong>{selectedSkill}</strong></span>
            <button className="text-btn" onClick={() => setSelectedSkill('')}>Clear</button>
          </div>
        )}
      </section>

      {/* Main Content Area */}
      <section className="marketplace-list-section">
        <div className="marketplace-results-meta">
          <span>
            {loading ? 'Searching marketplace...' : `Showing ${freelancers.length} talent profiles`}
          </span>
          {(search || selectedCategory !== 'All' || selectedSkill) && (
            <button className="button secondary tiny" onClick={clearFilters}>
              Reset all filters
            </button>
          )}
        </div>

        {loading ? (
          <div className="freelancer-grid">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className="freelancer-card skeleton-card">
                <div className="skeleton-avatar" />
                <div className="skeleton-line" style={{ width: '60%' }} />
                <div className="skeleton-line" style={{ width: '40%' }} />
                <div className="skeleton-line" style={{ width: '90%', height: '36px' }} />
                <div className="skeleton-row" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="empty-state">
            <p className="warning">{error}</p>
            <button className="button secondary" onClick={fetchFreelancers}>Retry</button>
          </div>
        ) : freelancers.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon-wrap">
              <Users size={32} />
            </div>
            <h3>No freelancers found</h3>
            <p className="muted">
              We couldn't find any freelancer profiles matching your criteria. Try adjusting your search keywords or category filters.
            </p>
            <button className="button secondary" onClick={clearFilters}>
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="freelancer-grid">
            {freelancers.map((fl) => (
              <article key={fl.id || fl._id} className="freelancer-card">
                {/* Header: Avatar, Name, Title, Category */}
                <div className="freelancer-card-top">
                  <div className="freelancer-avatar-wrap">
                    {fl.profileImage ? (
                      <img src={fl.profileImage} alt={fl.name} className="freelancer-avatar-img" />
                    ) : (
                      <div className="freelancer-avatar-fallback">
                        {getInitials(fl.name)}
                      </div>
                    )}
                    <span className="online-indicator" title="Available for projects" />
                  </div>

                  <div className="freelancer-info">
                    <div className="freelancer-name-row">
                      <h3 className="freelancer-name">{fl.name}</h3>
                      <span className="badge-role">Freelancer</span>
                    </div>
                    <p className="freelancer-title">{fl.title || 'Specialist Freelancer'}</p>
                    <span className="badge-category">{fl.category || 'Development & IT'}</span>
                  </div>
                </div>

                {/* Key Metrics Row */}
                <div className="freelancer-metrics-row">
                  <div className="metric-item" title="Customer Rating">
                    <Star size={14} className="star-icon" fill="currentColor" />
                    <strong>{typeof fl.rating === 'number' ? fl.rating.toFixed(1) : '4.9'}</strong>
                    <span className="muted">({fl.reviewsCount || 8})</span>
                  </div>

                  <div className="metric-item" title="Hourly Rate">
                    <DollarSign size={14} className="accent-icon" />
                    <strong>${fl.hourlyRate || 45}</strong>
                    <span className="muted">/hr</span>
                  </div>

                  <div className="metric-item" title="Completed Projects">
                    <CheckCircle2 size={14} className="success-icon" />
                    <strong>{fl.completedProjectsCount || 0}</strong>
                    <span className="muted">projects</span>
                  </div>
                </div>

                {/* Bio Snippet */}
                <p className="freelancer-bio-snippet">
                  {fl.bio && fl.bio.trim().length > 0 
                    ? fl.bio 
                    : 'Professional freelancer focused on dependable execution, clear communication, and high-quality deliverables.'}
                </p>

                {/* Skills Cloud */}
                <div className="freelancer-skills-wrap">
                  {(fl.skills && fl.skills.length > 0 ? fl.skills : ['Remote Collaboration', 'Agile Delivery'])
                    .slice(0, 4)
                    .map((skill) => (
                      <button
                        key={skill}
                        type="button"
                        className="skill-pill-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedSkill(skill);
                        }}
                        title={`Filter by ${skill}`}
                      >
                        {skill}
                      </button>
                    ))}
                  {fl.skills && fl.skills.length > 4 && (
                    <span className="skills-more-count">+{fl.skills.length - 4}</span>
                  )}
                </div>

                {/* Location / Meta */}
                <div className="freelancer-meta-row">
                  <div className="freelancer-location">
                    <MapPin size={13} />
                    <span>{fl.location || 'Remote'}</span>
                  </div>
                  <div className="freelancer-experience">
                    <Clock size={13} />
                    <span>{fl.experience || '3+ years exp'}</span>
                  </div>
                </div>

                {/* Footer Action */}
                <div className="freelancer-card-footer">
                  <Link 
                    to={`/freelancers/${fl.id || fl._id}`} 
                    className="button primary full-width"
                  >
                    View Profile
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default FreelancersPage;
