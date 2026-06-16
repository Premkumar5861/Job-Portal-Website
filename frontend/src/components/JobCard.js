import React from 'react';
import { useNavigate } from 'react-router-dom';

const typeColors = {
  'Full-time': 'primary',
  'Part-time': 'warning',
  'Remote': 'success',
  'Internship': 'info',
  'Contract': 'secondary'
};

const JobCard = ({ job }) => {
  const navigate = useNavigate();

  return (
    <div className="job-card p-4 mb-3" onClick={() => navigate(`/jobs/${job._id}`)}>
      <div className="d-flex justify-content-between align-items-start">
        <div>
          <h5 className="fw-semibold mb-1">{job.title}</h5>
          <p className="text-muted mb-2">
            <i className="bi bi-building me-1"></i>{job.company}
          </p>
          <div className="d-flex flex-wrap gap-2 mb-2">
            <span className="text-muted small">
              <i className="bi bi-geo-alt me-1"></i>{job.location}
            </span>
            {job.salary && (
              <span className="text-muted small">
                <i className="bi bi-currency-rupee me-1"></i>{job.salary}
              </span>
            )}
          </div>
          <div className="d-flex flex-wrap gap-1">
            <span className={`badge bg-${typeColors[job.type] || 'secondary'} badge-type`}>
              {job.type}
            </span>
            {job.skills?.slice(0, 3).map(skill => (
              <span key={skill} className="badge bg-light text-dark border badge-type">{skill}</span>
            ))}
          </div>
        </div>
        <div className="text-end">
          <small className="text-muted d-block mb-2">
            {new Date(job.createdAt).toLocaleDateString()}
          </small>
          <span className="badge bg-light text-primary border border-primary">
            {job.applicants?.length || 0} Applicants
          </span>
        </div>
      </div>
    </div>
  );
};

export default JobCard;
