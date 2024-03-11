// przeliczanie łuku - w krzywych Coprus'a jest łuk od-do punktu z zadanym promieniem,
// a w three js potrzebny jest środek, promień, kąty początkowy i końcowy
// conversion of arc from Corpus point to point with given radius to
// three js format - center poin, radius, start and end angle.
export default function calculateArc(path, krzywa, x1, y1) {
  // find center of circle.
  function calculateCenter(x0, y0, x1, y1, r, PTARSM, PTARST) {
    const d = Math.sqrt(Math.pow(x1 - x0, 2) + Math.pow(y1 - y0, 2));
    if (d / 2 > r) return { x: NaN, y: NaN };
    const x3 =
      PTARSM == "0"
        ? x0 + (x1 - x0) / 2 - (Math.sqrt(r * r - (d * d) / 4) * (y1 - y0)) / d
        : x0 + (x1 - x0) / 2 + (Math.sqrt(r * r - (d * d) / 4) * (y1 - y0)) / d;
    const y3 =
      PTARSM == "0"
        ? y0 + (y1 - y0) / 2 + (Math.sqrt(r * r - (d * d) / 4) * (x1 - x0)) / d
        : y0 + (y1 - y0) / 2 - (Math.sqrt(r * r - (d * d) / 4) * (x1 - x0)) / d;
    return { x: x3, y: y3 };
  }

  const p = calculateCenter(
    krzywa.x,
    krzywa.y,
    x1,
    y1,
    krzywa.radius,
    krzywa.PTARSM,
    krzywa.PTARST
  );

  if (isNaN(p.x) || isNaN(p.y) || krzywa.radius === 0) {
    path.lineTo(x1, y1);
  } else {
    path.absarc(
      p.x,
      p.y,
      krzywa.radius,
      krzywa.PTARSM === "0"
        ? p.x < krzywa.x
          ? Math.atan((p.y - krzywa.y) / (p.x - krzywa.x))
          : Math.atan((p.y - krzywa.y) / (p.x - krzywa.x)) - Math.PI
        : p.x < krzywa.x
        ? Math.atan((p.y - krzywa.y) / (p.x - krzywa.x))
        : Math.atan((p.y - krzywa.y) / (p.x - krzywa.x)) + Math.PI,
      krzywa.PTARSM === "0"
        ? p.x < x1
          ? Math.atan((p.y - y1) / (p.x - x1))
          : Math.atan((p.y - y1) / (p.x - x1)) - Math.PI
        : p.x < x1
        ? Math.atan((p.y - y1) / (p.x - x1))
        : Math.atan((p.y - y1) / (p.x - x1)) - Math.PI,

      krzywa.PTARSM == "0"
        ? krzywa.PTARST == "0"
          ? false
          : true
        : krzywa.PTARST == "1"
        ? false
        : true
    );
  }
}
