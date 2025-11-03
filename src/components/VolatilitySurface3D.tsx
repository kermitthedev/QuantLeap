import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Text } from "@react-three/drei";
import { Card } from "@/components/ui/card";
import * as THREE from "three";

function Surface({ data }: { data: number[][] }) {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.z += 0.001;
    }
  });

  const geometry = useMemo(() => {
    const geo = new THREE.PlaneGeometry(10, 10, data.length - 1, data[0].length - 1);
    const positions = geo.attributes.position;
    
    for (let i = 0; i < positions.count; i++) {
      const x = Math.floor(i / data[0].length);
      const y = i % data[0].length;
      if (data[x] && data[x][y] !== undefined) {
        positions.setZ(i, data[x][y] * 20);
      }
    }
    
    geo.computeVertexNormals();
    return geo;
  }, [data]);

  const colorMap = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 1;
    const ctx = canvas.getContext('2d')!;
    const gradient = ctx.createLinearGradient(0, 0, 256, 0);
    gradient.addColorStop(0, '#3b82f6');
    gradient.addColorStop(0.5, '#8b5cf6');
    gradient.addColorStop(1, '#ec4899');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 256, 1);
    return new THREE.CanvasTexture(canvas);
  }, []);

  return (
    <mesh ref={meshRef} geometry={geometry} rotation={[-Math.PI / 3, 0, 0]}>
      <meshStandardMaterial map={colorMap} side={THREE.DoubleSide} wireframe={false} />
    </mesh>
  );
}

export default function VolatilitySurface3D({ currentVolatility }: { currentVolatility: number }) {
  const data = useMemo(() => {
    const strikes = 20;
    const maturities = 20;
    const result: number[][] = [];
    
    for (let i = 0; i < strikes; i++) {
      result[i] = [];
      for (let j = 0; j < maturities; j++) {
        const strike = 80 + (i / strikes) * 40;
        const maturity = 0.1 + (j / maturities) * 2;
        const moneyness = strike / 100;
        
        // Volatility smile/skew
        const smile = Math.exp(-Math.pow(moneyness - 1, 2) * 2) * 0.1;
        const skew = (1 - moneyness) * 0.15;
        const termStructure = Math.sqrt(maturity) * 0.05;
        
        result[i][j] = currentVolatility + smile + skew + termStructure;
      }
    }
    
    return result;
  }, [currentVolatility]);

  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold mb-4">Interactive 3D Volatility Surface</h2>
      <div className="h-[500px] bg-gradient-to-br from-slate-900 to-slate-800 rounded-lg overflow-hidden">
        <Canvas camera={{ position: [15, 15, 15], fov: 50 }}>
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} intensity={1} />
          <pointLight position={[-10, -10, -10]} intensity={0.5} />
          <Surface data={data} />
          <OrbitControls enableZoom={true} enablePan={true} />
          <gridHelper args={[20, 20, '#444', '#222']} />
          <Text position={[0, -6, 0]} fontSize={0.5} color="white">
            Strike Price
          </Text>
          <Text position={[-6, 0, 0]} fontSize={0.5} color="white" rotation={[0, 0, Math.PI / 2]}>
            Time to Maturity
          </Text>
        </Canvas>
      </div>
      <p className="text-sm text-muted-foreground mt-4">
        🖱️ Drag to rotate • Scroll to zoom • Shows implied volatility across strikes and maturities
      </p>
    </Card>
  );
}
