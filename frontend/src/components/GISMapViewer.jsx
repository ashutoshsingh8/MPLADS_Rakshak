import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';

const STATUS_COLORS = {
  RECOMMENDED: '#A78BFA',    // Purple
  SANCTIONED: '#60A5FA',     // Blue
  IN_PROGRESS: '#FBBF24',    // Amber
  COMPLETED: '#34D399',      // Green
  FLAGGED_REVIEW: '#F87171', // Red
};

const RISK_LEGEND = [
  { label: 'Normal', color: '#34D399' },
  { label: 'In Progress', color: '#FBBF24' },
  { label: 'Flagged', color: '#F87171' },
];

function MapBounds({ projects }) {
  const map = useMap();

  useEffect(() => {
    if (projects.length > 0) {
      const bounds = projects
        .filter((p) => p.latitude && p.longitude)
        .map((p) => [p.latitude, p.longitude]);
      if (bounds.length > 0) {
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 8 });
      }
    }
  }, [projects, map]);

  return null;
}

export default function GISMapViewer({ projects = [], onProjectClick, height = '400px' }) {
  // Default center: India
  const defaultCenter = [22.5937, 78.9629];
  const validProjects = projects.filter((p) => p.latitude && p.longitude);

  return (
    <div className="glass-card overflow-hidden" style={{ height }}>
      {/* Legend */}
      <div className="absolute top-3 right-3 z-[1000] glass-card p-2.5 flex flex-col gap-1.5">
        {RISK_LEGEND.map((item) => (
          <div key={item.label} className="flex items-center gap-2 text-xs">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
            <span className="text-gray-300">{item.label}</span>
          </div>
        ))}
      </div>

      <MapContainer
        center={defaultCenter}
        zoom={5}
        style={{ height: '100%', width: '100%' }}
        zoomControl={true}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://carto.com">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        <MapBounds projects={validProjects} />

        {validProjects.map((project) => {
          const color = STATUS_COLORS[project.status] || STATUS_COLORS.RECOMMENDED;
          const isFlagged = project.status === 'FLAGGED_REVIEW';

          return (
            <CircleMarker
              key={project.id || project.project_uid}
              center={[project.latitude, project.longitude]}
              radius={isFlagged ? 10 : 7}
              pathOptions={{
                color: color,
                fillColor: color,
                fillOpacity: 0.6,
                weight: isFlagged ? 3 : 2,
              }}
              eventHandlers={{
                click: () => onProjectClick?.(project),
              }}
            >
              <Popup>
                <div className="min-w-[200px]">
                  <div className="font-bold text-sm mb-1">{project.title}</div>
                  <div className="text-xs space-y-0.5">
                    <div>📍 {project.district}, {project.state}</div>
                    <div>💰 ₹{(project.sanctioned_amount || 0).toLocaleString('en-IN')}</div>
                    <div>📊 Status: {project.status}</div>
                    {project.physical_progress_percent !== undefined && (
                      <div>
                        <div className="flex justify-between text-[10px] mt-1">
                          <span>Progress</span>
                          <span>{project.physical_progress_percent}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-gray-600 rounded-full mt-0.5">
                          <div
                            className="h-full rounded-full transition-all"
                            style={{
                              width: `${project.physical_progress_percent}%`,
                              backgroundColor: color,
                            }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </Popup>
            </CircleMarker>
          );
        })}
      </MapContainer>
    </div>
  );
}
