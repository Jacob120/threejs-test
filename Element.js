import React, { useEffect, useMemo, useRef } from "react";
import Model3d from "./Model3d";

import { TextureLoader, RepeatWrapping } from "three";

// displays element in case no curves inside
const Element = ({
  name,
  polozenie,
  krawedzie,
  wymiary,
  materialy,
  obrot,
  obrocenie,
  visible,
  shadow,
  kierunek,
  has3dModel,
  models,
}) => {
  // console.log("name materialy", name, materialy);

  const mesh = useRef();

  const box = (
    <boxGeometry attach="geometry" args={[wymiary.x, wymiary.y, wymiary.z]} />
  );

  /* Kolejnosć boków przy wczytywaniu tekstury
  order of sides when loading textures
0 prawo / right
1 lewo / left
2 gora / up 
3 dol / down
4 przod / front
5 tyl / back
*/

  function decodeHtmlEntity(str) {
    return str.replace(/&#x2F;/g, "/");
  }

  const loader = new TextureLoader();
  let textureArray = useMemo(() =>
    krawedzie.map(
      (krawedz, index) => {
        let textureFactor = 50;
        const textureRatio = 0.5;
        let texture;
        if (!krawedz.localeCompare("brak")) {
          texture = loader.load("/img/plyta-mfp.jpg"); // texture when no decor.
        } else {
          /* For local testing */
          // texture = loader.load(
          //   materialy[krawedz] && materialy[krawedz].matimg !== undefined
          //     ? process.env.NEXT_PUBLIC_API_BASE_URL +
          //         "/uploads/materials/textures/" +
          //         materialy[krawedz].matimg
          //     : "/img/missing.jpg" // texture in case material is missing
          // );

          /* For deployment */
          texture = loader.load(
            materialy[krawedz] && materialy[krawedz].matimg !== undefined
              ? process.env.NEXT_PUBLIC_API_BASE_URL +
                  "/" +
                  decodeHtmlEntity(materialy[krawedz].matimg)
              : "/img/missing.jpg", // texture in case material is missing
          );
        }

        texture.wrapS = RepeatWrapping;
        texture.wrapT = RepeatWrapping;
        texture.name = krawedz;
        switch (kierunek) {
          case "Pion_front":
            if (index == 4 || index == 5)
              // break
              // if (!obrocenie)
              texture.repeat.set(
                obrocenie !== "true"
                  ? (wymiary.x / textureFactor) * textureRatio
                  : (wymiary.y / textureFactor) * textureRatio,
                obrocenie !== "true"
                  ? (wymiary.y / textureFactor) * textureRatio // Note: it was without * textureRatio
                  : (wymiary.x / textureFactor) * textureRatio, // Note: it was without * textureRatio
              );
            else if (index === 0 || index === 1)
              texture.repeat.set(
                obrocenie !== "true"
                  ? (wymiary.z / textureFactor) * textureRatio
                  : (wymiary.y / textureFactor) * textureRatio,
                obrocenie !== "true"
                  ? wymiary.y / textureFactor
                  : wymiary.z / textureFactor,
              );
            else
              texture.repeat.set(
                obrocenie !== "true"
                  ? (wymiary.x / textureFactor) * textureRatio
                  : (wymiary.z / textureFactor) * textureRatio,
                obrocenie !== "true"
                  ? wymiary.z / textureFactor
                  : wymiary.x / textureFactor,
              );
            break;
          case "Poziomo":
            if (index == 2 || index == 3)
              texture.repeat.set(
                obrocenie !== "true"
                  ? (wymiary.x / textureFactor) * textureRatio
                  : (wymiary.z / textureFactor) * textureRatio,
                obrocenie !== "true"
                  ? wymiary.z / textureFactor
                  : wymiary.x / textureFactor,
              );
            else if (index === 0 || index === 1)
              texture.repeat.set(
                obrocenie !== "true"
                  ? (wymiary.y / textureFactor) * textureRatio
                  : (wymiary.z / textureFactor) * textureRatio,
                obrocenie !== "true"
                  ? wymiary.z / textureFactor
                  : wymiary.y / textureFactor,
              );
            else
              texture.repeat.set(
                obrocenie !== "true"
                  ? (wymiary.x / textureFactor) * textureRatio
                  : (wymiary.y / textureFactor) * textureRatio,
                obrocenie !== "true"
                  ? wymiary.y / textureFactor
                  : wymiary.x / textureFactor,
              );
            break;
          case "Pion_bok":
            if (index == 1 || index == 0)
              texture.repeat.set(
                obrocenie !== "true"
                  ? (wymiary.z / textureFactor) * textureRatio
                  : (wymiary.y / textureFactor) * textureRatio,
                obrocenie !== "true"
                  ? wymiary.y / textureFactor
                  : wymiary.z / textureFactor,
              );
            else if (index === 2 || index === 3)
              texture.repeat.set(
                obrocenie !== "true"
                  ? (wymiary.x / textureFactor) * textureRatio
                  : (wymiary.z / textureFactor) * textureRatio,
                obrocenie !== "true"
                  ? wymiary.z / textureFactor
                  : wymiary.x / textureFactor,
              );
            else
              texture.repeat.set(
                obrocenie !== "true"
                  ? (wymiary.x / textureFactor) * textureRatio
                  : (wymiary.y / textureFactor) * textureRatio,
                obrocenie !== "true"
                  ? wymiary.y / textureFactor
                  : wymiary.x / textureFactor,
              );
            break;
        }
        if (obrocenie === "true") {
          texture.rotation = Math.PI / 2;
        }
        return texture;
      },
      [JSON.stringify(materialy)],
    ),
  );
  // console.log("textureArray", textureArray);

  const myMaterialMesh = useMemo(
    () =>
      textureArray.map((_texture, index) => {
        const isMirror = materialy[krawedzie[index]]?.matimg?.includes("glass");

        // Create a MeshPhysicalMaterial for glass materials
        return isMirror ? (
          <meshStandardMaterial
            // key={index}
            // attachArray="material"
            // map={_texture}
            // roughness={0}
            // metalness={0.2}
            // reflectivity={1}
            // clearcoat={1}
            // clearcoatRoughness={0}
            // transparent={true}
            // opacity={visible ? 1 : 0.4}
            key={index}
            attachArray="material"
            // color={"#d8e9eb"} // White color to ensure full reflectivity
            color={"#ffffff"} // White color to ensure full reflectivity
            // color={"#8fa3af"} // Blue color to ensure full reflectivity
            // envMap={envMap} // Set the loaded environment map here
            metalness={0.3} // Full metalness for maximum reflectivity
            roughness={0} // Zero roughness for a smooth reflective surface
            reflectivity={1} // Maximum reflectivity
            clearcoat={1} // Use clearcoat to enhance the reflective effect
            clearcoatRoughness={0} // Keep the clearcoat layer smooth
            transparent={true}
            opacity={1} // Adjust opacity if you want some see-through effect
          />
        ) : (
          <meshStandardMaterial
            key={index}
            attachArray="material"
            map={_texture}
            roughness={0.6}
            metalness={0.1}
            reflectivity={0}
            transparent
            opacity={visible ? 1 : 0.4}
          />
        );
      }),
    [JSON.stringify(materialy), visible],
  );
  return (
    <group>
      {name !== "makro" && (
        <mesh
          ref={mesh}
          rotation={[obrot.x, obrot.y, obrot.z]}
          castShadow={shadow}
        >
          {box}
          {myMaterialMesh}
        </mesh>
      )}
      {has3dModel == "true" && (
        <>
          {models &&
            models.map((model, index) => {
              return (
                <Model3d
                  key={index}
                  model_data={model}
                  wymiary={wymiary}
                  kierunek={kierunek}
                  visible={visible}
                  formatka={true}
                />
              );
            })}
        </>
      )}
    </group>
  );
};
export default Element;
