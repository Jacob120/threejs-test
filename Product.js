import {
  useState,
  useContext,
  useEffect,
  useMemo,
  useRef,
  Suspense,
} from "react";
import ThreeCanvas from "./ThreeCanvas";
import { CartContext } from "../../context/CartContextProvider";
import calculateNewDimensions from "./calculateNewDimensions";
import { FormattedMessage } from "react-intl";
import * as helpers from "../../utils/helpers";
import * as modelsHelpers from "../../utils/modelsHelpers";
import setFittingsListKodAsKey from "../../utils/setFittingsListKodAsKey";
import EyeHiddenIcon from "../common/icons/EyeHiddenIcon";
import EyeIcon from "../common/icons/EyeIcon";
import FitWidthIcon from "../common/icons/FitWidthIcon";
import MaximizeIcon from "../common/icons/MaximizeIcon";
import ReloadIcon from "../common/icons/ReloadIcon";
import dynamic from "next/dynamic";
const cloneDeep = require("lodash.clonedeep");
import { debounce } from "lodash";
import { useRouter } from "next/router";

const ParamsTabsDynamic = dynamic(
  () => import("../features/ParamsTabs/ParamsTabs.js"),
  {
    ssr: false,
  },
);

const Produkt = ({
  szafka,
  user,
  formsSettings,
  globalDeliveryAdd,
  fittingsList,
  priceTemplate,
  allMaterials,
}) => {
  // console.log("szafka", szafka.main.objects);
  const deepCopy = cloneDeep(szafka);

  const router = useRouter();
  const categoryId = router.query.categoryId;

  const [macroModels, setMacroModels] = useState({});
  const [wybranaSzafka, setWybranaSzafka] = useState(deepCopy);
  const { myCart, storeMyCart } = useContext(CartContext);
  const [visible, setVisible] = useState(true);
  const [dimensions, setDimensions] = useState(false);
  const [edges, setEdges] = useState(false);
  const [shadow, setShadow] = useState(true);
  const [resetView, setResetView] = useState(false);

  const [fittings, setFittings] = useState([]);
  const [paramsChangeCount, setParamsChangeCount] = useState(0);
  const [isFirstRender, setIsFirstRender] = useState(true);
  const [isReadyToRender, setIsReadyToRender] = useState(false);
  const [fittingsState, setFittingsState] = useState(undefined);
  const [internalFittings, setInternalFittings] = useState(0);
  const [externalFittings, setExternalFittings] = useState(0);
  const [modelsSummaryObject, setModelsSummaryObject] = useState({});
  const [isSticky, setIsSticky] = useState(false);
  const [paramsTabHeight, setParamsTabHeight] = useState(0);

  const fittingsListKod = useMemo(() => {
    return setFittingsListKodAsKey(fittingsList);
  }, [fittingsList]);

  const globalDeliveryTimeinDays = globalDeliveryAdd;

  useEffect(() => {
    calculateNewDimensions(
      wybranaSzafka.main,
      wybranaSzafka.main,
      "main",
      {},
      true,
      fittings,
      setFittings,
    );
  }, [szafka, wybranaSzafka, fittings, fittingsState]);

  /*--------------callback for changed parameter----------------------------------------------*/
  /*--------------triggers recalculating of furniture 3x times 
   one pass is not sufficient as parameters and dimensions are connected in various ways-----
                                                            ------------------------------------*/

  const doChangeParams = async (name, value, type) => {
    // console.log("============Change params=============");
    if (type === "wymiar") {
      const newSzafka = { ...wybranaSzafka };
      newSzafka.main[name].calc = value;
      newSzafka.main[name].decl = value;
      setWybranaSzafka({
        ...newSzafka,
      });
    } else {
      const newSzafka = { ...wybranaSzafka };
      newSzafka.main.params[name.toLowerCase()].calc = value;
      newSzafka.main.params[name].decl = value;

      setWybranaSzafka({ ...newSzafka });
    }
    // Note, Duplication is important here, sounds like state is not managed correctly..
    await calculateNewDimensions(
      wybranaSzafka.main,
      wybranaSzafka.main,
      "main",
      {},
      true,
      fittings,
      setFittings,
    );
    await calculateNewDimensions(
      wybranaSzafka.main,
      wybranaSzafka.main,
      "main",
      {},
      false,
      fittings,
      setFittings,
    );
    await calculateNewDimensions(
      wybranaSzafka.main,
      wybranaSzafka.main,
      "main",
      {},
      false,
      fittings,
      setFittings,
    );
    setParamsChangeCount((paramsChangeCount) => ++paramsChangeCount);
  };

  const debouncedChangeParams = debounce(doChangeParams, 300);
  /*--------------------------------------------------------------------------------------*/
  const handleAddToCart = () => {
    let _myCart = myCart;

    const _szafka =
      JSON.stringify(wybranaSzafka._id) +
      JSON.stringify(wybranaSzafka.main.params) +
      JSON.stringify(wybranaSzafka.forms) +
      JSON.stringify(wybranaSzafka.materialy) +
      JSON.stringify(wybranaSzafka.calculations);
    if (myCart.length > 0) {
      let change = false;
      _myCart.map((cartItem) => {
        if (
          JSON.stringify(cartItem._id) +
            JSON.stringify(cartItem.main.params) +
            JSON.stringify(cartItem.forms) +
            JSON.stringify(cartItem.materialy) +
            JSON.stringify(cartItem.calculations) ===
          _szafka
        ) {
          cartItem.ilosc = (Number(cartItem.ilosc) + 1).toString();
          change = true;
        }
      });
      if (!change) {
        wybranaSzafka.ilosc = "1";
        _myCart.push(JSON.parse(JSON.stringify(wybranaSzafka)));
      }
    } else {
      wybranaSzafka.ilosc = "1";
      _myCart.push(JSON.parse(JSON.stringify(wybranaSzafka)));
    }
    storeMyCart(_myCart);
  };

  /*-----------------update price in szafka-------------------------------------------------------*/
  const handleSavePrice = async (
    price,
    calculations,
    setAvailability,
    priceTemplate,
    edgeBands,
  ) => {
    let _wybranaSzafka = await wybranaSzafka;

    _wybranaSzafka.calculatedPrice = parseFloat(price);
    _wybranaSzafka.calculations = calculations;
    _wybranaSzafka.availability = setAvailability;
    _wybranaSzafka.usedPriceTemplate = priceTemplate;
    _wybranaSzafka.edgeBands = edgeBands;
    _wybranaSzafka.addedFromCategoryId = categoryId;

    setWybranaSzafka({ ..._wybranaSzafka });
    // setWybranaSzafka(wybranaSzafka => ({...wybranaSzafka, _wybranaSzafka}))
  };
  /*------------------handle change materials via parameters-----------------------------------------*/
  const handleChangeMaterial = (newMaterial, oldMaterial, category) => {
    let _wybranaSzafka = wybranaSzafka;
    _wybranaSzafka.materialy[category].SIFRA = newMaterial.SIFRA;
    _wybranaSzafka.materialy[category].MUID = newMaterial.MUID;
    _wybranaSzafka.materialy[category].matimg = newMaterial.PICFILE;
    _wybranaSzafka.materialy[category].FULLNAME = newMaterial.FULLNAME;
    _wybranaSzafka.materialy[category].CIJENA = newMaterial.CIJENA;

    setWybranaSzafka({ ..._wybranaSzafka });
    setParamsChangeCount((paramsChangeCount) => ++paramsChangeCount);
  };

  /*-------------------reset threejs canvas view to initial----------------------------------------*/
  const handleResetView = () => {
    setResetView(true);
    setEdges(false);
    setVisible(true);
    setDimensions(false);
  };

  const viewReseted = () => {
    setResetView(false);
  };
  /*--------------------------------------------------------------------------------------*/
  const toggleVisibility = () => {
    if (visible) setEdges(true);
    setVisible(!visible);
    setShadow(!shadow);
  };

  // Table for Jin & Adam only
  const countModelsInObjects = (objects, modelsSummaryObject) => {
    if (helpers.isEmptyObjectOrUndefined(objects)) return;
    for (const object of Object.values(objects)) {
      countModels(object["macroModels"], modelsSummaryObject);
      countModels(object["models"], modelsSummaryObject);
      while (Object.prototype.hasOwnProperty.call(object, "objects")) {
        countModelsInObjects(object["objects"], modelsSummaryObject);
        break;
      }
    }
  };

  const countModels = (models, modelsSummaryObject) => {
    if (helpers.isEmptyObjectOrUndefined(models)) return;
    for (const model of models) {
      const kod = model.kods && model["kods"][0];
      if (kod == "" || kod == undefined) continue;
      if (!modelsSummaryObject[kod]) {
        const name = model.file && model["file"][0];
        const image =
          process.env.NEXT_PUBLIC_API_BASE_URL +
          "/uploads/fittings/images" +
          kod.toLowerCase() +
          ".jpg";
        modelsSummaryObject[kod] = {};
        modelsSummaryObject[kod]["qty"] = 1;
        modelsSummaryObject[kod]["name"] = name.substring(0, name.length - 4);
        modelsSummaryObject[kod]["image"] = image;
      } else {
        modelsSummaryObject[kod]["qty"] = modelsSummaryObject[kod]["qty"] + 1;
      }
    }
  };

  // const joinExternalFittings = useMemo((macroModels) => {
  //   const externalFittings = macroModels["externalFittings"];
  //   const externalFittingsSummary = {};
  //
  // })

  useEffect(() => {
    const timer = setTimeout(async () => {
      // To calculate after doChangeParams update the default params as it might run several times after the first render
      if (isFirstRender) {
        setIsFirstRender(!isFirstRender);
      } else {
        // Calculate New Models
        // console.log("wybranaSzafka", wybranaSzafka.main.objects);
        const macroModels = modelsHelpers.calculateNewModels(wybranaSzafka);
        // console.log("macroModels in Product.js", macroModels);
        setExternalFittings(0);

        Object.entries(macroModels).forEach(([, value]) => {
          // console.log("price--value", value);
          const externalFittings = value.externalFittings;

          if (externalFittings) {
            Object.entries(externalFittings).forEach(([key, value]) => {
              setExternalFittings((prevExternalFittings) => {
                // Create a new object to avoid direct mutation
                const newExternalFittings = { ...prevExternalFittings };

                // Check and update the property
                if (newExternalFittings[key]) {
                  newExternalFittings[key] += value;
                } else {
                  newExternalFittings[key] = value;
                }

                return newExternalFittings;
              });
            });
          }

          if (value.objects) {
            Object.entries(value.objects).forEach(([key, value]) => {
              const externalFittings = value.externalFittings;

              if (externalFittings) {
                Object.entries(externalFittings).forEach(([key, value]) => {
                  setExternalFittings((prevExternalFittings) => {
                    // Create a new object to avoid direct mutation
                    const newExternalFittings = { ...prevExternalFittings };

                    // Check and update the property
                    if (newExternalFittings[key]) {
                      newExternalFittings[key] += value;
                    } else {
                      newExternalFittings[key] = value;
                    }

                    return newExternalFittings;
                  });
                });
              }
            });
          }
        });

        setMacroModels({ ...macroModels });

        // Fittings
        let fittingsResult = modelsHelpers.testIntersection(
          wybranaSzafka,
          fittingsListKod,
        );

        setInternalFittings(fittingsResult);
        setFittingsState(fittingsResult["fittigsPrices"]);
        //
        // // KOD_TABLE
        // let modelsSummary = {};
        // countModelsInObjects(wybranaSzafka.main.objects, modelsSummary);
        // setModelsSummaryObject(modelsSummary);
      }
    }, 150);
    return () => clearTimeout(timer);
  }, [paramsChangeCount]);

  useEffect(() => {
    setIsReadyToRender(true);

    let fittingsResult = modelsHelpers.testIntersection(
      wybranaSzafka,
      fittingsListKod,
    );

    setInternalFittings(fittingsResult);
    setFittingsState(fittingsResult["fittigsPrices"]);

    // Calculate New Models

    // console.log("macroModels", macroModels);
    // setMacroModels({ ...macroModels });
    // setTimeout(async () => {
    //   let macroModels = await modelsHelpers.calculateNewModels(wybranaSzafka);
    //   console.log({ macroModels });
    //   setMacroModels({ ...macroModels });
    // }, 50);

    let modelsSummary = {};
    countModelsInObjects(wybranaSzafka.main.objects, modelsSummary);
    setModelsSummaryObject(modelsSummary);
  }, []);

  const paramsTabsRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      if (paramsTabsRef.current) {
        const offsetTop = paramsTabsRef.current.getBoundingClientRect().top;
        const elementHeight = paramsTabsRef.current.offsetHeight;

        setParamsTabHeight(elementHeight);
        if (
          elementHeight > 1000 &&
          offsetTop <= 0 &&
          offsetTop > -elementHeight / 1.5
        ) {
          setIsSticky(true);
        } else {
          setIsSticky(false);
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(() => {
    setTimeout(() => {
      setParamsChangeCount((paramsChangeCount) => ++paramsChangeCount);
    }, 150);
  }, [isReadyToRender]);

  if (!isReadyToRender) return <>Loading..</>;

  return (
    <div className="relative">
      <div
        className={`flex justify-between ${
          isSticky ? "sticky top-[20px]" : ""
        } my-2 `}
      >
        <div className="flex gap-5  ">
          <FormattedMessage defaultMessage="Change Transparency">
            {(message) => (
              <button title={message} onClick={() => toggleVisibility()}>
                {visible ? (
                  <div className="flex w-10 h-10 bg-white rounded-full text-product-icons-bg ">
                    <EyeHiddenIcon width={16} height={16} className="m-auto" />
                  </div>
                ) : (
                  <div className="flex w-10 h-10 bg-white rounded-full text-black">
                    <EyeIcon width={16} height={16} className="m-auto" />
                  </div>
                )}
              </button>
            )}
          </FormattedMessage>

          <FormattedMessage defaultMessage="Show/Hide edges">
            {(message) => (
              <button title={message} onClick={() => setEdges(!edges)}>
                {!edges ? (
                  <div className="flex w-10 h-10 bg-white rounded-full text-product-icons-bg ">
                    <MaximizeIcon width={16} height={16} className="m-auto" />
                  </div>
                ) : (
                  <div className="flex w-10 h-10 bg-white rounded-full">
                    <MaximizeIcon width={16} height={16} className="m-auto" />
                  </div>
                )}
              </button>
            )}
          </FormattedMessage>

          <FormattedMessage defaultMessage="Show/Hide dimensions">
            {(message) => (
              <button
                title={message}
                onClick={() => setDimensions(!dimensions)}
              >
                {!dimensions ? (
                  <div className="flex w-10 h-10 text-product-icons-bg  bg-white rounded-full">
                    <FitWidthIcon width={16} height={16} className="m-auto" />
                  </div>
                ) : (
                  <div className="flex w-10 h-10 bg-white text-black rounded-full">
                    <FitWidthIcon width={16} height={16} className="m-auto  " />
                  </div>
                )}
              </button>
            )}
          </FormattedMessage>
          <FormattedMessage defaultMessage="Return to the original view">
            {(message) => (
              <button title={message} onClick={handleResetView}>
                <div className="flex w-10 h-10 bg-white rounded-full text-product-icons-bg active:text-black">
                  <ReloadIcon width={16} height={16} className="m-auto" />
                </div>
              </button>
            )}
          </FormattedMessage>
        </div>
      </div>

      <div className="">
        <div className="relative flex flex-col md:flex-row justify-between gap-5">
          <div className=" w-[80%] mx-auto md:w-3/5">
            <ThreeCanvas
              paramsTabHeight={paramsTabHeight}
              szafka={wybranaSzafka}
              visible={visible}
              shadow={shadow}
              resetView={resetView}
              viewReseted={viewReseted}
              dimensions={dimensions}
              edges={edges}
              macroModels={macroModels}
              height={600}
            />
          </div>
          <div
            className="md:w-2/5 h-fit pb-3 mt-[20px] md:mt-[-200px] bg-white rounded-[25px] shadow-lg"
            ref={paramsTabsRef}
          >
            <ParamsTabsDynamic
              // ref={paramsTabsRef}
              data={szafka}
              productID={szafka._id}
              formsSettings={formsSettings}
              parametryMain={{
                wysokosc: wybranaSzafka.main.wysokosc,
                szerokosc: wybranaSzafka.main.szerokosc,
                glebokosc: wybranaSzafka.main.glebokosc,
              }}
              parametry={wybranaSzafka.main.params}
              changeParams={debouncedChangeParams}
              materialy={wybranaSzafka.materialy}
              changeMaterial={handleChangeMaterial}
              cena={wybranaSzafka.cena}
              addToCart={handleAddToCart}
              savePrice={handleSavePrice}
              status={wybranaSzafka.status}
              availability={wybranaSzafka.availability}
              szafkaMain={wybranaSzafka.main}
              globalDeliveryTimeinDays={globalDeliveryTimeinDays}
              internalFittings={internalFittings}
              externalFittings={externalFittings}
              priceTemplate={priceTemplate}
              wybranaSzafka={wybranaSzafka}
              allMaterials={allMaterials}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Produkt;
