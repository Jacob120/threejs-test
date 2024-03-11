import React from "react";
import { Vector3, BufferGeometry } from "three";
import { Html } from "../../utils/html/Html";

// pojedyncza strzałka wymiaru
// arrow for one dimension
function Wymiar({ position, wymiar, offset, rotation }) {
  const textOffset = 10;
  const points = [];
  points.push(new Vector3(-offset, -wymiar / 20, 0));
  points.push(new Vector3(0, -wymiar / 20, 0));
  points.push(new Vector3(0, wymiar / 20, 0));
  points.push(new Vector3(-offset, wymiar / 20, 0));
  const lineGeometry = new BufferGeometry().setFromPoints(points);
  return (
    <mesh position={position} rotation={rotation}>
      <mesh>
        <line geometry={lineGeometry}>
          <lineBasicMaterial color="grey" linewidth={5} />
        </line>
      </mesh>
      <mesh position={[0, -wymiar / 20 + 2.5, 0]} rotation={[Math.PI, 0, 0]}>
        <coneGeometry attach="geometry" args={[1.5, 5, 10]} />
        <meshStandardMaterial attach="material" color="grey" />
      </mesh>
      <mesh position={[0, wymiar / 20 - 2.5, 0]} rotation={[0, 0, 0]}>
        <coneGeometry attach="geometry" args={[1.5, 5, 10]} />
        <meshStandardMaterial attach="material" color="grey" />
      </mesh>

      <Html position={[textOffset, 0, 0]}>
        <div className="content">{wymiar}</div>
      </Html>
    </mesh>
  );
}

// wymiary szafki
// dimensions of furniture
export const Dimensions = ({ x, y, z }) => {
  const offset = 10;

  return (
    <group>
      <Wymiar
        position={[0, (1 * y) / 20 + offset, -z / 20]}
        wymiar={x}
        offset={offset}
        rotation={[0, 0, Math.PI / 2]}
      />
      <Wymiar
        position={[-x / 20 - offset, 0, -z / 20]}
        wymiar={y}
        offset={offset}
        rotation={[0, Math.PI, 0]}
      />
      <Wymiar
        position={[-x / 20 - offset, (-1 * y) / 20, 0]}
        wymiar={z}
        offset={offset}
        rotation={[Math.PI / 2, Math.PI, 0]}
      />
    </group>
  );
};
export default Dimensions;
