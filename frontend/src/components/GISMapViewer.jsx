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

// Strict Republic of India Bounding Box
const INDIA_BOUNDS = [
  [6.5, 68.0],   // Southwest coordinates (Kanyakumari / Indian Ocean border)
  [37.5, 97.5],  // Northeast coordinates (Kashmir / Arunachal border)
];
const INDIA_CENTER = [22.3511, 78.6677];

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
    } else {
      map.fitBounds(INDIA_BOUNDS, { padding: [20, 20] });
    }
  }, [projects, map]);

  return null;
}

export default function GISMapViewer({ projects = [], onProjectClick, height = '400px' }) {
  const validProjects = projects.filter((p) => p.latitude && p.longitude);

  return (
    <div className="rounded-2xl overflow-hidden relative shadow-md border border-slate-200" style={{ height }}>
      {/* Legend */}
      <div className="absolute top-3 right-3 z-[1000] bg-white/95 backdrop-blur-xs p-2.5 rounded-xl border border-slate-200 shadow-md flex flex-col gap-1.5">
        {RISK_LEGEND.map((item) => (
          <div key={item.label} className="flex items-center gap-2 text-xs font-semibold text-slate-700">
            <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
            <span>{item.label}</span>
          </div>
        ))}
      </div>

      <MapContainer
        center={INDIA_CENTER}
        zoom={5}
        minZoom={4}
        maxZoom={18}
        maxBounds={INDIA_BOUNDS}
        maxBoundsViscosity={1.0}
        style={{ height: '100%', width: '100%' }}
        zoomControl={true}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          noWrap={true}
          bounds={INDIA_BOUNDS}
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
                fillOpacity: 0.75,
                weight: isFlagged ? 3 : 2,
              }}
              eventHandlers={{
                click: () => onProjectClick?.(project),
              }}
            >
              <Popup>
                <div className="min-w-[200px] text-slate-800 p-1">
                  <div className="font-bold text-sm mb-1 text-slate-900">{project.title}</div>
                  <div className="text-xs space-y-0.5 text-slate-600">
                    <div>📍 {project.district}, {project.state}</div>
                    <div>💰 ₹{(project.sanctioned_amount || 0).toLocaleString('en-IN')}</div>
                    <div>📊 Status: <strong className="text-slate-800">{project.status}</strong></div>
                    {project.physical_progress_percent !== undefined && (
                      <div className="pt-1">
                        <div className="flex justify-between text-[10px] text-slate-500 font-medium">
                          <span>Progress</span>
                          <span className="font-bold text-slate-700">{project.physical_progress_percent}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-200 rounded-full mt-0.5 overflow-hidden">
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
