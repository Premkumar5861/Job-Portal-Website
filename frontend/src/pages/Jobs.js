import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useSearchParams } from "react-router-dom";
import { fetchJobs } from "../redux/slices/jobSlice";
import JobCard from "../components/JobCard";

const Jobs = () => {
  const dispatch = useDispatch();
  const { jobs, total, pages, loading } = useSelector((state) => state.jobs);
  const [searchParams, setSearchParams] = useSearchParams();
  const [filters, setFilters] = useState({
    search: searchParams.get("search") || "",
    location: "",
    type: "",
    page: 1,
  });

  useEffect(() => {
    const params = {};
    if (filters.search) params.search = filters.search;
    if (filters.location) params.location = filters.location;
    if (filters.type) params.type = filters.type;
    params.page = filters.page;
    dispatch(fetchJobs(params));
  }, [dispatch, filters]);

  const handleFilter = (e) => {
    e.preventDefault();
    setFilters((f) => ({ ...f, page: 1 }));
  };

  const jobTypes = [
    "Full-time",
    "Part-time",
    "Remote",
    "Internship",
    "Contract",
  ];

  return (
    <div className="container py-5">
      <h3 className="fw-bold mb-4">
        Browse Jobs <span className="text-muted fs-6">({total} found)</span>
      </h3>
      <div className="row">
        {/* Filters Sidebar */}
        <div className="col-12 col-md-3 mb-4">
          <div className="card border-0 shadow-sm p-3">
            <h6 className="fw-semibold mb-3">
              <i className="bi bi-funnel me-2"></i>Filters
            </h6>
            <form onSubmit={handleFilter}>
              <div className="mb-3">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search jobs..."
                  value={filters.search}
                  onChange={(e) =>
                    setFilters({ ...filters, search: e.target.value })
                  }
                />
              </div>
              <div className="mb-3">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Location..."
                  value={filters.location}
                  onChange={(e) =>
                    setFilters({ ...filters, location: e.target.value })
                  }
                />
              </div>
              <div className="mb-3">
                <select
                  className="form-select"
                  value={filters.type}
                  onChange={(e) =>
                    setFilters({ ...filters, type: e.target.value })
                  }
                >
                  <option value="">All Types</option>
                  {jobTypes.map((t) => (
                    <option key={t}>{t}</option>
                  ))}
                </select>
              </div>
              <button type="submit" className="btn btn-primary w-100 btn-sm">
                Apply Filters
              </button>
              <button
                type="button"
                className="btn btn-light w-100 btn-sm mt-2"
                onClick={() =>
                  setFilters({ search: "", location: "", type: "", page: 1 })
                }
              >
                Clear
              </button>
            </form>
          </div>
        </div>

        {/* Job List */}
        <div className="col-12 col-md-9">
          {loading ? (
            <div className="loading-overlay">
              <div className="spinner-border text-primary"></div>
            </div>
          ) : jobs.length === 0 ? (
            <div className="text-center text-muted py-5">
              <i className="bi bi-search fs-1 d-block mb-2"></i>
              No jobs found. Try different filters.
            </div>
          ) : (
            <>
              {jobs && jobs.length > 0 ? (
                jobs.map((job) => <JobCard key={job._id} job={job} />)
              ) : (
                <div className="text-center text-muted py-5">
                  No jobs found...
                </div>
              )}
              {/* Pagination */}
              {pages > 1 && (
                <div className="d-flex justify-content-center mt-4">
                  <nav>
                    <ul className="pagination">
                      {Array.from({ length: pages }, (_, i) => i + 1).map(
                        (p) => (
                          <li
                            key={p}
                            className={`page-item ${filters.page === p ? "active" : ""}`}
                          >
                            <button
                              className="page-link"
                              onClick={() =>
                                setFilters({ ...filters, page: p })
                              }
                            >
                              {p}
                            </button>
                          </li>
                        ),
                      )}
                    </ul>
                  </nav>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Jobs;
