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
