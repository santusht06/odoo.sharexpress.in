import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { api } from "../../api/api";

export const sendOTP = createAsyncThunk(
  "auth/sendOTP",
  async (email, { rejectWithValue }) => {
    try {
      const res = await api.post("/auth/sendOTP", { email });
      return res.data;
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

export const verifyOTP = createAsyncThunk(
  "auth/verifyOTP",
  async (data, { rejectWithValue }) => {
    try {
      const res = await api.post("/auth/verifyOTP", data);
      return res.data;
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

export const getCurrentUser = createAsyncThunk(
  "auth/getCurrentUser",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/auth/me");
      return res.data;
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

export const updateUserProfile = createAsyncThunk(
  "auth/updateUserProfile",
  async (name, { rejectWithValue }) => {
    try {
      const res = await api.patch("/auth/update", { name });
      return res.data;
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

export const logoutUser = createAsyncThunk(
  "auth/logout",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.post("/auth/logout");
      return res.data;
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: null,
    loading: false,
    error: null,
    isAuthenticated: false,
    initialized: false,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(sendOTP.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(sendOTP.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(sendOTP.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(verifyOTP.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(verifyOTP.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.isAuthenticated = !!action.payload.user;
      })
      .addCase(verifyOTP.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(getCurrentUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(getCurrentUser.fulfilled, (state, action) => {
        state.loading = false;
        state.initialized = true;
        state.user = action.payload.user;
        state.isAuthenticated = !!action.payload.user;
      })
      .addCase(getCurrentUser.rejected, (state) => {
        state.loading = false;
        state.initialized = true;
        state.user = null;
        state.isAuthenticated = false;
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        if (state.user) {
          state.user.user_name = action.meta.arg;
        }
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.isAuthenticated = false;
      });
  },
});

export const { clearError } = authSlice.actions;
export const authReducer = authSlice.reducer;
