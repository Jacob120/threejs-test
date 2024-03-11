// @ts-check
import React, { useState, useEffect, useRef, useMemo } from "react";
import { OBJLoader } from "../../../node_modules/three/examples/jsm/loaders/OBJLoader";
import { ColladaLoader } from "../../../node_modules/three/examples/jsm/loaders/ColladaLoader";
import { Mesh, Vector3, Matrix4, Euler, Quaternion } from "three";

import { useLoader } from "react-three-fiber";
import { getModelIndexFromReplacements } from "../../utils/modelsHelpers";

function decodeHtmlEntity(str) {
  return str.replace(/&#x2F;/g, "/");
}

//wczytywanie modeli dae
function ColladaModel({ url, model }) {
  /* For local testing */
  // const _url = Array.isArray(url)
  //   ? url.map(
  //       (x) => process.env.NEXT_PUBLIC_IMAGE_SERVER + "/img/3d_models/" + x
  //     )
  //   : [process.env.NEXT_PUBLIC_IMAGE_SERVER + "/img/3d_models/" + url];

  /* For deployment */
  const _url = Array.isArray(url)
    ? url.map((x) => {
        const decodedX = decodeHtmlEntity(x);
        return process.env.NEXT_PUBLIC_IMAGE_SERVER + "/" + decodedX;
      })
    : [process.env.NEXT_PUBLIC_IMAGE_SERVER + "/" + decodeHtmlEntity(url)];
  // console.log("ColladaModel -> _url", _url)
  const models = useLoader(ColladaLoader, _url);

  const { scene } = models[model];
  const copiedScene = useMemo(() => {
    const scene2 = scene.clone();
    if (scene2.children) {
      scene2.children.forEach((node) => {
        if (
          node.name === "node" &&
          // @ts-ignore
          node.material &&
          // @ts-ignore
          node.material.color &&
          // @ts-ignore
          node.material.color.r === 1 &&
          // @ts-ignore
          node.material.color.g === 0 &&
          // @ts-ignore
          node.material.color.b === 1
        ) {
          // @ts-ignore
          node.material.color.r = 0.5;
          node.material.color.g = 0.5;
          node.material.color.b = 0.5;
          node.material.roughness = 0.25;
          node.material.metalness = 0.75;
        }
      });
    }
    return scene2;
  }, [scene]);
  return <primitive object={copiedScene} dispose={null} />;
}
//wczytywanie modeli obj
function OBJModel({ url, model }) {
  const filePath = decodeURIComponent(url);
  const _url = Array.isArray(url)
    ? url.map(
        (x) =>
          process.env.NEXT_PUBLIC_IMAGE_SERVER + "/" + decodeURIComponent(x),
      )
    : [process.env.NEXT_PUBLIC_IMAGE_SERVER + "/" + filePath];
  const models = useLoader(OBJLoader, _url);
  // console.log("OBJModel -> models", models)
  const scene = models[model];
  const copiedScene = useMemo(() => {
    const scene2 = scene.clone();
    scene2.traverse(function (child) {
      if (child instanceof Mesh) {
        child.material.color.r = 0.35;
        child.material.color.g = 0.35;
        child.material.color.b = 0.35;
        child.material.metalness = 1;
        child.material.emissive = { r: 0.3, g: 0.3, b: 0.3 };
        child.material.emissiveIntensity = 0.1;
        child.material.shininess = 80;
        child.material.specular = { r: 1, g: 1, b: 1 };
      }
    });

    scene2.scale.set(
      scene2.scale.x / 1000,
      scene2.scale.y / 1000,
      scene2.scale.z / 1000,
    );
    return scene2;
  }, [scene]);
  return <primitive object={copiedScene} />;
}

//pozycjonowanie modeli 3D
// positioning of 3DModels
export const Model3d = ({
  model_data,
  name,
  wymiary,
  kierunek,
  formatka,
  x,
}) => {
  // console.log("Model3d -> model_data", model_data);
  const [offsetState, setOffsetState] = useState([0, 0, 0]);
  const [selectedModel, setSelectedModel] = useState(0);

  useEffect(() => {
    // Todo: Move that to a method.
    // Todo: Uncomment -- commented for testing
    // let selectedModelIndex = 0;
    if (model_data.change_array_z) {
      let dataChangeArrayZ = model_data.change_array_z;
      const divideReplacementsBy10 = true;
      let selectedModelIndex = getModelIndexFromReplacements(
        wymiary.z,
        dataChangeArrayZ,
        divideReplacementsBy10,
      );
      // console.log('selectedIndex3D', selectedModelIndex, 'arrayZ3D', dataChangeArrayZ, 'wyZ', wymiary.z)
      if (selectedModelIndex !== selectedModel)
        setSelectedModel(selectedModelIndex);

      // Testing
      // if (model_data.file[0] == 'kolek_3d.dae') {
      //   console.log('model', model_data)
      //   console.log('selectedIndex', selectedModelIndex)
      //   // model_data.positions[selectedModel].mdrl.scale = '1'
      //   // model_data.positions[selectedModel].mdrl.up_vector.x = '-1'
      //   // model_data.positions[selectedModel].mdrl.up_vector.y = '0'
      //   // model_data.positions[selectedModel].mdrl.up_vector.z = '-4.371139E-08'

      // }
    }
  }, [wymiary.z]);

  useEffect(() => {
    // calculating offset
    const fs1 = model_data.fs1;
    const useSides = model_data.positions[selectedModel].modeli.use_sides;

    // console.log("Change offset useEffect")
    // console.log('wymiary', wymiary)
    // console.log('selectedModel', selectedModel)
    // console.log('draw3DModels from model3D', model_data)
    let offset = [0, 0, 0];
    // Note: stick_to_side can be wrong in the DB when fs1 != 0 and useSides == 'yes', so we set its value to fs1
    const stick_to_side =
      fs1 && useSides === "yes"
        ? fs1.toString()
        : model_data.positions[selectedModel].modeli.stick_to_side;

    // const stick_to_side = model_data.positions[selectedModel].modeli.stick_to_side
    const axisNumber = model_data.positions[selectedModel].modeli.axis; // (00-> x+, 01-> x-,02->y+, 03 ->y-, 04->z+, 05->z-)
    // console.log(
    //   "useSides, stick_to_side,  axisNumber",
    //   useSides,
    //   stick_to_side,
    //   axisNumber,
    // );
    const modeliX = Number(model_data.positions[selectedModel].modeli.x);
    const modeliY = Number(model_data.positions[selectedModel].modeli.y);
    const modeliZ = Number(model_data.positions[selectedModel].modeli.z);

    // console.log("wymiary", wymiary);
    // console.log("modeliX, modeliY, modeliZ", modeliX, modeliY, modeliZ);
    // Without use_sides
    if (model_data.positions[selectedModel].modeli && useSides === "no")
      switch (kierunek) {
        case "Poziomo":
          switch (stick_to_side) {
            case "0":
              switch (axisNumber) {
                case "0":
                case "2":
                  offset = [
                    modeliZ / 10,
                    modeliY / 10,
                    -modeliX / 10,
                    // offset[0] + wymiary.z,
                    // offset[1] + wymiary.y,
                    // offset[2] - wymiary.x,
                  ];
                  break;
                case "1":
                  offset = [-modeliZ / 10, -modeliY / 10, -modeliX / 10];
                  break;
                case "3":
                  offset = [modeliX / 10, -modeliZ / 10, modeliY / 10];
                  break;
                case "4":
                  offset = [modeliX / 10, modeliY / 10, modeliZ / 10];
                  break;
                case "5":
                  offset = [modeliX / 10, -modeliY / 10, -modeliZ / 10];
                  break;
              }
              break;
            case "1":
              switch (axisNumber) {
                case "0":
                case "2":
                  offset = [
                    wymiary.x + modeliZ / 10,
                    modeliY / 10,
                    -modeliX / 10,
                    // offset[0] + wymiary.z,
                    // offset[1] + wymiary.y,
                    // offset[2] - wymiary.x,
                  ];
                  break;
                case "1":
                  // kołki po prawej stronie
                  offset = [
                    wymiary.x - modeliZ / 10, // lewo prawo
                    -modeliY / 10, // góra dół
                    -modeliX / 10,
                    // przód tył
                  ];

                  break;
                case "3":
                  offset = [
                    wymiary.x + modeliX / 10,
                    -modeliZ / 10,
                    modeliY / 10,
                  ];
                  break;
                case "4":
                  offset = [
                    wymiary.x + modeliX / 10,
                    modeliY / 10,
                    modeliZ / 10,
                  ];
                  break;
                case "5":
                  offset = [
                    wymiary.x + modeliX / 10,
                    -modeliY / 10,
                    -modeliZ / 10,
                  ];
                  break;
              }
              break;
            case "2":
              switch (axisNumber) {
                case "0":
                case "2":
                  offset = [
                    wymiary.x + modeliZ / 10,
                    modeliY / 10,
                    -wymiary.z - modeliX / 10,
                    // offset[0] + wymiary.z,
                    // offset[1] + wymiary.y,
                    // offset[2] - wymiary.x,
                  ];
                  break;
                case "1":
                  offset = [
                    wymiary.x - modeliZ / 10,
                    -modeliY / 10,
                    -wymiary.z - modeliX / 10,
                  ];
                  break;
                case "3":
                  offset = [
                    wymiary.x + modeliX / 10,
                    -modeliZ / 10,
                    -wymiary.z + modeliY / 10,
                  ];
                  break;
                case "4":
                  offset = [
                    wymiary.x + modeliX / 10,
                    modeliY / 10,
                    -wymiary.z + modeliZ / 10,
                  ];
                  break;
                case "5":
                  offset = [
                    wymiary.x + modeliX / 10,
                    -modeliY / 10,
                    -wymiary.z - modeliZ / 10,
                  ];
                  break;
              }
              break;
            case "3":
              switch (axisNumber) {
                case "0":
                case "2":
                  offset = [
                    +modeliZ / 10,
                    modeliY / 10,
                    -wymiary.z - modeliX / 10,
                    // offset[0] + wymiary.z,
                    // offset[1] + wymiary.y,
                    // offset[2] - wymiary.x,
                  ];
                  break;
                case "1":
                  offset = [
                    -modeliZ / 10,
                    -modeliY / 10,
                    -wymiary.z - modeliX / 10,
                  ];
                  break;
                case "3":
                  offset = [
                    +modeliX / 10,
                    -modeliZ / 10,
                    -wymiary.z + modeliY / 10,
                  ];
                  break;
                case "4":
                  offset = [
                    +modeliX / 10,
                    modeliY / 10,
                    -wymiary.z + modeliZ / 10,
                  ];
                  break;
                case "5":
                  offset = [
                    +modeliX / 10,
                    -modeliY / 10,
                    -wymiary.z - modeliZ / 10,
                  ];
                  break;
              }
              break;
            case "4":
              switch (axisNumber) {
                case "0":
                case "2":
                  offset = [
                    modeliZ / 10,
                    wymiary.y + modeliY / 10,
                    -modeliX / 10 +
                      ((wymiary.grubosc && (wymiary.grubosc / 10) * 2) || 0),
                    // offset[0] + wymiary.z,
                    // offset[1] + wymiary.y,
                    // offset[2] - wymiary.x,
                  ];
                  break;
                case "1":
                  offset = [
                    -modeliZ / 10,
                    wymiary.y - modeliY / 10,
                    -modeliX / 10 +
                      ((wymiary.grubosc && (wymiary.grubosc / 10) * 2) || 0),
                  ];
                  break;
                case "3":
                  offset = [
                    modeliX / 10,
                    wymiary.y - modeliZ / 10,
                    modeliY / 10 +
                      ((wymiary.grubosc && (wymiary.grubosc / 10) * 2) || 0),
                  ];
                  break;
                case "4":
                  offset = [
                    modeliX / 10,
                    wymiary.y + modeliY / 10,
                    modeliZ / 10 +
                      ((wymiary.grubosc && (wymiary.grubosc / 10) * 2) || 0),
                  ];
                  break;
                case "5":
                  offset = [
                    modeliX / 10,
                    wymiary.y - modeliY / 10,
                    -modeliZ / 10 +
                      ((wymiary.grubosc && (wymiary.grubosc / 10) * 2) || 0),
                  ];
                  break;
              }
              break;
            case "5":
              switch (axisNumber) {
                case "0":
                case "2":
                  offset = [
                    wymiary.x + modeliZ / 10,
                    wymiary.y + modeliY / 10,
                    -modeliX / 10 +
                      ((wymiary.grubosc && (wymiary.grubosc / 10) * 2) || 0),
                    // offset[0] + wymiary.z,
                    // offset[1] + wymiary.y,
                    // offset[2] - wymiary.x,
                  ];
                  break;
                case "1":
                  offset = [
                    wymiary.x - modeliZ / 10,
                    wymiary.y - modeliY / 10,
                    -modeliX / 10 +
                      ((wymiary.grubosc && (wymiary.grubosc / 10) * 2) || 0),
                  ];
                  break;
                case "3":
                  offset = [
                    wymiary.x + modeliX / 10,
                    wymiary.y - modeliZ / 10,
                    modeliY / 10 +
                      ((wymiary.grubosc && (wymiary.grubosc / 10) * 2) || 0),
                  ];
                  break;
                case "4":
                  offset = [
                    wymiary.x + modeliX / 10,
                    wymiary.y + modeliY / 10,
                    modeliZ / 10 +
                      ((wymiary.grubosc && (wymiary.grubosc / 10) * 2) || 0),
                  ];
                  break;
                case "5":
                  offset = [
                    wymiary.x + modeliX / 10,
                    wymiary.y - modeliY / 10,
                    -modeliZ / 10 +
                      ((wymiary.grubosc && (wymiary.grubosc / 10) * 2) || 0),
                  ];
                  break;
              }
              break;
            case "6":
              switch (axisNumber) {
                case "0":
                case "2":
                  offset = [
                    wymiary.x + modeliZ / 10,
                    wymiary.y + modeliY / 10,
                    -wymiary.z -
                      modeliX / 10 +
                      ((wymiary.grubosc && (wymiary.grubosc / 10) * 2) || 0),
                    // offset[0] + wymiary.z,
                    // offset[1] + wymiary.y,
                    // offset[2] - wymiary.x,
                  ];
                  break;
                case "1":
                  offset = [
                    wymiary.x - modeliZ / 10,
                    wymiary.y - modeliY / 10,
                    -wymiary.z -
                      modeliX / 10 +
                      ((wymiary.grubosc && (wymiary.grubosc / 10) * 2) || 0),
                  ];
                  break;
                case "3":
                  offset = [
                    wymiary.x + modeliX / 10,
                    wymiary.y - modeliZ / 10,
                    -wymiary.z +
                      modeliY / 10 +
                      ((wymiary.grubosc && (wymiary.grubosc / 10) * 2) || 0),
                  ];
                  break;
                case "4":
                  offset = [
                    wymiary.x + modeliX / 10,
                    wymiary.y + modeliY / 10,
                    -wymiary.z + modeliZ / 10,
                  ];
                  break;
                case "5":
                  offset = [
                    wymiary.x + modeliX / 10,
                    wymiary.y - modeliY / 10,
                    -wymiary.z +
                      -modeliZ / 10 +
                      ((wymiary.grubosc && (wymiary.grubosc / 10) * 2) || 0),
                  ];
                  break;
              }
              break;
            case "7":
              switch (axisNumber) {
                case "0":
                case "2":
                  offset = [
                    modeliZ / 10,
                    wymiary.y + modeliY / 10,
                    -wymiary.z -
                      modeliX / 10 +
                      ((wymiary.grubosc && (wymiary.grubosc / 10) * 2) || 0),
                    // offset[0] + wymiary.z,
                    // offset[1] + wymiary.y,
                    // offset[2] - wymiary.x,
                  ];
                  break;
                case "1":
                  offset = [
                    -modeliZ / 10,
                    wymiary.y - modeliY / 10,
                    -wymiary.z -
                      modeliX / 10 +
                      ((wymiary.grubosc && (wymiary.grubosc / 10) * 2) || 0),
                  ];
                  break;
                case "3":
                  offset = [
                    modeliX / 10,
                    wymiary.y - modeliZ / 10,
                    -wymiary.z +
                      modeliY / 10 +
                      ((wymiary.grubosc && (wymiary.grubosc / 10) * 2) || 0),
                  ];
                  break;
                case "4":
                  offset = [
                    modeliX / 10,
                    wymiary.y + modeliY / 10,
                    -wymiary.z + modeliZ / 10,
                  ];
                  break;
                case "5":
                  offset = [
                    modeliX / 10,
                    wymiary.y - modeliY / 10,
                    -wymiary.z +
                      -modeliZ / 10 +
                      ((wymiary.grubosc && (wymiary.grubosc / 10) * 2) || 0),
                  ];
                  break;
              }
              break;
          }
          break;
        case "Pion_bok":
          switch (stick_to_side) {
            case "0":
              switch (axisNumber) {
                case "0":
                  // case '2':
                  offset = [
                    modeliZ / 10,
                    modeliY / 10,
                    -modeliX / 10,
                    // offset[0] + wymiary.z,
                    // offset[1] + wymiary.y,
                    // offset[2] - wymiary.x,
                  ];
                  break;
                case "2":
                  offset = [modeliX / 10, modeliZ / 10, -modeliY / 10];
                  break;
                case "1":
                  offset = [-modeliZ / 10, -modeliY / 10, -modeliX / 10];
                  break;
                case "3":
                  offset = [modeliX / 10, -modeliZ / 10, modeliY / 10];
                  break;
                case "4":
                  offset = [modeliX / 10, modeliY / 10, modeliZ / 10];
                  break;
                case "5":
                  offset = [modeliX / 10, -modeliY / 10, -modeliZ / 10];
                  break;
              }
              break;
            case "1":
              switch (axisNumber) {
                case "0":
                case "2":
                  offset = [
                    modeliZ / 10,
                    wymiary.y + modeliY / 10,
                    -modeliX / 10,
                    // offset[0] + wymiary.z,
                    // offset[1] + wymiary.y,
                    // offset[2] - wymiary.x,
                  ];
                  break;
                case "1":
                  offset = [
                    -modeliZ / 10,
                    wymiary.y - modeliY / 10,
                    -modeliX / 10,
                  ];
                  break;
                case "3":
                  offset = [
                    modeliX / 10,
                    wymiary.y - modeliZ / 10,
                    modeliY / 10,
                  ];
                  break;
                case "4":
                  offset = [
                    modeliX / 10,
                    wymiary.y + modeliY / 10,
                    modeliZ / 10,
                  ];
                  break;
                case "5":
                  offset = [
                    modeliX / 10,
                    wymiary.y - modeliY / 10,
                    -modeliZ / 10,
                  ];
                  break;
              }
              break;
            case "2":
              switch (axisNumber) {
                case "0":
                case "2":
                  offset = [
                    modeliZ / 10,
                    wymiary.y + modeliY / 10,
                    -wymiary.z - modeliX / 10,
                    // offset[0] + wymiary.z,
                    // offset[1] + wymiary.y,
                    // offset[2] - wymiary.x,
                  ];
                  break;
                case "1":
                  offset = [
                    -modeliZ / 10,
                    wymiary.y - modeliY / 10,
                    -wymiary.z - modeliX / 10,
                  ];
                  break;
                case "3":
                  offset = [
                    modeliX / 10,
                    wymiary.y - modeliZ / 10,
                    -wymiary.z + modeliY / 10,
                  ];
                  break;
                case "4":
                  offset = [
                    modeliX / 10,
                    wymiary.y + modeliY / 10,
                    -wymiary.z + modeliZ / 10,
                  ];
                  break;
                case "5":
                  offset = [
                    modeliX / 10,
                    wymiary.y - modeliY / 10,
                    -wymiary.z - modeliZ / 10,
                  ];
                  break;
              }
              break;
            case "3":
              switch (axisNumber) {
                case "0":
                case "2":
                  offset = [
                    modeliZ / 10,
                    modeliY / 10,
                    -wymiary.z - modeliX / 10,
                    // offset[0] + wymiary.z,
                    // offset[1] + wymiary.y,
                    // offset[2] - wymiary.x,
                  ];
                  break;
                case "1":
                  offset = [
                    -modeliZ / 10,
                    -modeliY / 10,
                    -wymiary.z - modeliX / 10,
                  ];
                  break;
                case "3":
                  offset = [
                    modeliX / 10,
                    -modeliZ / 10,
                    -wymiary.z + modeliY / 10,
                  ];
                  break;
                case "4":
                  offset = [
                    modeliX / 10,
                    modeliY / 10,
                    -wymiary.z + modeliZ / 10,
                  ];
                  break;
                case "5":
                  offset = [
                    modeliX / 10,
                    -modeliY / 10,
                    -wymiary.z - modeliZ / 10,
                  ];
                  break;
              }
              break;
            case "4":
              switch (axisNumber) {
                case "0":
                case "2":
                  offset = [
                    wymiary.x + modeliZ / 10,
                    modeliY / 10,
                    -modeliX / 10 +
                      ((wymiary.grubosc && (wymiary.grubosc / 10) * 2) || 0),
                    // offset[0] + wymiary.z,
                    // offset[1] + wymiary.y,
                    // offset[2] - wymiary.x,
                  ];
                  break;
                case "1":
                  offset = [
                    wymiary.x - modeliZ / 10,
                    -modeliY / 10,
                    -modeliX / 10 +
                      ((wymiary.grubosc && (wymiary.grubosc / 10) * 2) || 0),
                  ];
                  break;
                case "3":
                  offset = [
                    wymiary.x + modeliX / 10,
                    -modeliZ / 10,
                    modeliY / 10 +
                      ((wymiary.grubosc && (wymiary.grubosc / 10) * 2) || 0),
                  ];
                  break;
                case "4":
                  offset = [
                    wymiary.x + modeliX / 10,
                    modeliY / 10,
                    modeliZ / 10 +
                      ((wymiary.grubosc && (wymiary.grubosc / 10) * 2) || 0),
                  ];
                  break;
                case "5":
                  offset = [
                    wymiary.x + modeliX / 10,
                    -modeliY / 10,
                    -modeliZ / 10 +
                      ((wymiary.grubosc && (wymiary.grubosc / 10) * 2) || 0),
                  ];
                  break;
              }
              break;
            case "5":
              switch (axisNumber) {
                case "0":
                case "2":
                  offset = [
                    wymiary.x + modeliZ / 10,
                    wymiary.y + modeliY / 10,
                    -modeliX / 10 +
                      ((wymiary.grubosc && (wymiary.grubosc / 10) * 2) || 0),
                    // offset[0] + wymiary.z,
                    // offset[1] + wymiary.y,
                    // offset[2] - wymiary.x,
                  ];
                  break;
                case "1":
                  offset = [
                    wymiary.x - modeliZ / 10,
                    wymiary.y - modeliY / 10,
                    -modeliX / 10 +
                      ((wymiary.grubosc && (wymiary.grubosc / 10) * 2) || 0),
                  ];
                  break;
                case "3":
                  offset = [
                    wymiary.x + modeliX / 10,
                    wymiary.y - modeliZ / 10,
                    modeliY / 10 +
                      ((wymiary.grubosc && (wymiary.grubosc / 10) * 2) || 0),
                  ];
                  break;
                case "4":
                  offset = [
                    wymiary.x + modeliX / 10,
                    wymiary.y + modeliY / 10,
                    modeliZ / 10 +
                      ((wymiary.grubosc && (wymiary.grubosc / 10) * 2) || 0),
                  ];
                  break;
                case "5":
                  offset = [
                    wymiary.x + modeliX / 10,
                    wymiary.y - modeliY / 10,
                    -modeliZ / 10 +
                      ((wymiary.grubosc && (wymiary.grubosc / 10) * 2) || 0),
                  ];
                  break;
              }
              break;
            case "6":
              switch (axisNumber) {
                case "0":
                case "2":
                  offset = [
                    wymiary.x + modeliZ / 10,
                    wymiary.y + modeliY / 10,
                    -wymiary.z -
                      modeliX / 10 +
                      ((wymiary.grubosc && (wymiary.grubosc / 10) * 2) || 0),
                    // offset[0] + wymiary.z,
                    // offset[1] + wymiary.y,
                    // offset[2] - wymiary.x,
                  ];
                  break;
                case "1":
                  offset = [
                    wymiary.x - modeliZ / 10,
                    wymiary.y - modeliY / 10,
                    -wymiary.z -
                      modeliX / 10 +
                      ((wymiary.grubosc && (wymiary.grubosc / 10) * 2) || 0),
                  ];
                  break;
                case "3":
                  offset = [
                    wymiary.x + modeliX / 10,
                    wymiary.y - modeliZ / 10,
                    -wymiary.z +
                      modeliY / 10 +
                      ((wymiary.grubosc && (wymiary.grubosc / 10) * 2) || 0),
                  ];
                  break;
                case "4":
                  offset = [
                    wymiary.x + modeliX / 10,
                    wymiary.y + modeliY / 10,
                    -wymiary.z +
                      modeliZ / 10 +
                      ((wymiary.grubosc && (wymiary.grubosc / 10) * 2) || 0),
                  ];
                  break;
                case "5":
                  offset = [
                    wymiary.x + modeliX / 10,
                    wymiary.y - modeliY / 10,
                    -wymiary.z +
                      -modeliZ / 10 +
                      ((wymiary.grubosc && (wymiary.grubosc / 10) * 2) || 0),
                  ];
                  break;
              }
              break;
            case "7":
              switch (axisNumber) {
                case "0":
                case "2":
                  offset = [
                    wymiary.x + modeliZ / 10,
                    modeliY / 10,
                    -wymiary.z -
                      modeliX / 10 +
                      ((wymiary.grubosc && (wymiary.grubosc / 10) * 2) || 0),
                    // offset[0] + wymiary.z,
                    // offset[1] + wymiary.y,
                    // offset[2] - wymiary.x,
                  ];
                  break;
                case "1":
                  offset = [
                    wymiary.x - modeliZ / 10,
                    -modeliY / 10,
                    -wymiary.z -
                      modeliX / 10 +
                      ((wymiary.grubosc && (wymiary.grubosc / 10) * 2) || 0),
                  ];
                  break;
                case "3":
                  offset = [
                    wymiary.x + modeliX / 10,
                    -modeliZ / 10,
                    -wymiary.z +
                      modeliY / 10 +
                      ((wymiary.grubosc && (wymiary.grubosc / 10) * 2) || 0),
                  ];
                  break;
                case "4":
                  offset = [
                    wymiary.x + modeliX / 10,
                    modeliY / 10,
                    -wymiary.z +
                      modeliZ / 10 +
                      ((wymiary.grubosc && (wymiary.grubosc / 10) * 2) || 0),
                  ];
                  break;
                case "5":
                  offset = [
                    wymiary.x + modeliX / 10,
                    -modeliY / 10,
                    -wymiary.z +
                      -modeliZ / 10 +
                      ((wymiary.grubosc && (wymiary.grubosc / 10) * 2) || 0),
                  ];
                  break;
              }
              break;
          }
          break;
        case "Pion_front":
          switch (stick_to_side) {
            case "0":
              switch (axisNumber) {
                case "0":
                case "2":
                  offset = [
                    modeliZ / 10,
                    modeliY / 10,
                    -modeliX / 10,
                    // offset[0] + wymiary.z,
                    // offset[1] + wymiary.y,
                    // offset[2] - wymiary.x,
                  ];
                  break;
                case "1":
                  offset = [-modeliZ / 10, -modeliY / 10, -modeliX / 10];
                  break;
                case "3":
                  offset = [modeliX / 10, -modeliZ / 10, modeliY / 10];
                  break;
                case "4":
                  offset = [modeliX / 10, modeliY / 10, modeliZ / 10];
                  break;
                case "5":
                  offset = [modeliX / 10, -modeliY / 10, -modeliZ / 10];
                  break;
              }
              break;
            case "1":
              switch (axisNumber) {
                case "0":
                case "2":
                  offset = [
                    modeliX / 10,
                    wymiary.y + modeliZ / 10,
                    -modeliY / 10,
                    // offset[0] + wymiary.z,
                    // offset[1] + wymiary.y,
                    // offset[2] - wymiary.x,
                  ];
                  break;
                case "1":
                  offset = [
                    -modeliZ / 10,
                    wymiary.y + -modeliY / 10,
                    -modeliX / 10,
                  ];
                  break;
                case "3":
                  offset = [
                    modeliX / 10,
                    wymiary.y + -modeliZ / 10,
                    modeliY / 10,
                  ];
                  break;
                case "4":
                  offset = [
                    modeliX / 10,
                    wymiary.y + modeliY / 10,
                    modeliZ / 10,
                  ];
                  break;
                case "5":
                  offset = [
                    modeliX / 10,
                    wymiary.y + -modeliY / 10,
                    -modeliZ / 10,
                  ];
                  break;
              }
              break;
            case "2":
              switch (axisNumber) {
                case "0":
                case "2":
                  offset = [
                    wymiary.x + modeliZ / 10,
                    wymiary.y + modeliY / 10,
                    -wymiary.z - modeliX / 10,
                    // offset[0] + wymiary.z,
                    // offset[1] + wymiary.y,
                    // offset[2] - wymiary.x,
                  ];
                  break;
                case "1":
                  offset = [
                    wymiary.x - modeliZ / 10,
                    wymiary.y - modeliY / 10,
                    -wymiary.z - modeliX / 10,
                  ];
                  break;
                case "3":
                  offset = [
                    wymiary.x + modeliX / 10,
                    wymiary.y - modeliZ / 10,
                    -wymiary.z + modeliY / 10,
                  ];
                  break;
                case "4":
                  offset = [
                    wymiary.x + modeliX / 10,
                    wymiary.y + modeliY / 10,
                    -wymiary.z + modeliZ / 10,
                  ];
                  break;
                case "5":
                  offset = [
                    wymiary.x + modeliX / 10,
                    wymiary.y - modeliY / 10,
                    -wymiary.z + -modeliZ / 10,
                  ];
                  break;
              }
              break;
            case "3":
              switch (axisNumber) {
                case "0":
                case "2":
                  offset = [
                    wymiary.x + modeliZ / 10,
                    modeliY / 10,
                    -modeliX / 10,
                    // offset[0] + wymiary.z,
                    // offset[1] + wymiary.y,
                    // offset[2] - wymiary.x,
                  ];
                  break;
                case "1":
                  offset = [
                    wymiary.x - modeliZ / 10,
                    -modeliY / 10,
                    -wymiary.z - modeliX / 10,
                  ];
                  break;
                case "3":
                  offset = [
                    wymiary.x + modeliX / 10,
                    -modeliZ / 10,
                    -wymiary.z + modeliY / 10,
                  ];
                  break;
                case "4":
                  offset = [
                    wymiary.x + modeliX / 10,
                    modeliY / 10,
                    -wymiary.z + modeliZ / 10,
                  ];
                  break;
                case "5":
                  offset = [
                    wymiary.x + modeliX / 10,
                    -modeliY / 10,
                    -wymiary.z + -modeliZ / 10,
                  ];
                  break;
              }
              break;
            case "4":
              switch (axisNumber) {
                case "0":
                case "2":
                  offset = [
                    modeliZ / 10,
                    modeliY / 10,
                    -wymiary.z -
                      modeliX / 10 +
                      ((wymiary.grubosc && (wymiary.grubosc / 10) * 2) || 0),
                    // offset[0] + wymiary.z,
                    // offset[1] + wymiary.y,
                    // offset[2] - wymiary.x,
                  ];
                  break;
                case "1":
                  offset = [
                    -modeliZ / 10,
                    -modeliY / 10,
                    -wymiary.z -
                      modeliX / 10 +
                      ((wymiary.grubosc && (wymiary.grubosc / 10) * 2) || 0),
                  ];
                  break;
                case "3":
                  offset = [
                    modeliX / 10,
                    -modeliZ / 10,
                    -wymiary.z +
                      modeliY / 10 +
                      ((wymiary.grubosc && (wymiary.grubosc / 10) * 2) || 0),
                  ];
                  break;
                case "4":
                  offset = [
                    modeliX / 10,
                    modeliY / 10,
                    -wymiary.z +
                      modeliZ / 10 +
                      ((wymiary.grubosc && (wymiary.grubosc / 10) * 2) || 0),
                  ];
                  break;
                case "5":
                  offset = [
                    modeliX / 10,
                    -modeliY / 10,
                    -wymiary.z +
                      -modeliZ / 10 +
                      ((wymiary.grubosc && (wymiary.grubosc / 10) * 2) || 0),
                  ];
                  break;
              }
              break;
            case "5":
              switch (axisNumber) {
                case "0":
                case "2":
                  offset = [
                    modeliZ / 10,
                    wymiary.y + modeliY / 10,
                    -wymiary.z -
                      modeliX / 10 +
                      ((wymiary.grubosc && (wymiary.grubosc / 10) * 2) || 0),
                    // offset[0] + wymiary.z,
                    // offset[1] + wymiary.y,
                    // offset[2] - wymiary.x,
                  ];
                  break;
                case "1":
                  offset = [
                    -modeliZ / 10,
                    wymiary.y - modeliY / 10,
                    -wymiary.z -
                      modeliX / 10 +
                      ((wymiary.grubosc && (wymiary.grubosc / 10) * 2) || 0),
                  ];
                  break;
                case "3":
                  offset = [
                    modeliX / 10,
                    wymiary.y - modeliZ / 10,
                    -wymiary.z +
                      modeliY / 10 +
                      ((wymiary.grubosc && (wymiary.grubosc / 10) * 2) || 0),
                  ];
                  break;
                case "4":
                  offset = [
                    modeliX / 10,
                    wymiary.y + modeliY / 10,
                    -wymiary.z +
                      modeliZ / 10 +
                      ((wymiary.grubosc && (wymiary.grubosc / 10) * 2) || 0),
                  ];
                  break;
                case "5":
                  offset = [
                    modeliX / 10,
                    wymiary.y - modeliY / 10,
                    -wymiary.z +
                      -modeliZ / 10 +
                      ((wymiary.grubosc && (wymiary.grubosc / 10) * 2) || 0),
                  ];
                  break;
              }
              break;
            case "6":
              switch (axisNumber) {
                case "0":
                case "2":
                  offset = [
                    wymiary.x + modeliZ / 10,
                    wymiary.y + modeliY / 10,
                    -wymiary.z -
                      modeliX / 10 +
                      ((wymiary.grubosc && (wymiary.grubosc / 10) * 2) || 0),
                    // offset[0] + wymiary.z,
                    // offset[1] + wymiary.y,
                    // offset[2] - wymiary.x,
                  ];
                  break;
                case "1":
                  offset = [
                    wymiary.x - modeliZ / 10,
                    wymiary.y - modeliY / 10,
                    -wymiary.z -
                      modeliX / 10 +
                      ((wymiary.grubosc && (wymiary.grubosc / 10) * 2) || 0),
                  ];
                  break;
                case "3":
                  offset = [
                    wymiary.x + modeliX / 10,
                    wymiary.y - modeliZ / 10,
                    -wymiary.z +
                      modeliY / 10 +
                      ((wymiary.grubosc && (wymiary.grubosc / 10) * 2) || 0),
                  ];
                  break;
                case "4":
                  offset = [
                    wymiary.x + modeliX / 10,
                    wymiary.y + modeliY / 10,
                    -wymiary.z +
                      modeliZ / 10 +
                      ((wymiary.grubosc && (wymiary.grubosc / 10) * 2) || 0),
                  ];
                  break;
                case "5":
                  offset = [
                    wymiary.x + modeliX / 10,
                    wymiary.y - modeliY / 10,
                    -wymiary.z +
                      -modeliZ / 10 +
                      ((wymiary.grubosc && (wymiary.grubosc / 10) * 2) || 0),
                  ];
                  break;
              }
              break;
            case "7":
              switch (axisNumber) {
                case "0":
                case "2":
                  offset = [
                    wymiary.x + modeliZ / 10,
                    modeliY / 10,
                    -wymiary.z -
                      modeliX / 10 +
                      ((wymiary.grubosc && (wymiary.grubosc / 10) * 2) || 0),
                    // offset[0] + wymiary.z,
                    // offset[1] + wymiary.y,
                    // offset[2] - wymiary.x,
                  ];
                  break;
                case "1":
                  offset = [
                    wymiary.x - modeliZ / 10,
                    -modeliY / 10,
                    -wymiary.z -
                      modeliX / 10 +
                      ((wymiary.grubosc && (wymiary.grubosc / 10) * 2) || 0),
                  ];
                  break;
                case "3":
                  offset = [
                    wymiary.x + modeliX / 10,
                    -modeliZ / 10,
                    -wymiary.z +
                      modeliY / 10 +
                      ((wymiary.grubosc && (wymiary.grubosc / 10) * 2) || 0),
                  ];
                  break;
                case "4":
                  offset = [
                    wymiary.x + modeliX / 10,
                    modeliY / 10,
                    -wymiary.z +
                      modeliZ / 10 +
                      ((wymiary.grubosc && (wymiary.grubosc / 10) * 2) || 0),
                  ];
                  break;
                case "5":
                  offset = [
                    wymiary.x + modeliX / 10,
                    -modeliY / 10,
                    -wymiary.z +
                      -modeliZ / 10 +
                      ((wymiary.grubosc && (wymiary.grubosc / 10) * 2) || 0),
                  ];
                  break;
              }
              break;
          }
          break;
      }

    // With use_sides
    if (model_data.positions[selectedModel].modeli && useSides == "yes")
      switch (kierunek) {
        case "Poziomo":
          switch (stick_to_side) {
            case "0":
            case "3":
            case "4":
              switch (axisNumber) {
                case "0":
                case "2":
                  offset = [
                    modeliZ / 10,
                    modeliY / 10,
                    -modeliX / 10,
                    // offset[0] + wymiary.z,
                    // offset[1] + wymiary.y,
                    // offset[2] - wymiary.x,
                  ];
                  break;
                case "1":
                  offset = [-modeliZ / 10, -modeliY / 10, -modeliX / 10];
                  break;
                case "3":
                  offset = [modeliX / 10, -modeliZ / 10, modeliY / 10];
                  break;
                case "4":
                  offset = [modeliX / 10, modeliY / 10, modeliZ / 10];
                  break;
                case "5":
                  offset = [modeliX / 10, -modeliY / 10, -modeliZ / 10];
                  break;
              }
              break;
            case "1":
              switch (axisNumber) {
                case "0":
                case "2":
                  offset = [
                    modeliZ / 10,
                    wymiary.y + modeliY / 10,
                    -modeliX / 10,
                    // offset[0] + wymiary.z,
                    // offset[1] + wymiary.y,
                    // offset[2] - wymiary.x,
                  ];
                  break;
                case "1":
                  offset = [
                    -modeliZ / 10,
                    wymiary.y - modeliY / 10,
                    -modeliX / 10,
                  ];
                  break;
                case "3":
                  offset = [
                    modeliX / 10,
                    wymiary.y - modeliZ / 10,
                    modeliY / 10,
                  ];
                  break;
                case "4":
                  offset = [
                    modeliX / 10,
                    wymiary.y + modeliY / 10,
                    modeliZ / 10,
                  ];
                  break;
                case "5":
                  offset = [
                    modeliX / 10,
                    wymiary.y - modeliY / 10,
                    -modeliZ / 10,
                  ];
                  break;
              }
              break;
            case "2":
              switch (axisNumber) {
                case "0":
                case "2":
                  offset = [
                    wymiary.x + modeliZ / 10,
                    modeliY / 10,
                    -modeliX / 10,
                    // offset[0] + wymiary.z,
                    // offset[1] + wymiary.y,
                    // offset[2] - wymiary.x,
                  ];
                  break;
                case "1":
                  offset = [
                    wymiary.x - modeliZ / 10,
                    -modeliY / 10,
                    -modeliX / 10,
                  ];
                  break;
                case "3":
                  offset = [
                    wymiary.x + modeliX / 10,
                    -modeliZ / 10,
                    +modeliY / 10,
                  ];
                  break;
                case "4":
                  offset = [
                    wymiary.x + modeliX / 10,
                    modeliY / 10,
                    +modeliZ / 10,
                  ];
                  break;
                case "5":
                  offset = [
                    wymiary.x + modeliX / 10,
                    -modeliY / 10,
                    -modeliZ / 10,
                  ];
                  break;
              }
              break;
            case "5":
              switch (axisNumber) {
                case "0":
                case "2":
                  offset = [
                    modeliZ / 10,
                    modeliY / 10,
                    -wymiary.z - modeliX / 10,
                    // offset[0] + wymiary.z,
                    // offset[1] + wymiary.y,
                    // offset[2] - wymiary.x,
                  ];
                  break;
                case "1":
                  offset = [
                    -modeliZ / 10,
                    -modeliY / 10,
                    -wymiary.z - modeliX / 10,
                  ];
                  break;
                case "3":
                  offset = [
                    modeliX / 10,
                    -modeliZ / 10,
                    -wymiary.z + modeliY / 10,
                  ];
                  break;
                case "4":
                  offset = [
                    modeliX / 10,
                    modeliY / 10,
                    -wymiary.z + modeliZ / 10,
                  ];
                  break;
                case "5":
                  offset = [
                    modeliX / 10,
                    -modeliY / 10,
                    -wymiary.z - modeliZ / 10,
                  ];
                  break;
              }
              break;
          }
          break;
        case "Pion_bok":
          switch (stick_to_side) {
            case "0":
              switch (axisNumber) {
                case "0":
                  // case '2':
                  offset = [
                    modeliZ / 10,
                    modeliY / 10,
                    -modeliX / 10,
                    // offset[0] + wymiary.z,
                    // offset[1] + wymiary.y,
                    // offset[2] - wymiary.x,
                  ];
                  break;
                case "2":
                  offset = [modeliX / 10, modeliZ / 10, -modeliY / 10];
                  break;
                case "1":
                  offset = [-modeliZ / 10, -modeliY / 10, -modeliX / 10];
                  break;
                case "3":
                  offset = [modeliX / 10, -modeliZ / 10, modeliY / 10];
                  break;
                case "4":
                  offset = [modeliX / 10, modeliY / 10, modeliZ / 10];
                  break;
                case "5":
                  offset = [modeliX / 10, -modeliY / 10, -modeliZ / 10];
                  break;
              }
              break;
            case "3":
            case "4":
              switch (axisNumber) {
                case "0":
                case "2":
                  offset = [
                    modeliZ / 10,
                    modeliY / 10,
                    -modeliX / 10,
                    // offset[0] + wymiary.z,
                    // offset[1] + wymiary.y,
                    // offset[2] - wymiary.x,
                  ];
                  break;
                case "1":
                  offset = [-modeliZ / 10, -modeliY / 10, -modeliX / 10];
                  break;
                case "3":
                  offset = [modeliX / 10, -modeliZ / 10, modeliY / 10];
                  break;
                case "4":
                  offset = [modeliX / 10, modeliY / 10, modeliZ / 10];
                  break;
                case "5":
                  offset = [modeliX / 10, -modeliY / 10, -modeliZ / 10];
                  break;
              }
              break;
            case "1":
              switch (axisNumber) {
                case "0":
                case "2":
                  offset = [
                    wymiary.x + modeliZ / 10,
                    modeliY / 10,
                    -modeliX / 10,
                    // offset[0] + wymiary.z,
                    // offset[1] + wymiary.y,
                    // offset[2] - wymiary.x,
                  ];
                  break;
                case "1":
                  offset = [
                    wymiary.x - modeliZ / 10,
                    -modeliY / 10,
                    -modeliX / 10,
                  ];
                  break;
                case "3":
                  offset = [
                    wymiary.x + modeliX / 10,
                    -modeliZ / 10,
                    modeliY / 10,
                  ];
                  break;
                case "4":
                  offset = [
                    wymiary.x + modeliX / 10,
                    modeliY / 10,
                    modeliZ / 10,
                  ];
                  break;
                case "5":
                  offset = [
                    wymiary.x + modeliX / 10,
                    -modeliY / 10,
                    -modeliZ / 10,
                  ];
                  break;
              }
              break;
            case "2":
              switch (axisNumber) {
                case "0":
                case "2":
                  offset = [
                    modeliZ / 10,
                    wymiary.y + modeliY / 10,
                    -modeliX / 10,
                    // offset[0] + wymiary.z,
                    // offset[1] + wymiary.y,
                    // offset[2] - wymiary.x,
                  ];
                  break;
                case "1":
                  offset = [
                    -modeliZ / 10,
                    wymiary.y - modeliY / 10,
                    -modeliX / 10,
                  ];
                  break;
                case "3":
                  offset = [
                    modeliX / 10,
                    wymiary.y - modeliZ / 10,
                    +modeliY / 10,
                  ];
                  break;
                case "4":
                  offset = [
                    modeliX / 10,
                    wymiary.y + modeliY / 10,
                    +modeliZ / 10,
                  ];
                  break;
                case "5":
                  offset = [
                    modeliX / 10,
                    wymiary.y - modeliY / 10,
                    -modeliZ / 10,
                  ];
                  break;
              }
              break;
            case "5":
              switch (axisNumber) {
                case "0":
                case "2":
                  offset = [
                    modeliZ / 10,
                    modeliY / 10,
                    -wymiary.z - modeliX / 10,
                    // offset[0] + wymiary.z,
                    // offset[1] + wymiary.y,
                    // offset[2] - wymiary.x,
                  ];
                  break;
                case "1":
                  offset = [
                    -modeliZ / 10,
                    -modeliY / 10,
                    -wymiary.z - modeliX / 10,
                  ];
                  break;
                case "3":
                  offset = [
                    modeliX / 10,
                    -modeliZ / 10,
                    -wymiary.z + modeliY / 10,
                  ];
                  break;
                case "4":
                  offset = [
                    modeliX / 10,
                    modeliY / 10,
                    -wymiary.z + modeliZ / 10,
                  ];
                  break;
                case "5":
                  offset = [
                    modeliX / 10,
                    -modeliY / 10,
                    -wymiary.z - modeliZ / 10,
                  ];
                  break;
              }
              break;
          }
          break;
        case "Pion_front":
          switch (stick_to_side) {
            case "0":
            case "3":
            case "4":
              switch (axisNumber) {
                case "0":
                  offset = [
                    modeliZ / 10,
                    modeliY / 10,
                    -modeliX / 10,
                    // offset[0] + wymiary.z,
                    // offset[1] + wymiary.y,
                    // offset[2] - wymiary.x,
                  ];
                  break;
                case "2":
                  offset = [
                    modeliX / 10,
                    modeliZ / 10,
                    -modeliY / 10,
                    // offset[0] + wymiary.z,
                    // offset[1] + wymiary.y,
                    // offset[2] - wymiary.x,
                  ];
                  break;
                case "1":
                  offset = [-modeliZ / 10, -modeliY / 10, -modeliX / 10];
                  break;
                case "3":
                  offset = [modeliX / 10, -modeliZ / 10, modeliY / 10];
                  break;
                case "4":
                  offset = [modeliX / 10, modeliY / 10, modeliZ / 10];
                  break;
                case "5":
                  offset = [modeliX / 10, -modeliY / 10, -modeliZ / 10];
                  break;
              }
              break;
            case "1":
              switch (axisNumber) {
                case "0":
                  offset = [
                    modeliZ / 10,
                    modeliY / 10,
                    -modeliX / 10 +
                      ((wymiary.grubosc && (wymiary.grubosc / 10) * 2) || 0),
                    // offset[0] + wymiary.z,
                    // offset[1] + wymiary.y,
                    // offset[2] - wymiary.x,
                  ];
                  break;
                case "2":
                  offset = [
                    modeliX / 10,
                    modeliZ / 10,
                    -modeliY / 10 +
                      ((wymiary.grubosc && (wymiary.grubosc / 10) * 2) || 0),
                    // offset[0] + wymiary.z,
                    // offset[1] + wymiary.y,
                    // offset[2] - wymiary.x,
                  ];
                  break;
                case "1":
                  offset = [
                    -modeliZ / 10,
                    -modeliY / 10,
                    -modeliX / 10 +
                      ((wymiary.grubosc && (wymiary.grubosc / 10) * 2) || 0),
                  ];
                  break;
                case "3":
                  offset = [
                    modeliX / 10,
                    -modeliZ / 10,
                    modeliY / 10 +
                      ((wymiary.grubosc && (wymiary.grubosc / 10) * 2) || 0),
                  ];
                  break;
                case "4":
                  offset = [
                    modeliX / 10,
                    modeliY / 10,
                    modeliZ / 10 +
                      ((wymiary.grubosc && (wymiary.grubosc / 10) * 2) || 0),
                  ];
                  break;
                case "5":
                  offset = [
                    modeliX / 10,
                    -modeliY / 10,
                    -modeliZ / 10 +
                      ((wymiary.grubosc && (wymiary.grubosc / 10) * 2) || 0),
                  ];
                  break;
              }
              break;
            case "2":
              switch (axisNumber) {
                case "0":
                  offset = [
                    modeliZ / 10,
                    wymiary.y + modeliY / 10,
                    -modeliX / 10,
                    // offset[0] + wymiary.z,
                    // offset[1] + wymiary.y,
                    // offset[2] - wymiary.x,
                  ];
                  break;
                case "2":
                  offset = [
                    modeliX / 10,
                    wymiary.y + modeliZ / 10,
                    -modeliY / 10,
                    // offset[0] + wymiary.z,
                    // offset[1] + wymiary.y,
                    // offset[2] - wymiary.x,
                  ];
                  break;
                case "1":
                  offset = [
                    -modeliZ / 10,
                    wymiary.y - modeliY / 10,
                    -modeliX / 10,
                  ];
                  break;
                case "3":
                  offset = [
                    modeliX / 10,
                    wymiary.y - modeliZ / 10,
                    +modeliY / 10,
                  ];
                  break;
                case "4":
                  offset = [
                    modeliX / 10,
                    wymiary.y + modeliY / 10,
                    +modeliZ / 10,
                  ];
                  break;
                case "5":
                  offset = [
                    modeliX / 10,
                    wymiary.y - modeliY / 10,
                    -modeliZ / 10,
                  ];
                  break;
              }
              break;
            case "5":
              switch (axisNumber) {
                case "0":
                  offset = [
                    wymiary.x + modeliZ / 10,
                    modeliY / 10,
                    -modeliX / 10,
                    // offset[0] + wymiary.z,
                    // offset[1] + wymiary.y,
                    // offset[2] - wymiary.x,
                  ];
                  break;
                case "2":
                  offset = [
                    wymiary.x + modeliX / 10,
                    modeliZ / 10,
                    -modeliY / 10,
                    // offset[0] + wymiary.z,
                    // offset[1] + wymiary.y,
                    // offset[2] - wymiary.x,
                  ];
                  break;
                case "1":
                  offset = [
                    wymiary.x + -modeliZ / 10,
                    -modeliY / 10,
                    -modeliX / 10,
                  ];
                  break;
                case "3":
                  offset = [
                    wymiary.x + modeliX / 10,
                    -modeliZ / 10,
                    +modeliY / 10,
                  ];
                  break;
                case "4":
                  offset = [
                    wymiary.x + modeliX / 10,
                    modeliY / 10,
                    +modeliZ / 10,
                  ];
                  break;
                case "5":
                  offset = [
                    wymiary.x + modeliX / 10,
                    -modeliY / 10,
                    -modeliZ / 10,
                  ];
                  break;
              }
              break;
          }
          break;
      }
    setOffsetState(offset);
  }, [
    selectedModel,
    wymiary.x,
    wymiary.y,
    wymiary.z,
    wymiary.grubosc,
    model_data,
  ]);

  const modeli_rott_grp = useRef();
  const mdrl_rott_grp = useRef();
  useEffect(() => {
    // mdrl shiftings applied to model - transition, rotation
    const up_mdrl = model_data.positions[selectedModel].mdrl.up_vector;
    const direction_mdrl =
      model_data.positions[selectedModel].mdrl.direction_vector;

    // TODO: catch errors
    if (!up_mdrl)
      console.error(
        "up_mdrl is undefined for ",
        model_data.positions[selectedModel],
      );
    const up_mdrl_vector = new Vector3(
      Number(up_mdrl.x),
      Number(up_mdrl.y),
      Number(up_mdrl.z),
    );
    const direction_mdrl_vector = new Vector3(
      Number(direction_mdrl.x),
      Number(direction_mdrl.y),
      Number(direction_mdrl.z),
    );

    const crossVec_mdrl = new Vector3();
    crossVec_mdrl.crossVectors(up_mdrl_vector, direction_mdrl_vector);
    const cd = new Vector3(-1, 0, 0);

    //prettier-ignore
    var conversionMatrix = new Matrix4().set(
        1,   0,   0,   0,
        0,   0,   -1,   0,
        0,   1,   0,   0,
        0,   0,   0,   1
    );
    // @ts-ignore
    mdrl_rott_grp.current.matrixAutoUpdate = false;
    // @ts-ignore
    mdrl_rott_grp.current.matrix.makeRotationFromQuaternion(
      new Quaternion().setFromRotationMatrix(
        new Matrix4().lookAt(
          up_mdrl_vector,
          new Vector3(0, 0, 0),
          direction_mdrl_vector,
        ),
      ),
    );
    // @ts-ignore
    mdrl_rott_grp.current.matrixWorldNeedsUpdate = true;

    if (model_data.positions[selectedModel].modeli) {
      const up_modeli = model_data.positions[selectedModel].modeli.up_vector;
      const direction_modeli =
        model_data.positions[selectedModel].modeli.direction_vector;
      const up_modeli_vector = new Vector3(
        Number(up_modeli.x),
        Number(up_modeli.y),
        Number(up_modeli.z),
      );
      const direction_modeli_vector = new Vector3(
        Number(direction_modeli.x),
        Number(direction_modeli.y),
        Number(direction_modeli.z),
      );

      const crossVec_modeli = new Vector3();
      crossVec_modeli.crossVectors(up_modeli_vector, direction_modeli_vector);
      // @ts-ignore
      modeli_rott_grp.current.matrixAutoUpdate = false;
      // @ts-ignore
      //prettier-ignore
      modeli_rott_grp.current.matrix.makeRotationFromQuaternion(   new Quaternion().setFromRotationMatrix(new Matrix4().lookAt(up_modeli_vector, new Vector3(0,0,0),direction_modeli_vector) ))
      // @ts-ignore
      modeli_rott_grp.current.matrixWorldNeedsUpdate = true;
    }
  }, [selectedModel, model_data]);
  const rotationXY = useMemo(() => {
    // final rotation of model
    // console.log('useMemo selectedModeIndex', selectedModel)
    // console.log('useMemo model_data', model_data)
    if (
      model_data.positions[selectedModel] &&
      model_data.positions[selectedModel].modeli
    )
      switch (model_data.positions[selectedModel].modeli.axis) {
        case "0": //x+
          return new Euler(
            (model_data.positions[selectedModel].modeli.obrotZ * Math.PI) / 180,
            (model_data.positions[selectedModel].modeli.obrotY * Math.PI) / 180,
            (model_data.positions[selectedModel].modeli.obrotX * Math.PI) / 180,
            "XYZ",
          );
          break;
        case "1": //x-
          return new Euler(
            -(model_data.positions[selectedModel].modeli.obrotZ * Math.PI) /
              180,
            (-model_data.positions[selectedModel].modeli.obrotY * Math.PI) /
              180,
            (-model_data.positions[selectedModel].modeli.obrotX * Math.PI) /
              180,
            "ZYX",
          );
          break;
        case "2": // y+
          return new Euler(
            (model_data.positions[selectedModel].modeli.obrotX * Math.PI) / 180,
            (model_data.positions[selectedModel].modeli.obrotZ * Math.PI) / 180,
            (model_data.positions[selectedModel].modeli.obrotY * Math.PI) / 180,
            "XZY",
          );
          break;
        case "3": // y-
          return new Euler(
            (model_data.positions[selectedModel].modeli.obrotX * Math.PI) / 180,
            -(model_data.positions[selectedModel].modeli.obrotZ * Math.PI) /
              180,
            (model_data.positions[selectedModel].modeli.obrotY * Math.PI) / 180,
            "XZY",
          );
          break;
        case "4": // z+
          return new Euler(
            (model_data.positions[selectedModel].modeli.obrotX * Math.PI) / 180,
            // 0,
            (model_data.positions[selectedModel].modeli.obrotY * Math.PI) / 180,
            (model_data.positions[selectedModel].modeli.obrotZ * Math.PI) / 180,
            "XYZ",
          );
          break;
        case "5": // z-
          return new Euler(
            -(model_data.positions[selectedModel].modeli.obrotX * Math.PI) /
              180,
            // 0,
            -(model_data.positions[selectedModel].modeli.obrotY * Math.PI) /
              180,
            -(model_data.positions[selectedModel].modeli.obrotZ * Math.PI) /
              180,
            "XYZ",
          );
          break;

        default:
          return new Euler(0, 0, 0);
      }
  }, [selectedModel, model_data]);

  return (
    <group
      position={[
        formatka ? -wymiary.x / 2 : 0,
        formatka ? -wymiary.y / 2 : 0,
        formatka
          ? kierunek == "Pion_front"
            ? -wymiary.z / 2
            : wymiary.z / 2
          : 0,
      ]}
    >
      <group>
        {/* {console.log('offsetState', offsetState)} */}
        <group
          // @ts-ignore
          position={offsetState}
          // position={[40 / 10, 0, -40 / 10]}
        >
          {/* <group
            position={[
              model_data.positions[selectedModel].modeli
                ? Number(model_data.positions[selectedModel].modeli.x) / 10
                : 0,
              model_data.positions[selectedModel].modeli
                ? Number(model_data.positions[selectedModel].modeli.y) / 10
                : 0,
              model_data.positions[selectedModel].modeli
                ? Number(model_data.positions[selectedModel].modeli.z) / 10
                : 0,
            ]} //przesuniecie/trnsition modeli
            ></group> */}
          <group
          // position={useSides == 'no' || !['0', '1'].includes(model_data.positions[selectedModel].modeli.stick_to_side) ? [
          //   model_data.positions[selectedModel].modeli
          //     ? -Number(model_data.positions[selectedModel].modeli.x) / 10
          //     : 0,
          //   model_data.positions[selectedModel].modeli
          //     ? -Number(model_data.positions[selectedModel].modeli.y) / 10
          //     : 0,
          //   model_data.positions[selectedModel].modeli
          //     ? Number(model_data.positions[selectedModel].modeli.z) / 10
          //     : 0,
          // ] : [
          //   model_data.positions[selectedModel].modeli
          //     ? Number(model_data.positions[selectedModel].modeli.z) / 10
          //     : 0,
          //   model_data.positions[selectedModel].modeli
          //     ? Number(model_data.positions[selectedModel].modeli.y) / 10
          //     : 0,
          //   model_data.positions[selectedModel].modeli
          //     ? -Number(model_data.positions[selectedModel].modeli.x) / 10
          //     : 0,
          //   ]} //przesuniecie/trnsition modeli
          // position={[0, 0, 0]}
          >
            <group rotation={rotationXY}>
              <group
                ref={modeli_rott_grp} //obrot/rotation axis
              >
                {/* {console.log('selectedModel in return ', selectedModel)} */}
                {/* {console.log('selectedModel in return ', model_data)} */}
                <group
                  position={[
                    Number(model_data.positions[selectedModel].mdrl.x) / 10,
                    Number(model_data.positions[selectedModel].mdrl.y) / 10,
                    Number(model_data.positions[selectedModel].mdrl.z) / 10,
                  ]} // przesunięcie/transition mdrl
                >
                  <group
                    ref={mdrl_rott_grp} //mdrl rotation
                  >
                    <group
                      scale={[
                        100 *
                          Number(
                            model_data.positions[selectedModel].mdrl.scale,
                          ),
                        100 *
                          Number(
                            model_data.positions[selectedModel].mdrl.scale,
                          ),
                        100 *
                          Number(
                            model_data.positions[selectedModel].mdrl.scale,
                          ),
                      ]}
                    >
                      <group
                        scale={[
                          model_data.positions[selectedModel].modeli &&
                          model_data.positions[selectedModel].modeli.mirrorX ===
                            "1"
                            ? -1
                            : 1,
                          model_data.positions[selectedModel].modeli &&
                          model_data.positions[selectedModel].modeli.mirrorY ===
                            "1"
                            ? -1
                            : 1,
                          model_data.positions[selectedModel].modeli &&
                          model_data.positions[selectedModel].modeli.mirrorZ ===
                            "1"
                            ? -1
                            : 1,
                        ]}
                      >
                        {!(
                          model_data.display3dModel &&
                          model_data.display3dModel === "false"
                        ) &&
                          model_data.file[selectedModel].substr(
                            model_data.file[selectedModel].length - 3,
                          ) === "dae" && (
                            <ColladaModel
                              url={model_data.file}
                              model={selectedModel}
                            />
                          )}
                        {!(
                          model_data.display3dModel &&
                          model_data.display3dModel === "false"
                        ) &&
                          model_data.file[selectedModel].substr(
                            model_data.file[selectedModel].length - 3,
                          ) === "obj" && (
                            <OBJModel
                              url={model_data.file}
                              model={selectedModel}
                            />
                          )}
                      </group>
                    </group>
                  </group>
                </group>
              </group>
            </group>
          </group>
        </group>
      </group>
    </group>
  );
};
export default Model3d;
