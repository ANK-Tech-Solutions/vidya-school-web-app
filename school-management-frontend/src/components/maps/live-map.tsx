"use client";

import dynamic from "next/dynamic";

export interface LiveMapProps {
  schoolLat?: number;
  schoolLng?: number;
  pickupLat?: number;
  pickupLng?: number;
  busLat?: number;
  busLng?: number;
  busHeading?: number | null;
  className?: string;
}

const LiveMapClient = dynamic(() => import("./live-map-client"), {
  ssr: false,
  loading: () => <div className="h-full min-h-80 animate-pulse rounded-2xl bg-[var(--muted)]" aria-label="Loading map" />,
});

export function LiveMap(props: LiveMapProps) {
  return <LiveMapClient {...props} />;
}
