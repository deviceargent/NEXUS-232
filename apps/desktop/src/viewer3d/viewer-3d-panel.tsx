import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useNexus } from '../app/context.js';
import { Button, Badge } from '@nexus/ui';
import { Box, Eye, RefreshCw, ZoomIn } from 'lucide-react';

// Scientific 3D simulation vector field component
const SimulationMesh: React.FC = () => {
  const meshRef = useRef<THREE.Mesh>(null);
  const wireframeRef = useRef<THREE.Mesh>(null);

  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.25;
      meshRef.current.rotation.x += delta * 0.1;
    }
    if (wireframeRef.current) {
      wireframeRef.current.rotation.y += delta * 0.25;
      wireframeRef.current.rotation.x += delta * 0.1;
    }
  });

  return (
    <group>
      {/* Central Potential Well */}
      <mesh ref={meshRef}>
        <icosahedronGeometry args={[1.8, 2]} />
        <meshStandardMaterial
          color="#38bdf8"
          roughness={0.3}
          metalness={0.8}
          transparent
          opacity={0.7}
        />
      </mesh>

      {/* Outer Halo Dispersion Wireframe */}
      <mesh ref={wireframeRef}>
        <icosahedronGeometry args={[2.5, 1]} />
        <meshBasicMaterial color="#0284c7" wireframe />
      </mesh>

      {/* Scientific Reference Coordinate Ring */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.5, 0]}>
        <ringGeometry args={[2.8, 3.0, 32]} />
        <meshBasicMaterial color="#1e293b" side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
};

export const Viewer3DPanel: React.FC = () => {
  const { resources } = useNexus();
  const modelResource = resources.find((r) => r.type === '3DModel');

  return (
    <div className="h-full flex flex-col bg-[#07090e] font-mono text-xs overflow-hidden select-none">
      {/* 3D Viewer Header */}
      <div className="p-2 border-b border-[var(--nexus-border)] bg-[var(--nexus-surface)] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Box className="w-4 h-4 text-cyan-400" />
          <span className="font-semibold text-[var(--nexus-text)]">
            {modelResource?.title || 'Galactic Dispersion 3D Model'}
          </span>
          <Badge status="VALID">R3F / Three.js</Badge>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] text-[var(--nexus-text-dim)]">
            Orbit Camera: Active &bull; Perspective
          </span>
          <Button size="icon" variant="ghost" title="Reset View">
            <RefreshCw className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      {/* 3D Canvas Viewport */}
      <div className="flex-1 relative">
        <Canvas
          camera={{ position: [0, 2, 6], fov: 45 }}
          className="w-full h-full"
        >
          <color attach="background" args={['#07090e']} />
          <ambientLight intensity={0.4} />
          <pointLight position={[10, 10, 10]} intensity={1.5} color="#38bdf8" />
          <pointLight position={[-10, -10, -10]} intensity={0.5} color="#6366f1" />
          <gridHelper args={[20, 20, '#1e293b', '#0f172a']} position={[0, -2, 0]} />
          <SimulationMesh />
        </Canvas>

        {/* Technical HUD Overlay */}
        <div className="absolute bottom-3 left-3 p-2 rounded bg-[var(--nexus-surface)]/80 backdrop-blur-xs border border-[var(--nexus-border)] text-[10px] space-y-0.5 pointer-events-none">
          <div className="text-[var(--nexus-accent)] font-bold">MODEL ATTRIBUTES</div>
          <div className="text-[var(--nexus-text-dim)]">Geometry: Icosahedron Potential Well</div>
          <div className="text-[var(--nexus-text-dim)]">Halo Anisotropy Dispersion: 18.4 km/s</div>
        </div>
      </div>
    </div>
  );
};
