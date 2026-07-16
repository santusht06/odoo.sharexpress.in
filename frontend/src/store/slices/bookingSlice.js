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

export const fetchBookings = createAsyncThunk(
  "bookings/fetchAll",
  async (params = {}, { rejectWithValue }) => {
    try {
      const res = await api.get("/bookings", { params });
      return res.data.bookings;
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

export const createBooking = createAsyncThunk(
  "bookings/create",
  async (data, { rejectWithValue, dispatch }) => {
    try {
      const res = await api.post("/bookings", data);
      dispatch(fetchBookings());
      return res.data.booking;
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

export const cancelBooking = createAsyncThunk(
  "bookings/cancel",
  async (bookingId, { rejectWithValue, dispatch }) => {
    try {
      const res = await api.patch(`/bookings/${bookingId}/cancel`);
      dispatch(fetchBookings());
      return res.data;
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

export const rescheduleBooking = createAsyncThunk(
  "bookings/reschedule",
  async ({ bookingId, data }, { rejectWithValue, dispatch }) => {
    try {
      const res = await api.patch(`/bookings/${bookingId}/reschedule`, data);
      dispatch(fetchBookings());
      return res.data;
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

const bookingSlice = createSlice({
  name: "bookings",
  initialState: {
    items: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchBookings.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchBookings.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchBookings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const bookingReducer = bookingSlice.reducer;
