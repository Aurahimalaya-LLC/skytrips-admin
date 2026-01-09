import React from 'react';

interface FlightHeaderProps {
  bookingId: string;
  pnr: string;
  ticketNo: string;
  passengerName: string;
  route: {
    origin: string;
    destination: string;
  };
  issuedDate: string;
  sellingPrice?: string;
  costPrice?: string;
  profitMargin?: {
    amount: string;
    percentage: string;
  };
  showFinancials?: boolean;
}

export function FlightHeader({
  bookingId,
  pnr,
  ticketNo,
  passengerName,
  route,
  issuedDate,
  sellingPrice,
  costPrice,
  profitMargin,
  showFinancials = true
}: FlightHeaderProps) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 mb-6">
      <div className="flex items-center gap-2 mb-6 text-slate-900 font-bold text-lg">
        <span className="material-symbols-outlined text-slate-500">flight_takeoff</span>
        <h3>Flight Details</h3>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-y-6 gap-x-8 pb-6 border-b border-slate-100">
        <div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Booking ID</p>
          <p className="text-slate-900 font-bold">{bookingId}</p>
        </div>
        <div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">PNR</p>
          <p className="text-slate-900 font-bold">{pnr}</p>
        </div>
        <div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Ticket No.</p>
          <p className="text-slate-900 font-bold">{ticketNo}</p>
        </div>
        <div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Issued Date</p>
          <p className="text-slate-900 font-bold">{issuedDate}</p>
        </div>
        <div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Passenger Name</p>
          <p className="text-slate-900 font-bold">{passengerName}</p>
        </div>
        <div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Route</p>
          <div className="flex items-center gap-2 font-bold text-slate-900">
            {route.origin}
            <span className="material-symbols-outlined text-[16px] text-slate-400">arrow_right_alt</span>
            {route.destination}
          </div>
        </div>
      </div>

      {showFinancials && sellingPrice && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
          <div>
            <p className="text-xs font-medium text-slate-500 mb-1">Selling Price</p>
            <p className="text-xl font-bold text-slate-900">{sellingPrice}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 mb-1">Cost Price</p>
            <p className="text-xl font-bold text-slate-900">{costPrice}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 mb-1">Profit Margin</p>
            <p className="text-xl font-bold text-green-600 flex items-center gap-2">
              {profitMargin?.amount}
              <span className="text-sm font-medium text-slate-500">({profitMargin?.percentage})</span>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
