import { useMemo } from "react";
import { Mesh, MeshStandardMaterial } from "three";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader";
import Load3DModels from "../../utils/load3DModel";

//wczytywanie modeli obj
export default function OBJModel({ filesNamesArray, model }) {
  const models = Load3DModels(OBJLoader, filesNamesArray);

  const scene = models[model];
  const copiedScene = useMemo(() => {
    const scene2 = scene.clone();

    scene2.traverse(function (child) {
      if (child instanceof Mesh) {
        const material = new MeshStandardMaterial({
          color: 0x555555,
          metalness: 1,
          emissive: 0x333333,
          emissiveIntensity: 0.1,
          shininess: 80,
          specular: 0xffffff,
        });
        child.material = material;
      }
    });

    scene2.scale.divideScalar(1000);
    return scene2;
  }, [scene]);

  return <primitive object={copiedScene} />;
}
