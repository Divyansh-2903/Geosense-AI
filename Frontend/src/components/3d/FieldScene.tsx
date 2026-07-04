import { useRef, useEffect, useMemo, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import SatelliteModel from "./SatelliteModel";
import TerrainModel from "./TerrainModel";

interface FieldSceneProps {
  scrollProgress: number;
}

// Camera controller component to handle scroll-driven cinematic paths
function CameraController({ scrollProgress }: { scrollProgress: number }) {
  const { camera } = useThree();
  const currentLookAt = useRef(new THREE.Vector3(0, 1.2, 0));

  useFrame((state) => {
    // Determine camera target positions & look-at targets per scroll chapter
    let targetX = 0;
    let targetY = 7;
    let targetZ = 8;
    let lookTargetY = 1.2;

    if (scrollProgress <= 1.0) {
      // Segment 1: Space Orbit (0.0) -> Ground Field (1.0)
      const t = scrollProgress;
      // Linear or cubic interpolation for camera positions
      targetX = THREE.MathUtils.lerp(0, -1.8, t);
      targetY = THREE.MathUtils.lerp(7, 1.4, t);
      targetZ = THREE.MathUtils.lerp(8, 5.0, t);
      lookTargetY = THREE.MathUtils.lerp(1.2, -0.2, t);
    } else {
      // Segment 2: Ground Field (1.0) -> Soil Subsurface (2.0)
      const t = Math.min(1.0, scrollProgress - 1.0);
      targetX = THREE.MathUtils.lerp(-1.8, 0, t);
      targetY = THREE.MathUtils.lerp(1.4, -4.5, t);
      targetZ = THREE.MathUtils.lerp(5.0, 4.2, t);
      lookTargetY = THREE.MathUtils.lerp(-0.2, -4.8, t);
    }

    // Add subtle mouse parallax movement to target position
    const mouseParallaxX = state.pointer.x * 0.8;
    const mouseParallaxY = state.pointer.y * 0.5;
    
    const finalTargetPos = new THREE.Vector3(
      targetX + mouseParallaxX, 
      targetY + mouseParallaxY, 
      targetZ
    );

    // Smoothly LERP camera position
    camera.position.lerp(finalTargetPos, 0.08);

    // Smoothly LERP camera LookAt point
    const targetLookAt = new THREE.Vector3(0, lookTargetY, 0);
    currentLookAt.current.lerp(targetLookAt, 0.08);
    camera.lookAt(currentLookAt.current);
  });

  return null;
}

function StarField({ count = 700 }) {
  const pointsRef = useRef<THREE.Points>(null);

  const particles = useMemo(() => {
    const positions = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      const radius = 35 + Math.random() * 65;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);

      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = radius * Math.cos(phi);
      positions[i * 3 + 2] = radius * Math.sin(phi) * Math.sin(theta);
    }

    return positions;
  }, [count]);

  useFrame((state) => {
    if (!pointsRef.current) return;
    pointsRef.current.rotation.y = state.clock.getElapsedTime() * 0.015;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[particles, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        color="#dfffb0"
        size={0.18}
        transparent
        opacity={0.65}
        depthWrite={false}
      />
    </points>
  );
}

// Particle dust representing atmospheric mist (space dust or soil nutrients)
function DustParticles({ count = 80 }) {
  const pointsRef = useRef<THREE.Points>(null);

  const particles = useMemo(() => {
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 15;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 10;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 15;
    }
    return positions;
  }, [count]);

  useFrame((state) => {
    if (!pointsRef.current) return;
    const time = state.clock.getElapsedTime();
    
    // Slow ambient rotation & floating
    pointsRef.current.rotation.y = time * 0.015;
    const positions = pointsRef.current.geometry.attributes.position.array as Float32Array;
    
    for (let i = 0; i < count; i++) {
      // Gently bob up and down
      positions[i * 3 + 1] += Math.sin(time + positions[i * 3]) * 0.002;
    }
    pointsRef.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[particles, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        color="#cff068"
        size={0.06}
        transparent
        opacity={0.35}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

export default function FieldScene({ scrollProgress }: FieldSceneProps) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  return (
    <div className="absolute inset-0 w-full h-full z-0 overflow-hidden pointer-events-none">
      <Canvas
        camera={{ position: [0, 7, 8], fov: 60 }}
        dpr={isMobile ? 1 : Math.min(window.devicePixelRatio, 2)}
        shadows
        gl={{ antialias: true, alpha: true }}
      >
        {/* Ambient starfield background (Chapters 1 & 2) */}
        {scrollProgress < 1.4 && (
          <StarField count={isMobile ? 300 : 700} />
        )}

        {/* Ambient forest-green glow lighting */}
        <ambientLight intensity={0.4} color="#a9d0ac" />

        {/* Moon/Sun directional light */}
        <directionalLight
          position={[5, 8, 3]}
          intensity={1.2}
          color="#cff068" // Warm lime sunlight tint
          castShadow
          shadow-mapSize-width={isMobile ? 512 : 1024}
          shadow-mapSize-height={isMobile ? 512 : 1024}
        />

        {/* Subtle orange/brown light bouncing from the soil */}
        <directionalLight 
          position={[-5, -8, -3]} 
          intensity={0.6} 
          color="#3d2b1f" 
        />

        {/* 3D Elements */}
        <SatelliteModel scrollProgress={scrollProgress} />
        <TerrainModel scrollProgress={scrollProgress} />

        {/* Floating atmospheric dust */}
        <DustParticles count={isMobile ? 40 : 100} />

        {/* Camera script execution */}
        <CameraController scrollProgress={scrollProgress} />
      </Canvas>
    </div>
  );
}
