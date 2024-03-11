import { useState, useRef, Suspense, useEffect } from "react";
import { Canvas, useFrame, extend, useThree } from "react-three-fiber";
import Dimensions from "./Dimensions";
import Szafka from "./Szafka";
import { OrbitControls } from "../../utils/OrbitControls/OrbitControls";
import useWindowSize from "../../../lib/hooks/useWindowSize";
import Spinner from "./Spinner";
extend({ OrbitControls });

//orbit controls
const CameraControls = ({ resetNow, viewReseted }) => {
  // Get a reference to the Three.js Camera, and the canvas html element.
  // We need these to setup the OrbitControls component.
  // https://threejs.org/docs/#examples/en/controls/OrbitControls
  const {
    camera,
    gl: { domElement },
  } = useThree();
  // Ref to the controls, so that we can update them on every frame using useFrame
  const controls = useRef();
  useFrame(() => controls?.current?.update());

  if (resetNow && controls.current) {
    controls.current.reset();
    viewReseted();
  }

  return <orbitControls ref={controls} args={[camera, domElement]} />;
};

//canvas do three js - ustawienia świateł, tła, orbit controls, wymiary, spinner przy ładowaniu modeli
const ThreeCanvas = (props) => {
  const size = useWindowSize();
  const isMobile = size.width < 768;
  const cameraZPosition = isMobile ? 30 : 60;

  const szafka = props.szafka;
  // console.log('szafka in three.js', szafka)
  const [isReadyToRender, setIsReadyToRender] = useState(false);
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    setIsReadyToRender(true);
  }, []);

  function changeStatus(newStatus) {
    setStatus(newStatus);
  }

  function GroundPlane() {
    return (
      <mesh
        receiveShadow={true}
        rotation={[(3 * Math.PI) / 2, 0, 0]}
        position={[0, (-1 * szafka.main.wysokosc.calc) / 20, 0 - 4 / 10]}
      >
        <planeGeometry
          attach="geometry"
          args={[
            (3 * szafka.main.szerokosc.calc) / 10,
            szafka.main.glebokosc.calc / 10,
          ]}
          receiveShadow={true}
        />
        <meshStandardMaterial attach="material" color="green" />
        <shadowMaterial
          attach="material"
          transparent={true}
          opacity={0.4}
          blur={20}
        />
      </mesh>
    );
  }
  function WallPlane() {
    return (
      <mesh
        receiveShadow={true}
        rotation={[0, 0, 0]}
        position={[0, 0, (-1 * szafka.main.glebokosc.calc) / 20 - 4 / 10]}
      >
        <planeGeometry
          attach="geometry"
          args={[
            (3 * szafka.main.szerokosc.calc) / 10,
            szafka.main.wysokosc.calc / 10,
          ]}
          receiveShadow={true}
        />
        <meshStandardMaterial attach="material" color="pink" />
        <shadowMaterial attach="material" transparent={true} opacity={0.4} />
      </mesh>
    );
  }

  if (!isReadyToRender) return <>Loading..</>;
  return (
    <div
      className={`${status} ${
        props.paramsTabHeight > 1000 ? "sticky top-[80px]" : ""
      }`}
      id={status}
    >
      <Canvas
        id="canvas"
        shadowMap
        frameloop="demand"
        dpr={[1, 2]}
        style={{
          zIndex: 0,
          height: props.height
            ? props.height
            : "calc(100vh - 64px - 27px - 27px - 1.5rem - 6px - 6px - 1.5rem)",
        }}
        camera={{
          position: [
            -45,
            60,
            Math.max(szafka.main.wysokosc.calc, szafka.main.szerokosc.calc) /
              10 /
              (2 * Math.tan((cameraZPosition * Math.PI) / 360)),
          ],
          far: 10000,
          near: 0.1,
        }}
      >
        {
          // <directionalLight
          //   intensity={0.7}
          //   position={[60, 60, 60]}
          //   castShadow={true}
          //   shadow-mapSize-height={2048}
          //   shadow-mapSize-width={2048}
          //   shadow-camera-far={1200}
          //   shadow-camera-near={1.72}
          //   shadow-camera-left={-1000}
          //   shadow-camera-right={1000}
          //   shadow-camera-top={1000}
          //   shadow-camera-bottom={-1000}
          // />
        }
        {props.shadow && (
          <>
            <GroundPlane />
            <WallPlane />
          </>
        )}

        <hemisphereLight
          position={[0, -100, -200]}
          intensity={1.2}
          color={0x999999}
          name="hemisphere_light"
        />
        <CameraControls
          resetNow={props.resetView}
          viewReseted={props.viewReseted}
        />

        <Suspense
          fallback={
            <Spinner
              x={szafka.main.szerokosc.calc / 10}
              y={szafka.main.wysokosc.calc / 10}
              z={szafka.main.glebokosc.calc / 10}
              changeStatus={changeStatus}
            />
          }
        >
          <Szafka
            szafka={szafka.main}
            grupa="main"
            materialy={szafka.materialy}
            visible={props.visible}
            // shadow={props.shadow}
            resetView={props.resetView}
            viewReseted={props.viewReseted}
            edges={props.edges}
            position={[
              szafka.main.x.calc,
              szafka.main.y.calc,
              szafka.main.z.calc,
            ]}
            main={szafka.main}
            macroModels={props.macroModels}
          />
          {props.dimensions && (
            <Dimensions
              x={szafka.main.szerokosc.calc}
              y={szafka.main.wysokosc.calc}
              z={szafka.main.glebokosc.calc}
            />
          )}
        </Suspense>
      </Canvas>
    </div>
  );
};
export default ThreeCanvas;
