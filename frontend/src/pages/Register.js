import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { register, clearError } from '../redux/slices/authSlice';
import { toast } from 'react-toastify';

const Register = () => {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'jobseeker', company: '' });
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, isAuthenticated } = useSelector(state => state.auth);

  useEffect(() => {
    if (isAuthenticated) navigate('/dashboard');
    if (error) { toast.error(error); dispatch(clearError()); }
  }, [isAuthenticated, error, navigate, dispatch]);

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(register(form));
  };

  return (
    <div className="container py-5" style={{ maxWidth: 500 }}>
      <div className="card auth-card p-4">
        <div className="text-center mb-4">
          <i className="bi bi-briefcase-fill text-primary fs-1"></i>
          <h3 className="fw-bold mt-2">Create Account</h3>
          <p className="text-muted">Join thousands of job seekers & recruiters</p>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label fw-semibold">I am a...</label>
            <div className="d-flex gap-3">
              <div
                className={`flex-fill p-3 rounded-3 border text-center cursor-pointer ${form.role === 'jobseeker' ? 'border-primary bg-primary bg-opacity-10' : ''}`}
                style={{ cursor: 'pointer' }}
                onClick={() => setForm({...form, role: 'jobseeker'})}
              >
                <i className="bi bi-person-fill fs-4 d-block text-primary"></i>
                <small className="fw-semibold">Job Seeker</small>
              </div>
              <div
                className={`flex-fill p-3 rounded-3 border text-center ${form.role === 'recruiter' ? 'border-primary bg-primary bg-opacity-10' : ''}`}
                style={{ cursor: 'pointer' }}
                onClick={() => setForm({...form, role: 'recruiter'})}
              >
                <i className="bi bi-building fs-4 d-block text-primary"></i>
                <small className="fw-semibold">Recruiter</small>
              </div>
            </div>
          </div>
          <div className="mb-3">
            <label className="form-label fw-semibold">Full Name</label>
            <input type="text" className="form-control" placeholder="John Doe"
              value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
          </div>
          <div className="mb-3">
            <label className="form-label fw-semibold">Email</label>
            <input type="email" className="form-control" placeholder="you@email.com"
              value={form.email} onChange={e => setForm({...form, email: e.target.value})} required />
          </div>
          {form.role === 'recruiter' && (
            <div className="mb-3">
              <label className="form-label fw-semibold">Company Name</label>
              <input type="text" className="form-control" placeholder="Your Company"
                value={form.company} onChange={e => setForm({...form, company: e.target.value})} />
            </div>
          )}
          <div className="mb-4">
            <label className="form-label fw-semibold">Password</label>
            <input type="password" className="form-control" placeholder="Min 6 characters"
              value={form.password} onChange={e => setForm({...form, password: e.target.value})}
              required minLength={6} />
          </div>
          <button type="submit" className="btn btn-primary w-100 py-2" disabled={loading}>
            {loading ? <span className="spinner-border spinner-border-sm me-2"></span> : null}
            Create Account
          </button>
        </form>
        <hr />
        <p className="text-center mb-0">
          Already have an account? <Link to="/login" className="text-primary">Login</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
