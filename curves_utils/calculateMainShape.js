import { Shape } from "three";
import calculateArc from "../CalculateArc";
// tworzenie płaszczyzny formatki
// calculate shape (one side of board)
export default function calculateMainShape(
  firstCurve,
  _mainShape,
  _mainPoints,
  kierunek,
  wymiary,
  drazekN
) {
  firstCurve.forEach((ptocka, index) => {
    const tempShape = new Shape();
    tempShape.autoClose = false;

    if (index == 0) {
    }
    if (ptocka.x < 0 && !drazekN) ptocka.x = 0;

    if (kierunek === "Poziomo" && ptocka.x > wymiary.z) ptocka.x = wymiary.z;
    if (kierunek === "Pion_front" && ptocka.x > wymiary.x && !drazekN)
      ptocka.x = wymiary.x;
    if (kierunek === "Pion_bok" && ptocka.x > wymiary.z) ptocka.x = wymiary.z;
    if (ptocka.y < 0) ptocka.y = 0;
    if (kierunek === "Poziomo" && ptocka.y > wymiary.x) ptocka.y = wymiary.x;
    if (kierunek === "Pion_front" && ptocka.y > wymiary.y && !drazekN)
      ptocka.y = wymiary.y;
    if (kierunek === "Pion_bok" && ptocka.y > wymiary.y) ptocka.y = wymiary.y;
    tempShape.moveTo(ptocka.x, ptocka.y);
    _mainShape.moveTo(ptocka.x, ptocka.y);
    let x1,
      y1 = 0;
    if (index === firstCurve.length - 1) {
      x1 = firstCurve[0].x;
      y1 = firstCurve[0].y;
    } else {
      x1 = firstCurve[index + 1].x;
      y1 = firstCurve[index + 1].y;
    }

    if (x1 < 0 && !drazekN) x1 = 0;

    if (kierunek === "Poziomo" && x1 > wymiary.z) x1 = wymiary.z;
    if (kierunek === "Pion_front" && x1 > wymiary.x && !drazekN) x1 = wymiary.x;
    if (kierunek === "Pion_bok" && x1 > wymiary.z) x1 = wymiary.z;
    if (y1 < 0) y1 = 0;
    if (kierunek === "Poziomo" && y1 > wymiary.x) y1 = wymiary.x;
    if (kierunek === "Pion_front" && y1 > wymiary.y && !drazekN) y1 = wymiary.y;
    if (kierunek === "Pion_bok" && y1 > wymiary.y) y1 = wymiary.y;
    if (ptocka.type && ptocka.type == "arc") {
      calculateArc(_mainShape, ptocka, x1, y1);
      calculateArc(tempShape, ptocka, x1, y1);
    } else if (ptocka.type && ptocka.type === "bezier") {
      let PTPR0,
        PTPR1 = 0;
      if (index === firstCurve.length - 1) {
        PTPR0 = firstCurve[0].PTPR0; //x jak jest
        PTPR1 = firstCurve[0].PTPR1; //y jak jest
      } else {
        PTPR0 = firstCurve[index + 1].PTPR0;
        PTPR1 = firstCurve[index + 1].PTPR1;
      }
      _mainShape.bezierCurveTo(
        ptocka.PTNE0,
        ptocka.PTNE1,
        PTPR0,
        PTPR1,
        x1,
        y1
      );
      tempShape.bezierCurveTo(ptocka.PTNE0, ptocka.PTNE1, PTPR0, PTPR1, x1, y1);
    } else {
      _mainShape.lineTo(x1, y1);

      tempShape.lineTo(x1, y1);
    }
    const { shape: somePoints } = tempShape.extractPoints();
    _mainPoints[parseInt(ptocka.PTS / 2)] =
      _mainPoints[parseInt(ptocka.PTS / 2)].concat(somePoints);
  });
}
