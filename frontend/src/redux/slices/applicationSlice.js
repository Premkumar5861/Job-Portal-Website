import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API = 'https://job-portal-website-p5s9.onrender.com/api/applications';
const getHeaders = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}` });

export const applyForJob = createAsyncThunk('applications/apply', async (data, { rejectWithValue }) => {
  try {
    const res = await axios.post(API, data, { headers: getHeaders() });
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Application failed');
  }
});

export const fetchMyApplications = createAsyncThunk('applications/fetchMy', async () => {
  const res = await axios.get(`${API}/my`, { headers: getHeaders() });
  return res.data;
});

export const fetchJobApplications = createAsyncThunk('applications/fetchForJob', async (jobId) => {
  const res = await axios.get(`${API}/job/${jobId}`, { headers: getHeaders() });
  return res.data;
});

export const updateApplicationStatus = createAsyncThunk('applications/updateStatus', async ({ id, status }) => {
  const res = await axios.put(`${API}/${id}/status`, { status }, { headers: getHeaders() });
  return res.data;
});

const applicationSlice = createSlice({
  name: 'applications',
  initialState: {
    myApplications: [],
    jobApplications: [],
    loading: false,
    error: null,
    success: null,
  },
  reducers: {
    clearMessages: (state) => { state.error = null; state.success = null; }
  },
  extraReducers: (builder) => {
    builder
      .addCase(applyForJob.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(applyForJob.fulfilled, (state, action) => {
        state.loading = false;
        state.success = 'Application submitted!';
        state.myApplications.unshift(action.payload);
      })
      .addCase(applyForJob.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchMyApplications.fulfilled, (state, action) => {
  state.myApplications = Array.isArray(action.payload) 
    ? action.payload 
    : action.payload.applications || action.payload.data || [];
})
      .addCase(fetchJobApplications.fulfilled, (state, action) => {
  state.jobApplications = Array.isArray(action.payload)
    ? action.payload
    : action.payload.applications || action.payload.data || [];
})
      .addCase(updateApplicationStatus.fulfilled, (state, action) => {
        const idx = state.jobApplications.findIndex(a => a._id === action.payload._id);
        if (idx !== -1) state.jobApplications[idx] = action.payload;
      });
  }
});

export const { clearMessages } = applicationSlice.actions;
export default applicationSlice.reducer;
