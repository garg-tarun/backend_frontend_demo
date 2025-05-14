import { useState, useEffect, useRef } from "react";
import DropDown from "../../Components/DropDown";
import ProgressBar from "../../Components/ProgressBar";
import Loader from "../../Components/Loader";
import TextInput from "../../Components/TextInput";
import ErrorDialog from "../../Components/ErrorDialog";
import { useAnimationFrame } from "../../Hooks/useAnimationFrame";
import classes from "./Rates.module.css";
import CountryData from "../../Libs/Countries.json";
import countryToCurrency from "../../Libs/CountryCurrency.json";

let countries = CountryData.CountryCodes;

const Rates = () => {
  const [fromCurrency, setFromCurrency] = useState("AU");
  const [toCurrency, setToCurrency] = useState("US");

  const [exchangeRate, setExchangeRate] = useState(0.7456);
  const [progression, setProgression] = useState(0);
  const [loading, setLoading] = useState(false);

  const [amount, setAmount] = useState<number | "">("");
  const [error, setError] = useState<string | null>(null);
  const [inputValue, setInput] = useState("");

  const controllerRef = useRef<AbortController | null>(null);

  const Flag = ({ code }: { code: string }) => (
    <img
      alt={code || ""}
      src={`/img/flags/${code || ""}.svg`}
      width="20px"
      className={classes.flag}
    />
  );

  const handleChange = (raw: string) => {
    // Accept only digits (0-9)
    if (!/^\d*$/.test(raw)) {
      setError("Only digits (0-9) are allowed");
      return;
    }
    setInput(raw);
    if (raw === "") {
      setAmount("");
    } else {
      setAmount(parseInt(raw, 10));
    }
  };

  // Dismiss error after 5s
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  // Markup calculation
  const markUpPercent = 0.5;
  const markUpRate = (markUpPercent * exchangeRate) / 100;
  const trueAmount = amount !== "" ? amount * exchangeRate : 0;
  const markedUpAmount =
    amount !== "" ? amount * (exchangeRate - markUpRate) : 0;

  const sellCurrencyCode =
    countryToCurrency[fromCurrency as keyof typeof countryToCurrency];
  const buyCurrencyCode =
    countryToCurrency[toCurrency as keyof typeof countryToCurrency];

  const sendRequest = async (signal?: AbortSignal) => {
    const baseUrl = "https://rates.staging.api.paytron.com/rate/public";
    const params = new URLSearchParams({
      sellCurrency: sellCurrencyCode,
      buyCurrency: buyCurrencyCode,
    });
    const url = `${baseUrl}?${params.toString()}`;
    const response = await fetch(url, signal ? { signal } : undefined);

    if (!response.ok) {
      const errorData = await response.json();
      const errorText = errorData.detail ?? "Unknown error";
      throw new Error(errorText);
    }
    const data = await response.json();
    return data.retailRate;
  };

  const fetchData = async () => {
    if (controllerRef.current) {
      controllerRef.current.abort();
    }

    const controller = new AbortController();
    controllerRef.current = controller;

    setLoading(true);
    setError(null);

    try {
      const retailRate = await sendRequest(controller.signal);
      setExchangeRate(retailRate);
    } catch (err) {
      if ((err as any).name !== "AbortError") {
        setExchangeRate(0);
        setError(err instanceof Error ? err.message : "Unknown error");
      }
    } finally {
      setLoading(false);
    }
  };

  // Fetch excahnge rate if currency is changed
  useEffect(() => {
    if (!fromCurrency || !toCurrency) {
      setExchangeRate(0);
      return;
    }
    fetchData();
    // clean up previous fetch request
    return () => controllerRef.current?.abort();
  }, [fromCurrency, toCurrency]);

  // Demo progress bar moving :)
  useAnimationFrame(!loading, (deltaTime) => {
    setProgression((prevState) => {
      if (prevState > 0.998) {
        fetchData();
        return 0;
      }
      return (prevState + deltaTime * 0.0001) % 1;
    });
  });

  return (
    <div className={classes.container}>
      <div className={classes.content}>
        <div className={classes.heading}>Currency Conversion</div>

        <div className={classes.rowWrapper}>
          <div>
            <DropDown
              leftIcon={<Flag code={fromCurrency} />}
              label={"From"}
              selected={
                countryToCurrency[
                  fromCurrency as keyof typeof countryToCurrency
                ]
              }
              options={countries.map(({ code }) => ({
                option:
                  countryToCurrency[code as keyof typeof countryToCurrency],
                key: code,
                icon: <Flag code={code} />,
              }))}
              setSelected={(key: string) => {
                setFromCurrency(key);
              }}
              style={{ marginRight: "20px" }}
            />
          </div>

          <div className={classes.exchangeWrapper}>
            <div className={classes.transferIcon}>
              <img src="/img/icons/Transfer.svg" alt="Transfer icon" />
            </div>

            <div className={classes.rate}>{exchangeRate}</div>
          </div>

          <div>
            <DropDown
              leftIcon={<Flag code={toCurrency} />}
              label={"To"}
              selected={
                countryToCurrency[toCurrency as keyof typeof countryToCurrency]
              }
              options={countries.map(({ code }) => ({
                option:
                  countryToCurrency[code as keyof typeof countryToCurrency],
                key: code,
                icon: <Flag code={code} />,
              }))}
              setSelected={(key: string) => {
                setToCurrency(key);
              }}
              style={{ marginLeft: "20px" }}
            />
          </div>
        </div>
        <div className={classes.rowWrapper}>
          <TextInput
            id="transfer-amount"
            label="Transfer amount"
            value={inputValue}
            onChange={handleChange}
            placeholder="e.g. 100"
          />
          {error && (
            <ErrorDialog
              message={error}
              onClose={() => setError("")}
              autoCloseDuration={5000}
            />
          )}
        </div>

        {amount !== "" && (
          <div style={{ marginTop: "1rem" }}>
            <p>
              <strong>True Amount:</strong> {trueAmount.toFixed(4)}{" "}
              {buyCurrencyCode}
            </p>
            <p>
              <strong>Markup Amount:</strong> {markedUpAmount.toFixed(4)}{" "}
              {buyCurrencyCode}
            </p>
          </div>
        )}

        <ProgressBar
          progress={progression}
          animationClass={loading ? classes.slow : ""}
          style={{ marginTop: "20px" }}
        />

        {loading && (
          <div className={classes.loaderWrapper}>
            <Loader width={"25px"} height={"25px"} />
          </div>
        )}
      </div>
    </div>
  );
};

export default Rates;
