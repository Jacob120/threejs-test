import { useMemo } from "react";
import { ColladaLoader } from "three/examples/jsm/loaders/ColladaLoader";
import Load3DModels from "../../utils/load3DModel";

function updateColladaModelNodeMaterial(node) {
  const material = node.material;
  if (!material || !material.color) return;

  const isColorToChange =
    material.color.r === 1 && material.color.g === 0 && material.color.b === 1;

  if (isColorToChange) {
    material.color.setRGB(0.5, 0.5, 0.5);
    material.roughness = 0.25;
    material.metalness = 0.75;
  }
}

//wczytywanie modeli dae
export default function ColladaModel({ filesNamesArray, model }) {
  const models = Load3DModels(ColladaLoader, filesNamesArray);
  const { scene } = models[model];
  const copiedScene = useMemo(() => {
    if (!scene.children) return scene;
    const scene2 = scene.clone();
    if (scene2.children) {
      for (const node of scene2.children) {
        if (node.name === "node") {
          updateColladaModelNodeMaterial(node);
        }
      }
    }
    return scene2;
  }, [scene]);
  return <primitive object={copiedScene} dispose={null} />;
}
