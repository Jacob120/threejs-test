import React, { useMemo, useState, useEffect } from "react";

import {
  TextureLoader,
  RepeatWrapping,
  Shape,
  ShapeGeometry,
  Mesh,
  MeshStandardMaterial,
  DoubleSide,
  EdgesGeometry,
  LineSegments,
  LineBasicMaterial,
  BufferGeometry,
  LatheGeometry,
  Group,
  sRGBEncoding,
} from "three";
import Model3d from "./Model3d";
import calculateMainShape from "./curves_utils/calculateMainShape";
import calculateHoles from "./curves_utils/calculateHoles";
import calculateSides from "./curves_utils/calculateSides";
const ElementWithCurve = ({
  name,
  krawedzie,
  wymiary,
  materialy,
  obrocenie,
  visible,
  grubosc,
  edges,
  krzywe,
  kierunek,
  has3dModel,
  models,
  curvesParams,
  category,
}) => {
  /* Kolejnosć boków przy wczytywaniu tekstury
  order of sides when loading textures
  0 prawo / right
1 lewo / left
2 gora / up 
3 dol / down
4 przod / front
5 tyl / back
dla extrusion [faces, sides]
*/
  const [metal, setMetal] = useState(false);
  const [drazekN, setDrazekN] = useState(false);
  const [_grubosc, set_grubosc] = useState(grubosc);

  const loader = new TextureLoader();

  const textureArray = useMemo(
    () =>
      krawedzie.map((krawedz, index) => {
        if (metal) return null;
        if (krawedz.includes("ametal") || krawedz.includes("cmetal")) {
          setMetal(true);
          return null;
        }
        let texture;
        let textureFactor = 20000;
        const textureRatio = 1.67;
        if (!krawedz.localeCompare("brak")) {
          texture = loader.load("/img/plyta-mfp.jpg");
        } else
          texture = loader.load(
            materialy[krawedz] && materialy[krawedz].matimg !== undefined
              ? process.env.NEXT_PUBLIC_API_BASE_URL +
                  "/" +
                  materialy[krawedz].matimg
              : "/img/missing.jpg"
          );
        texture.wrapS = RepeatWrapping;
        texture.wrapT = RepeatWrapping;
        texture.encoding = sRGBEncoding;
        switch (kierunek) {
          case "Pion_front":
            if (index === 4 || index === 5) {
              texture.repeat.set(
                obrocenie !== "true"
                  ? (wymiary.x / textureFactor) * textureRatio
                  : (wymiary.y / textureFactor) * textureRatio,
                obrocenie !== "true"
                  ? wymiary.y / textureFactor
                  : wymiary.x / textureFactor
              );
              if (obrocenie === "true") texture.rotation = Math.PI / 2;
            } else if (index === 0 || index === 1) {
              texture.repeat.set(
                obrocenie !== "true"
                  ? (wymiary.z / textureFactor) * textureRatio * 1000
                  : (wymiary.y / textureFactor) * textureRatio * 1000,
                obrocenie !== "true"
                  ? (wymiary.y / textureFactor) * 1000
                  : (wymiary.z / textureFactor) * 1000
              );
              if (obrocenie !== "true") texture.rotation = Math.PI / 2;
            } else {
              texture.repeat.set(
                obrocenie === "true"
                  ? (wymiary.x / textureFactor) * textureRatio * 1000
                  : (wymiary.z / textureFactor) * textureRatio * 1000,
                obrocenie === "true"
                  ? (wymiary.z / textureFactor) * 1000
                  : (wymiary.x / textureFactor) * 1000
              );
              if (obrocenie !== "true") texture.rotation = Math.PI / 2;
            }
            break;
          case "Poziomo":
            if (index == 2 || index == 3) {
              texture.repeat.set(
                obrocenie !== "true"
                  ? (wymiary.x / textureFactor) * textureRatio
                  : (wymiary.z / textureFactor) * textureRatio,
                obrocenie !== "true"
                  ? wymiary.z / textureFactor
                  : wymiary.x / textureFactor
              );
              if (obrocenie !== "true") texture.rotation = Math.PI / 2;
              texture.flipY = false;
            } else if (index === 0 || index === 1) {
              texture.repeat.set(
                obrocenie !== "true"
                  ? (wymiary.z / textureFactor) * textureRatio * 1000
                  : (wymiary.y / textureFactor) * textureRatio * 1000,
                obrocenie !== "true"
                  ? (wymiary.y / textureFactor) * 1000
                  : (wymiary.z / textureFactor) * 1000
              );
              if (obrocenie === "true") texture.rotation = Math.PI / 2;
            } else {
              texture.repeat.set(
                obrocenie !== "true"
                  ? (wymiary.x / textureFactor) * textureRatio * 1000
                  : (wymiary.y / textureFactor) * textureRatio * 1000,
                obrocenie !== "true"
                  ? (wymiary.y / textureFactor) * 1000
                  : (wymiary.x / textureFactor) * 1000
              );
              if (obrocenie === "true") texture.rotation = Math.PI / 2;
            }

            break;
          case "Pion_bok":
            if (index == 1 || index == 0) {
              texture.repeat.set(
                obrocenie !== "true"
                  ? (wymiary.z / textureFactor) * textureRatio
                  : (wymiary.y / textureFactor) * textureRatio,
                obrocenie !== "true"
                  ? wymiary.y / textureFactor
                  : wymiary.z / textureFactor
              );
              if (obrocenie === "true") texture.rotation = Math.PI / 2;
            } else if (index === 2 || index === 3) {
              texture.repeat.set(
                obrocenie !== "true"
                  ? (wymiary.x / textureFactor) * textureRatio * 1000
                  : (wymiary.z / textureFactor) * textureRatio * 1000,
                obrocenie !== "true"
                  ? (wymiary.z / textureFactor) * 1000
                  : (wymiary.x / textureFactor) * 1000
              );
              if (obrocenie !== "true") texture.rotation = Math.PI / 2;
            } else {
              texture.repeat.set(
                obrocenie !== "true"
                  ? (wymiary.x / textureFactor) * textureRatio * 1000
                  : (wymiary.y / textureFactor) * textureRatio * 1000,
                obrocenie !== "true"
                  ? (wymiary.y / textureFactor) * 1000
                  : (wymiary.x / textureFactor) * 1000
              );
              if (obrocenie !== "true") texture.rotation = Math.PI / 2;
            }
            break;
        }
        //

        return texture;
      }),
    [JSON.stringify(materialy)]
  );
  useEffect(() => {
    Object.values(krzywe).forEach((ptocka) => {
      if (ptocka.every((krzywa) => krzywa.x.calc === ptocka[0].x.calc)) {
        setDrazekN(true);
      }
    });
  }, []);

  const krzywe_array = useMemo(
    () =>
      Object.values(krzywe).map((ptocka, index) => {
        if (curvesParams.CUSYSMODE === "3" && index > 0)
          if (!drazekN) set_grubosc(ptocka[0].z.calc);
          else set_grubosc(ptocka[0].x.calc);
        return ptocka.map((krzywa) => {
          return {
            x: !drazekN
              ? Number(krzywa.x.calc) / 10
              : Number(krzywa.z.calc) / 10,
            y: Number(krzywa.y.calc) / 10,
            type: krzywa.type,
            radius:
              krzywa.type && krzywa.type.includes("arc")
                ? krzywa.radius.calc / 10
                : 0,
            PTARSM: krzywa.PTARSM,
            PTARST: krzywa.PTARST,
            PTPR0:
              curvesParams &&
              (curvesParams.CUSTYPE !== "4" ||
                curvesParams.CUSYSMODE === "3") &&
              !drazekN
                ? krzywa.PTPR0 && krzywa.PTPR0 / 10
                : krzywa.PTPR2 && krzywa.PTPR2 / 10, //tu pozmieniać dla drążka
            PTPR1: krzywa.PTPR1 && krzywa.PTPR1 / 10,
            PTNE0:
              curvesParams &&
              (curvesParams.CUSTYPE !== "4" ||
                curvesParams.CUSYSMODE === "3") &&
              !drazekN
                ? krzywa.PTNE0 && krzywa.PTNE0 / 10
                : krzywa.PTNE2 && krzywa.PTNE2 / 10,
            PTNE1: krzywa.PTNE1 && krzywa.PTNE1 / 10,
            PTS: krzywa.PTS ? krzywa.PTS : 0,
          };
        });
      }),
    [drazekN, JSON.stringify(krzywe)]
  );

  // calculate shape (one side of board)
  const mainShape = new Shape();
  const mainPoints = [[], [], [], []];
  calculateMainShape(
    krzywe_array[0],
    mainShape,
    mainPoints,
    kierunek,
    wymiary,
    drazekN
  );

  // add holes to shape
  const holesPoints = [];
  if (
    (curvesParams.CUSYSMODE === "0" || curvesParams.CUSYSMODE === "2") &&
    curvesParams.CUSTYPE === "0" &&
    krzywe_array.length > 1
  ) {
    calculateHoles(krzywe_array, mainShape, holesPoints, kierunek, wymiary);
  }
  const mainGeometry = new ShapeGeometry(mainShape);
  const mainMesh = new Mesh(
    mainGeometry,
    new MeshStandardMaterial({
      map:
        kierunek === "Pion_bok"
          ? textureArray[1]
          : kierunek === "Pion_front"
          ? textureArray[5]
          : textureArray[3],
      roughness: 0.6,
      metalness: 0.1,
      transparent: true,
      opacity: visible ? 1 : 0.4,
      side: DoubleSide,
    })
  );
  // if edges on add edges
  if (edges) {
    const myEdges = new EdgesGeometry(mainGeometry);
    const line = new LineSegments(
      myEdges,
      new LineBasicMaterial({ color: 0x000000 })
    );
    mainMesh.add(line);
  }

  const backGeometry = new BufferGeometry();
  const backMesh = new Mesh();
  const backPoints = [[], [], [], []];
  if (
    (curvesParams.CUSYSMODE === "0" || curvesParams.CUSYSMODE === "2") &&
    curvesParams.CUSTYPE === "0"
  ) {
    backGeometry.copy(new ShapeGeometry(mainShape));
    backMesh.add(
      new Mesh(
        backGeometry,
        new MeshStandardMaterial({
          map:
            kierunek === "Pion_bok"
              ? textureArray[0]
              : kierunek === "Pion_front"
              ? textureArray[4]
              : textureArray[2],
          side: DoubleSide,
          roughness: 0.6,
          metalness: 0.1,
          transparent: true,
          opacity: visible ? 1 : 0.4,
        })
      )
    );
    backMesh.translateZ(
      kierunek !== "Poziomo" ? _grubosc / 10 : -_grubosc / 10
    );
    if (krzywe_array.length > 1) {
      mainPoints.push(...holesPoints);
    }
    mainPoints.forEach((group, index) => (backPoints[index] = group));
  }

  // calculation of 2nd shape for board
  if (curvesParams.CUSYSMODE === "3" && curvesParams.CUSTYPE !== "5") {
    const backShape = new Shape();
    calculateMainShape(
      krzywe_array[1],
      backShape,
      backPoints,
      kierunek,
      wymiary,
      drazekN
    );
    backGeometry.copy(new ShapeGeometry(backShape));
    backMesh.translateZ(
      kierunek !== "Poziomo" ? _grubosc / 10 : -_grubosc / 10
    );
    backMesh.add(
      new Mesh(
        backGeometry,
        new MeshStandardMaterial({
          map:
            kierunek === "Pion_bok"
              ? textureArray[0]
              : kierunek === "Pion_front"
              ? textureArray[4]
              : textureArray[2],
          side: DoubleSide,
          roughness: 0.6,
          metalness: 0.1,
          transparent: true,
          opacity: visible ? 1 : 0.4,
        })
      )
    );
  }
  // if edges on add edges
  if (
    edges &&
    ((curvesParams.CUSYSMODE === "3" && curvesParams.CUSTYPE !== "5") ||
      (curvesParams.CUSYSMODE === "0" && curvesParams.CUSTYPE === "0"))
  ) {
    const myEdges = new EdgesGeometry(backGeometry);
    const line = new LineSegments(
      myEdges,
      new LineBasicMaterial({ color: 0x000000 })
    );
    backMesh.add(line);
  }
  const sideGeometry = [];

  // calculate sides between both shapes
  const sideMesh = [];
  if (curvesParams.CUSTYPE !== "5")
    calculateSides(
      mainPoints,
      backPoints,
      sideGeometry,
      sideMesh,
      kierunek,
      _grubosc,
      edges,
      textureArray,
      visible,
      name
    );

  /*--------------------------other shapes (from rotation, from lathe) ------------*/
  if (curvesParams.CUSTYPE === "5") {
    backGeometry.copy(new ShapeGeometry(mainShape));
    backMesh.add(
      new Mesh(
        backGeometry,
        new MeshStandardMaterial({
          map:
            kierunek === "Pion_bok"
              ? textureArray[0]
              : kierunek === "Pion_front"
              ? textureArray[4]
              : textureArray[2],
          side: DoubleSide,
          roughness: 0.6,
          metalness: 0.1,
          transparent: true,
          opacity: visible ? 1 : 0.4,
        })
      )
    );
    const points12 = mainShape.getPoints(200);
    if (curvesParams.CUSROT && curvesParams.CUSROT === "x") {
      points12.forEach((point) => {
        let pom = point.x;
        point.x = point.y;
        point.y = pom;
      });
    }
    if (curvesParams.CUSROT && curvesParams.CUSROT === "z") {
      points12.forEach((point) => {
        point.y = 0;
      });
    }
    const rotated = new LatheGeometry(
      points12.concat(points12.slice().reverse()),
      50,
      curvesParams.CUSSPSTART
        ? Number((curvesParams.CUSSPSTART * Math.PI) / 180)
        : 0,
      curvesParams.CUSSPEND
        ? Number((curvesParams.CUSSPEND * Math.PI) / 180) -
          Number((curvesParams.CUSSPSTART * Math.PI) / 180)
        : 0
    );
    const rotatedMesh = new Mesh(
      rotated,
      new MeshStandardMaterial({
        map:
          kierunek === "Pion_bok"
            ? textureArray[0]
            : kierunek === "Pion_front"
            ? textureArray[4]
            : textureArray[2],
        side: DoubleSide,
        roughness: 0.6,
        metalness: 0.1,
        transparent: true,
        opacity: visible ? 1 : 0.4,
      })
    );

    if (curvesParams.CUSROT && curvesParams.CUSROT === "y") {
      rotatedMesh.rotateY(Math.PI / 2);
      mainMesh.rotateY(Number((curvesParams.CUSSPSTART * Math.PI) / 180));
      backMesh.rotateY(Number((curvesParams.CUSSPEND * Math.PI) / 180));
    }

    if (curvesParams.CUSROT && curvesParams.CUSROT === "x") {
      rotatedMesh.rotateZ(-Math.PI / 2);
      rotatedMesh.rotateY(-Math.PI / 2);
      mainMesh.rotateX(Number((curvesParams.CUSSPSTART * Math.PI) / 180));
      backMesh.rotateX(Number((curvesParams.CUSSPEND * Math.PI) / 180));
    }
    if (curvesParams.CUSROT && curvesParams.CUSROT === "z") {
      rotatedMesh.rotateY(Math.PI / 2);
      rotatedMesh.rotateZ(Math.PI / 2);
      mainMesh.rotateZ(Number((curvesParams.CUSSPSTART * Math.PI) / 180));
      backMesh.rotateZ(Number((curvesParams.CUSSPEND * Math.PI) / 180));
    }
    sideMesh.push(rotatedMesh);
  }
  /*-----------------adding all to finalGroup for displaying-------------------------------------*/
  const finalGroup = new Group();
  finalGroup.add(backMesh);
  finalGroup.add(mainMesh);
  sideMesh.forEach((mesh) => finalGroup.add(mesh));

  finalGroup.position.x = -wymiary.x / 2;
  finalGroup.position.y = -wymiary.y / 2;
  finalGroup.position.z =
    kierunek !== "Pion_front" ? wymiary.z / 2 : -wymiary.z / 2;

  finalGroup.rotation.x = kierunek !== "Poziomo" ? 0 : Math.PI / 2;
  finalGroup.rotation.y = kierunek === "Pion_bok" ? Math.PI / 2 : 0;

  finalGroup.rotation.z = kierunek === "Poziomo" ? -Math.PI / 2 : 0;
  if (drazekN && kierunek === "Pion_front") finalGroup.rotation.y = Math.PI / 2;
  finalGroup.updateMatrix();

  return (
    <>
      <primitive object={finalGroup} />

      {has3dModel == "true" && (
        <>
          {models.map((model, index) => {
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
    </>
  );
};
export default ElementWithCurve;
