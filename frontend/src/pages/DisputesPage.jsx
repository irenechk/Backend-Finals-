import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { bidService } from '../services/bidService';
import { disputeService } from '../services/disputeService';
import { gigService } from '../services/gigService';

const DisputesPage = () => {
  const { user } = useAuth();
  const [disputes, setDisputes] = useState([]);
  const [gigs, setGigs] = useState([]);
  const [counterparties, setCounterparties] = useState([]);
  const [form, setForm] = useState({ gig: '', against: '', reason: '', description: '' });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const loadData = async () => {
      try {
        const [disputesResponse, gigsResponse] = await Promise.all([
          disputeService.getDisputes(),
          gigService.getGigs()
        ]);

        setDisputes(disputesResponse?.data?.disputes || []);
        const gigsData = gigsResponse?.data?.gigs || [];
        setGigs(gigsData);

        const mappedCounterparties = gigsData
          .filter((gig) => user?.role === 'client' ? (gig.client?._id === user?._id || gig.client?.id === user?.id || gig.client === user?._id) : gig.client?._id !== user?._id && gig.client?.id !== user?.id)
          .map((gig) => ({ value: gig.client?._id || gig.client || '', label: gig.client?.name || 'Client' }));

        setCounterparties(mappedCounterparties.filter((item) => item.value));
      } catch (error) {
        console.error('Failed to load disputes:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user) loadData();
  }, [user]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setMessage('');

    try {
      await disputeService.createDispute(form);
      const disputesResponse = await disputeService.getDisputes();
      setDisputes(disputesResponse?.data?.disputes || []);
      setForm({ gig: '', against: '', reason: '', description: '' });
      setMessage('Dispute submitted successfully.');
    } catch (error) {
      setMessage(error?.response?.data?.message || 'Unable to create dispute.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page-shell">
      <div className="section-heading">
        <div>
          <span className="eyebrow">Disputes</span>
          <h2>Dispute center</h2>
        </div>
      </div>

      <div className="detail-shell">
        <div className="panel">
          <h3>Raise a dispute</h3>
          <form className="form-grid" onSubmit={handleSubmit}>
            <div className="field-group">
              <label>Gig</label>
              <select className="select" value={form.gig} onChange={(e) => setForm({ ...form, gig: e.target.value })} required>
                <option value="">Select a gig</option>
                {gigs.map((gig) => (
                  <option key={gig._id} value={gig._id}>{gig.title}</option>
                ))}
              </select>
            </div>

            <div className="field-group">
              <label>Against</label>
              <select className="select" value={form.against} onChange={(e) => setForm({ ...form, against: e.target.value })} required>
                <option value="">Select a counterparty</option>
                {counterparties.map((person) => (
                  <option key={person.value} value={person.value}>{person.label}</option>
                ))}
              </select>
            </div>

            <div className="field-group">
              <label>Reason</label>
              <input className="input" value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} placeholder="Deadline missed" required />
            </div>

            <div className="field-group">
              <label>Description</label>
              <textarea className="textarea" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Describe the issue" required />
            </div>

            {message && <div className="warning" style={{ color: message.includes('success') ? '#8ccf9b' : '#d9b88a' }}>{message}</div>}

            <button className="button primary" type="submit" disabled={submitting}>{submitting ? 'Submitting...' : 'Submit dispute'}</button>
          </form>
        </div>

        <div className="panel">
          <h3>Recent disputes</h3>
          {loading ? (
            <div className="loader">Loading disputes...</div>
          ) : disputes.length ? (
            <div className="dispute-list">
              {disputes.map((dispute) => (
                <div key={dispute._id} className="dispute-card">
                  <div className="dispute-header">
                    <strong>{dispute.gig?.title || 'Gig dispute'}</strong>
                    <span className="chip status-chip">{dispute.status}</span>
                  </div>
                  <p className="muted">{dispute.reason}</p>
                  <p>{dispute.description}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">No disputes recorded yet.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DisputesPage;
