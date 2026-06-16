import React, { useEffect, useState, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

const api = (path, options = {}) => {
  const token = localStorage.getItem('token');
  return axios({ url: path, headers: { Authorization: `Bearer ${token}` }, ...options });
};

const Admin = () => {
  const { user, isAuthenticated } = useSelector(state => state.auth);
  const navigate = useNavigate();
  const [tab, setTab] = useState('dashboard');
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [userSearch, setUserSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'admin') {
      navigate('/login');
    }
  }, [isAuthenticated, user, navigate]);

  const loadStats = useCallback(async () => {
    try {
      const res = await api('/api/admin/stats');
      setStats(res.data);
    } catch { toast.error('Failed to load stats'); }
  }, []);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (userSearch) params.search = userSearch;
      if (roleFilter) params.role = roleFilter;
      const res = await api('/api/admin/users', { params });
      setUsers(res.data.users);
    } catch { toast.error('Failed to load users'); }
    setLoading(false);
  }, [userSearch, roleFilter]);

  const loadJobs = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api('/api/admin/jobs');
      setJobs(res.data);
    } catch { toast.error('Failed to load jobs'); }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (tab === 'dashboard') loadStats();
    if (tab === 'users') loadUsers();
    if (tab === 'jobs') loadJobs();
  }, [tab, loadStats, loadUsers, loadJobs]);

  const handleDeleteUser = async (id, name) => {
    if (!window.confirm(`Delete user "${name}"? This cannot be undone.`)) return;
    try {
      await api(`/api/admin/users/${id}`, { method: 'delete' });
      toast.success('User deleted');
      setUsers(u => u.filter(x => x._id !== id));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    }
  };

  const handleChangeRole = async (id, newRole) => {
    try {
      const res = await api(`/api/admin/users/${id}/role`, { method: 'put', data: { role: newRole } });
      setUsers(u => u.map(x => x._id === id ? res.data : x));
      toast.success('Role updated');
    } catch { toast.error('Role update failed'); }
  };

  const handleDeleteJob = async (id, title) => {
    if (!window.confirm(`Delete job "${title}"?`)) return;
    try {
      await api(`/api/admin/jobs/${id}`, { method: 'delete' });
      toast.success('Job deleted');
      setJobs(j => j.filter(x => x._id !== id));
    } catch { toast.error('Delete failed'); }
  };

  const handleToggleJob = async (id) => {
    try {
      const res = await api(`/api/admin/jobs/${id}/toggle`, { method: 'put' });
      setJobs(j => j.map(x => x._id === id ? res.data : x));
      toast.success(`Job ${res.data.isActive ? 'activated' : 'deactivated'}`);
    } catch { toast.error('Toggle failed'); }
  };

  const roleBadge = (role) => {
    const map = { admin: 'danger', recruiter: 'primary', jobseeker: 'success' };
    return <span className={`badge bg-${map[role] || 'secondary'}`}>{role}</span>;
  };

  const sidebarItems = [
    { key: 'dashboard', icon: 'speedometer2', label: 'Dashboard' },
    { key: 'users', icon: 'people-fill', label: 'Users' },
    { key: 'jobs', icon: 'briefcase-fill', label: 'All Jobs' },
  ];

  return (
    <div className="container-fluid py-4">
      <div className="row">
        {/* Sidebar */}
        <div className="col-12 col-md-2 mb-4">
          <div className="sidebar">
            <div className="text-center p-3 border-bottom">
              <div className="bg-danger text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-1 fw-bold"
                style={{ width: 44, height: 44, fontSize: 18 }}>
                {user?.name?.[0]?.toUpperCase()}
              </div>
              <div className="fw-semibold small">{user?.name}</div>
              <span className="badge bg-danger mt-1">Admin</span>
            </div>
            <nav className="nav flex-column mt-1">
              {sidebarItems.map(item => (
                <button key={item.key}
                  className={`nav-link text-start border-0 bg-transparent ${tab === item.key ? 'active' : ''}`}
                  onClick={() => setTab(item.key)}>
                  <i className={`bi bi-${item.icon}`}></i> {item.label}
                </button>
              ))}
              <hr className="my-1" />
              <button className="nav-link text-start border-0 bg-transparent text-muted"
                onClick={() => navigate('/')}>
                <i className="bi bi-house"></i> Home
              </button>
            </nav>
          </div>
        </div>

        {/* Content */}
        <div className="col-12 col-md-10">

          {/* DASHBOARD STATS */}
          {tab === 'dashboard' && (
            <div>
              <h4 className="fw-bold mb-4">
                <i className="bi bi-speedometer2 me-2 text-danger"></i>Admin Dashboard
              </h4>
              {!stats ? (
                <div className="loading-overlay"><div className="spinner-border text-danger"></div></div>
              ) : (
                <>
                  <div className="row g-3 mb-4">
                    {[
                      { val: stats.totalUsers, label: 'Total Users', color: 'primary', icon: 'people-fill' },
                      { val: stats.jobSeekers, label: 'Job Seekers', color: 'success', icon: 'person-fill' },
                      { val: stats.recruiters, label: 'Recruiters', color: 'warning', icon: 'building' },
                      { val: stats.totalJobs, label: 'Total Jobs', color: 'info', icon: 'briefcase-fill' },
                      { val: stats.totalApplications, label: 'Applications', color: 'danger', icon: 'file-earmark-text-fill' },
                    ].map(s => (
                      <div key={s.label} className="col-6 col-md-4 col-lg-2-4">
                        <div className="card border-0 shadow-sm p-3 text-center">
                          <i className={`bi bi-${s.icon} text-${s.color} fs-3 mb-1`}></i>
                          <h3 className={`fw-bold text-${s.color} mb-0`}>{s.val}</h3>
                          <small className="text-muted">{s.label}</small>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="row g-3">
                    <div className="col-md-6">
                      <div className="card border-0 shadow-sm p-3">
                        <h6 className="fw-semibold mb-3">User Breakdown</h6>
                        <div className="mb-2">
                          <div className="d-flex justify-content-between small mb-1">
                            <span>Job Seekers</span>
                            <span>{stats.jobSeekers} / {stats.totalUsers}</span>
                          </div>
                          <div className="progress" style={{height:8}}>
                            <div className="progress-bar bg-success"
                              style={{width: `${(stats.jobSeekers / stats.totalUsers * 100) || 0}%`}}></div>
                          </div>
                        </div>
                        <div>
                          <div className="d-flex justify-content-between small mb-1">
                            <span>Recruiters</span>
                            <span>{stats.recruiters} / {stats.totalUsers}</span>
                          </div>
                          <div className="progress" style={{height:8}}>
                            <div className="progress-bar bg-warning"
                              style={{width: `${(stats.recruiters / stats.totalUsers * 100) || 0}%`}}></div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="card border-0 shadow-sm p-3 h-100">
                        <h6 className="fw-semibold mb-3">Quick Actions</h6>
                        <div className="d-flex flex-wrap gap-2">
                          <button className="btn btn-sm btn-outline-primary" onClick={() => setTab('users')}>
                            <i className="bi bi-people me-1"></i>Manage Users
                          </button>
                          <button className="btn btn-sm btn-outline-info" onClick={() => setTab('jobs')}>
                            <i className="bi bi-briefcase me-1"></i>Manage Jobs
                          </button>
                          <button className="btn btn-sm btn-outline-secondary" onClick={() => navigate('/jobs')}>
                            <i className="bi bi-eye me-1"></i>View Site
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* USERS */}
          {tab === 'users' && (
            <div>
              <h4 className="fw-bold mb-4">
                <i className="bi bi-people-fill me-2 text-primary"></i>Manage Users ({users.length})
              </h4>

              {/* Filter bar */}
              <div className="card border-0 shadow-sm p-3 mb-4">
                <div className="row g-2 align-items-end">
                  <div className="col-md-5">
                    <input className="form-control" placeholder="Search by name or email..."
                      value={userSearch} onChange={e => setUserSearch(e.target.value)} />
                  </div>
                  <div className="col-md-3">
                    <select className="form-select" value={roleFilter} onChange={e => setRoleFilter(e.target.value)}>
                      <option value="">All Roles</option>
                      <option value="jobseeker">Job Seeker</option>
                      <option value="recruiter">Recruiter</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                  <div className="col-md-2">
                    <button className="btn btn-primary w-100" onClick={loadUsers}>Search</button>
                  </div>
                  <div className="col-md-2">
                    <button className="btn btn-light w-100" onClick={() => { setUserSearch(''); setRoleFilter(''); }}>Clear</button>
                  </div>
                </div>
              </div>

              {loading ? (
                <div className="loading-overlay"><div className="spinner-border text-primary"></div></div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover bg-white rounded shadow-sm overflow-hidden">
                    <thead className="table-light">
                      <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Role</th>
                        <th>Joined</th>
                        <th>Change Role</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.length === 0 ? (
                        <tr><td colSpan="6" className="text-center text-muted py-4">No users found</td></tr>
                      ) : users.map(u => (
                        <tr key={u._id}>
                          <td className="fw-semibold">{u.name}</td>
                          <td className="text-muted small">{u.email}</td>
                          <td>{roleBadge(u.role)}</td>
                          <td className="small text-muted">{new Date(u.createdAt).toLocaleDateString('en-IN')}</td>
                          <td>
                            <select className="form-select form-select-sm" value={u.role}
                              onChange={e => handleChangeRole(u._id, e.target.value)}
                              disabled={u._id === user?._id}>
                              <option value="jobseeker">Job Seeker</option>
                              <option value="recruiter">Recruiter</option>
                              <option value="admin">Admin</option>
                            </select>
                          </td>
                          <td>
                            <button className="btn btn-sm btn-outline-danger"
                              onClick={() => handleDeleteUser(u._id, u.name)}
                              disabled={u._id === user?._id}>
                              <i className="bi bi-trash"></i>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* JOBS */}
          {tab === 'jobs' && (
            <div>
              <h4 className="fw-bold mb-4">
                <i className="bi bi-briefcase-fill me-2 text-info"></i>All Jobs ({jobs.length})
              </h4>

              {loading ? (
                <div className="loading-overlay"><div className="spinner-border text-info"></div></div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover bg-white rounded shadow-sm">
                    <thead className="table-light">
                      <tr>
                        <th>Title</th>
                        <th>Company</th>
                        <th>Posted By</th>
                        <th>Type</th>
                        <th>Applicants</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {jobs.length === 0 ? (
                        <tr><td colSpan="7" className="text-center text-muted py-4">No jobs found</td></tr>
                      ) : jobs.map(job => (
                        <tr key={job._id}>
                          <td className="fw-semibold">{job.title}</td>
                          <td className="text-muted small">{job.company}</td>
                          <td className="small">{job.postedBy?.name || '—'}</td>
                          <td><span className="badge bg-light text-dark border">{job.type}</span></td>
                          <td className="text-center">{job.applicants?.length || 0}</td>
                          <td>
                            <span className={`badge ${job.isActive ? 'bg-success' : 'bg-secondary'}`}>
                              {job.isActive ? 'Active' : 'Closed'}
                            </span>
                          </td>
                          <td>
                            <div className="d-flex gap-1">
                              <button className={`btn btn-sm ${job.isActive ? 'btn-outline-warning' : 'btn-outline-success'}`}
                                onClick={() => handleToggleJob(job._id)}
                                title={job.isActive ? 'Deactivate' : 'Activate'}>
                                <i className={`bi bi-${job.isActive ? 'pause-circle' : 'play-circle'}`}></i>
                              </button>
                              <button className="btn btn-sm btn-outline-danger"
                                onClick={() => handleDeleteJob(job._id, job.title)}>
                                <i className="bi bi-trash"></i>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default Admin;