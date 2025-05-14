import { render, screen, fireEvent } from "@testing-library/react";
import { vi } from "vitest";
import { describe, expect, it } from "vitest";
import { useState } from "react";
import Dropdown from "../src/Components/DropDown";
import CountryData from "../src/Libs/Countries.json";
import countryToCurrency from "../src/Libs/CountryCurrency.json";
import styles from "../src/Pages/Rates/Rates.module.css";
import { verifyFlagElement } from "./utils/helpers";

let countries = CountryData.CountryCodes;

const Flag = ({ code }: { code: string }) => (
  <img
    alt={code || ""}
    src={`/img/flags/${code || ""}.svg`}
    width="20px"
    className={styles.flag}
  />
);

const DropdownWrapper = () => {
  const [currency, setCurrency] = useState("US");
  return (
    <Dropdown
      leftIcon={<Flag code={currency} />}
      label={"From"}
      selected={countryToCurrency[currency as keyof typeof countryToCurrency]}
      options={countries.map(({ code }) => ({
        option: countryToCurrency[code as keyof typeof countryToCurrency],
        key: code,
        icon: <Flag code={code} />,
      }))}
      setSelected={setCurrency}
      style={{ marginRight: "20px" }}
    />
  );
};

describe("Dropdown Component Test", () => {
  it("Renders Dropdown component and triggers currency change", () => {
    render(<DropdownWrapper />);
    const label = screen.getByText("From");
    expect(label).toBeInTheDocument();

    const currency = "US";
    verifyFlagElement(currency);

    // Simulate user selecting "AUD"
    // Open the dropdown
    fireEvent.click(screen.getByRole("button"));
    // Click AUD option
    fireEvent.click(screen.getByText("AUD"));

    const newCurrency = "AU";
    verifyFlagElement(newCurrency);
  });

  it("matches default snapshot", () => {
    const { container } = render(<DropdownWrapper />);
    expect(container).toMatchSnapshot();
  });
});
