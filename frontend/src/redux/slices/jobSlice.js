import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API = '/api/jobs';
const getHeaders = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}` });

export const fetchJobs = createAsyncThunk('jobs/fetchAll', async (params = {}) => {
  const query = new URLSearchParams(params).toString();
  const res = await axios.get(`${API}?${query}`);
  return res.data;
});

export const fetchJobById = createAsyncThunk('jobs/fetchOne', async (id) => {
  const res = await axios.get(`${API}/${id}`);
  return res.data;
});

export const createJob = createAsyncThunk('jobs/create', async (data, { rejectWithValue }) => {
  try {
    const res = await axios.post(API, data, { headers: getHeaders() });
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to post job');
  }
});

export const fetchMyJobs = createAsyncThunk('jobs/myJobs', async () => {
  const res = await axios.get(`${API}/recruiter/myjobs`, { headers: getHeaders() });
  return res.data;
});

export const deleteJob = createAsyncThunk('jobs/delete', async (id) => {
  await axios.delete(`${API}/${id}`, { headers: getHeaders() });
  return id;
});

const jobSlice = createSlice({
  name: 'jobs',
  initialState: {
    jobs: [],
    myJobs: [],
    currentJob: null,
    total: 0,
    pages: 1,
    loading: false,
    error: null,
  },
  reducers: {
    clearCurrentJob: (state) => { state.currentJob = null; }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchJobs.pending, (state) => { state.loading = true; })
      .addCase(fetchJobs.fulfilled, (state, action) => {
        state.loading = false;
        state.jobs = action.payload.jobs;
        state.total = action.payload.total;
        state.pages = action.payload.pages;
      })
      .addCase(fetchJobs.rejected, (state) => { state.loading = false; })
      .addCase(fetchJobById.fulfilled, (state, action) => { state.currentJob = action.payload; })
      .addCase(createJob.fulfilled, (state, action) => {
        state.myJobs.unshift(action.payload);
      })
      .addCase(fetchMyJobs.fulfilled, (state, action) => { state.myJobs = action.payload; })
      .addCase(deleteJob.fulfilled, (state, action) => {
        state.myJobs = state.myJobs.filter(j => j._id !== action.payload);
      });
  }
});

export const { clearCurrentJob } = jobSlice.actions;
export default jobSlice.reducer;
