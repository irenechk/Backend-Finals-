import { useEffect, useState } from 'react';
import { BriefcaseBusiness, CircleDollarSign, FileText, MessageSquareText, ShieldAlert, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import MetricCard from '../components/MetricCard';
import EmptyState from '../components/EmptyState';
import { useAuth } from '../context/AuthContext';
import { bidService } from '../services/bidService';
import { disputeService } from '../services/disputeService';
import { gigService } from '../services/gigService';
import { milestoneService } from '../services/milestoneService';

const DashboardPage = () => {
  const { user } = useAuth();
  const [gigs, setGigs] = useState([]);
  const [bids, setBids] = useState([]);
  const [milestones, setMilestones] = useState([]);
  const [disputes, setDisputes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [gigsResponse, bidsResponse, milestonesResponse, disputesResponse] = await Promise.all([
          gigService.getGigs(),
          bidService.getBids(),
          milestoneService.getMilestones(),
          disputeService.getDisputes()
        ]);

        setGigs(gigsResponse?.data?.gigs || []);
        setBids(bidsResponse?.data?.bids || []);
        setMilestones(milestonesResponse?.data?.milestones || []);
        setDisputes(disputesResponse?.data?.disputes || []);
      } catch (error) {
        console.error('Dashboard load error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const myGigs = gigs.filter((gig) => gig.client?._id === user?._id || gig.client === user?._id || gig.client?.id === user?.id);
  const myBids = bids.filter((bid) => bid.freelancer?._id === user?._id || bid.freelancer === user?._id || bid.freelancer?.id === user?.id);
  const activeProjects = gigs.filter((gig) => gig.status === 'in_progress').length;
  const pendingMilestones = milestones.filter((item) => item.status !== 'completed' && item.status !== 'approved').length;
  const openDisputes = disputes.filter((item) => item.status === 'open' || item.status === 'under_review').length;

  const metrics =
    user?.role === 'client'
      ? [
          { label: 'Active gigs', value: myGigs.length, accent: 'rgba(217,184,138,0.18)', icon: BriefcaseBusiness },
          { label: 'Pending bids', value: bids.filter((bid) => bid.gig?.client === user?._id || bid.gig?.client?._id === user?._id).length, accent: 'rgba(140,207,155,0.16)', icon: FileText },
          { label: 'Active projects', value: activeProjects, accent: 'rgba(217,184,138,0.14)', icon: BriefcaseBusiness },
          { label: 'Open disputes', value: openDisputes, accent: 'rgba(223,125,125,0.14)', icon: ShieldAlert }
        ]
      : [
          { label: 'Available gigs', value: gigs.filter((gig) => gig.status === 'open').length, accent: 'rgba(217,184,138,0.18)', icon: BriefcaseBusiness },
          { label: 'Submitted bids', value: myBids.length, accent: 'rgba(140,207,155,0.16)', icon: FileText },
          { label: 'Active projects', value: myBids.filter((bid) => bid.status === 'accepted').length, accent: 'rgba(217,184,138,0.14)', icon: TrendingUp },
          { label: 'Pending milestones', value: pendingMilestones, accent: 'rgba(223,125,125,0.14)', icon: MessageSquareText }
        ];

  if (loading) {
    return <div className="page-shell"><div className="loader">Loading dashboard...</div></div>;
  }

  return (
    <div className="page-shell">
      <div className="section-heading">
        <div>
          <span className="eyebrow">Dashboard</span>
          <h2>{user?.role === 'client' ? 'Client workspace' : 'Freelancer workspace'}</h2>
        </div>
        <Link className="button primary" to="/gigs">Browse more work</Link>
      </div>

      <div className="metrics-grid">
        {metrics.map((item) => (
          <MetricCard key={item.label} label={item.label} value={item.value} accent={item.accent} icon={item.icon} />
        ))}
      </div>

      <div className="section">
        <div className="section-heading">
          <div>
            <h3>Recent opportunities</h3>
          </div>
        </div>

        {gigs.length ? (
          <div className="gig-list">
            {gigs.slice(0, 4).map((gig) => (
              <div key={gig._id} className="gig-card">
                <div className="gig-card-header">
                  <div>
                    <span className="eyebrow">{gig.category}</span>
                    <h3>{gig.title}</h3>
                  </div>
                  <span className="chip status-chip">{gig.status}</span>
                </div>
                <p className="gig-description">{gig.description?.slice(0, 140)}...</p>
                <div className="meta-grid">
                  <div><CircleDollarSign size={16} /> ₹{gig.budget}</div>
                  <div><BriefcaseBusiness size={16} /> {gig.client?.name || 'Client'}</div>
                </div>
                <div className="action-row">
                  <Link className="button secondary tiny" to={`/gigs/${gig._id}`}>Open gig</Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState title="No gigs yet" description="Your marketplace activity will appear here once data is available." />
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
