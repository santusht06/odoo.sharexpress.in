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

export const fetchCategories = createAsyncThunk(
  "categories/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/categories");
      return res.data.categories;
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

export const createCategory = createAsyncThunk(
  "categories/create",
  async (data, { rejectWithValue, dispatch }) => {
    try {
      const res = await api.post("/categories", data);
      dispatch(fetchCategories());
      return res.data.category;
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

export const updateCategory = createAsyncThunk(
  "categories/update",
  async ({ catId, data }, { rejectWithValue, dispatch }) => {
    try {
      const res = await api.patch(`/categories/${catId}`, data);
      dispatch(fetchCategories());
      return res.data;
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

const categorySlice = createSlice({
  name: "categories",
  initialState: {
    items: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCategories.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const categoryReducer = categorySlice.reducer;
