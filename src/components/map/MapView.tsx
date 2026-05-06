"use client";

import { useEffect, useState } from "react";
import {
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  useMap,
  ZoomControl,
} from "react-leaflet";
import { divIcon, LatLngExpression } from "leaflet";
import { Navigation } from "lucide-react";
import { ProviderPreviewCard } from "./ProviderPreviewCard";
import type { ProviderProfile } from "@/types";

interface MapViewProps {
  providers: ProviderProfile[];
  userLocation: { lat: number; lng: number } | null;
  selectedProviderId: string | null;
  onProviderSelect: (id: string | null) => void;
  providerDistances?: Record<string, number>;
}

function Recenter({ center }: { center: LatLngExpression }) {
  const map = useMap();

  useEffect(() => {
    map.setView(center, map.getZoom(), { animate: true });
  }, [center, map]);

  return null;
}

function MapAutoResize() {
  const map = useMap();

  useEffect(() => {
    const container = map.getContainer();
    const parent = container.parentElement;

    const resize = () => {
      map.invalidateSize({ animate: false });
    };

    resize();
    const timeoutId = window.setTimeout(resize, 120);

    if (!parent || typeof ResizeObserver === "undefined") {
      window.addEventListener("resize", resize);
      return () => {
        window.clearTimeout(timeoutId);
        window.removeEventListener("resize", resize);
      };
    }

    const observer = new ResizeObserver(() => resize());
    observer.observe(parent);

    window.addEventListener("resize", resize);
    return () => {
      window.clearTimeout(timeoutId);
      observer.disconnect();
      window.removeEventListener("resize", resize);
    };
  }, [map]);

  return null;
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function createProviderIcon(provider: ProviderProfile, isSelected: boolean) {
  const name = escapeHtml(provider.businessName || "Provider");
  const initials = escapeHtml((provider.businessName || "P").slice(0, 1).toUpperCase());
  const image = provider.profileImage ? escapeHtml(provider.profileImage) : "";

  const avatarHtml = image
    ? `<img src="${image}" alt="${name}" class="provider-marker__image"/>`
    : `<span class="provider-marker__initials">${initials}</span>`;

  return divIcon({
    className: `provider-marker-root${isSelected ? " is-selected" : ""}`,
    iconSize: [160, 88],
    iconAnchor: [40, 84],
    popupAnchor: [0, -72],
    html: `
      <div class="provider-marker${isSelected ? " provider-marker--selected" : ""}">
        <div class="provider-marker__avatar-wrap">
          <div class="provider-marker__avatar">
            ${avatarHtml}
          </div>
        </div>
        <div class="provider-marker__label" title="${name}">
          ${name}
        </div>
        <div class="provider-marker__tail" aria-hidden="true"></div>
      </div>
    `,
  });
}

export function MapView({ 
  providers, 
  userLocation, 
  selectedProviderId,
  onProviderSelect,
  providerDistances = {},
}: MapViewProps) {
  const [selectedProvider, setSelectedProvider] = useState<ProviderProfile | null>(null);

  const mapCenter: LatLngExpression = userLocation
    ? [userLocation.lat, userLocation.lng]
    : [30.0444, 31.2357];

  useEffect(() => {
    if (!selectedProviderId) {
      setSelectedProvider(null);
      return;
    }

    const provider = providers.find((item) => item.id === selectedProviderId) || null;
    setSelectedProvider(provider);
  }, [providers, selectedProviderId]);

  return (
    <div className="relative w-full h-full overflow-hidden">
      <MapContainer
        center={mapCenter}
        zoom={13}
        zoomControl={false}
        className="absolute inset-0 h-full w-full"
        style={{ height: "100%", width: "100%" }}
      >
        <MapAutoResize />
        <Recenter center={mapCenter} />
        <ZoomControl position="topright" />

        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap contributors"
        />

        {providers.map((provider) => (
          <Marker
            key={provider.id}
            position={[provider.location.lat, provider.location.lng]}
            icon={createProviderIcon(provider, provider.id === selectedProviderId)}
            eventHandlers={{
              click: () => {
                onProviderSelect(provider.id);
                setSelectedProvider(provider);
              },
            }}
          >
            <Popup>
              <div className="flex items-center gap-2 min-w-[170px]">
                <div className="h-9 w-9 rounded-full overflow-hidden bg-[#f0f2f2] border border-[#d5d9d9] shrink-0 flex items-center justify-center text-[12px] font-bold text-[#0f1111]">
                  {provider.profileImage ? (
                    <img src={provider.profileImage} alt={provider.businessName} className="h-full w-full object-cover" />
                  ) : (
                    <span>{provider.businessName.slice(0, 1).toUpperCase()}</span>
                  )}
                </div>
                <div className="text-[12px]">
                  <p className="font-bold text-[#0f1111] leading-tight">{provider.businessName}</p>
                  <p className="text-[#565959]">{provider.profession}</p>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
      
      {/* Floating UI Elements */}
      <div className="absolute bottom-8 left-0 right-0 px-4 pointer-events-none">
        <div className="mx-auto max-w-xl w-full flex flex-col items-center pointer-events-auto">
          {selectedProvider && (
            <div className="w-full animate-slide-up mb-4">
              <ProviderPreviewCard 
                provider={selectedProvider} 
                distance={
                  Number.isFinite(providerDistances[selectedProvider.id])
                    ? providerDistances[selectedProvider.id].toFixed(1)
                    : undefined
                }
              />
            </div>
          )}
          
          {!selectedProvider && (
            <div className="glass px-6 py-3 rounded-full shadow-elegant border border-border/50 flex items-center gap-3 animate-fade-in text-sm font-medium">
              <Navigation className="h-4 w-4 text-primary" />
              Showing {providers.length} providers near you
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
