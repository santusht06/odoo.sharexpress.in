import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { api } from "../../api/api";

export const fetchNotifications = createAsyncThunk(
  "notifications/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/notifications");
      return res.data.notifications;
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

export const markNotificationRead = createAsyncThunk(
  "notifications/markRead",
  async (notificationId, { rejectWithValue, dispatch }) => {
    try {
      const res = await api.patch(`/notifications/${notificationId}/read`);
      dispatch(fetchNotifications());
      return res.data;
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

export const markAllNotificationsRead = createAsyncThunk(
  "notifications/markAllRead",
  async (_, { rejectWithValue, dispatch }) => {
    try {
      const res = await api.post("/notifications/read-all");
      dispatch(fetchNotifications());
      return res.data;
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

const notificationSlice = createSlice({
  name: "notifications",
  initialState: {
    items: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const notificationReducer = notificationSlice.reducer;
