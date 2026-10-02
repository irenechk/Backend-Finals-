import { ArrowRight, BriefcaseBusiness, CalendarDays, IndianRupee, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

const formatCurrency = (amount) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount || 0);

const GigCard = ({ gig }) => {
  if (!gig) return null;

  return (
    <div className="gig-card">
      <div className="gig-card-header">
        <div>
          <span className="eyebrow">{gig.category || 'General'}</span>
          <h3>{gig.title}</h3>
        </div>
        <span className="chip status-chip">{gig.status || 'open'}</span>
      </div>

      <p className="gig-description">{gig.description?.slice(0, 140)}{gig.description?.length > 140 ? '...' : ''}</p>

      <div className="meta-grid">
        <div><IndianRupee size={15} /> {formatCurrency(gig.budget)}</div>
        <div><CalendarDays size={15} /> {gig.deadline ? new Date(gig.deadline).toLocaleDateString() : 'Flexible'}</div>
      </div>

      <div className="tag-row">
        {(gig.skills || []).slice(0, 3).map((skill) => (
          <span key={skill} className="tag">{skill}</span>
        ))}
      </div>

      <div className="gig-footer">
        <div className="client-meta">
          <BriefcaseBusiness size={15} />
          <span>{gig.client?.name || 'Client'}</span>
        </div>

        <Link className="inline-link" to={`/gigs/${gig._id}`}>
          View gig <ArrowRight size={16} />
        </Link>
      </div>
    </div>
  );
};

export default GigCard;
