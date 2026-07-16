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

export const fetchDashboardKpis = createAsyncThunk(
  "dashboard/fetchKpis",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/dashboard/kpis");
      return res.data.kpis;
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

const dashboardSlice = createSlice({
  name: "dashboard",
  initialState: {
    kpis: {
      assets_available: 0,
      assets_allocated: 0,
      maintenance_today: 0,
      maintenance_pending: 0,
      active_bookings: 0,
      pending_transfers: 0,
      upcoming_returns: 0,
      overdue_returns: 0
    },
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboardKpis.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchDashboardKpis.fulfilled, (state, action) => {
        state.loading = false;
        state.kpis = action.payload;
      })
      .addCase(fetchDashboardKpis.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const dashboardReducer = dashboardSlice.reducer;
