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

export const fetchAllocations = createAsyncThunk(
  "allocations/fetchAll",
  async (params = {}, { rejectWithValue }) => {
    try {
      const res = await api.get("/allocations", { params });
      return res.data.allocations;
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

export const allocateAsset = createAsyncThunk(
  "allocations/create",
  async (data, { rejectWithValue, dispatch }) => {
    try {
      const res = await api.post("/allocations", data);
      dispatch(fetchAllocations());
      return res.data.allocation;
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

export const returnAsset = createAsyncThunk(
  "allocations/return",
  async ({ allocationId, data }, { rejectWithValue, dispatch }) => {
    try {
      const res = await api.post(`/allocations/${allocationId}/return`, data);
      dispatch(fetchAllocations());
      return res.data;
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

const allocationSlice = createSlice({
  name: "allocations",
  initialState: {
    items: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllocations.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAllocations.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchAllocations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const allocationReducer = allocationSlice.reducer;
