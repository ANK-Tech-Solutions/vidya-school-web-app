"use client";

import "leaflet/dist/leaflet.css";

import { useEffect, useMemo } from "react";
import L from "leaflet";
import { MapContainer, Marker, Popup, Polyline, TileLayer, useMap } from "react-leaflet";
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

function stopIcon(kind: "normal" | "current" | "yours") {
  const bg = kind === "current" ? "#0f766e" : kind === "yours" ? "#2563eb" : "#64748b";
  return new L.DivIcon({
    className: "live-map-marker",
    html: `<span style="display:flex;align-items:center;justify-content:center;width:22px;height:22px;border-radius:9999px;background:${bg};border:2px solid white;box-shadow:0 2px 6px #0004;color:white;font-size:11px;font-weight:700">•</span>`,
    iconSize: [22, 22],
    iconAnchor: [11, 11],
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
  stops = [],
  currentStopId,
  studentStopId,
  pathPositions = [],
  className,
}: LiveMapProps) {
  const schoolPosition = schoolLat !== undefined && schoolLng !== undefined ? ([schoolLat, schoolLng] as [number, number]) : null;
  const pickupPosition = pickupLat !== undefined && pickupLng !== undefined ? ([pickupLat, pickupLng] as [number, number]) : null;
  const busPosition = busLat !== undefined && busLng !== undefined ? ([busLat, busLng] as [number, number]) : null;
  const stopPositions = useMemo(
    () =>
      [...stops]
        .filter((s) => s.latitude != null && s.longitude != null)
        .sort((a, b) => (a.stopOrder ?? 0) - (b.stopOrder ?? 0))
        .map((s) => [Number(s.latitude), Number(s.longitude)] as [number, number]),
    [stops],
  );
  const points = [schoolPosition, pickupPosition, busPosition, ...stopPositions, ...pathPositions].filter(
    (point): point is [number, number] => point !== null,
  );

  if (!points.length) {
    return (
      <div
        className={cn(
          "flex min-h-80 items-center justify-center rounded-2xl bg-[var(--muted)] p-6 text-center text-sm text-[var(--muted-foreground)]",
          className,
        )}
      >
        Waiting for a bus location to display the map.
      </div>
    );
  }

  return (
    <MapContainer center={points[0]} zoom={14} scrollWheelZoom className={cn("min-h-80 overflow-hidden rounded-2xl", className)}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <FitToMarkers points={points} />
      {pathPositions.length > 1 && <Polyline positions={pathPositions} pathOptions={{ color: "#2563eb", weight: 4, opacity: 0.8 }} />}
      {stopPositions.length > 1 && <Polyline positions={stopPositions} pathOptions={{ color: "#0f766e", weight: 4, opacity: 0.7, dashArray: pathPositions.length > 1 ? "6 8" : undefined }} />}
      {stops.map((stop, index) => {
        if (stop.latitude == null || stop.longitude == null) return null;
        const kind = stop.id === currentStopId ? "current" : stop.id === studentStopId ? "yours" : "normal";
        return (
          <Marker
            key={stop.id ?? `${stop.name}-${index}`}
            position={[Number(stop.latitude), Number(stop.longitude)]}
            icon={stopIcon(kind)}
          >
            <Popup>
              {stop.stopOrder ?? index + 1}. {stop.name}
              {kind === "current" ? " (bus here)" : kind === "yours" ? " (your stop)" : ""}
            </Popup>
          </Marker>
        );
      })}
      {schoolPosition && (
        <Marker position={schoolPosition} icon={schoolIcon}>
          <Popup>School</Popup>
        </Marker>
      )}
      {pickupPosition && (
        <Marker position={pickupPosition} icon={pickupIcon}>
          <Popup>Student pickup</Popup>
        </Marker>
      )}
      {busPosition && (
        <Marker position={busPosition} icon={busIcon(busHeading)} zIndexOffset={1000}>
          <Popup>Live bus location</Popup>
        </Marker>
      )}
    </MapContainer>
  );
}
