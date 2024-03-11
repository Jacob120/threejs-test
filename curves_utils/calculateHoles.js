import { Shape } from "three";
import calculateArc from "../CalculateArc";

// wyliczanie otworów w płaszczyźnie formatki (muszą być w przeciwnym kierunku niż formatka)
// calculates points in board shape - holes has to be in oposite direction than shape
export default function calculateHoles(curves, _mainShape, _holesPoints) {
  const holesPoints = [];
  curves.forEach((ptocka, indx) => {
    if (indx == 0) return;
    const holeShape = new Shape();
    holeShape.autoClose = true;
    ptocka.forEach((krzywa, index) => {
      if (index == 0) {
        holeShape.moveTo(krzywa.x, krzywa.y);
      }
      let x1,
        y1 = 0;
      if (index == ptocka.length - 1) {
        x1 = ptocka[0].x;
        y1 = ptocka[0].y;
      } else {
        x1 = ptocka[index + 1].x;
        y1 = ptocka[index + 1].y;
      }
      if (x1 < 0 && !drazekN) x1 = 0;

      if (krzywa.type && krzywa.type == "arc") {
        calculateArc(holeShape, krzywa, x1, y1);
      } else if (krzywa.type && krzywa.type === "bezier") {
        // console.log(krzywa);
        let PTPR0,
          PTPR1 = 0;
        if (index === ptocka.length - 1) {
          PTPR0 = ptocka[0].PTPR0; //x jak jest
          PTPR1 = ptocka[0].PTPR1; //y jak jest
        } else {
          PTPR0 = ptocka[index + 1].PTPR0;
          PTPR1 = ptocka[index + 1].PTPR1;
        }
        holeShape.lineTo(krzywa.x, krzywa.y);

        holeShape.bezierCurveTo(
          krzywa.PTNE0,
          krzywa.PTNE1,
          PTPR0,
          PTPR1,
          x1,
          y1
        );
      } else {
        holeShape.lineTo(x1, y1);
      }
    });
    _mainShape.holes.push(holeShape);
    const { shape } = holeShape.extractPoints();
    _holesPoints.push(shape);
  });
}
