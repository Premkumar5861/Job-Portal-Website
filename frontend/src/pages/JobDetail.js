import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchJobById } from '../redux/slices/jobSlice';
import { applyForJob, clearMessages } from '../redux/slices/applicationSlice';
import { toast } from 'react-toastify';

const JobDetail = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { currentJob, loading } = useSelector(state => state.jobs);
  const { user, isAuthenticated } = useSelector(state => state.auth);
  const { loading: applying, error, success } = useSelector(state => state.applications);
  const [coverLetter, setCoverLetter] = useState('');
  const [showModal, setShowModal] = useState(false);

  useEffect(() => { dispatch(fetchJobById(id)); }, [dispatch, id]);

  useEffect(() => {
    if (success) { toast.success(success); dispatch(clearMessages()); setShowModal(false); }
    if (error) { toast.error(error); dispatch(clearMessages()); }
  }, [success, error, dispatch]);

  const handleApply = () => {
    if (!isAuthenticated) { navigate('/login'); return; }
    dispatch(applyForJob({ jobId: id, coverLetter }));
  };

  if (loading || !currentJob) return (
    <div className="loading-overlay"><div className="spinner-border text-primary"></div></div>
  );

  return (
    <div className="container py-5">
      <button className="btn btn-light mb-4" onClick={() => navigate('/jobs')}>
        <i className="bi bi-arrow-left me-2"></i>Back to Jobs
      </button>

      <div className="row">
        <div className="col-12 col-lg-8">
          <div className="card border-0 shadow-sm p-4 mb-4">
            <h2 className="fw-bold">{currentJob.title}</h2>
            <h5 className="text-muted mb-3">{currentJob.company}</h5>
            <div className="d-flex flex-wrap gap-3 mb-3">
              <span><i className="bi bi-geo-alt text-primary me-1"></i>{currentJob.location}</span>
              <span><i className="bi bi-clock text-primary me-1"></i>{currentJob.type}</span>
              {currentJob.salary && <span><i className="bi bi-currency-rupee text-primary me-1"></i>{currentJob.salary}</span>}
              {currentJob.experience && <span><i className="bi bi-briefcase text-primary me-1"></i>{currentJob.experience}</span>}
            </div>
            <div className="d-flex flex-wrap gap-1 mb-4">
              {currentJob.skills?.map(s => (
                <span key={s} className="badge bg-light text-dark border">{s}</span>
              ))}
            </div>

            <h5 className="fw-semibold">Job Description</h5>
            <p className="text-muted">{currentJob.description}</p>

            {currentJob.requirements?.length > 0 && (
              <>
                <h5 className="fw-semibold mt-3">Requirements</h5>
                <ul className="text-muted">
                  {currentJob.requirements.map((r, i) => <li key={i}>{r}</li>)}
                </ul>
              </>
            )}
          </div>
        </div>

        {/* Apply Sidebar */}
        <div className="col-12 col-lg-4">
          <div className="card border-0 shadow-sm p-4 sticky-top" style={{ top: 80 }}>
            <h5 className="fw-semibold mb-3">Apply for this Job</h5>
            {currentJob.deadline && (
              <p className="text-muted small mb-3">
                <i className="bi bi-calendar me-1"></i>
                Deadline: {new Date(currentJob.deadline).toLocaleDateString()}
              </p>
            )}
            <p className="text-muted small mb-3">
              <i className="bi bi-people me-1"></i>
              {currentJob.applicants?.length || 0} people applied
            </p>

            {user?.role === 'jobseeker' && (
              <>
                <div className="mb-3">
                  <label className="form-label fw-semibold small">Cover Letter (optional)</label>
                  <textarea
                    className="form-control"
                    rows="4"
                    placeholder="Why are you a good fit?"
                    value={coverLetter}
                    onChange={e => setCoverLetter(e.target.value)}
                  ></textarea>
                </div>
                <button
                  className="btn btn-primary w-100"
                  onClick={handleApply}
                  disabled={applying}
                >
                  {applying ? <span className="spinner-border spinner-border-sm me-2"></span> : null}
                  Apply Now
                </button>
              </>
            )}
            {!isAuthenticated && (
              <button className="btn btn-primary w-100" onClick={() => navigate('/login')}>
                Login to Apply
              </button>
            )}
            {user?.role === 'recruiter' && (
              <div className="alert alert-info small">Recruiters cannot apply for jobs.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobDetail;
