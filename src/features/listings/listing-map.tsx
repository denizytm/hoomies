"use client";

import { useEffect, useRef } from "react";

import "maplibre-gl/dist/maplibre-gl.css";

// Merkez etrafında ~yarıçaplı çember poligonu (gizlilik için yaklaşık alan).
function circlePolygon(
  lng: number,
  lat: number,
  radiusMeters: number,
  points = 64,
): [number, number][] {
  const earth = 6378137;
  const dLat = (radiusMeters / earth) * (180 / Math.PI);
  const dLng = dLat / Math.cos((lat * Math.PI) / 180);
  const coords: [number, number][] = [];
  for (let i = 0; i <= points; i++) {
    const theta = (i / points) * 2 * Math.PI;
    coords.push([lng + dLng * Math.cos(theta), lat + dLat * Math.sin(theta)]);
  }
  return coords;
}

export function ListingMap({
  lng,
  lat,
  label,
}: {
  lng: number;
  lat: number;
  label?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    let map: { remove: () => void } | null = null;
    let cancelled = false;

    (async () => {
      const maplibregl = (await import("maplibre-gl")).default;
      if (cancelled || !ref.current) return;
      const m = new maplibregl.Map({
        container: ref.current,
        style: {
          version: 8,
          sources: {
            osm: {
              type: "raster",
              tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
              tileSize: 256,
              attribution: "© OpenStreetMap katkıda bulunanlar",
            },
          },
          layers: [{ id: "osm", type: "raster", source: "osm" }],
        },
        center: [lng, lat],
        zoom: 13,
      });
      m.addControl(new maplibregl.NavigationControl({ showCompass: false }), "top-right");
      m.on("load", () => {
        m.addSource("area", {
          type: "geojson",
          data: {
            type: "Feature",
            properties: {},
            geometry: {
              type: "Polygon",
              coordinates: [circlePolygon(lng, lat, 600)],
            },
          },
        });
        m.addLayer({
          id: "area-fill",
          type: "fill",
          source: "area",
          paint: { "fill-color": "#f97316", "fill-opacity": 0.18 },
        });
        m.addLayer({
          id: "area-line",
          type: "line",
          source: "area",
          paint: { "line-color": "#f97316", "line-width": 2 },
        });
      });
      map = m;
    })();

    return () => {
      cancelled = true;
      map?.remove();
    };
  }, [lng, lat]);

  return (
    <div
      ref={ref}
      aria-label={label}
      className="h-64 w-full overflow-hidden rounded-2xl border border-border"
    />
  );
}
