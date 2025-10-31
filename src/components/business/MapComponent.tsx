'use client';

interface Props {
  latitude: number;
  longitude: number;
  businessName: string;
}

export default function MapComponent({ latitude, longitude, businessName }: Props) {
  // Using OpenStreetMap - no API key required!
  const osmUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${longitude - 0.01},${latitude - 0.01},${longitude + 0.01},${latitude + 0.01}&layer=mapnik&marker=${latitude},${longitude}`;
  
  return (
    <div className="w-full h-[400px] relative rounded-lg overflow-hidden border border-gray-200">
      <iframe
        width="100%"
        height="100%"
        style={{ border: 0 }}
        loading="lazy"
        src={osmUrl}
        title={`Map showing ${businessName}`}
      />
    </div>
  );
}