import { ManageBooking, Booking } from "@/types";

interface RefundedTabProps {
  booking: Booking;
  record: ManageBooking;
}

export default function RefundedTab({ booking, record }: RefundedTabProps) {
  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-xl border border-green-200 bg-green-50 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 border border-green-200">
            <span className="material-symbols-outlined text-green-600">check_circle</span>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-green-900">Refund Completed</h3>
            <p className="text-sm text-green-700">This booking has been successfully refunded.</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="bg-white/60 rounded-lg p-3">
                <span className="block text-slate-500 text-xs mb-1">Refund ID</span>
                <span className="font-medium text-slate-900">{record.uid}</span>
            </div>
            <div className="bg-white/60 rounded-lg p-3">
                <span className="block text-slate-500 text-xs mb-1">Processed Date</span>
                <span className="font-medium text-slate-900">
                    {record.updated_at ? new Date(record.updated_at).toLocaleDateString() : "-"}
                </span>
            </div>
        </div>
      </div>
    </div>
  );
}
