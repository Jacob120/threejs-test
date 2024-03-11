import {
  BufferGeometry,
  BufferAttribute,
  Mesh,
  MeshStandardMaterial,
  DoubleSide,
  EdgesGeometry,
  LineSegments,
  LineBasicMaterial,
} from "three";

// wyliczanie boków przez połączenie punktów z górnej i dolnej płaszczyzny
// calculating sides verexes by connecting points from mainPoints and backPoints
export default function calculateSides(
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
) {
  const positionsArray = [];
  const positionNumComponents = 3;
  const uvNumComponents = 2;

  mainPoints.forEach((group, groupIndex) => {
    let uvs = [];
    positionsArray.push([]);

    group.forEach((point, index) => {
      if (index >= mainPoints[groupIndex].length - 1) return;
      positionsArray[groupIndex].push(point.x, point.y, 0);
      uvs.push(0, 0);
      positionsArray[groupIndex].push(
        mainPoints[groupIndex][index + 1].x,
        mainPoints[groupIndex][index + 1].y,
        0
      );
      uvs.push(1, 0);
      positionsArray[groupIndex].push(
        backPoints[groupIndex][index].x,
        backPoints[groupIndex][index].y,
        kierunek !== "Poziomo" ? _grubosc / 10 : -_grubosc / 10
      );
      uvs.push(0, 1);
      positionsArray[groupIndex].push(
        backPoints[groupIndex][index].x,
        backPoints[groupIndex][index].y,
        kierunek !== "Poziomo" ? _grubosc / 10 : -_grubosc / 10
      );
      uvs.push(0, 1);
      positionsArray[groupIndex].push(
        mainPoints[groupIndex][index + 1].x,
        mainPoints[groupIndex][index + 1].y,
        0
      );
      uvs.push(1, 0);
      positionsArray[groupIndex].push(
        backPoints[groupIndex][index + 1].x,
        backPoints[groupIndex][index + 1].y,
        kierunek !== "Poziomo" ? _grubosc / 10 : -_grubosc / 10
      );
      uvs.push(1, 1);
    });
    sideGeometry[groupIndex] = new BufferGeometry();
    sideGeometry[groupIndex].setAttribute(
      "position",
      new BufferAttribute(
        new Float32Array(positionsArray[groupIndex]),
        positionNumComponents
      )
    );
    sideGeometry[groupIndex].setAttribute(
      "uv",
      new BufferAttribute(new Float32Array(uvs), uvNumComponents)
    );
    sideGeometry[groupIndex].computeVertexNormals();
    let texture;

    if (kierunek === "Poziomo") {
      switch (groupIndex) {
        case 0:
          texture = textureArray[4];
          break;
        case 1:
          texture = textureArray[0];
          break;
        case 2:
          texture = textureArray[5];
          break;
        case 3:
          texture = textureArray[1];
          break;
        default:
          texture = textureArray[2];
      }
    } else if (kierunek === "Pion_bok") {
      switch (groupIndex) {
        case 0:
          texture = textureArray[4];
          break;
        case 1:
          texture = textureArray[2];
          break;
        case 2:
          texture = textureArray[5];
          break;
        case 3:
          texture = textureArray[3];
          break;
        default:
          texture = textureArray[2];
      }
    } else {
      switch (groupIndex) {
        case 0:
          texture = textureArray[1];
          break;
        case 1:
          texture = textureArray[2];
          break;
        case 2:
          texture = textureArray[0];
          break;
        case 3:
          texture = textureArray[3];
          break;
        default:
          texture = textureArray[2];
      }
    }
    sideMesh[groupIndex] = new Mesh(
      sideGeometry[groupIndex],
      new MeshStandardMaterial({
        map: texture,
        side: DoubleSide,
        roughness: 0.6,
        metalness: 0.1,
        transparent: true,
        opacity: visible ? 1 : 0.4,
      })
    );
    if (edges) {
      const edges = new EdgesGeometry(sideGeometry[groupIndex]);
      const line = new LineSegments(
        edges,
        new LineBasicMaterial({ color: 0x000000 })
      );
      sideMesh[groupIndex].add(line);
    }
  });
}
