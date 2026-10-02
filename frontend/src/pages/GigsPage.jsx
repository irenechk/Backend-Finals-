import { useEffect, useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import GigCard from '../components/GigCard';
import EmptyState from '../components/EmptyState';
import { useAuth } from '../context/AuthContext';
import { gigService } from '../services/gigService';

const GigsPage = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [gigs, setGigs] = useState([]);
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    status: 'open',
    minBudget: '',
    maxBudget: ''
  });

  const fetchGigs = async (nextFilters = filters) => {
    setLoading(true);
    try {
      const response = await gigService.getGigs({
        search: nextFilters.search,
        category: nextFilters.category,
        status: nextFilters.status,
        minBudget: nextFilters.minBudget,
        maxBudget: nextFilters.maxBudget
      });
      setGigs(response?.data?.gigs || []);
    } catch (error) {
      console.error('Failed to load gigs:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGigs();
  }, []);

  const categories = useMemo(
    () => [...new Set(gigs.map((gig) => gig.category).filter(Boolean))],
    [gigs]
  );

  const handleSubmit = (event) => {
    event.preventDefault();
    fetchGigs(filters);
  };

  return (
    <div className="page-shell">
      <div className="section-heading">
        <div>
          <span className="eyebrow">Marketplace</span>
          <h2>Explore live gigs</h2>
        </div>
        {user?.role === 'client' && (
          <Link className="button primary" to="/gigs/create">Post a gig</Link>
        )}
      </div>

      <form className="panel" onSubmit={handleSubmit}>
        <div className="filter-row">
          <div className="field-group">
            <label>Search</label>
            <input
              className="input"
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              placeholder="Search by title or description"
            />
          </div>

          <div className="field-group">
            <label>Category</label>
            <select className="select" value={filters.category} onChange={(e) => setFilters({ ...filters, category: e.target.value })}>
              <option value="">All</option>
              {categories.map((category) => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>

          <div className="field-group">
            <label>Status</label>
            <select className="select" value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })}>
              <option value="all">All</option>
              <option value="open">Open</option>
              <option value="in_progress">In progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          <div className="field-group">
            <label>Budget</label>
            <input
              className="input"
              value={filters.minBudget}
              onChange={(e) => setFilters({ ...filters, minBudget: e.target.value })}
              placeholder="Min"
            />
          </div>
        </div>

        <div className="action-row">
          <button className="button primary" type="submit"><Search size={16} /> Search</button>
          <button className="button secondary" type="button" onClick={() => { setFilters({ search:'', category:'', status:'open', minBudget:'', maxBudget:'' }); fetchGigs({ search:'', category:'', status:'open', minBudget:'', maxBudget:'' }); }}>
            Reset
          </button>
        </div>
      </form>

      {loading ? (
        <div className="loader">Loading gigs...</div>
      ) : gigs.length ? (
        <div className="gig-list">
          {gigs.map((gig) => (
            <GigCard key={gig._id} gig={gig} />
          ))}
        </div>
      ) : (
        <EmptyState title="No gigs found" description="Adjust your search filters or come back later for new opportunities." />
      )}
    </div>
  );
};

export default GigsPage;
