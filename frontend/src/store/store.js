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
