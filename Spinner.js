import React, { useEffect } from "react";
import { Html } from "../../utils/html/Html";
import { useProgress } from "@react-three/drei";

export const Spinner = ({ x, y, z, changeStatus }) => {
  const { active, progress, errors, item, loaded, total } = useProgress();

  useEffect(() => {
    return function cleanup() {
      changeStatus("rendered");
    };
  }, []);

  const size = 150;

  return (
    <group>
      <mesh position={[0, 0, 0]} castShadow receiveShadow>
        <boxGeometry attach="geometry" args={[x, y, z]}></boxGeometry>
        <meshStandardMaterial attach="material" color="#bdbfc1" />
      </mesh>
      <Html position={[-size / 6, size / 6, 0]}>
        <div className="relative text-center w-full h-full flex items-center justify-center">
          <div
            className="text-primary-darken-orange inline-block h-24 w-24 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"
            role="status"
          ></div>

          <p className="absolute top-[25%] left-[30%] text-center text-lg font-semibold mt-3">
            {progress.toFixed(0)}%
          </p>
        </div>
      </Html>
    </group>
  );
};

export default Spinner;
