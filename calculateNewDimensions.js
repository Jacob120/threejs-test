import { Math_2 } from "../../utils/math";
const Math2 = Math_2; // nie usuwać eval to wywyołuje dla nie których wyrażeń
import * as helpers from "./../../utils/helpers";

// calculation of dimensions for given parameters
export const calculateNewDimensions = async (
  branch,
  main,
  branchName,
  parent,
  show_errors,
  fittings,
  setFittings
) => {
  // console.log("calculateNewDimensions branch", branch);
  // console.log("calculateNewDimensions main", main);
  if (branch.params)
    // processing parameters
    Object.entries(branch.params).forEach(([elementName, element]) => {
      // console.log("elementName:", elementName, "element:", element);
      try {
        // console.log("element.decl:", element.decl);
        element.calc = eval(element.decl);
        // console.log("element.calc:", element.calc);
        // ToDo: This can be also a formula. But we can ignore it for now.
        if (!helpers.isNumeric(Number(element.calc))) {
          throw "error";
        }
      } catch (e) {
        if (show_errors) {
          console.log(
            "Błąd przetwarzania:",
            element.decl,
            " element:",
            branch.nameMongo,
            " parametr:",
            elementName,
            "errorMessage",
            e
          );
        }
      }
      // pokazd & pokazc - special Corpus functions to hide/show elements
      // pokazd - hides one element
      // pokazc - hides all elements with ending number higher than parameter value
      if (elementName.includes("pokazd_") || elementName.includes("pokazc_")) {
        if (elementName.includes("pokazd")) {
          const form = elementName.slice(
            elementName.indexOf("pokazd_") + 7,
            elementName.length
          );
          if (form in branch.objects) {
            branch.objects[form].visible = element.calc ? "true" : "false";
          }
        } else {
          const form = elementName.slice(
            elementName.indexOf("pokazc_") + 7,
            elementName.length
          );
          if (form + "1" in branch.objects) {
            Object.entries(branch.objects).forEach(
              ([formName, formDetails]) => {
                if (!isNaN(Number(formName.replace(form, ""))))
                  if (formName.replace(form, "") <= element.calc) {
                    formDetails.visible = "true";
                  } else {
                    formDetails.visible = "false";
                  }
              }
            );
          }
        }
      }
    });

  function getClosestValueinRange(calc, range) {
    if (!range || range.length == 0) return;
    if (calc < range[0]) return range[0];
    for (let i = range.length; i >= 0; i--) {
      if (calc > range[i]) {
        return parseInt(range[i]);
      }
    }
  }
  function evalPositionsDimensions(element, elementProperty, branch_nameMongo) {
    try {
      // console.log("BEFORE EVAL element[elementProperty].decl", element[elementProperty].decl);

      element[elementProperty].calc = eval(element[elementProperty].decl);
      // console.log("AFTER EVAL element[elementProperty].calc", element[elementProperty].calc);

      if (element[elementProperty].range) {
        element[elementProperty].calc = getClosestValueinRange(
          element[elementProperty].calc,
          element[elementProperty].range
        );
      }
      if (isNaN(Number(element[elementProperty].calc))) {
        console.log(
          "element[elementProperty].calc",
          element,
          element[elementProperty].calc
        );
        throw "error";
      } else {
        if (
          element[elementProperty].block &&
          element[elementProperty].block.round &&
          element[elementProperty].block.blockRanges
        ) {
          const arr = element[elementProperty].block.blockRanges.sort();
          if (element[elementProperty].calc <= arr[0]) {
            element[elementProperty].calc = arr[0];
          } else if (element[elementProperty].calc >= arr[arr.length - 1]) {
            element[elementProperty].calc = arr[arr.length - 1];
          } else
            switch (
              element[elementProperty].block.round // switch rounding type
            ) {
              case "0":
                //round
                const bigger = arr.find(
                  (item) => element[elementProperty].calc <= item
                );
                const smaller = arr
                  .reverse()
                  .find((item) => element[elementProperty].calc >= item);
                if (
                  bigger - element[elementProperty].calc <
                  element[elementProperty].calc - smaller
                )
                  element[elementProperty].calc = bigger;
                else element[elementProperty].calc = smaller;
                break;
              case "1":
                //floor
                element[elementProperty].calc = arr
                  .reverse()
                  .find((item) => element[elementProperty].calc >= item);
                break;
              case "2":
                //ceil
                element[elementProperty].calc = arr.find(
                  (item) => element[elementProperty].calc <= item
                );
                break;
            }
        }
      }
    } catch (e) {
      element[elementProperty].calc = 0;
      console.log(
        "element[elementProperty].decl",
        element[elementProperty].decl
      );
      if (show_errors) console.log("screenshot-new-dimensions-error");
      console.log(
        "Błąd przetwarzania:",
        element[elementProperty].decl,
        " w ",
        elementProperty,
        " dla:",
        element.nameMongo,
        " w branch:",
        branch_nameMongo,
        "errorMessage",
        e
      );
    }
  }
  if (branch.fittings) {
    branch.fittings.forEach((fitting, index) => {
      try {
        fitting.quantity.calc = eval(fitting.quantity.decl);
        if (isNaN(Number(fitting.quantity.calc))) {
          throw "error";
        }
      } catch (e) {
        if (show_errors)
          console.log(
            "Błąd przetwarzania:",
            fitting.quantity.decl,
            " okucie:",
            index,
            "UID:",
            fitting.id
          );
      }
    });
  }
  if (branch.objects)
    //iterating through objects
    Object.entries(branch.objects).forEach(([elementName, element]) => {
      if (
        element.has3dModel &&
        element.has3dModel === "true" &&
        element.models
      ) {
        // pobierz dane modelu z api  -->> pobierz jak nie ma w state i zapisz do state .
        // sprawdz czy model pasuje do wymiarow
        // jesli nie - pobierz zamienniki i podstaw - tez do state
        // checking 3d models. Fetching model det. from api and saving to state if not there
        // checking if this model fits to new dimensions
        // if not - fetching replacement model and amending it, also updating storage of models in state
        element.models.forEach(async (model) => {
          async function getFittings(CorpusID) {
            if (CorpusID === "") return [];
            const res = await fetch("/api/fittings/" + CorpusID);
            const data = await res.json();
            return data;
          }
          if (model.CorpusID) {
            const foundFitting = fittings.filter(
              (item) => item.CorpusID == model.CorpusID
            );
            let fittingData;
            if (foundFitting.length === 0) {
              const getFittingData = await getFittings(model.CorpusID);

              fittingData = getFittingData[0];
              const filteredFittings = fittings.filter(
                (item) => item.CorpusID === model.CorpusID
              );
              if (filteredFittings.length === 0) fittings.push(fittingData);
              setFittings(fittings);
            }
            function checkFittingReplacement(wymiar, _fittingData) {
              if (
                _fittingData &&
                _fittingData.dimensions &&
                _fittingData.dimensions[wymiar] &&
                (_fittingData.dimensions[wymiar].min !== "0" ||
                  _fittingData.dimensions[wymiar].max !== "0")
              ) {
                let dimensionToCheck;
                switch (wymiar) {
                  case "x":
                    switch (element.kierunek) {
                      case "Poziomo":
                        dimensionToCheck = "wysokosc";
                        break;
                      case "Pion_front":
                        dimensionToCheck = "szerokosc";
                        break;
                      case "Pion_bok":
                        dimensionToCheck = "glebokosc";
                        break;
                    }
                    break;
                  case "y":
                    if (element.kierunek !== "Poziomo")
                      dimensionToCheck = "wysokosc";
                    else dimensionToCheck = "glebokosc";
                    break;
                  case "z":
                    if (element.kierunek !== "Pion_front")
                      dimensionToCheck = "szerokosc";
                    else dimensionToCheck = "glebokosc";
                    break;
                }

                if (
                  _fittingData.dimensions[wymiar].min !== "0" &&
                  element[dimensionToCheck].calc <
                    Number(_fittingData.dimensions[wymiar].min)
                ) {
                  // console.log("za mała"); //too small
                  return false;
                }
                if (
                  _fittingData.dimensions[wymiar].max !== "0" &&
                  element[dimensionToCheck].calc >=
                    Number(_fittingData.dimensions[wymiar].max)
                ) {
                  //  console.log("za duża"); // too big
                  return false;
                }
              }
              return true;
            }
            const _myModel = fittings.filter(
              (x) => model.CorpusID === x.CorpusID
            );
            const myModel = _myModel[0];
            const xCheck = checkFittingReplacement("x", myModel);
            const yCheck = checkFittingReplacement("y", myModel);
            const zCheck = checkFittingReplacement("z", myModel);
            if (!(xCheck && yCheck && zCheck)) {
              //  czy z listy zamienników jest w fittings
              // if fitting is on fitting list
              const toGet = fittings
                .filter((x) => x.CorpusID === model.CorpusID)[0]
                .replacementList.filter(
                  (item) => !fittings.some((fitem) => fitem.CorpusID === item)
                );
              const replacementData = await getFittings(toGet.join("/"));
              const toSave = replacementData.filter(
                (item) =>
                  !fittings.some((fitem) => fitem.CorpusID === item.CorpusID)
              );

              const joined = fittings.concat(toSave);
              setFittings(joined);

              const filtered = joined.filter(
                (x) =>
                  myModel.replacementList.includes(x.CorpusID) &&
                  checkFittingReplacement("x", x) &&
                  checkFittingReplacement("y", x) &&
                  checkFittingReplacement("z", x)
              );
              if (filtered.length === 0) model.display3dModel = "false";
              else {
                model.display3dModel = "true";
                model.file[0] = filtered[0].filename;
                model.positions[0].mdrl = filtered[0].mdrl;
                model.CorpusID = filtered[0].CorpusID;
              }
            }
          }
        });
      }
      // calculate dimensions of elements other than forms
      // those are nested elements so calculateNewDimensions is called recursuively
      if (element.typ !== "formatka") {
        evalPositionsDimensions(element, "szerokosc", branch.nameMongo);
        evalPositionsDimensions(element, "wysokosc", branch.nameMongo);
        evalPositionsDimensions(element, "glebokosc", branch.nameMongo);
        evalPositionsDimensions(element, "x", branch.nameMongo);
        evalPositionsDimensions(element, "y", branch.nameMongo);
        evalPositionsDimensions(element, "z", branch.nameMongo);

        if (element.visible === "true")
          calculateNewDimensions(
            element,
            main,
            elementName,
            {
              ...branch,
              parent: parent,
            },
            show_errors,
            fittings,
            setFittings
          );
      } else {
        if (element.hasCurve == "true") {
          if (element.cusvars)
            Object.entries(element.cusvars).forEach(([cusVarName, cusVar]) => {
              try {
                cusVar.calc = eval(cusVar.decl);
                if (isNaN(Number(cusVar.calc))) {
                  throw "błąd";
                }
              } catch (e) {
                if (show_errors)
                  //prettier-ignore
                  console.log("Błąd przetwarzania: ",cusVar.decl," cusVar:",cusVarName," dla:",element.nameMongo," w branch:",branch.nameMongo);
              }
            });

          //calculate evals for curves
          //prettier-ignore
          function evalKrzywe(line,lineIndex,lineProperty,ptockaName,element_nameMongo,branch_nameMongo) {
              try {
                line[lineProperty].calc = eval(line[lineProperty].decl);
                if (isNaN(Number(line[lineProperty].calc))) {
                  throw "błąd";
                }
              } catch (e) {
                if (show_errors)
                //prettier-ignore
                  console.log("Błąd przetwarzania:",line[lineProperty].decl,"'",lineProperty,"' w krzywej index:",lineIndex," w ",ptockaName," dla:",element_nameMongo," w branch:",branch_nameMongo);
              }
            }
          if (element.krzywe)
            Object.entries(element.krzywe).forEach(([ptockaName, ptocka]) => {
              ptocka.forEach((line, lineIndex) => {
                //prettier-ignore
                evalKrzywe(line, lineIndex,"x", ptockaName,element.nameMongo, branch.nameMongo );
                //prettier-ignore
                evalKrzywe(line, lineIndex,"y", ptockaName,element.nameMongo, branch.nameMongo );
                if (line.type == "arc")
                  //prettier-ignore
                  evalKrzywe(line, lineIndex,"radius", ptockaName,element.nameMongo, branch.nameMongo );
              });
            });
        }
        //calculate remaining parameters
        evalPositionsDimensions(element, "szerokosc", branch.nameMongo);
        evalPositionsDimensions(element, "wysokosc", branch.nameMongo);
        evalPositionsDimensions(element, "glebokosc", branch.nameMongo);
        evalPositionsDimensions(element, "x", branch.nameMongo);
        evalPositionsDimensions(element, "y", branch.nameMongo);
        evalPositionsDimensions(element, "z", branch.nameMongo);
      }
    });
};
export default calculateNewDimensions;
