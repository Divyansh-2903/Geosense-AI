import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface SatelliteModelProps {
  scrollProgress: number;
}

export default function SatelliteModel({ scrollProgress }: SatelliteModelProps) {
  const satelliteRef = useRef<THREE.Group>(null);
  const dishRef = useRef<THREE.Mesh>(null);
  const beamRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!satelliteRef.current) return;

    // Gentle ambient floating animation
    const time = state.clock.getElapsedTime();
    satelliteRef.current.position.y = Math.sin(time * 0.8) * 0.15;
    satelliteRef.current.position.x = Math.cos(time * 0.5) * 0.1;

    // Satellite rotation based on scroll progress (spins slowly as camera moves)
    satelliteRef.current.rotation.y = time * 0.05 + scrollProgress * Math.PI * 0.5;
    satelliteRef.current.rotation.z = Math.sin(time * 0.3) * 0.05;

    // Gently rotate/wiggle the radar dish
    if (dishRef.current) {
      dishRef.current.rotation.y = Math.sin(time * 1.5) * 0.1;
    }

    // Pulse the scanning beam opacity
    if (beamRef.current) {
      const material = beamRef.current.material as THREE.MeshBasicMaterial;
      // The beam fades out as the camera moves past Chapter 2 (scrollProgress > 1.2)
      const baseOpacity = 0.25 + Math.sin(time * 4) * 0.08;
      const scrollFade = scrollProgress < 1.0 
        ? 1 
        : Math.max(0, 1 - (scrollProgress - 1.0) * 2);
      material.opacity = baseOpacity * scrollFade;
    }
  });

  return (
    <group ref={satelliteRef} position={[0, 2.5, 0]}>
      {/* Central core body of the satellite */}
      <mesh castShadow receiveShadow>
        <cylinderGeometry args={[0.3, 0.3, 0.8, 12]} />
        <meshStandardMaterial 
          color="#a8c5ba" 
          metalness={0.9} 
          roughness={0.2} 
        />
      </mesh>

      {/* Gold metallic cap on top */}
      <mesh position={[0, 0.45, 0]}>
        <sphereGeometry args={[0.28, 12, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial 
          color="#d4a373" 
          metalness={0.8} 
          roughness={0.3} 
        />
      </mesh>

      {/* Gold metallic cap on bottom */}
      <mesh position={[0, -0.45, 0]} rotation={[Math.PI, 0, 0]}>
        <sphereGeometry args={[0.28, 12, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial 
          color="#d4a373" 
          metalness={0.8} 
          roughness={0.3} 
        />
      </mesh>

      {/* Solar Panel Left Support Arm */}
      <mesh position={[-0.4, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.04, 0.04, 0.3, 8]} />
        <meshStandardMaterial color="#424841" metalness={0.8} />
      </mesh>

      {/* Solar Panel Left Panel */}
      <group position={[-1.1, 0, 0]}>
        <mesh castShadow>
          <boxGeometry args={[1.2, 0.05, 0.5]} />
          <meshStandardMaterial 
            color="#142c54" 
            metalness={0.7} 
            roughness={0.1} 
            emissive="#1a3c7a"
            emissiveIntensity={0.2}
          />
        </mesh>
        {/* Decorative Grid Lines on Solar Panel */}
        <gridHelper args={[1.2, 6, "#cff068", "#103e0e"]} rotation={[0, 0, 0]} position={[0, 0.026, 0]} />
      </group>

      {/* Solar Panel Right Support Arm */}
      <mesh position={[0.4, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.04, 0.04, 0.3, 8]} />
        <meshStandardMaterial color="#424841" metalness={0.8} />
      </mesh>

      {/* Solar Panel Right Panel */}
      <group position={[1.1, 0, 0]}>
        <mesh castShadow>
          <boxGeometry args={[1.2, 0.05, 0.5]} />
          <meshStandardMaterial 
            color="#142c54" 
            metalness={0.7} 
            roughness={0.1} 
            emissive="#1a3c7a"
            emissiveIntensity={0.2}
          />
        </mesh>
        <gridHelper args={[1.2, 6, "#cff068", "#103e0e"]} rotation={[0, 0, 0]} position={[0, 0.026, 0]} />
      </group>

      {/* Instruments / Sensors attachment */}
      <mesh position={[0, -0.5, 0.25]} rotation={[Math.PI / 4, 0, 0]}>
        <cylinderGeometry args={[0.05, 0.05, 0.3, 8]} />
        <meshStandardMaterial color="#424841" metalness={0.8} />
      </mesh>

      {/* Radar / Sensor Dish */}
      <mesh ref={dishRef} position={[0, -0.65, 0.35]} rotation={[Math.PI / 4, 0, 0]}>
        <coneGeometry args={[0.2, 0.15, 12, 1, true]} />
        <meshStandardMaterial 
          color="#cff068" 
          metalness={0.9} 
          roughness={0.1} 
          side={THREE.DoubleSide} 
        />
      </mesh>

      {/* Translucent Laser Scanning Beam (Chapter 1 & 2 only) */}
      <mesh 
        ref={beamRef} 
        position={[0, -5, 0]} 
        rotation={[0, 0, 0]}
      >
        <coneGeometry args={[2.5, 10, 16, 1, true]} />
        <meshBasicMaterial
          color="#cff068"
          transparent
          opacity={0.25}
          side={THREE.DoubleSide}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}
