import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { api } from "../../api/api";

export const fetchAuditCycles = createAsyncThunk(
  "audits/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/audits");
      return res.data.cycles;
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

export const createAuditCycle = createAsyncThunk(
  "audits/create",
  async (data, { rejectWithValue, dispatch }) => {
    try {
      const res = await api.post("/audits", data);
      dispatch(fetchAuditCycles());
      return res.data.cycle;
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

export const recordAuditEntry = createAsyncThunk(
  "audits/recordEntry",
  async ({ cycleId, data }, { rejectWithValue }) => {
    try {
      const res = await api.post(`/audits/${cycleId}/entries`, data);
      return res.data;
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

export const fetchDiscrepancyReport = createAsyncThunk(
  "audits/fetchReport",
  async (cycleId, { rejectWithValue }) => {
    try {
      const res = await api.get(`/audits/${cycleId}/report`);
      return res.data;
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

export const closeAuditCycle = createAsyncThunk(
  "audits/close",
  async (cycleId, { rejectWithValue, dispatch }) => {
    try {
      const res = await api.post(`/audits/${cycleId}/close`);
      dispatch(fetchAuditCycles());
      return res.data;
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

const auditSlice = createSlice({
  name: "audits",
  initialState: {
    items: [],
    loading: false,
    error: null,
    currentReport: null,
  },
  reducers: {
    clearCurrentReport: (state) => {
      state.currentReport = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAuditCycles.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAuditCycles.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchAuditCycles.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchDiscrepancyReport.fulfilled, (state, action) => {
        state.currentReport = action.payload;
      });
  },
});

export const { clearCurrentReport } = auditSlice.actions;
export const auditReducer = auditSlice.reducer;
