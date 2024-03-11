// zamiana evar na params
// change evar.something to main.params.something
// or to diferent_something.params.something
const _amendEvar = (main) => {
  const splitEvars = (formula, parents, name) => {
    let newFormula = formula;
    const split = formula.split("evar.params.");
    split.map((x, index) => {
      if (x !== "" && index !== 0) {
        const evar_name = x.split(/[^A-Za-z0-9_]/);
        const blabla1 = findEvar(
          evar_name[0],
          parents.length == 0 ? ["main"] : [...parents],
          main
        );
        newFormula = formula.replace("evar.params." + evar_name[0], blabla1);
      }
    });
    return newFormula;
  };
  const findEvar = (evar, parents, reference) => {
    let chain = "";
    const present = parents.shift();
    if (parents && parents.length > 0) {
      if (present === "main") chain = findEvar(evar, parents, main);
      else {
        if (reference.objects) {
          chain = findEvar(
            evar,
            parents,
            reference.objects[present.toLowerCase()]
          );
        } else
          console.log("*******************************************", reference);
      }
    }
    if (present !== "main") {
      if (
        reference.objects[present.toLowerCase()].params &&
        Object.keys(reference.objects[present.toLowerCase()].params).includes(
          evar
        )
      ) {
        return present.toLowerCase() + ".params." + evar;
      } else return present + ".objects." + chain;
    } else {
      if (Object.keys(reference.params).includes(evar))
        chain = "main.params." + evar;
      else return present + ".objects." + chain;
    }
    // }
    return chain;
  };

  const amendEvar = (myData, parentsList, main) => {
    try {
      if (myData && myData.szerokosc) {
        if (myData.szerokosc.decl.includes("evar.")) {
          myData.szerokosc.decl = splitEvars(
            myData.szerokosc.decl,
            parentsList,
            myData.name,
            main
          );
        }
        if (myData.wysokosc.decl.includes("evar."))
          myData.wysokosc.decl = splitEvars(
            myData.wysokosc.decl,
            parentsList,
            myData.name,
            main
          );
        if (myData.glebokosc.decl.includes("evar."))
          myData.glebokosc.decl = splitEvars(
            myData.glebokosc.decl,
            parentsList,
            myData.name,
            main
          );
        if (myData.x.decl.includes("evar.")) {
          myData.x.decl = splitEvars(
            myData.x.decl,
            parentsList,
            myData.name,
            main
          );
        }
        if (myData.y.decl.includes("evar."))
          myData.y.decl = splitEvars(
            myData.y.decl,
            parentsList,
            myData.name,
            main
          );
        if (myData.z.decl.includes("evar."))
          myData.z.decl = splitEvars(
            myData.z.decl,
            parentsList,
            myData.name,
            main
          );
        if (myData.params) {
          Object.values(myData.params).forEach((param, index) => {
            if (param.type === "formula" && param.decl.includes("evar."))
              param.decl = splitEvars(
                param.decl,
                parentsList,
                myData.name,
                main
              );
          });
        }
        if (myData.cusvars) {
          Object.values(myData.cusvars).forEach((cusvar) => {
            if (cusvar.decl.includes("evar."))
              cusvar.decl = splitEvars(
                cusvar.decl,
                parentsList,
                myData.name,
                main
              );
          });
        }
        if (myData.objects) {
          let localParentList = [...parentsList];
          if (localParentList.length === 0) localParentList.push("main");
          else localParentList.push(myData.name);
          Object.values(myData.objects).forEach((x) =>
            amendEvar(x, localParentList, main)
          );
        }
      }
    } catch (e) {}
  };
  amendEvar(main, []);
};
export default _amendEvar;
