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

export const fetchAssets = createAsyncThunk(
  "assets/fetchAll",
  async (params = {}, { rejectWithValue }) => {
    try {
      const res = await api.get("/assets", { params });
      return res.data.assets;
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

export const createAsset = createAsyncThunk(
  "assets/create",
  async (data, { rejectWithValue, dispatch }) => {
    try {
      const res = await api.post("/assets", data);
      dispatch(fetchAssets());
      return res.data.asset;
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

export const updateAsset = createAsyncThunk(
  "assets/update",
  async ({ assetId, data }, { rejectWithValue, dispatch }) => {
    try {
      const res = await api.patch(`/assets/${assetId}`, data);
      return res.data;
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

const assetSlice = createSlice({
  name: "assets",
  initialState: {
    items: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAssets.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAssets.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchAssets.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const assetReducer = assetSlice.reducer;
