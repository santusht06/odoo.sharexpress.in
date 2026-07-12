import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { fetchBookings, createBooking, cancelBooking, rescheduleBooking } from "../store/slices/bookingSlice";
import { fetchAssets } from "../store/slices/assetSlice";
import { toast } from "react-toastify";
import { Calendar, Plus, Trash2, Clock, CheckCircle } from "lucide-react";

export default function Bookings() {
  const dispatch = useDispatch();
  const { items: bookings } = useSelector((state) => state.bookings);
  const { items: bookableAssets } = useSelector((state) => state.assets);
  const { user } = useSelector((state) => state.auth);

  const [assetId, setAssetId] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [purpose, setPurpose] = useState("");

  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    dispatch(fetchBookings());
    // Query only bookable resources
    dispatch(fetchAssets({ is_bookable: true }));
  }, [dispatch]);

  const handleBooking = (e) => {
    e.preventDefault();
    if (!assetId || !startTime || !endTime) return;

    dispatch(createBooking({
      asset_id: assetId,
      start_time: new Date(startTime).toISOString(),
      end_time: new Date(endTime).toISOString(),
      purpose
    })).unwrap()
      .then(() => {
        toast.success("Resource booked successfully!");
        setShowAddForm(false);
        setAssetId("");
        setStartTime("");
        setEndTime("");
        setPurpose("");
      })
      .catch((err) => toast.error(err));
  };

  const handleCancel = (bookingId) => {
    if (window.confirm("Are you sure you want to cancel this booking?")) {
      dispatch(cancelBooking(bookingId))
        .unwrap()
        .then(() => toast.success("Booking cancelled"))
        .catch((err) => toast.error(err));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Resource Scheduling</h2>
          <p className="text-xs text-slate-500 font-semibold mt-1">Book shared facilities, meeting rooms, vehicles, or team labs</p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="btn-primary flex items-center gap-2 py-2 text-xs font-bold cursor-pointer"
        >
          <Plus className="h-4 w-4" /> Book a Slot
        </button>
      </div>

      {showAddForm && (
        <div className="jira-card p-6 bg-white max-w-lg">
          <h3 className="text-xs font-bold text-slate-800 border-b border-slate-100 pb-3 uppercase tracking-wider mb-4">
            Reserve Shared Resource
          </h3>
          <form onSubmit={handleBooking} className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Select Shared Resource *</label>
              <select
                required
                value={assetId}
                onChange={(e) => setAssetId(e.target.value)}
                className="jira-input w-full px-3 py-2 text-xs text-slate-800"
              >
                <option value="">Select Resource</option>
                {bookableAssets.map((asset) => (
                  <option key={asset.asset_id} value={asset.asset_id}>
                    {asset.name} ({asset.location || "Default Location"})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Start Time *</label>
                <input
                  type="datetime-local"
                  required
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="jira-input w-full px-3 py-2 text-xs text-slate-800"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">End Time *</label>
                <input
                  type="datetime-local"
                  required
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="jira-input w-full px-3 py-2 text-xs text-slate-800"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Booking Purpose</label>
              <input
                type="text"
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                className="jira-input w-full px-3 py-2 text-xs text-slate-800"
                placeholder="e.g. Weekly Standup Meeting"
              />
            </div>

            <div className="flex justify-end gap-2 mt-4">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="btn-secondary py-2 text-xs font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button type="submit" className="btn-primary py-2 text-xs font-bold cursor-pointer">
                Confirm Booking
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Bookings List */}
      <div className="jira-card p-6 bg-white">
        <h3 className="text-xs font-bold text-slate-800 border-b border-slate-100 pb-3 uppercase tracking-wider mb-4">
          All Scheduled Bookings
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 font-bold bg-slate-50">
                <th className="py-2.5 px-3">Resource</th>
                <th className="py-2.5 px-3">Location</th>
                <th className="py-2.5 px-3">Booked By</th>
                <th className="py-2.5 px-3">Start Time</th>
                <th className="py-2.5 px-3">End Time</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {bookings.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-4 text-center text-slate-400">No active bookings scheduled</td>
                </tr>
              ) : (
                bookings.map((booking) => (
                  <tr key={booking.booking_id} className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 font-semibold text-slate-800">{booking.asset_name}</td>
                    <td className="py-2.5 px-3 text-slate-500">{booking.location}</td>
                    <td className="py-2.5 px-3 font-medium text-slate-700">{booking.booked_by_name}</td>
                    <td className="py-2.5 px-3 text-slate-600 flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5 text-slate-400" />
                      {new Date(booking.start_time).toLocaleString()}
                    </td>
                    <td className="py-2.5 px-3 text-slate-600">{new Date(booking.end_time).toLocaleString()}</td>
                    <td className="py-2.5 px-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        booking.status === "Upcoming"
                          ? "bg-blue-50 text-blue-700"
                          : booking.status === "Completed"
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-slate-100 text-slate-600"
                      }`}>
                        {booking.status}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      {booking.status === "Upcoming" && (booking.booked_by === user?.user_id || ["ADMIN", "ASSET_MANAGER"].includes(user?.role)) && (
                        <button
                          onClick={() => handleCancel(booking.booking_id)}
                          className="text-red-500 font-bold hover:underline cursor-pointer flex items-center gap-1 ml-auto text-xs"
                        >
                          <Trash2 className="h-3.5 w-3.5" /> Cancel
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
