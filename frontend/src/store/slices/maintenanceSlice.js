/*
 * Copyright 2026 Sharexpress Contributors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { api } from "../../api/api";

export const fetchMaintenanceRequests = createAsyncThunk(
  "maintenance/fetchAll",
  async (params = {}, { rejectWithValue }) => {
    try {
      const res = await api.get("/maintenance", { params });
      return res.data.requests;
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

export const raiseMaintenanceRequest = createAsyncThunk(
  "maintenance/create",
  async (data, { rejectWithValue, dispatch }) => {
    try {
      const res = await api.post("/maintenance", data);
      dispatch(fetchMaintenanceRequests());
      return res.data.maintenance;
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

export const approveMaintenanceRequest = createAsyncThunk(
  "maintenance/approve",
  async (requestId, { rejectWithValue, dispatch }) => {
    try {
      const res = await api.post(`/maintenance/${requestId}/approve`);
      dispatch(fetchMaintenanceRequests());
      return res.data;
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

export const rejectMaintenanceRequest = createAsyncThunk(
  "maintenance/reject",
  async (requestId, { rejectWithValue, dispatch }) => {
    try {
      const res = await api.post(`/maintenance/${requestId}/reject`);
      dispatch(fetchMaintenanceRequests());
      return res.data;
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

export const assignTechnician = createAsyncThunk(
  "maintenance/assign",
  async ({ requestId, data }, { rejectWithValue, dispatch }) => {
    try {
      const res = await api.post(`/maintenance/${requestId}/assign`, data);
      dispatch(fetchMaintenanceRequests());
      return res.data;
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

export const resolveMaintenance = createAsyncThunk(
  "maintenance/resolve",
  async ({ requestId, data }, { rejectWithValue, dispatch }) => {
    try {
      const res = await api.post(`/maintenance/${requestId}/resolve`, data);
      dispatch(fetchMaintenanceRequests());
      return res.data;
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

const maintenanceSlice = createSlice({
  name: "maintenance",
  initialState: {
    items: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchMaintenanceRequests.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchMaintenanceRequests.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchMaintenanceRequests.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const maintenanceReducer = maintenanceSlice.reducer;
