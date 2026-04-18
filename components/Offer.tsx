import React from 'react'
import OfferCard from './OfferCard'
import { LuTicketCheck } from "react-icons/lu";
import { GiPartyPopper } from "react-icons/gi";
import { BsQrCodeScan } from "react-icons/bs";

export interface OfferProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

function Offer() {
  return (
    <section className="flex flex-col items-center justify-center px-6 py-20 text-center bg-white dark:bg-slate-950/95">
      <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
        Everything You Need
      </h2>
      <div className="flex flex-col lg:flex-row justify-center gap-8 mt-12 flex-wrap">
        <OfferCard
          icon={<LuTicketCheck />}
          title="Smart Ticketing"
          description="Multiple ticket types, dynamic pricing, and automated inventory management."
        />
        <OfferCard
          icon={<GiPartyPopper />}
          title="Real Time Analysis"
          description="Track sales, attendance, and attendee demographics in real-time."
        />
        <OfferCard
          icon={<BsQrCodeScan />}
          title="QR Verification  "
          description="Fast check-in with QR code scanning and barcode verification."
        />
      </div>
    </section>
  );
}

export default Offer
