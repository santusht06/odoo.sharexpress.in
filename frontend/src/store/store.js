import { configureStore } from "@reduxjs/toolkit";
import { authReducer } from "./slices/authSlice";
import { departmentReducer } from "./slices/departmentSlice";
import { categoryReducer } from "./slices/categorySlice";
import { employeeReducer } from "./slices/employeeSlice";
import { assetReducer } from "./slices/assetSlice";
import { allocationReducer } from "./slices/allocationSlice";
import { transferReducer } from "./slices/transferSlice";
import { bookingReducer } from "./slices/bookingSlice";
import { maintenanceReducer } from "./slices/maintenanceSlice";
import { auditReducer } from "./slices/auditSlice";
import { notificationReducer } from "./slices/notificationSlice";
import { dashboardReducer } from "./slices/dashboardSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    departments: departmentReducer,
    categories: categoryReducer,
    employees: employeeReducer,
    assets: assetReducer,
    allocations: allocationReducer,
    transfers: transferReducer,
    bookings: bookingReducer,
    maintenance: maintenanceReducer,
    audits: auditReducer,
    notifications: notificationReducer,
    dashboard: dashboardReducer,
  },
});
