import { useMemo } from "react";
import { GoogleMap, Marker, useLoadScript } from "@react-google-maps/api";

const GOOGLE_MAPS_KEY = import.meta.env.VITE_GOOGLE_MAPS_KEY || "";

const containerStyle = {
  width: "100%",
  height: "260px",
};

const defaultCenter = { lat: 20.5937, lng: 78.9629 };

const ContainerMap = ({ position }) => {
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: GOOGLE_MAPS_KEY,
  });

  const center = useMemo(() => {
    if (position?.lat && position?.lon) {
      return { lat: position.lat, lng: position.lon };
    }
    return defaultCenter;
  }, [position]);

  return (
    <div className="glass-panel rounded-2xl p-5 border border-slate-100 shadow-card hover-float">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-900">Container C101 Location</h2>
        <span className="text-xs text-slate-400">Live GPS</span>
      </div>
      <div className="mt-4 rounded-xl overflow-hidden border border-slate-100">
        {!GOOGLE_MAPS_KEY && (
          <div className="h-[260px] flex items-center justify-center text-sm text-slate-500">
            Google Maps key missing. Set `VITE_GOOGLE_MAPS_KEY`.
          </div>
        )}
        {GOOGLE_MAPS_KEY && !isLoaded && (
          <div className="h-[260px] flex items-center justify-center text-sm text-slate-500">
            Loading map...
          </div>
        )}
        {GOOGLE_MAPS_KEY && isLoaded && (
          <GoogleMap mapContainerStyle={containerStyle} center={center} zoom={position ? 7 : 3.5}>
            {position?.lat && position?.lon && (
              <Marker position={{ lat: position.lat, lng: position.lon }} />
            )}
          </GoogleMap>
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
