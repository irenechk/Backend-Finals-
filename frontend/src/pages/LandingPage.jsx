import { ArrowRight, Briefcase, CheckCircle2, MessageSquareText, ShieldCheck, Sparkles, Users } from 'lucide-react';
import { Link } from 'react-router-dom';

const featureCards = [
  { icon: Briefcase, title: 'Post & discover work', description: 'Clients publish projects with clear scopes and budgets, while freelancers find aligned opportunities quickly.' },
  { icon: Users, title: 'Smart collaboration', description: 'Purpose-built communication and milestone flow keep everyone in sync from kickoff to delivery.' },
  { icon: ShieldCheck, title: 'Secure milestones', description: 'Escrow-style milestones make deliverables, approvals, and payment states visible and controlled.' }
];

const processSteps = [
  'Create your profile and choose your role',
  'Explore gigs or publish a client brief',
  'Review bids, approve the right match, and build together',
  'Track milestones, chat live, and resolve issues confidently'
];

const testimonials = [
  { name: 'Aarav S.', role: 'Client', quote: 'GigHub gave us a simple way to manage scopes, communication, and payment checkpoints without adding friction.' },
  { name: 'Nina P.', role: 'Freelancer', quote: 'The bidding flow feels realistic and the milestone progress keeps work organized from draft to delivery.' },
  { name: 'Samir K.', role: 'Product Lead', quote: 'It feels like a mature marketplace product—clear roles, defined escrow flow, and useful collaboration tools.' }
];

const LandingPage = () => {
  return (
    <div className="page-shell">
      <section className="hero">
        <div className="hero-grid">
          <div className="hero-copy">
            <span className="eyebrow">Freelance marketplace</span>
            <h1>Gigs that move your ideas forward.</h1>
            <p>
              GigHub connects ambitious clients with specialist freelancers through transparent project posting,
              competitive bids, milestone-based delivery, and real-time communication.
            </p>
            <div className="hero-actions">
              <Link className="button primary" to="/freelancers">Find Freelancers <ArrowRight size={16} /></Link>
              <Link className="button secondary" to="/register">Post a Project</Link>
            </div>
            <div className="tag-row">
              <span className="tag">Project-based hiring</span>
              <span className="tag">Real-time chat</span>
              <span className="tag">Milestone safe-guarding</span>
            </div>
          </div>

          <div className="hero-card">
            <div className="dashboard-visual">
              <div className="visual-block">
                <div className="visual-row">
                  <span>Active projects</span>
                  <span>Live pipeline</span>
                </div>
                <div className="visual-graph" />
              </div>

              <div className="visual-block">
                <div className="visual-row">
                  <span>Milestone flow</span>
                  <span>Escrow monitored</span>
                </div>
                <div className="tag-row">
                  <span className="tag">Pending</span>
                  <span className="tag">In progress</span>
                  <span className="tag">Approved</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="section-heading">
          <div>
            <span className="eyebrow">How GigHub works</span>
            <h2>Built for smooth freelance delivery</h2>
          </div>
        </div>
        <div className="card-grid">
          {featureCards.map(({ icon: Icon, title, description }) => (
            <div key={title} className="feature-card">
              <div className="icon-wrap"><Icon size={22} /></div>
              <h3>{title}</h3>
              <p>{description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="section-heading">
          <div>
            <span className="eyebrow">For clients</span>
            <h2>Launch projects with clarity</h2>
          </div>
        </div>
        <div className="card-grid">
          {processSteps.map((step) => (
            <div key={step} className="info-card">
              <div className="icon-wrap"><CheckCircle2 size={22} /></div>
              <h3>{step}</h3>
              <p>Clear handoff, efficient collaboration, and visible progress without scattered updates.</p>
            </div>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="section-heading">
          <div>
            <span className="eyebrow">For freelancers</span>
            <h2>Find work that fits your skills</h2>
          </div>
        </div>
        <div className="card-grid">
          <div className="info-card">
            <div className="icon-wrap"><Sparkles size={22} /></div>
            <h3>Discover aligned gigs</h3>
            <p>Browse real opportunities with filters for category, budget, and status, then submit a focused proposal.</p>
          </div>
          <div className="info-card">
            <div className="icon-wrap"><MessageSquareText size={22} /></div>
            <h3>Collaborate without friction</h3>
            <p>Connect directly with clients in message threads tied to each project, including milestone context.</p>
          </div>
          <div className="info-card">
            <div className="icon-wrap"><ShieldCheck size={22} /></div>
            <h3>Track revenue and progress</h3>
            <p>Follow milestone updates, escrow state, and delivery status from first bid to final approval.</p>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="section-heading">
          <div>
            <span className="eyebrow">Reviews</span>
            <h2>Trusted across the project lifecycle</h2>
          </div>
        </div>
        <div className="testimonial-row">
          {testimonials.map((person) => (
            <div key={person.name} className="review-card">
              <p>“{person.quote}”</p>
              <div className="author">
                <div className="avatar">{person.name[0]}</div>
                <div>
                  <strong>{person.name}</strong>
                  <div className="muted">{person.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="cta-box">
          <div>
            <span className="eyebrow">Ready to begin?</span>
            <h3>Let your next project move faster.</h3>
          </div>
          <div className="hero-actions">
            <Link className="button primary" to="/register">Create account</Link>
            <Link className="button secondary" to="/freelancers">Explore marketplace</Link>
          </div>
        </div>
      </section>

      <footer className="footer">
        <div className="brand-link"><span className="brand-mark">G</span><span>GigHub</span></div>
        <span>Professional work, beautifully managed.</span>
      </footer>
    </div>
  );
};

export default LandingPage;
