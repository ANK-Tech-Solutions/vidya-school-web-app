"use client";

import "leaflet/dist/leaflet.css";

import { useEffect } from "react";
import L from "leaflet";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import type { LiveMapProps } from "./live-map";
import { cn } from "@/lib/utils";

const schoolIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const pickupIcon = new L.DivIcon({
  className: "live-map-marker",
  html: '<span style="display:flex;align-items:center;justify-content:center;width:30px;height:30px;border-radius:9999px;background:#f59e0b;border:3px solid white;box-shadow:0 2px 6px #0004">🏠</span>',
  iconSize: [30, 30],
  iconAnchor: [15, 15],
});

function busIcon(heading?: number | null) {
  return new L.DivIcon({
    className: "live-map-marker",
    html: `<span style="display:flex;align-items:center;justify-content:center;width:36px;height:36px;border-radius:9999px;background:#0f766e;border:3px solid white;box-shadow:0 2px 6px #0004;transform:rotate(${heading ?? 0}deg)">🚌</span>`,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
  });
}

function FitToMarkers({ points }: { points: [number, number][] }) {
  const map = useMap();

  useEffect(() => {
    if (points.length === 1) {
      map.setView(points[0], 15);
    } else if (points.length > 1) {
      map.fitBounds(L.latLngBounds(points), { padding: [36, 36], maxZoom: 15 });
    }
  }, [map, points]);

  return null;
}

export default function LiveMapClient({
  schoolLat,
  schoolLng,
  pickupLat,
  pickupLng,
  busLat,
  busLng,
  busHeading,
  className,
}: LiveMapProps) {
  const schoolPosition = schoolLat !== undefined && schoolLng !== undefined ? [schoolLat, schoolLng] as [number, number] : null;
  const pickupPosition = pickupLat !== undefined && pickupLng !== undefined ? [pickupLat, pickupLng] as [number, number] : null;
  const busPosition = busLat !== undefined && busLng !== undefined ? [busLat, busLng] as [number, number] : null;
  const points = [schoolPosition, pickupPosition, busPosition].filter((point): point is [number, number] => point !== null);

  if (!points.length) {
    return <div className={cn("flex min-h-80 items-center justify-center rounded-2xl bg-[var(--muted)] p-6 text-center text-sm text-[var(--muted-foreground)]", className)}>Waiting for a bus location to display the map.</div>;
  }

  return <MapContainer center={points[0]} zoom={14} scrollWheelZoom className={cn("min-h-80 overflow-hidden rounded-2xl", className)}>
    <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
    <FitToMarkers points={points} />
    {schoolPosition && <Marker position={schoolPosition} icon={schoolIcon}><Popup>School</Popup></Marker>}
    {pickupPosition && <Marker position={pickupPosition} icon={pickupIcon}><Popup>Student pickup</Popup></Marker>}
    {busPosition && <Marker position={busPosition} icon={busIcon(busHeading)} zIndexOffset={1000}><Popup>Live bus location</Popup></Marker>}
  </MapContainer>;
}
