import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { login, clearError } from '../redux/slices/authSlice';
import { toast } from 'react-toastify';

const Login = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, isAuthenticated } = useSelector(state => state.auth);

  useEffect(() => {
    if (isAuthenticated) navigate('/dashboard');
    if (error) { toast.error(error); dispatch(clearError()); }
  }, [isAuthenticated, error, navigate, dispatch]);

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(login(form));
  };

  return (
    <div className="container py-5" style={{ maxWidth: 450 }}>
      <div className="card auth-card p-4">
        <div className="text-center mb-4">
          <i className="bi bi-briefcase-fill text-primary fs-1"></i>
          <h3 className="fw-bold mt-2">Welcome Back</h3>
          <p className="text-muted">Login to your account</p>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label fw-semibold">Email</label>
            <input
              type="email"
              className="form-control"
              placeholder="you@email.com"
              value={form.email}
              onChange={e => setForm({...form, email: e.target.value})}
              required
            />
          </div>
          <div className="mb-4">
            <label className="form-label fw-semibold">Password</label>
            <input
              type="password"
              className="form-control"
              placeholder="••••••••"
              value={form.password}
              onChange={e => setForm({...form, password: e.target.value})}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary w-100 py-2" disabled={loading}>
            {loading ? <span className="spinner-border spinner-border-sm me-2"></span> : null}
            Login
          </button>
        </form>
        <hr />
        <p className="text-center mb-0">
          Don't have an account? <Link to="/register" className="text-primary">Sign Up</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
