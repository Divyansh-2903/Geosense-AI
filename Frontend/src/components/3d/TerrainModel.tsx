import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface TerrainModelProps {
  scrollProgress: number;
}

export default function TerrainModel({ scrollProgress }: TerrainModelProps) {
  const groundRef = useRef<THREE.Mesh>(null);
  const gridRef = useRef<THREE.Mesh>(null);
  const instancedGrassRef = useRef<THREE.InstancedMesh>(null);
  const rootsGroupRef = useRef<THREE.Group>(null);
  const scannerRef = useRef<THREE.Mesh>(null);

  // Height function to define the hills/terrain topology
  const getTerrainHeight = (x: number, z: number) => {
    return Math.sin(x * 0.15) * Math.cos(z * 0.15) * 0.7 + Math.sin(x * 0.05) * 1.2;
  };

  // 1. Generate displaced ground geometry
  const groundGeometry = useMemo(() => {
    const geom = new THREE.PlaneGeometry(40, 40, 30, 30);
    geom.rotateX(-Math.PI / 2); // Lay flat on XZ plane

    const pos = geom.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const z = pos.getZ(i);
      const y = getTerrainHeight(x, z);
      pos.setY(i, y); // Y is up
    }
    geom.computeVertexNormals();
    return geom;
  }, []);

  // 2. Setup instanced grass/crops (neat rows of wheat/grass)
  const grassCount = 450;
  const tempObject = new THREE.Object3D();

  const grassPositions = useMemo(() => {
    const positions: [number, number, number][] = [];
    const rows = 18;
    const cols = 25;

    // Distribute in agricultural crop rows
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        // Add slight noise to position to feel natural but still row-based
        const x = -15 + r * 1.8 + (Math.random() - 0.5) * 0.4;
        const z = -15 + c * 1.3 + (Math.random() - 0.5) * 0.3;

        // Skip crops in a center circle to let scanning display clearly
        const dist = Math.sqrt(x*x + z*z);
        if (dist < 1.0) continue;

        const y = getTerrainHeight(x, z);
        positions.push([x, y, z]);
      }
    }
    return positions.slice(0, grassCount);
  }, []);

  // 3. Generate underground root curves (Chapter 3)
  const rootPaths = useMemo(() => {
    const paths = [];
    const rootCount = 15;

    for (let i = 0; i < rootCount; i++) {
      // Start root near the surface under the crops
      const startX = (Math.random() - 0.5) * 12;
      const startZ = (Math.random() - 0.5) * 12;
      const startY = getTerrainHeight(startX, startZ) - 0.1;

      const points = [];
      let currentX = startX;
      let currentY = startY;
      let currentZ = startZ;

      // Grow root downward with random branching
      for (let j = 0; j < 5; j++) {
        points.push(new THREE.Vector3(currentX, currentY, currentZ));
        currentX += (Math.random() - 0.5) * 1.2;
        currentY -= 0.8 + Math.random() * 0.6; // Growing down
        currentZ += (Math.random() - 0.5) * 1.2;
      }

      paths.push(new THREE.CatmullRomCurve3(points));
    }
    return paths;
  }, []);

  // 4. Custom shader for swaying grass
  const grassMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: "#cff068",
      roughness: 0.6,
      metalness: 0.1,
      side: THREE.DoubleSide,
    });
  }, []);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();

    // A. Animate grass swaying (wind)
    if (instancedGrassRef.current) {
      const windSpeed = 1.8;
      const windStrength = 0.12;

      grassPositions.forEach((pos, idx) => {
        const [x, y, z] = pos;
        tempObject.position.set(x, y, z);

        // Wind calculation based on time and position
        const wind = Math.sin(time * windSpeed + x * 0.5 + z * 0.3) * windStrength;
        
        // Tilt the grass in response to wind and add slight scaling
        tempObject.rotation.set(wind, Math.sin(x * 10) * 0.2, wind * 0.5);
        tempObject.scale.set(0.12, 0.4 + Math.abs(wind) * 0.5, 0.12);
        
        tempObject.updateMatrix();
        instancedGrassRef.current!.setMatrixAt(idx, tempObject.matrix);
      });
      instancedGrassRef.current.instanceMatrix.needsUpdate = true;
    }

    // B. Animate scanning sweep plane (Chapter 2)
    if (scannerRef.current) {
      // Oscillate scanner position across the field
      scannerRef.current.position.z = Math.sin(time * 0.8) * 14;
      
      // Control opacity: fade in during scanning chapter (scrollProgress approx 0.5 to 1.5)
      const mat = scannerRef.current.material as THREE.MeshBasicMaterial;
      if (scrollProgress > 0.1 && scrollProgress < 1.6) {
        const entryFade = Math.min(1, (scrollProgress - 0.1) * 3);
        const exitFade = Math.min(1, (1.6 - scrollProgress) * 3);
        mat.opacity = 0.25 * entryFade * exitFade * (0.6 + Math.sin(time * 6) * 0.4);
      } else {
        mat.opacity = 0;
      }
    }

    // C. Root systems glow & reveal (Chapter 3)
    if (rootsGroupRef.current) {
      // Fade in roots as we scroll down into Chapter 3 (scrollProgress > 1.0)
      const rootFade = scrollProgress < 1.0 
        ? 0 
        : Math.min(1, (scrollProgress - 1.0) * 1.5);
      
      rootsGroupRef.current.position.y = (1 - rootFade) * -3; // Rise up into view
      
      rootsGroupRef.current.traverse((child) => {
        if (child instanceof THREE.Line || child instanceof THREE.Mesh) {
          const mat = child.material as THREE.Material;
          mat.transparent = true;
          mat.opacity = rootFade * 0.8;
        }
      });
    }

    // D. Fade out grass when scrolling deep underground (scrollProgress > 1.5)
    if (instancedGrassRef.current) {
      const grassFade = scrollProgress < 1.2
        ? 1
        : Math.max(0, 1 - (scrollProgress - 1.2) * 2);
      
      const mat = instancedGrassRef.current.material as THREE.MeshStandardMaterial;
      mat.transparent = true;
      mat.opacity = grassFade;
    }

    // E. Fade out terrain when scrolling deep underground
    if (groundRef.current && gridRef.current) {
      const groundFade = scrollProgress < 1.3
        ? 1
        : Math.max(0.1, 1 - (scrollProgress - 1.3) * 1.5);
      
      const groundMat = groundRef.current.material as THREE.MeshStandardMaterial;
      const gridMat = gridRef.current.material as THREE.MeshBasicMaterial;

      groundMat.transparent = true;
      groundMat.opacity = groundFade;
      gridMat.transparent = true;
      gridMat.opacity = groundFade * 0.18;
    }
  });

  return (
    <group position={[0, -1, 0]}>
      {/* 1. Soil Ground Mesh */}
      <mesh ref={groundRef} geometry={groundGeometry} receiveShadow>
        <meshStandardMaterial 
          color="#0b1d0d" // Deep Forest Green ground
          roughness={0.9} 
          metalness={0.1} 
        />
      </mesh>

      {/* 2. Analytical Wireframe Grid (Holographic overlay) */}
      <mesh ref={gridRef} geometry={groundGeometry} position={[0, 0.01, 0]}>
        <meshBasicMaterial 
          color="#cff068" 
          wireframe 
          transparent
          opacity={0.18} 
        />
      </mesh>

      {/* 3. Crop Shoots (Instanced Mesh for high performance) */}
      <instancedMesh
        ref={instancedGrassRef}
        args={[null as any, null as any, grassCount]}
        castShadow
        receiveShadow
      >
        <coneGeometry args={[0.5, 2, 4]} />
        <primitive object={grassMaterial} />
      </instancedMesh>

      {/* 4. Scanner Laser Sweep Bar (Chapter 2 visual) */}
      <mesh ref={scannerRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, 0]}>
        <planeGeometry args={[35, 0.4]} />
        <meshBasicMaterial 
          color="#cff068" 
          transparent 
          opacity={0}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* 5. Underground Root Network (Chapter 3) */}
      <group ref={rootsGroupRef}>
        {rootPaths.map((path, idx) => {
          // Represent root as a tube or line
          const points = path.getPoints(30);
          const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);

          return (
            <group key={idx}>
              {/* @ts-ignore */}
              <line geometry={lineGeometry}>
                <lineBasicMaterial color="#3d2b1f" linewidth={2} />
              </line>

              {/* Glowing internal nutrient path */}
              {/* @ts-ignore */}
              <line geometry={lineGeometry}>
                <lineBasicMaterial 
                  color="#cff068" 
                  linewidth={1} 
                  transparent 
                  opacity={0.5} 
                  blending={THREE.AdditiveBlending}
                />
              </line>

              {/* Pulsing nutrient nodes moving along root */}
              <NutrientNode pathPoints={points} delay={idx * 0.4} />
            </group>
          );
        })}
      </group>
    </group>
  );
}

// Sub-component representing moving nutrient/water nodes in roots
interface NutrientNodeProps {
  pathPoints: THREE.Vector3[];
  delay: number;
}

function NutrientNode({ pathPoints, delay }: NutrientNodeProps) {
  const nodeRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!nodeRef.current) return;
    const time = state.clock.getElapsedTime() + delay;
    
    // Calculate position along path index (looping 0 to 1)
    const speed = 0.35;
    const t = (time * speed) % 1.0;
    
    // Find point on path
    const pointIdx = Math.floor(t * (pathPoints.length - 1));
    const nextIdx = Math.min(pointIdx + 1, pathPoints.length - 1);
    
    const p1 = pathPoints[pointIdx];
    const p2 = pathPoints[nextIdx];
    
    const alpha = (t * (pathPoints.length - 1)) % 1.0;
    nodeRef.current.position.lerpVectors(p1, p2, alpha);

    // Dynamic sizing based on flow
    const scale = 0.04 + Math.sin(time * 5) * 0.015;
    nodeRef.current.scale.set(scale, scale, scale);
  });

  return (
    <mesh ref={nodeRef}>
      <sphereGeometry args={[1, 8, 8]} />
      <meshBasicMaterial 
        color="#8dcc3e" 
        transparent 
        opacity={0.8} 
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  );
}
