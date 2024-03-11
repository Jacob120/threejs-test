// zmiana wartości calc ze string na Number
// change calc values from string to numbers
const convertCalcToNumber = async (myData) => {
  if (!myData) return;
  myData.szerokosc.calc = Number(myData.szerokosc.calc);
  myData.wysokosc.calc = Number(myData.wysokosc.calc);
  myData.glebokosc.calc = Number(myData.glebokosc.calc);
  myData.x.calc = Number(myData.x.calc);
  myData.y.calc = Number(myData.y.calc);
  myData.z.calc = Number(myData.z.calc);
  if (myData.hasCurve == "true") {
    if (myData.cusvars)
      Object.values(myData.cusvars).forEach((x) => (x.calc = Number(x.calc)));
    if (myData.krzywe)
      Object.values(myData.krzywe).forEach((ptocka) =>
        ptocka.forEach((line) => {
          line.x.calc = Number(line.x.calc);
          line.y.calc = Number(line.y.calc);
          line.z.calc = Number(line.z.calc);
          if (line.type == "arc") line.radius.calc = Number(line.radius.calc);
        })
      );
  }
  if (myData.grubosc) myData.grubosc = Number(myData.grubosc);
  if (myData.params)
    Object.values(myData.params).forEach((x) => (x.calc = Number(x.calc)));
  if (myData.fittings)
    myData.fittings.forEach((x) => (x.quantity.calc = Number(x.quantity.calc)));
  if (myData.objects)
    Object.values(myData.objects).forEach((x) => convertCalcToNumber(x));
};
export default convertCalcToNumber;
