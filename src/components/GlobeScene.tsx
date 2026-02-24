import { useMemo, useRef, useState, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Html } from "@react-three/drei";
import * as THREE from "three";
import type { Trip } from "@/hooks/useTrips";
import { formatDestination } from "@/lib/formatDestination";

function latLngToPos(lat: number, lng: number, r = 1.03): [number, number, number] {
  const phi = ((90 - lat) * Math.PI) / 180;
  const theta = ((lng + 180) * Math.PI) / 180;
  return [
    -(r * Math.sin(phi) * Math.cos(theta)),
    r * Math.cos(phi),
    r * Math.sin(phi) * Math.sin(theta),
  ];
}

function GlobeMesh() {
  const gridGeo = useMemo(() => {
    const sphere = new THREE.SphereGeometry(1.002, 24, 16);
    return new THREE.EdgesGeometry(sphere);
  }, []);

  return (
    <group>
      <mesh>
        <sphereGeometry args={[1, 64, 64]} />
        <meshStandardMaterial color="#C8B89A" roughness={0.85} metalness={0.05} />
      </mesh>
      <lineSegments geometry={gridGeo}>
        <lineBasicMaterial color="#8B7355" transparent opacity={0.2} />
      </lineSegments>
    </group>
  );
}

function Pin({ trip, isUpcoming, onClick }: { trip: Trip; isUpcoming: boolean; onClick: () => void }) {
  const [hovered, setHovered] = useState(false);
  const pos = latLngToPos(trip.lat!, trip.lng!);
  const color = isUpcoming ? "#C8832A" : "#4A7A82";
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.scale.setScalar(hovered ? 1.4 : 1);
    }
  });

  return (
    <group position={pos}>
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
          <div className="bg-card px-2.5 py-1.5 rounded-lg shadow-lg text-xs font-georgia text-ink whitespace-nowrap border">
            <p className="font-bold">{trip.name}</p>
            {trip.destination && <p className="text-[10px] text-muted-foreground">{formatDestination(trip.destination)}</p>}
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
  const now = new Date();

  return (
    <Canvas camera={{ position: [0, 0, 2.8], fov: 45 }} style={{ background: "transparent" }}>
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 3, 5]} intensity={0.8} />
      <directionalLight position={[-3, -1, -3]} intensity={0.3} />
      <Suspense fallback={null}>
        <GlobeMesh />
        {trips
          .filter((t) => t.lat != null && t.lng != null)
          .map((trip) => {
            const isUpcoming = trip.start_date ? new Date(trip.start_date) > now : false;
            return (
              <Pin
                key={trip.id}
                trip={trip}
                isUpcoming={isUpcoming}
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
