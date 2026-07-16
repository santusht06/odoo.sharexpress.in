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

import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { fetchBookings, createBooking, cancelBooking } from "../store/slices/bookingSlice";
import { fetchAssets } from "../store/slices/assetSlice";
import { toast } from "react-toastify";
import { Calendar, Plus, Trash2, Clock, ChevronLeft, ChevronRight, FilterX } from "lucide-react";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Drawer from "../components/ui/Drawer";
import StatusBadge from "../components/ui/StatusBadge";
import ConfirmModal from "../components/ui/ConfirmModal";
import { TableContainer, Table, Thead, Tbody, Tr, Th, Td, EmptyState, TableSkeleton } from "../components/ui/TableComponents";

export default function Bookings() {
  const dispatch = useDispatch();
  const { items: bookings, loading } = useSelector((state) => state.bookings);
  const { items: bookableAssets } = useSelector((state) => state.assets);
  const { user } = useSelector((state) => state.auth);

  const [assetId, setAssetId] = useState("");
  const [bookingDate, setBookingDate] = useState("");
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("10:00");
  const [purpose, setPurpose] = useState("");

  const [showAddForm, setShowAddForm] = useState(false);
  const [showConfirmCancel, setShowConfirmCancel] = useState(false);
  const [bookingToCancel, setBookingToCancel] = useState(null);

  // Calendar States
  const [viewDate, setViewDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);

  const refreshData = () => {
    dispatch(fetchBookings());
    dispatch(fetchAssets({ is_bookable: true }));
  };

  useEffect(() => {
    refreshData();
  }, [dispatch]);

  const getFormattedDate = (dateObj) => {
    const y = dateObj.getFullYear();
    const m = String(dateObj.getMonth() + 1).padStart(2, "0");
    const d = String(dateObj.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  };

  const handleOpenAddForm = () => {
    const yearVal = viewDate.getFullYear();
    const monthVal = viewDate.getMonth();
    const activeDate = selectedDate ? new Date(yearVal, monthVal, selectedDate) : new Date();
    
    setBookingDate(getFormattedDate(activeDate));
    setStartTime("09:00");
    setEndTime("10:00");
    setAssetId("");
    setPurpose("");
    setShowAddForm(true);
  };

  const handleBooking = (e) => {
    e.preventDefault();
    if (!assetId || !bookingDate || !startTime || !endTime) return;

    try {
      const startISO = new Date(`${bookingDate}T${startTime}`).toISOString();
      const endISO = new Date(`${bookingDate}T${endTime}`).toISOString();

      if (new Date(startISO) >= new Date(endISO)) {
        toast.error("End Time must be after Start Time!");
        return;
      }

      dispatch(createBooking({
        asset_id: assetId,
        start_time: startISO,
        end_time: endISO,
        purpose
      })).unwrap()
        .then(() => {
          toast.success("Resource booked successfully!");
          setShowAddForm(false);
          refreshData();
        })
        .catch((err) => toast.error(err));
    } catch (error) {
      toast.error("Invalid Date or Time configuration.");
    }
  };

  const handleCancelClick = (bookingId) => {
    setBookingToCancel(bookingId);
    setShowConfirmCancel(true);
  };

  const executeCancelBooking = () => {
    if (!bookingToCancel) return;
    dispatch(cancelBooking(bookingToCancel))
      .unwrap()
      .then(() => {
        toast.success("Booking cancelled");
        refreshData();
      })
      .catch((err) => toast.error(err));
  };

  // Calendar calculations
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startDayOfWeek = new Date(year, month, 1).getDay();

  const prevMonth = () => {
    setViewDate(new Date(year, month - 1, 1));
    setSelectedDate(null);
  };
  const nextMonth = () => {
    setViewDate(new Date(year, month + 1, 1));
    setSelectedDate(null);
  };

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const getBookingsForDay = (day) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return bookings.filter(b => {
      const bDate = b.start_time.split("T")[0];
      return bDate === dateStr && b.status !== "Cancelled";
    });
  };

  const filteredBookings = selectedDate 
    ? bookings.filter(b => b.start_time.split("T")[0] === `${year}-${String(month + 1).padStart(2, "0")}-${String(selectedDate).padStart(2, "0")}`)
    : bookings;

  const weekdayNames = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
  const daysGrid = [];
  
  // Empty slots for offsets
  for (let i = 0; i < startDayOfWeek; i++) {
    daysGrid.push(<div key={`blank-${i}`} className="h-8 w-8"></div>);
  }

  // Days list
  for (let d = 1; d <= daysInMonth; d++) {
    const dayBookings = getBookingsForDay(d);
    const hasBookings = dayBookings.length > 0;
    const isSelected = selectedDate === d;
    const isToday = new Date().toDateString() === new Date(year, month, d).toDateString();

    daysGrid.push(
      <button
        key={`day-${d}`}
        type="button"
        onClick={() => setSelectedDate(isSelected ? null : d)}
        className={`h-8 w-8 rounded-lg flex flex-col items-center justify-center relative text-xs font-semibold transition-all ${
          isSelected 
            ? "bg-accent-purple text-white shadow-sm" 
            : isToday 
              ? "border border-accent-purple/50 text-accent-purple bg-accent-purple/5" 
              : "hover:bg-bg-secondary text-text-primary"
        }`}
      >
        <span>{d}</span>
        {hasBookings && !isSelected && (
          <span className="absolute bottom-1.5 h-1 w-1 rounded-full bg-accent-purple"></span>
        )}
      </button>
    );
  }

  // Generate 24h intervals for selects
  const generateTimeOptions = () => {
    const options = [];
    for (let h = 0; h < 24; h++) {
      for (let m of ["00", "30"]) {
        const hStr = String(h).padStart(2, "0");
        options.push(`${hStr}:${m}`);
      }
    }
    return options;
  };
  const timeOptions = generateTimeOptions();

  return (
    <div className="space-y-6 text-text-primary">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">Facility Scheduling</h2>
          <p className="text-xs text-text-muted mt-0.5 font-medium">Book conference rooms, demo vehicles, team devices, or hardware setups</p>
        </div>
        <Button
          onClick={handleOpenAddForm}
          variant="primary"
          size="sm"
          className="flex items-center gap-1.5"
        >
          <Plus className="h-4 w-4" /> Book a Slot
        </Button>
      </div>

      {/* Main Split Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Side: Calendar Card */}
        <div className="bg-bg-card border border-border-primary rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-border-primary/50">
            <h3 className="text-xs font-bold uppercase tracking-wider text-text-primary flex items-center gap-1.5">
              <Calendar className="h-4 w-4 text-accent-purple" />
              Calendar View
            </h3>
            <div className="flex items-center gap-1">
              <button 
                onClick={prevMonth} 
                className="p-1 rounded-lg hover:bg-bg-secondary text-text-muted hover:text-text-primary"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="text-[11px] font-bold text-text-primary min-w-[70px] text-center">
                {monthNames[month]} {year}
              </span>
              <button 
                onClick={nextMonth} 
                className="p-1 rounded-lg hover:bg-bg-secondary text-text-muted hover:text-text-primary"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Weekday Names Header */}
          <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-semibold text-text-muted uppercase tracking-wider">
            {weekdayNames.map((name) => (
              <div key={name} className="py-1">{name}</div>
            ))}
          </div>

          {/* Monthly Days Grid */}
          <div className="grid grid-cols-7 gap-1 text-center justify-items-center">
            {daysGrid}
          </div>

          {/* Selected Date Indicator / Reset Filter */}
          {selectedDate && (
            <div className="flex justify-between items-center text-[11px] bg-bg-secondary border border-border-primary rounded-lg px-2.5 py-1.5 text-text-secondary font-medium">
              <span>Showing: {monthNames[month]} {selectedDate}, {year}</span>
              <button 
                onClick={() => setSelectedDate(null)} 
                className="flex items-center gap-1 text-accent-purple hover:underline"
              >
                <FilterX className="h-3 w-3" /> Clear
              </button>
            </div>
          )}
        </div>

        {/* Right Side: Bookings Table (Filtered) */}
        <div className="lg:col-span-2 space-y-4">
          <TableContainer>
            {loading ? (
              <TableSkeleton rows={4} cols={5} />
            ) : filteredBookings.length === 0 ? (
              <EmptyState 
                title={selectedDate ? "No bookings on this day" : "No bookings scheduled"} 
                description="No staff members have currently reserved shared company infrastructure slots."
                primaryActionLabel={selectedDate ? undefined : "Book a Slot"}
                onPrimaryAction={selectedDate ? undefined : handleOpenAddForm}
              />
            ) : (
              <Table>
                <Thead>
                  <Th>Resource</Th>
                  <Th>Location</Th>
                  <Th>Booked By</Th>
                  <Th>Start Time</Th>
                  <Th>End Time</Th>
                  <Th>Status</Th>
                  <Th className="text-right">Actions</Th>
                </Thead>
                <Tbody>
                  {filteredBookings.map((booking) => (
                    <Tr key={booking.booking_id}>
                      <Td className="font-semibold text-text-primary">{booking.asset_name}</Td>
                      <Td className="text-text-secondary">{booking.location}</Td>
                      <Td className="font-medium text-text-secondary">{booking.booked_by_name}</Td>
                      <Td className="text-text-secondary">
                        <div className="flex items-center gap-1.5 font-mono text-[11px]">
                          <Clock className="h-3.5 w-3.5 text-text-muted" />
                          {new Date(booking.start_time).toLocaleString(undefined, { dateStyle: "short", timeStyle: "short" })}
                        </div>
                      </Td>
                      <Td className="text-text-secondary font-mono text-[11px]">
                        {new Date(booking.end_time).toLocaleString(undefined, { dateStyle: "short", timeStyle: "short" })}
                      </Td>
                      <Td>
                        <StatusBadge status={booking.status} />
                      </Td>
                      <Td className="text-right">
                        {booking.status === "Upcoming" && (booking.booked_by === user?.user_id || ["ADMIN", "ASSET_MANAGER"].includes(user?.role)) && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleCancelClick(booking.booking_id)}
                            className="text-status-danger hover:bg-status-danger/10 p-1"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            )}
          </TableContainer>
        </div>
      </div>

      {/* Book a Slot Drawer */}
      <Drawer
        isOpen={showAddForm}
        onClose={() => setShowAddForm(false)}
        title="Reserve Shared Resource"
        subtitle="Provision scheduling locks on shared company assets"
        size="sm"
      >
        <form onSubmit={handleBooking} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-[10px] font-semibold text-text-muted uppercase tracking-wider">Select Shared Resource *</label>
            <select
              required
              value={assetId}
              onChange={(e) => setAssetId(e.target.value)}
              className="w-full bg-bg-secondary border border-border-primary text-xs text-text-primary rounded-lg px-3 py-2.5 focus:border-accent-purple/80 focus:outline-none focus:ring-2 focus:ring-accent-purple/20 transition-all cursor-pointer"
            >
              <option value="">Select Resource</option>
              {bookableAssets.map((asset) => (
                <option key={asset.asset_id} value={asset.asset_id}>
                  {asset.name} ({asset.location || "Default Location"})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
            <div className="sm:col-span-1">
              <Input
                label="Booking Date"
                type="date"
                required
                value={bookingDate}
                onChange={(e) => setBookingDate(e.target.value)}
              />
            </div>
            
            <div>
              <label className="block text-[10px] font-semibold text-text-muted uppercase tracking-wider mb-1.5">Start Time *</label>
              <select
                required
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full bg-bg-secondary border border-border-primary text-xs text-text-primary rounded-lg px-3 py-2.5 focus:border-accent-purple/80 focus:outline-none focus:ring-2 focus:ring-accent-purple/20 transition-all cursor-pointer"
              >
                {timeOptions.map((t) => (
                  <option key={`start-${t}`} value={t}>{t}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-semibold text-text-muted uppercase tracking-wider mb-1.5">End Time *</label>
              <select
                required
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full bg-bg-secondary border border-border-primary text-xs text-text-primary rounded-lg px-3 py-2.5 focus:border-accent-purple/80 focus:outline-none focus:ring-2 focus:ring-accent-purple/20 transition-all cursor-pointer"
              >
                {timeOptions.map((t) => (
                  <option key={`end-${t}`} value={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>

          <Input
            label="Booking Purpose Justification"
            value={purpose}
            onChange={(e) => setPurpose(e.target.value)}
            placeholder="e.g. Weekly Standup Meeting"
          />

          <div className="flex justify-end gap-2 pt-4 border-t border-border-primary">
            <Button variant="secondary" onClick={() => setShowAddForm(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Confirm Booking
            </Button>
          </div>
        </form>
      </Drawer>

      <ConfirmModal
        isOpen={showConfirmCancel}
        onClose={() => {
          setShowConfirmCancel(false);
          setBookingToCancel(null);
        }}
        onConfirm={executeCancelBooking}
        title="Cancel Reservation Booking"
        message="Are you sure you want to cancel this reservation booking? This action cannot be undone."
        confirmText="Cancel Booking"
        cancelText="Go Back"
        variant="danger"
      />
    </div>
  );
}
