import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchJobs } from '../redux/slices/jobSlice';
import JobCard from '../components/JobCard';

const Home = () => {
  const [search, setSearch] = useState('');
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { jobs, loading } = useSelector(state => state.jobs);

  useEffect(() => {
    dispatch(fetchJobs({ limit: 6 }));
  }, [dispatch]);

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(`/jobs?search=${search}`);
  };

  const stats = [
    { icon: 'briefcase-fill', value: '500+', label: 'Jobs Posted' },
    { icon: 'building', value: '100+', label: 'Companies' },
    { icon: 'people-fill', value: '10K+', label: 'Job Seekers' },
    { icon: 'check-circle-fill', value: '2K+', label: 'Hired' },
  ];

  const categories = [
    { icon: 'code-slash', label: 'Software Dev', color: '#e8f4fd' },
    { icon: 'palette-fill', label: 'Design', color: '#fef3e8' },
    { icon: 'graph-up-arrow', label: 'Marketing', color: '#e8fdf0' },
    { icon: 'cash-stack', label: 'Finance', color: '#fde8f4' },
    { icon: 'people-fill', label: 'HR', color: '#f4e8fd' },
    { icon: 'headset', label: 'Support', color: '#e8f9fd' },
  ];

  return (
    <div>
      {/* Hero */}
      <section className="hero-section">
        <div className="container text-center">
          <h1 className="fw-bold display-5 mb-3">Find Your Dream Job Today</h1>
          <p className="lead mb-4 opacity-90">Connect with top companies and kickstart your career</p>
          <form onSubmit={handleSearch}>
            <div className="search-box d-flex mx-auto" style={{ maxWidth: 600 }}>
              <input
                type="text"
                className="form-control border-0 shadow-none"
                placeholder="Search jobs, skills, companies..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
              <button type="submit" className="btn btn-primary rounded-pill px-4">
                <i className="bi bi-search me-1"></i>Search
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-white py-4 border-bottom">
        <div className="container">
          <div className="row text-center">
            {stats.map(s => (
              <div key={s.label} className="col-6 col-md-3">
                <i className={`bi bi-${s.icon} text-primary fs-4`}></i>
                <h4 className="fw-bold mb-0">{s.value}</h4>
                <small className="text-muted">{s.label}</small>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-5">
        <div className="container">
          <h3 className="fw-bold mb-4">Browse by Category</h3>
          <div className="row g-3">
            {categories.map(cat => (
              <div key={cat.label} className="col-6 col-md-4 col-lg-2">
                <div
                  className="p-3 rounded-3 text-center cursor-pointer"
                  style={{ background: cat.color, cursor: 'pointer' }}
                  onClick={() => navigate(`/jobs?search=${cat.label}`)}
                >
                  <i className={`bi bi-${cat.icon} fs-3 mb-2 d-block text-primary`}></i>
                  <small className="fw-semibold">{cat.label}</small>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Recent Jobs */}
      <section className="py-5 bg-light">
        <div className="container">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h3 className="fw-bold mb-0">Recent Jobs</h3>
            <button className="btn btn-outline-primary btn-sm" onClick={() => navigate('/jobs')}>
              View All <i className="bi bi-arrow-right ms-1"></i>
            </button>
          </div>
          {loading ? (
            <div className="loading-overlay"><div className="spinner-border text-primary"></div></div>
          ) : (
            <div className="row">
              {jobs.map(job => (
                <div key={job._id} className="col-12 col-md-6">
                  <JobCard job={job} />
                </div>
              ))}
              {jobs.length === 0 && (
                <div className="text-center text-muted py-5">
                  <i className="bi bi-inbox fs-1 d-block mb-2"></i>
                  No jobs posted yet. Be the first recruiter!
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-5 bg-primary text-white text-center">
        <div className="container">
          <h3 className="fw-bold mb-2">Are you a Recruiter?</h3>
          <p className="mb-4">Post jobs and find the best talent for your company</p>
          <button className="btn btn-light btn-lg px-5" onClick={() => navigate('/register')}>
            Post a Job Now
          </button>
        </div>
      </section>
    </div>
  );
};

export default Home;
