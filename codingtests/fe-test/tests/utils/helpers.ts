import { expect } from "vitest";
import { screen, fireEvent, within } from "@testing-library/react";
import styles from "../../src/Pages/Rates/Rates.module.css";

export function verifyFlagElement(code: string) {
  let img = screen.getByAltText(code);
  expect(img).toBeInTheDocument();
  expect(img).toHaveAttribute("src", `/img/flags/${code}.svg`);
  expect(img).toHaveAttribute("width", "20px");
  expect(img).toHaveClass(styles.flag);
}

export function selectCurrencyUsingDropdown(
  label: string,
  currencyCode: string
) {
  const fromLabel = screen.getByText(label);
  const fromContainer = fromLabel.closest("div");
  const fromButton = within(fromContainer!).getByRole("button");
  // open the dropdown
  fireEvent.click(fromButton);
  // select the currecny
  fireEvent.click(screen.getByText(currencyCode));
}
