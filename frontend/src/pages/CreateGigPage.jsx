import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { gigService } from '../services/gigService';

const initialState = {
  title: '',
  description: '',
  budget: '',
  category: '',
  skills: '',
  deadline: ''
};

const CreateGigPage = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState(initialState);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      const payload = {
        ...form,
        budget: Number(form.budget),
        skills: form.skills.split(',').map((item) => item.trim()).filter(Boolean)
      };

      const response = await gigService.createGig(payload);
      const gigId = response?.data?.gig?._id;
      navigate(`/gigs/${gigId}`);
    } catch (err) {
      setError(err?.response?.data?.message || 'Unable to create this gig.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-shell">
      <div className="auth-card">
        <span className="eyebrow">Create gig</span>
        <h1>Publish a new project</h1>

        <form className="form-grid" onSubmit={handleSubmit}>
          <div className="field-group">
            <label htmlFor="title">Project title</label>
            <input className="input" id="title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Build a marketing landing page" required />
          </div>

          <div className="field-group">
            <label htmlFor="category">Category</label>
            <input className="input" id="category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="Web Development" required />
          </div>

          <div className="field-group">
            <label htmlFor="budget">Budget</label>
            <input className="input" id="budget" type="number" value={form.budget} onChange={(e) => setForm({ ...form, budget: e.target.value })} placeholder="20000" required />
          </div>

          <div className="field-group">
            <label htmlFor="deadline">Deadline</label>
            <input className="input" id="deadline" type="date" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} />
          </div>

          <div className="field-group">
            <label htmlFor="skills">Required skills</label>
            <input className="input" id="skills" value={form.skills} onChange={(e) => setForm({ ...form, skills: e.target.value })} placeholder="React, Node.js, MongoDB" />
          </div>

          <div className="field-group">
            <label htmlFor="description">Project description</label>
            <textarea className="textarea" id="description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Describe the project scope, goals, deliverables, and what success looks like." required />
          </div>

          {error && <div className="warning">{error}</div>}

          <button type="submit" className="button primary" disabled={loading}>{loading ? 'Publishing...' : 'Publish gig'}</button>
        </form>
      </div>
    </div>
  );
};

export default CreateGigPage;
