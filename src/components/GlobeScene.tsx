import { useMemo, useRef, useState, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Html } from "@react-three/drei";
import * as THREE from "three";
import type { Trip } from "@/hooks/useTrips";
import { formatDestination } from "@/lib/formatDestination";
import { getTripStatus, type TripStatus } from "@/lib/tripStatus";

function latLngToPos(lat: number, lng: number, r = 1.03): [number, number, number] {
  const phi = ((90 - lat) * Math.PI) / 180;
  const theta = ((lng + 180) * Math.PI) / 180;
  return [
    -(r * Math.sin(phi) * Math.cos(theta)),
    r * Math.cos(phi),
    r * Math.sin(phi) * Math.sin(theta),
  ];
}

// Simplified world continent outlines as lat/lng polylines
const CONTINENT_OUTLINES: [number, number][][] = [
  [[60,-140],[65,-170],[72,-170],[71,-155],[60,-140],[55,-130],[48,-125],[35,-120],[25,-110],[20,-105],[15,-90],[18,-88],[20,-87],[22,-80],[25,-80],[30,-82],[30,-85],[35,-75],[40,-74],[42,-70],[45,-67],[47,-60],[50,-55],[55,-60],[60,-65],[60,-75],[62,-75],[65,-90],[65,-100],[70,-100],[72,-120],[68,-140],[60,-140]],
  [[10,-75],[12,-72],[10,-62],[5,-52],[0,-50],[-5,-35],[-10,-37],[-15,-39],[-20,-40],[-25,-48],[-30,-50],[-35,-57],[-40,-63],[-45,-65],[-50,-70],[-55,-68],[-55,-65],[-50,-73],[-45,-73],[-40,-72],[-35,-72],[-30,-70],[-25,-65],[-15,-75],[-5,-80],[0,-78],[5,-77],[10,-75]],
  [[35,-10],[38,-8],[37,0],[43,3],[44,8],[46,3],[48,-5],[51,-10],[54,-8],[58,-5],[58,5],[56,10],[55,12],[57,18],[60,20],[63,20],[65,25],[70,25],[72,30],[70,40],[65,40],[60,30],[55,20],[50,20],[48,15],[47,10],[45,13],[42,18],[40,20],[38,24],[36,28],[34,25],[35,15],[38,10],[36,0],[35,-10]],
  [[35,-10],[35,0],[32,10],[30,32],[25,35],[20,37],[15,42],[12,44],[5,42],[0,42],[-5,40],[-10,40],[-15,35],[-20,35],[-25,33],[-30,30],[-35,20],[-34,18],[-30,17],[-20,12],[-15,12],[-10,14],[-5,12],[0,10],[5,2],[5,-5],[7,-10],[5,-10],[0,-1],[-5,8],[-5,12],[-2,10],[0,10],[3,10],[5,0],[5,-10],[10,-15],[15,-17],[20,-17],[25,-15],[30,-10],[35,-10]],
  [[35,30],[40,30],[42,40],[45,50],[50,55],[55,60],[60,65],[65,70],[70,70],[75,80],[72,100],[70,140],[65,170],[60,160],[55,155],[50,143],[45,140],[40,130],[35,130],[30,120],[25,120],[22,108],[20,105],[15,100],[10,100],[5,105],[0,105],[-5,105],[-8,115],[-8,120],[-5,120],[0,115],[5,115],[10,110],[15,108],[20,110],[22,115],[30,122],[35,128],[38,130],[40,132]],
  [[-12,130],[-15,125],[-20,118],[-25,114],[-30,115],[-32,116],[-35,118],[-37,140],[-38,145],[-38,148],[-35,150],[-30,153],[-25,153],[-20,148],[-18,146],[-15,145],[-12,142],[-12,135],[-12,130]],
];

function latLngToVec3(lat: number, lng: number, r: number): THREE.Vector3 {
  const phi = ((90 - lat) * Math.PI) / 180;
  const theta = ((lng + 180) * Math.PI) / 180;
  return new THREE.Vector3(
    -(r * Math.sin(phi) * Math.cos(theta)),
    r * Math.cos(phi),
    r * Math.sin(phi) * Math.sin(theta)
  );
}

function GlobeMesh() {
  const gridGeo = useMemo(() => {
    const sphere = new THREE.SphereGeometry(1.002, 24, 16);
    return new THREE.EdgesGeometry(sphere);
  }, []);

  const continentLines = useMemo(() => {
    const geometries: THREE.BufferGeometry[] = [];
    for (const outline of CONTINENT_OUTLINES) {
      const points: THREE.Vector3[] = [];
      for (const [lat, lng] of outline) {
        points.push(latLngToVec3(lat, lng, 1.005));
      }
      const geo = new THREE.BufferGeometry().setFromPoints(points);
      geometries.push(geo);
    }
    return geometries;
  }, []);

  return (
    <group>
      <mesh>
        <sphereGeometry args={[1, 64, 64]} />
        <meshStandardMaterial color="#C8B89A" roughness={0.85} metalness={0.05} />
      </mesh>
      <lineSegments geometry={gridGeo}>
        <lineBasicMaterial color="#8B7355" transparent opacity={0.15} />
      </lineSegments>
      {continentLines.map((geo, i) => (
        <primitive key={i} object={new THREE.Line(geo, new THREE.LineBasicMaterial({ color: '#6B5B3E', transparent: true, opacity: 0.7 }))} />
      ))}
    </group>
  );
}

/** Dashed route lines between sequential trip pins */
function RouteLines({ trips }: { trips: Trip[] }) {
  const routeLines = useMemo(() => {
    const validTrips = trips
      .filter((t) => t.lat != null && t.lng != null)
      .sort((a, b) => new Date(a.start_date || "").getTime() - new Date(b.start_date || "").getTime());

    if (validTrips.length < 2) return [];

    const lines: THREE.BufferGeometry[] = [];
    for (let i = 0; i < validTrips.length - 1; i++) {
      const a = validTrips[i];
      const b = validTrips[i + 1];
      // Create arc between points
      const startVec = latLngToVec3(a.lat!, a.lng!, 1.01);
      const endVec = latLngToVec3(b.lat!, b.lng!, 1.01);
      const points: THREE.Vector3[] = [];
      const segments = 32;
      for (let j = 0; j <= segments; j++) {
        const t = j / segments;
        const p = new THREE.Vector3().lerpVectors(startVec, endVec, t);
        p.normalize().multiplyScalar(1.01 + Math.sin(t * Math.PI) * 0.03);
        points.push(p);
      }
      lines.push(new THREE.BufferGeometry().setFromPoints(points));
    }
    return lines;
  }, [trips]);

  return (
    <>
      {routeLines.map((geo, i) => (
        <primitive
          key={`route-${i}`}
          object={new THREE.Line(
            geo,
            new THREE.LineDashedMaterial({
              color: '#C8832A',
              dashSize: 0.02,
              gapSize: 0.015,
              transparent: true,
              opacity: 0.5,
            })
          )}
          onAfterRender={(renderer: any, scene: any, camera: any, geometry: any, material: any, group: any) => {}}
          ref={(ref: any) => { if (ref) ref.computeLineDistances(); }}
        />
      ))}
    </>
  );
}

function Pin({ trip, status, onClick }: { trip: Trip; status: TripStatus; onClick: () => void }) {
  const [hovered, setHovered] = useState(false);
  const pos = latLngToPos(trip.lat!, trip.lng!);
  const color = status === "past" ? "#4A7A82" : "#C8832A";
  const meshRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (meshRef.current) {
      meshRef.current.scale.setScalar(hovered ? 1.4 : 1);
    }
    if (glowRef.current && status === "active") {
      const s = 1 + Math.sin(clock.getElapsedTime() * 3) * 0.4;
      glowRef.current.scale.setScalar(s);
    }
  });

  return (
    <group position={pos}>
      {status === "active" && (
        <mesh ref={glowRef}>
          <sphereGeometry args={[0.04, 16, 16]} />
          <meshStandardMaterial color="#C8832A" transparent opacity={0.25} />
        </mesh>
      )}
      <mesh
        ref={meshRef}
        onPointerOver={(e) => { e.stopPropagation(); setHovered(true); }}
        onPointerOut={() => setHovered(false)}
        onClick={(e) => { e.stopPropagation(); onClick(); }}
      >
        <sphereGeometry args={[0.025, 16, 16]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={hovered ? 0.6 : 0.2} />
      </mesh>
      {hovered && (
        <Html distanceFactor={3} style={{ pointerEvents: "none" }}>
          <div
            className="whitespace-nowrap animate-fade-in"
            style={{
              background: "#FAF7F2",
              border: "1px solid rgba(200,131,42,0.3)",
              borderRadius: 10,
              padding: "10px 14px",
              boxShadow: "0 4px 16px rgba(80,60,30,0.2)",
              pointerEvents: "none",
            }}
          >
            <div className="flex items-center gap-1.5 mb-0.5">
              <span className="inline-block w-2 h-2 rounded-full flex-shrink-0" style={{ background: color }} />
              <p className="font-georgia font-bold text-[13px]" style={{ color: "#2A2218" }}>{trip.name}</p>
            </div>
            {trip.destination && <p className="text-[11px]" style={{ color: "#5A4F3E" }}>{formatDestination(trip.destination)}</p>}
            {trip.start_date && (
              <p className="text-[11px] mt-0.5" style={{ color: "#9A8F7E" }}>
                {new Date(trip.start_date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                {trip.end_date && ` – ${new Date(trip.end_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`}
              </p>
            )}
            <span
              className="inline-block mt-1 text-[8px] font-bold uppercase px-1.5 py-0.5 rounded-full text-white"
              style={{ background: status === "past" ? "#4A7A82" : "#C8832A", letterSpacing: 0.5 }}
            >
              {status === "upcoming" ? "UPCOMING" : status === "active" ? "ACTIVE" : "PAST"}
            </span>
          </div>
        </Html>
      )}
    </group>
  );
}

interface GlobeSceneProps {
  trips: Trip[];
  onTripClick: (tripId: string) => void;
}

export default function GlobeScene({ trips, onTripClick }: GlobeSceneProps) {
  return (
    <Canvas camera={{ position: [0, 0, 2.8], fov: 45 }} style={{ background: "transparent" }}>
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 3, 5]} intensity={0.8} />
      <directionalLight position={[-3, -1, -3]} intensity={0.3} />
      <Suspense fallback={null}>
        <GlobeMesh />
        <RouteLines trips={trips} />
        {trips
          .filter((t) => t.lat != null && t.lng != null)
          .map((trip) => {
            const status = getTripStatus(trip.start_date, trip.end_date);
            return (
              <Pin
                key={trip.id}
                trip={trip}
                status={status}
                onClick={() => onTripClick(trip.id)}
              />
            );
          })}
      </Suspense>
      <OrbitControls
        enableZoom={false}
        enablePan={false}
        autoRotate
        autoRotateSpeed={0.4}
        minPolarAngle={Math.PI * 0.2}
        maxPolarAngle={Math.PI * 0.8}
      />
    </Canvas>
  );
}
