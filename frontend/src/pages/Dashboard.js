import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  fetchMyApplications,
  updateApplicationStatus,
  fetchJobApplications,
} from "../redux/slices/applicationSlice";
import { fetchMyJobs, createJob, deleteJob } from "../redux/slices/jobSlice";
import { updateProfile } from "../redux/slices/authSlice";
import axios from "axios";
import { toast } from "react-toastify";

const Dashboard = () => {
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const { myApplications } = useSelector((state) => state.applications);
  const { myJobs } = useSelector((state) => state.jobs);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [tab, setTab] = useState("overview");
  const [jobForm, setJobForm] = useState({
    title: "",
    company: "",
    location: "",
    type: "Full-time",
    salary: "",
    description: "",
    skills: "",
    experience: "",
    deadline: "",
  });
  const [profileForm, setProfileForm] = useState({
    name: user?.name || "",
    phone: "",
    location: "",
    skills: "",
    company: "",
  });
  const [selectedJobId, setSelectedJobId] = useState(null);
  const { jobApplications } = useSelector((state) => state.applications);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    if (user?.role === "jobseeker") dispatch(fetchMyApplications());
    if (user?.role === "recruiter") dispatch(fetchMyJobs());
    setProfileForm({
      name: user?.name || "",
      phone: user?.phone || "",
      location: user?.location || "",
      skills: user?.skills?.join(", ") || "",
      company: user?.company || "",
    });
  }, [isAuthenticated, user, dispatch, navigate]);

  const handlePostJob = async (e) => {
    e.preventDefault();
    const data = {
      ...jobForm,
      skills: jobForm.skills.split(",").map((s) => s.trim()),
    };
    const result = await dispatch(createJob(data));
    if (!result.error) {
      toast.success("Job posted!");
      setJobForm({
        title: "",
        company: "",
        location: "",
        type: "Full-time",
        salary: "",
        description: "",
        skills: "",
        experience: "",
        deadline: "",
      });
      setTab("myjobs");
    } else toast.error(result.payload);
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    const data = {
      ...profileForm,
      skills: profileForm.skills.split(",").map((s) => s.trim()),
    };
    const result = await dispatch(updateProfile(data));
    if (!result.error) toast.success("Profile updated!");
  };

  const handleResumeUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("resume", file);
    try {
      await axios.post("/api/resume/upload", formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "multipart/form-data",
        },
      });
      toast.success("Resume uploaded!");
    } catch {
      toast.error("Upload failed");
    }
  };

  const handleViewApplicants = (jobId) => {
    setSelectedJobId(jobId);
    dispatch(fetchJobApplications(jobId));
    setTab("applicants");
  };

  const statusColors = {
    Applied: "primary",
    Reviewed: "warning",
    Shortlisted: "success",
    Rejected: "danger",
    Hired: "success",
  };

  const sidebarItems =
    user?.role === "jobseeker"
      ? [
          { key: "overview", icon: "grid", label: "Overview" },
          { key: "applications", icon: "file-text", label: "My Applications" },
          { key: "resume", icon: "file-earmark-person", label: "Resume" },
          { key: "profile", icon: "person-gear", label: "Profile" },
        ]
      : [
          { key: "overview", icon: "grid", label: "Overview" },
          { key: "postjob", icon: "plus-circle", label: "Post a Job" },
          { key: "myjobs", icon: "briefcase", label: "My Jobs" },
          { key: "applicants", icon: "people", label: "Applicants" },
          { key: "profile", icon: "person-gear", label: "Profile" },
        ];

  return (
    <div className="container py-5">
      <div className="row">
        {/* Sidebar */}
        <div className="col-12 col-md-3 mb-4">
          <div className="sidebar">
            <div className="text-center p-3 border-bottom">
              <div
                className="bg-primary text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-2"
                style={{ width: 50, height: 50, fontSize: 20 }}
              >
                {user?.name?.[0]?.toUpperCase()}
              </div>
              <div className="fw-semibold small">{user?.name}</div>
              <div className="badge bg-primary bg-opacity-10 text-primary mt-1">
                {user?.role}
              </div>
            </div>
            <nav className="nav flex-column mt-2">
              {sidebarItems.map((item) => (
                <button
                  key={item.key}
                  className={`nav-link text-start ${tab === item.key ? "active" : ""}`}
                  onClick={() => setTab(item.key)}
                >
                  <i className={`bi bi-${item.icon}`}></i> {item.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Content */}
        <div className="col-12 col-md-9">
          {/* OVERVIEW */}
          {tab === "overview" && (
            <div>
              <h4 className="fw-bold mb-4">Welcome, {user?.name}! 👋</h4>
              <div className="row g-3">
                {user?.role === "jobseeker" ? (
                  <>
                    <div className="col-6 col-md-4">
                      <div className="card border-0 shadow-sm p-3 text-center">
                        <h3 className="text-primary fw-bold">
                          {myApplications.length}
                        </h3>
                        <small>Applications</small>
                      </div>
                    </div>
                    <div className="col-6 col-md-4">
                      <div className="card border-0 shadow-sm p-3 text-center">
                        <h3 className="text-success fw-bold">
                          {
                            myApplications.filter(
                              (a) => a.status === "Shortlisted",
                            ).length
                          }
                        </h3>
                        <small>Shortlisted</small>
                      </div>
                    </div>
                    <div className="col-6 col-md-4">
                      <div className="card border-0 shadow-sm p-3 text-center">
                        <h3 className="text-warning fw-bold">
                          {
                            myApplications.filter((a) => a.status === "Hired")
                              .length
                          }
                        </h3>
                        <small>Hired</small>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="col-6 col-md-4">
                      <div className="card border-0 shadow-sm p-3 text-center">
                        <h3 className="text-primary fw-bold">
                          {myJobs.length}
                        </h3>
                        <small>Jobs Posted</small>
                      </div>
                    </div>
                    <div className="col-6 col-md-4">
                      <div className="card border-0 shadow-sm p-3 text-center">
                        <h3 className="text-success fw-bold">
                          {myJobs.filter((j) => j.isActive).length}
                        </h3>
                        <small>Active Jobs</small>
                      </div>
                    </div>
                    <div className="col-6 col-md-4">
                      <div className="card border-0 shadow-sm p-3 text-center">
                        <h3 className="text-warning fw-bold">
                          {myJobs.reduce(
                            (s, j) => s + (j.applicants?.length || 0),
                            0,
                          )}
                        </h3>
                        <small>Total Applicants</small>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* MY APPLICATIONS */}
          {tab === "applications" && (
            <div>
              <h4 className="fw-bold mb-4">My Applications</h4>
              {myApplications.length === 0 ? (
                <div className="text-center text-muted py-5">
                  <i className="bi bi-inbox fs-1 d-block mb-2"></i>
                  No applications yet.{" "}
                  <button
                    className="btn btn-link p-0"
                    onClick={() => navigate("/jobs")}
                  >
                    Browse jobs
                  </button>
                </div>
              ) : (
                myApplications.map((app) => (
                  <div
                    key={app._id}
                    className="card border-0 shadow-sm p-3 mb-3"
                  >
                    <div className="d-flex justify-content-between align-items-start">
                      <div>
                        <h6 className="fw-semibold mb-1">{app.job?.title}</h6>
                        <p className="text-muted small mb-1">
                          {app.job?.company} • {app.job?.location}
                        </p>
                        <small className="text-muted">
                          Applied:{" "}
                          {new Date(app.appliedAt).toLocaleDateString()}
                        </small>
                      </div>
                      <span className={`badge status-${app.status}`}>
                        {app.status}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* RESUME */}
          {tab === "resume" && (
            <div>
              <h4 className="fw-bold mb-4">Resume Management</h4>
              <div className="card border-0 shadow-sm p-4">
                {user?.resume ? (
                  <div className="alert alert-success">
                    <i className="bi bi-file-earmark-check me-2"></i>
                    Resume uploaded!
                    <a
                      href={`https://job-portal-website-p5s9.onrender.com${user.resume}`}
                      target="_blank"
                      rel="noreferrer"
                      className="ms-2"
                    >
                      View Resume
                    </a>
                  </div>
                ) : (
                  <div className="alert alert-warning">
                    <i className="bi bi-exclamation-circle me-2"></i>
                    No resume uploaded yet.
                  </div>
                )}
                <label className="form-label fw-semibold">
                  Upload Resume (PDF, DOC, DOCX — max 5MB)
                </label>
                <input
                  type="file"
                  className="form-control"
                  accept=".pdf,.doc,.docx"
                  onChange={handleResumeUpload}
                />
              </div>
            </div>
          )}

          {/* POST JOB */}
          {tab === "postjob" && (
            <div>
              <h4 className="fw-bold mb-4">Post a New Job</h4>
              <div className="card border-0 shadow-sm p-4">
                <form onSubmit={handlePostJob}>
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">
                        Job Title *
                      </label>
                      <input
                        className="form-control"
                        placeholder="e.g. React Developer"
                        value={jobForm.title}
                        onChange={(e) =>
                          setJobForm({ ...jobForm, title: e.target.value })
                        }
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">
                        Company *
                      </label>
                      <input
                        className="form-control"
                        placeholder="Company name"
                        value={jobForm.company}
                        onChange={(e) =>
                          setJobForm({ ...jobForm, company: e.target.value })
                        }
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">
                        Location *
                      </label>
                      <input
                        className="form-control"
                        placeholder="Chennai, Tamil Nadu"
                        value={jobForm.location}
                        onChange={(e) =>
                          setJobForm({ ...jobForm, location: e.target.value })
                        }
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">
                        Job Type *
                      </label>
                      <select
                        className="form-select"
                        value={jobForm.type}
                        onChange={(e) =>
                          setJobForm({ ...jobForm, type: e.target.value })
                        }
                      >
                        {[
                          "Full-time",
                          "Part-time",
                          "Remote",
                          "Internship",
                          "Contract",
                        ].map((t) => (
                          <option key={t}>{t}</option>
                        ))}
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Salary</label>
                      <input
                        className="form-control"
                        placeholder="e.g. 5-8 LPA"
                        value={jobForm.salary}
                        onChange={(e) =>
                          setJobForm({ ...jobForm, salary: e.target.value })
                        }
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">
                        Experience
                      </label>
                      <input
                        className="form-control"
                        placeholder="e.g. 2-3 years"
                        value={jobForm.experience}
                        onChange={(e) =>
                          setJobForm({ ...jobForm, experience: e.target.value })
                        }
                      />
                    </div>
                    <div className="col-12">
                      <label className="form-label fw-semibold">
                        Skills (comma separated)
                      </label>
                      <input
                        className="form-control"
                        placeholder="React, Node.js, MongoDB"
                        value={jobForm.skills}
                        onChange={(e) =>
                          setJobForm({ ...jobForm, skills: e.target.value })
                        }
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">
                        Application Deadline
                      </label>
                      <input
                        type="date"
                        className="form-control"
                        value={jobForm.deadline}
                        onChange={(e) =>
                          setJobForm({ ...jobForm, deadline: e.target.value })
                        }
                      />
                    </div>
                    <div className="col-12">
                      <label className="form-label fw-semibold">
                        Job Description *
                      </label>
                      <textarea
                        className="form-control"
                        rows="5"
                        placeholder="Describe the role..."
                        value={jobForm.description}
                        onChange={(e) =>
                          setJobForm({
                            ...jobForm,
                            description: e.target.value,
                          })
                        }
                        required
                      ></textarea>
                    </div>
                    <div className="col-12">
                      <button type="submit" className="btn btn-primary px-5">
                        Post Job
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* MY JOBS */}
          {tab === "myjobs" && (
            <div>
              <h4 className="fw-bold mb-4">My Posted Jobs</h4>
              {myJobs.length === 0 ? (
                <div className="text-center text-muted py-5">
                  <i className="bi bi-briefcase fs-1 d-block mb-2"></i>
                  No jobs posted.{" "}
                  <button
                    className="btn btn-link p-0"
                    onClick={() => setTab("postjob")}
                  >
                    Post a job
                  </button>
                </div>
              ) : (
                myJobs.map((job) => (
                  <div
                    key={job._id}
                    className="card border-0 shadow-sm p-3 mb-3"
                  >
                    <div className="d-flex justify-content-between align-items-start">
                      <div>
                        <h6 className="fw-semibold mb-1">{job.title}</h6>
                        <p className="text-muted small mb-1">
                          {job.location} • {job.type}
                        </p>
                        <small className="text-muted">
                          {job.applicants?.length || 0} applicants
                        </small>
                      </div>
                      <div className="d-flex gap-2">
                        <button
                          className="btn btn-outline-primary btn-sm"
                          onClick={() => handleViewApplicants(job._id)}
                        >
                          <i className="bi bi-people me-1"></i>Applicants
                        </button>
                        <button
                          className="btn btn-outline-danger btn-sm"
                          onClick={() => dispatch(deleteJob(job._id))}
                        >
                          <i className="bi bi-trash"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* APPLICANTS */}
          {tab === "applicants" && (
            <div>
              <h4 className="fw-bold mb-4">Job Applicants</h4>
              {!selectedJobId ? (
                <p className="text-muted">
                  Select a job from "My Jobs" to see applicants.
                </p>
              ) : jobApplications.length === 0 ? (
                <p className="text-muted">No applicants yet for this job.</p>
              ) : (
                jobApplications.map((app) => (
                  <div
                    key={app._id}
                    className="card border-0 shadow-sm p-3 mb-3"
                  >
                    <div className="d-flex justify-content-between align-items-start">
                      <div>
                        <h6 className="fw-semibold mb-1">
                          {app.applicant?.name}
                        </h6>
                        <p className="text-muted small mb-1">
                          {app.applicant?.email} • {app.applicant?.location}
                        </p>
                        {app.applicant?.skills?.length > 0 && (
                          <div className="d-flex flex-wrap gap-1 mb-2">
                            {app.applicant.skills.map((s) => (
                              <span
                                key={s}
                                className="badge bg-light text-dark border"
                              >
                                {s}
                              </span>
                            ))}
                          </div>
                        )}
                        {app.coverLetter && (
                          <p className="text-muted small fst-italic">
                            "{app.coverLetter}"
                          </p>
                        )}
                      </div>
                      <div>
                        <select
                          className="form-select form-select-sm"
                          value={app.status}
                          onChange={(e) =>
                            dispatch(
                              updateApplicationStatus({
                                id: app._id,
                                status: e.target.value,
                              }),
                            )
                          }
                        >
                          {[
                            "Applied",
                            "Reviewed",
                            "Shortlisted",
                            "Rejected",
                            "Hired",
                          ].map((s) => (
                            <option key={s}>{s}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* PROFILE */}
          {tab === "profile" && (
            <div>
              <h4 className="fw-bold mb-4">Edit Profile</h4>
              <div className="card border-0 shadow-sm p-4">
                <form onSubmit={handleUpdateProfile}>
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">
                        Full Name
                      </label>
                      <input
                        className="form-control"
                        value={profileForm.name}
                        onChange={(e) =>
                          setProfileForm({
                            ...profileForm,
                            name: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Phone</label>
                      <input
                        className="form-control"
                        value={profileForm.phone}
                        onChange={(e) =>
                          setProfileForm({
                            ...profileForm,
                            phone: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Location</label>
                      <input
                        className="form-control"
                        value={profileForm.location}
                        onChange={(e) =>
                          setProfileForm({
                            ...profileForm,
                            location: e.target.value,
                          })
                        }
                      />
                    </div>
                    {user?.role === "recruiter" && (
                      <div className="col-md-6">
                        <label className="form-label fw-semibold">
                          Company
                        </label>
                        <input
                          className="form-control"
                          value={profileForm.company}
                          onChange={(e) =>
                            setProfileForm({
                              ...profileForm,
                              company: e.target.value,
                            })
                          }
                        />
                      </div>
                    )}
                    {user?.role === "jobseeker" && (
                      <div className="col-12">
                        <label className="form-label fw-semibold">
                          Skills (comma separated)
                        </label>
                        <input
                          className="form-control"
                          placeholder="React, Node.js, Python"
                          value={profileForm.skills}
                          onChange={(e) =>
                            setProfileForm({
                              ...profileForm,
                              skills: e.target.value,
                            })
                          }
                        />
                      </div>
                    )}
                    <div className="col-12">
                      <button type="submit" className="btn btn-primary px-4">
                        Save Changes
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
