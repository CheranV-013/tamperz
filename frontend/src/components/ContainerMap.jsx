import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN || "";

const ContainerMap = ({ position }) => {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;
    if (!MAPBOX_TOKEN) return;

    try {
      mapboxgl.accessToken = MAPBOX_TOKEN;

      mapRef.current = new mapboxgl.Map({
        container: mapContainerRef.current,
        style: "mapbox://styles/mapbox/light-v11",
        center: [78.9629, 20.5937],
        zoom: 3.5,
      });

      mapRef.current.addControl(new mapboxgl.NavigationControl(), "top-right");
    } catch (err) {
      console.error("Mapbox init failed", err);
    }
  }, []);

  useEffect(() => {
    if (!mapRef.current || !position) return;

    const { lat, lon } = position;
    const lngLat = [lon, lat];

    if (!markerRef.current) {
      markerRef.current = new mapboxgl.Marker({ color: "#0f172a" })
        .setLngLat(lngLat)
        .addTo(mapRef.current);
    } else {
      markerRef.current.setLngLat(lngLat);
    }

    mapRef.current.easeTo({ center: lngLat, zoom: 7 });
  }, [position]);

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-card">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-900">Container C101 Location</h2>
        <span className="text-xs text-slate-400">Live GPS</span>
      </div>
      <div className="mt-4 h-[260px] rounded-xl overflow-hidden border border-slate-100">
        {MAPBOX_TOKEN ? (
          <div ref={mapContainerRef} className="h-full w-full" />
        ) : (
          <div className="h-full w-full flex items-center justify-center text-sm text-slate-500">
            Mapbox token missing. Set `VITE_MAPBOX_TOKEN`.
          </div>
        )}
      </div>
      {!position && (
        <p className="text-xs text-slate-500 mt-3">
          Waiting for GPS coordinates from C101...
        </p>
      )}
    </div>
  );
};

export default ContainerMap;
