import { useEffect, useState } from 'react';
import { ArrowLeft, BriefcaseBusiness, CalendarRange, CheckCircle2, IndianRupee, MessageSquareText } from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { bidService } from '../services/bidService';
import { gigService } from '../services/gigService';

const formatCurrency = (amount) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount || 0);

const GigDetailPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [gig, setGig] = useState(null);
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bidForm, setBidForm] = useState({ amount: '', proposal: '', deliveryTime: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchGig = async () => {
    try {
      const response = await gigService.getGigById(id);
      const loadedGig = response?.data?.gig;
      setGig(loadedGig);

      const bidResponse = await bidService.getBids({ gig: id });
      setBids(bidResponse?.data?.bids || []);
    } catch (err) {
      console.error('Failed to load gig detail:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGig();
  }, [id]);

  const submitBid = async (event) => {
    event.preventDefault();
    if (!user || user.role !== 'freelancer') {
      setError('Only freelancers may submit bids.');
      return;
    }

    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      await bidService.createBid({
        gig: id,
        amount: Number(bidForm.amount),
        proposal: bidForm.proposal,
        deliveryTime: Number(bidForm.deliveryTime)
      });
      setSuccess('Your bid was submitted successfully.');
      setBidForm({ amount: '', proposal: '', deliveryTime: '' });
      fetchGig();
    } catch (err) {
      setError(err?.response?.data?.message || 'Unable to submit bid.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleBidAction = async (bidId, status) => {
    try {
      await bidService.updateBid(bidId, { status });
      fetchGig();
    } catch (err) {
      console.error('Failed to update bid status:', err);
    }
  };

  if (loading) {
    return <div className="page-shell"><div className="loader">Loading gig details...</div></div>;
  }

  if (!gig) {
    return <div className="page-shell"><div className="empty-state"><h3>Gig not found</h3><Link to="/gigs" className="button secondary">Back to marketplace</Link></div></div>;
  }

  const isClientOwner = user && (gig.client?._id === user._id || gig.client === user._id || gig.client?.id === user.id);
  const hasBidAccess = !!user && (user.role === 'freelancer' || user.role === 'client' || user.role === 'admin');

  return (
    <div className="page-shell">
      <button className="button secondary tiny" onClick={() => navigate('/gigs')}> <ArrowLeft size={16} /> Back to gigs</button>

      <div className="detail-shell" style={{ marginTop: '22px' }}>
        <div className="panel">
          <div className="detail-header">
            <div>
              <span className="eyebrow">{gig.category}</span>
              <h2>{gig.title}</h2>
            </div>
            <span className="chip status-chip">{gig.status}</span>
          </div>

          <p>{gig.description}</p>

          <ul className="detail-list">
            <li><span>Budget</span><strong>{formatCurrency(gig.budget)}</strong></li>
            <li><span>Deadline</span><strong>{gig.deadline ? new Date(gig.deadline).toLocaleDateString() : 'Flexible'}</strong></li>
            <li><span>Client</span><strong>{gig.client?.name || 'Client'}</strong></li>
            <li><span>Skills</span><strong>{(gig.skills || []).join(', ') || 'Not specified'}</strong></li>
          </ul>

          {hasBidAccess && (
            <div className="action-row">
              {user?.role === 'client' && isClientOwner && <Link className="button secondary" to="/gigs/create">Create another gig</Link>}
              {user?.role === 'freelancer' && <span className="tag">Freelancer access enabled</span>}
            </div>
          )}
        </div>

        <div className="panel">
          <h3>Project summary</h3>
          <div className="detail-list">
            <li><span>Status</span><strong>{gig.status}</strong></li>
            <li><span>Client contact</span><strong>{gig.client?.email || 'Private'}</strong></li>
            <li><span>Escrow</span><strong>Simulated milestone funding</strong></li>
          </div>

          {user && user.role === 'freelancer' && !isClientOwner && (
            <form className="form-grid" onSubmit={submitBid}>
              <div className="field-group">
                <label>Bid amount</label>
                <input className="input" type="number" value={bidForm.amount} onChange={(e) => setBidForm({ ...bidForm, amount: e.target.value })} placeholder="₹7000" required />
              </div>
              <div className="field-group">
                <label>Delivery time (days)</label>
                <input className="input" type="number" value={bidForm.deliveryTime} onChange={(e) => setBidForm({ ...bidForm, deliveryTime: e.target.value })} placeholder="7" required />
              </div>
              <div className="field-group">
                <label>Proposal</label>
                <textarea className="textarea" value={bidForm.proposal} onChange={(e) => setBidForm({ ...bidForm, proposal: e.target.value })} placeholder="Share your approach and experience..." required />
              </div>

              {error && <div className="warning">{error}</div>}
              {success && <div className="warning" style={{ color: '#8ccf9b' }}>{success}</div>}

              <button className="button primary" type="submit" disabled={submitting}> {submitting ? 'Submitting...' : 'Submit bid'} </button>
            </form>
          )}
        </div>
      </div>

      <div className="section">
        <div className="section-heading">
          <div>
            <span className="eyebrow">Bids</span>
            <h3>Current proposals</h3>
          </div>
        </div>

        {bids.length ? (
          <div className="bid-list">
            {bids.map((bid) => (
              <div className="bid-card" key={bid._id}>
                <div className="bid-card-header">
                  <div>
                    <strong>{bid.freelancer?.name || 'Freelancer'}</strong>
                    <div className="muted">Delivery in {bid.deliveryTime} days</div>
                  </div>
                  <span className="chip status-chip">{bid.status}</span>
                </div>
                <p>{bid.proposal}</p>
                <div className="detail-header">
                  <strong>{formatCurrency(bid.amount)}</strong>
                  {user && isClientOwner && bid.status === 'pending' && (
                    <div className="action-row">
                      <button className="button primary tiny" onClick={() => handleBidAction(bid._id, 'accepted')}>Accept</button>
                      <button className="button secondary tiny" onClick={() => handleBidAction(bid._id, 'rejected')}>Reject</button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state"><h3>No bids yet</h3><p>Be the first freelancer to submit a proposal for this gig.</p></div>
        )}
      </div>
    </div>
  );
};

export default GigDetailPage;
