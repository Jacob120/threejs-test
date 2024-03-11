import React, { useEffect, useRef, useState } from "react";

import Element from "./Element";
import ElementWithCurve from "./ElementWithCurve";
import Model3d from "./Model3d";

import { CylinderGeometry, BoxGeometry } from "three";

// main engine to display furniture
// calling self recursively in case needed.
// setting up positions for Element, ElementWithCurve and Model3d.
const Szafka = (props) => {
  const {
    szafka,
    params,
    materialy,
    edges,
    position,
    shadow,
    main,
    macroModels,
  } = props;

  const group = useRef();
  const [mojaSzafka, setMojaSzafka] = useState(undefined);
  const [isReadyToRender, setIsReadyToRender] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      calculateModels();
    }, 50);
    return () => clearTimeout(timer);
  }, [props]);

  useEffect(() => {
    mojaSzafka && setIsReadyToRender(true);
  }, [mojaSzafka]);

  const getWymiaryObject = (przeliczanyElement) => {
    return {
      x:
        przeliczanyElement.kierunek === "Poziomo"
          ? przeliczanyElement.wysokosc.calc / 10
          : przeliczanyElement.kierunek === "Pion_front"
            ? przeliczanyElement.szerokosc.calc / 10
            : przeliczanyElement.glebokosc.calc / 10,
      y:
        przeliczanyElement.kierunek !== "Poziomo"
          ? przeliczanyElement.wysokosc.calc / 10
          : przeliczanyElement.glebokosc.calc / 10,
      z:
        przeliczanyElement.kierunek !== "Pion_front"
          ? przeliczanyElement.szerokosc.calc / 10
          : przeliczanyElement.glebokosc.calc / 10,
    };
  };

  const draw3DModelsForFormatkaWithoutCurves = (
    przeliczanyElement,
    models,
    macroModels,
  ) => {
    // if(macroModels)  console.log('draw3DModelsForFormatkaWithoutCurves', macroModels.length)

    let allModels = [];
    if (models)
      allModels = (macroModels && models.concat(macroModels)) || models;
    else {
      allModels = macroModels;
      // console.log('draw3DModels for ', przeliczanyElement.name,  allModels)
    }
    return (
      <group
        key={przeliczanyElement.name}
        position={[
          (przeliczanyElement.x.calc - main.szerokosc.calc / 2) / 10,
          (przeliczanyElement.y.calc - main.wysokosc.calc / 2) / 10,
          przeliczanyElement.kierunek !== "Pion_front"
            ? (przeliczanyElement.z.calc + main.glebokosc.calc / 2) / 10
            : (przeliczanyElement.z.calc +
                main.glebokosc.calc / 2 +
                przeliczanyElement.glebokosc.calc) /
              10,
        ]}
      >
        <group
          rotation={[
            przeliczanyElement.obrot
              ? (przeliczanyElement.obrot.x * Math.PI) / 180
              : 0,
            przeliczanyElement.obrot
              ? (przeliczanyElement.obrot.y * Math.PI) / 180
              : 0,
            przeliczanyElement.obrot
              ? (przeliczanyElement.obrot.z * Math.PI) / 180
              : 0,
          ]}
        >
          {przeliczanyElement.category.slice(0, 2) === "5_" && ( // for leg
            <group
              position={[
                0,
                przeliczanyElement.kierunek === "Poziomo"
                  ? przeliczanyElement.glebokosc.calc / 2 / 10
                  : przeliczanyElement.kierunek === "Pion_bok"
                    ? przeliczanyElement.wysokosc.calc / 2 / 10
                    : przeliczanyElement.wysokosc.calc / 2 / 10,
                0,
              ]}
            >
              <mesh>
                <cylinderBufferGeometry
                  args={[
                    przeliczanyElement.glebokosc.calc / 10,
                    przeliczanyElement.glebokosc.calc / 10,
                    przeliczanyElement.wysokosc.calc / 10,
                    32,
                  ]}
                />
                <meshStandardMaterial
                  color={"silver"}
                  roughness={0.5}
                  metalness={1.0}
                  emissiveIntensity={0.2}
                  emissive={"silver"}
                  transparent
                  opacity={props.visible ? 1 : 0.4}
                />
              </mesh>
              {edges &&
                przeliczanyElement.category.slice(0, 2) === "5_" && ( // lines for leg
                  <mesh>
                    <lineSegments>
                      <edgesGeometry
                        attach="geometry"
                        args={[
                          new CylinderGeometry(
                            przeliczanyElement.glebokosc.calc / 10,
                            przeliczanyElement.glebokosc.calc / 10,
                            przeliczanyElement.wysokosc.calc / 10,
                            8,
                          ),
                        ]}
                      />
                      <lineBasicMaterial
                        color="black"
                        attach="material"
                        lineWidth={5}
                      />
                    </lineSegments>
                  </mesh>
                )}
            </group>
          )}
          <group
            position={[
              przeliczanyElement.kierunek === "Poziomo"
                ? przeliczanyElement.wysokosc.calc / 2 / 10
                : przeliczanyElement.kierunek === "Pion_bok"
                  ? przeliczanyElement.glebokosc.calc / 2 / 10
                  : przeliczanyElement.szerokosc.calc / 2 / 10,
              przeliczanyElement.kierunek === "Poziomo"
                ? przeliczanyElement.glebokosc.calc / 2 / 10
                : przeliczanyElement.kierunek === "Pion_bok"
                  ? przeliczanyElement.wysokosc.calc / 2 / 10
                  : przeliczanyElement.wysokosc.calc / 2 / 10,
              przeliczanyElement.kierunek === "Poziomo"
                ? -przeliczanyElement.szerokosc.calc / 2 / 10
                : przeliczanyElement.kierunek === "Pion_bok"
                  ? -przeliczanyElement.szerokosc.calc / 2 / 10
                  : -przeliczanyElement.glebokosc.calc / 2 / 10,
            ]}
          >
            {przeliczanyElement.category.slice(0, 2) !== "5_" && ( //if not leg
              // add console.log
              // (console.log(
              //   " przeliczanyElement.glebokosc.calc",
              //   przeliczanyElement.glebokosc.calc
              // ),
              // console.log(
              //   "przeliczanyElement.szerokosc",
              //   przeliczanyElement.szerokosc
              // ),
              // console.log(
              //   "przeliczanyElement.szerokosc.calc / 10",
              //   przeliczanyElement.szerokosc.calc / 10
              // ),
              // console.log(
              //   "przeliczanyElement.glebokosc.calc / 10",
              //   przeliczanyElement.glebokosc.calc / 10
              // ),
              <Element
                name={przeliczanyElement.name}
                wymiary={{
                  x:
                    przeliczanyElement.kierunek === "Poziomo"
                      ? przeliczanyElement.wysokosc.calc / 10
                      : przeliczanyElement.kierunek === "Pion_front"
                        ? przeliczanyElement.szerokosc.calc / 10
                        : przeliczanyElement.glebokosc.calc / 10,
                  y:
                    przeliczanyElement.kierunek !== "Poziomo"
                      ? przeliczanyElement.wysokosc.calc / 10
                      : przeliczanyElement.glebokosc.calc / 10,
                  z:
                    przeliczanyElement.kierunek !== "Pion_front"
                      ? przeliczanyElement.szerokosc.calc / 10
                      : przeliczanyElement.glebokosc.calc / 10,
                  grubosc:
                    przeliczanyElement.grubosc && przeliczanyElement.grubosc,
                }}
                visible={props.visible}
                krawedzie={przeliczanyElement.krawedzie}
                materialy={materialy}
                edges={edges}
                shadow={shadow}
                obrocenie={przeliczanyElement.obrocenie}
                obrot={{ x: 0, y: 0, z: 0 }}
                params={params}
                kierunek={przeliczanyElement.kierunek}
                has3dModel={przeliczanyElement.has3dModel}
                models={allModels}
              />
            )}
            {edges &&
              przeliczanyElement.category.slice(0, 2) !== "5_" && ( //lined for Element
                <mesh>
                  <lineSegments>
                    <edgesGeometry
                      attach="geometry"
                      args={[
                        new BoxGeometry(
                          przeliczanyElement.kierunek === "Poziomo"
                            ? przeliczanyElement.wysokosc.calc / 10
                            : przeliczanyElement.kierunek === "Pion_front"
                              ? przeliczanyElement.szerokosc.calc / 10
                              : przeliczanyElement.glebokosc.calc / 10,
                          przeliczanyElement.kierunek !== "Poziomo"
                            ? przeliczanyElement.wysokosc.calc / 10
                            : przeliczanyElement.glebokosc.calc / 10,
                          przeliczanyElement.kierunek !== "Pion_front"
                            ? przeliczanyElement.szerokosc.calc / 10
                            : przeliczanyElement.glebokosc.calc / 10,
                        ),
                      ]}
                    />
                    <lineBasicMaterial
                      color="black"
                      attach="material"
                      lineWidth={5}
                    />
                  </lineSegments>
                </mesh>
              )}
          </group>
        </group>
      </group>
    );
  };

  const draw3DModelsForFormatkaWithCurves = (
    przeliczanyElement,
    models,
    macroModels,
  ) => {
    // console.log(
    //   "draw3DModelsForFormatkaWithCurves",
    //   przeliczanyElement.name,
    //   models,
    //   macroModels,
    // );
    let allModels = [];
    if (models)
      allModels = (macroModels && models.concat(macroModels)) || models;
    else allModels = macroModels;

    return (
      <group
        key={przeliczanyElement.name}
        position={[
          (przeliczanyElement.x.calc - main.szerokosc.calc / 2) / 10,
          (przeliczanyElement.y.calc - main.wysokosc.calc / 2) / 10,
          przeliczanyElement.kierunek !== "Pion_front"
            ? (przeliczanyElement.z.calc + main.glebokosc.calc / 2) / 10
            : (przeliczanyElement.z.calc +
                main.glebokosc.calc / 2 +
                przeliczanyElement.glebokosc.calc) /
              10,
        ]}
      >
        <group
          rotation={[
            przeliczanyElement.obrot
              ? (przeliczanyElement.obrot.x * Math.PI) / 180
              : 0,
            przeliczanyElement.obrot
              ? (przeliczanyElement.obrot.y * Math.PI) / 180
              : 0,
            przeliczanyElement.obrot
              ? (przeliczanyElement.obrot.z * Math.PI) / 180
              : 0,
          ]}
        >
          <group
            position={[
              przeliczanyElement.kierunek === "Poziomo"
                ? przeliczanyElement.wysokosc.calc / 2 / 10
                : przeliczanyElement.kierunek === "Pion_bok"
                  ? przeliczanyElement.glebokosc.calc / 2 / 10
                  : przeliczanyElement.szerokosc.calc / 2 / 10,
              przeliczanyElement.kierunek === "Poziomo"
                ? przeliczanyElement.glebokosc.calc / 2 / 10
                : przeliczanyElement.kierunek === "Pion_bok"
                  ? przeliczanyElement.wysokosc.calc / 2 / 10
                  : przeliczanyElement.wysokosc.calc / 2 / 10,
              przeliczanyElement.kierunek === "Poziomo"
                ? -przeliczanyElement.szerokosc.calc / 2 / 10
                : przeliczanyElement.kierunek === "Pion_bok"
                  ? -przeliczanyElement.szerokosc.calc / 2 / 10
                  : -przeliczanyElement.glebokosc.calc / 2 / 10,
            ]}
          >
            <group key={przeliczanyElement.name}>
              <ElementWithCurve
                name={przeliczanyElement.name}
                wymiary={{
                  x:
                    przeliczanyElement.kierunek === "Poziomo"
                      ? przeliczanyElement.wysokosc.calc / 10
                      : przeliczanyElement.kierunek === "Pion_front"
                        ? przeliczanyElement.szerokosc.calc / 10
                        : przeliczanyElement.glebokosc.calc / 10,
                  y:
                    przeliczanyElement.kierunek !== "Poziomo"
                      ? przeliczanyElement.wysokosc.calc / 10
                      : przeliczanyElement.glebokosc.calc / 10,
                  z:
                    przeliczanyElement.kierunek !== "Pion_front"
                      ? przeliczanyElement.szerokosc.calc / 10
                      : przeliczanyElement.glebokosc.calc / 10,
                }}
                grubosc={przeliczanyElement.grubosc}
                visible={props.visible}
                krawedzie={przeliczanyElement.krawedzie}
                materialy={materialy}
                edges={edges}
                obrocenie={przeliczanyElement.obrocenie}
                krzywe={przeliczanyElement.krzywe}
                kierunek={przeliczanyElement.kierunek}
                has3dModel={przeliczanyElement.has3dModel}
                models={allModels}
                curvesParams={przeliczanyElement.curvesParams}
                category={przeliczanyElement.category.substr(
                  0,
                  przeliczanyElement.category.indexOf("_"),
                )}
              />
            </group>
          </group>
        </group>
      </group>
    );
  };

  const draw3DModelsForModel3D = (przeliczanyElement, models, macroModels) => {
    // console.log(
    //   "draw3DModelsForModel3D",
    //   przeliczanyElement.name,
    //   models,
    //   macroModels,
    // );
    let allModels = [];
    if (models)
      allModels = (macroModels && models.concat(macroModels)) || models;

    const wymiaryObject = getWymiaryObject(przeliczanyElement);

    return (
      <group
        key={przeliczanyElement.name + "_model3d"}
        position={[
          (przeliczanyElement.x.calc - main.szerokosc.calc / 2) / 10,
          (przeliczanyElement.y.calc - main.wysokosc.calc / 2) / 10,
          przeliczanyElement.kierunek !== "Pion_front"
            ? (przeliczanyElement.z.calc + main.glebokosc.calc / 2) / 10
            : (przeliczanyElement.z.calc + main.glebokosc.calc / 2) / 10,
        ]}
      >
        <group
          rotation={[
            przeliczanyElement.obrot
              ? (przeliczanyElement.obrot.x * Math.PI) / 180
              : 0,
            przeliczanyElement.obrot
              ? (przeliczanyElement.obrot.y * Math.PI) / 180
              : 0,
            przeliczanyElement.obrot
              ? (przeliczanyElement.obrot.z * Math.PI) / 180
              : 0,
          ]}
        >
          <group>
            {allModels.map((model, index) => {
              return (
                <Model3d
                  key={index}
                  model_data={model}
                  wymiary={wymiaryObject}
                  kierunek={przeliczanyElement.kierunek}
                  visible={props.visible}
                  formatka={false}
                  name={przeliczanyElement.name}
                />
              );
            })}
          </group>
        </group>
      </group>
    );
  };

  const draw3DModelsForTypeElement = (
    przeliczanyElement,
    models,
    macroModels,
  ) => {
    // console.log(
    //   "draw3DModelsForTypeElement",
    //   przeliczanyElement.name,
    //   models,
    //   macroModels,
    // );
    let allModels = [];
    if (models)
      allModels = (macroModels && models.concat(macroModels)) || models;

    const wymiaryObject = getWymiaryObject(przeliczanyElement);

    return (
      <group
        key={przeliczanyElement.nameMongo}
        position={[
          (przeliczanyElement.x.calc - main.szerokosc.calc / 2) / 10,
          (przeliczanyElement.y.calc - main.wysokosc.calc / 2) / 10,
          (przeliczanyElement.z.calc + main.glebokosc.calc / 2) / 10,
        ]}
      >
        <group
          rotation={[
            przeliczanyElement.obrot
              ? (przeliczanyElement.obrot.x * Math.PI) / 2 / 180
              : 0,
            przeliczanyElement.obrot
              ? (przeliczanyElement.obrot.y * Math.PI) / 180
              : 0,
            przeliczanyElement.obrot
              ? (przeliczanyElement.obrot.z * Math.PI) / 180
              : 0,
          ]}
        >
          <group
            position={[
              przeliczanyElement.szerokosc.calc / 2 / 10,
              przeliczanyElement.wysokosc.calc / 2 / 10,
              -przeliczanyElement.glebokosc.calc / 2 / 10,
            ]}
          >
            <Szafka // recursively open self (cabinet in cabinet)
              szafka={przeliczanyElement}
              materialy={materialy}
              visible={props.visible}
              shadow={props.shadow}
              resetView={props.resetView}
              viewReseted={props.viewReseted}
              edges={props.edges}
              main={przeliczanyElement}
            />

            {przeliczanyElement.has3dModel &&
              przeliczanyElement.has3dModel === "true" && (
                <group
                  position={[
                    -przeliczanyElement.szerokosc.calc / 2 / 10,
                    -przeliczanyElement.wysokosc.calc / 2 / 10,
                    przeliczanyElement.glebokosc.calc / 2 / 10,
                  ]}
                >
                  {allModels.map((model, index) => {
                    return (
                      <Model3d
                        key={index}
                        model_data={model}
                        wymiary={wymiaryObject}
                        kierunek={przeliczanyElement.kierunek}
                        visible={props.visible}
                        formatka={false}
                        name={przeliczanyElement.name}
                      />
                    );
                  })}
                </group>
              )}
          </group>
        </group>
      </group>
    );
  };

  function isEmptyObjectOrUndefined(obj) {
    return obj == undefined || Object.keys(obj).length === 0;
  }

  const calculateModels = () => {
    if (!szafka || typeof szafka !== "object") {
      return [];
    }

    const mojaSzafka =
      (isEmptyObjectOrUndefined(macroModels) &&
        Object.values(szafka?.objects ?? {}).map((przeliczanyElement) => {
          if (przeliczanyElement.visible.localeCompare("true")) return; // if not visible return nothing

          if (przeliczanyElement.typ === "model3d") {
            przeliczanyElement.kierunek = "Pion_front";
            return draw3DModelsForModel3D(
              przeliczanyElement,
              undefined,
              macroModels,
            );
          }
          if (przeliczanyElement.typ === "formatka") {
            if (
              //simple element without curves
              !(
                przeliczanyElement.hasCurve &&
                przeliczanyElement.hasCurve == "true"
              )
            ) {
              return draw3DModelsForFormatkaWithoutCurves(
                przeliczanyElement,
                przeliczanyElement.models,
                przeliczanyElement.macroModels,
              );
            } else {
              // element with curves
              return draw3DModelsForFormatkaWithCurves(
                przeliczanyElement,
                przeliczanyElement.models,
                przeliczanyElement.macroModels,
              );
            }
          } else {
            //if not "formatka"
            if (!przeliczanyElement.kierunek)
              przeliczanyElement.kierunek = "Pion_front";
            // przeliczanyElement.kierunek = "Pion_front";
            return draw3DModelsForTypeElement(
              przeliczanyElement,
              przeliczanyElement.models,
              przeliczanyElement.macroModels,
            );
          }
        })) ||
      // Object.entries(macroModels).map(([key, macrosObj], index) => {
      Object.entries(macroModels).map((macrosObj, index) => {
        if (macrosObj[1].visible.localeCompare("true")) return; // if not visible return nothing

        if (macrosObj[1].typ === "model3d") {
          macrosObj[1].kierunek = "Pion_front";

          return draw3DModelsForModel3D(
            macrosObj[1],
            macrosObj[1].models,
            macrosObj[1].macroModels,
          );
        }
        if (macrosObj[1].typ === "formatka") {
          if (
            //simple element without curves
            !(macrosObj[1].hasCurve && macrosObj[1].hasCurve == "true")
          ) {
            return draw3DModelsForFormatkaWithoutCurves(
              macrosObj[1],
              macrosObj[1].models,
              macrosObj[1].macroModels,
            );
          } else {
            // element with curves
            return draw3DModelsForFormatkaWithCurves(
              macrosObj[1],
              macrosObj[1].models,
              macrosObj[1].macroModels,
            );
          }
        } else {
          //if not "formatka"
          if (!macrosObj[1].kierunek) macrosObj[1].kierunek = "Pion_front";
          // macrosObj[1].kierunek = "Pion_front";
          return draw3DModelsForTypeElement(
            macrosObj[1],
            macrosObj[1].models,
            macrosObj[1].macroModels,
          );
        }
      });

    setMojaSzafka(mojaSzafka);
  };

  if (!isReadyToRender) return <>Loading..</>;
  return (
    <>
      <mesh
        visible
        rotation={[0, 0, 0]}
        castShadow={shadow}
        position={position}
      >
        <group ref={group}>{mojaSzafka}</group>
        {/* <group ref={group}>{mojaSzafka1}</group> */}
      </mesh>
    </>
  );
};
export default Szafka;
