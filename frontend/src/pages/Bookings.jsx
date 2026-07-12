import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { fetchBookings, createBooking, cancelBooking } from "../store/slices/bookingSlice";
import { fetchAssets } from "../store/slices/assetSlice";
import { toast } from "react-toastify";
import { Calendar, Plus, Trash2, Clock } from "lucide-react";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Drawer from "../components/ui/Drawer";
import StatusBadge from "../components/ui/StatusBadge";
import { TableContainer, Table, Thead, Tbody, Tr, Th, Td, EmptyState } from "../components/ui/TableComponents";

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

  const refreshData = () => {
    dispatch(fetchBookings());
    dispatch(fetchAssets({ is_bookable: true }));
  };

  useEffect(() => {
    refreshData();
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
        refreshData();
      })
      .catch((err) => toast.error(err));
  };

  const handleCancel = (bookingId) => {
    if (window.confirm("Are you sure you want to cancel this booking?")) {
      dispatch(cancelBooking(bookingId))
        .unwrap()
        .then(() => {
          toast.success("Booking cancelled");
          refreshData();
        })
        .catch((err) => toast.error(err));
    }
  };

  return (
    <div className="space-y-6 text-text-primary">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">Facility Scheduling</h2>
          <p className="text-xs text-text-muted mt-0.5 font-medium">Book conference rooms, demo vehicles, team devices, or hardware setups</p>
        </div>
        <Button
          onClick={() => setShowAddForm(true)}
          variant="primary"
          size="sm"
          className="flex items-center gap-1.5"
        >
          <Plus className="h-4 w-4" /> Book a Slot
        </Button>
      </div>

      {/* Bookings List */}
      <TableContainer>
        {bookings.length === 0 ? (
          <EmptyState 
            title="No bookings scheduled" 
            description="No staff members have currently reserved shared company infrastructure slots."
            primaryActionLabel="Book a Slot"
            onPrimaryAction={() => setShowAddForm(true)}
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
              {bookings.map((booking) => (
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
                        onClick={() => handleCancel(booking.booking_id)}
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Start Time"
              type="datetime-local"
              required
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
            />

            <Input
              label="End Time"
              type="datetime-local"
              required
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
            />
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
    </div>
  );
}
