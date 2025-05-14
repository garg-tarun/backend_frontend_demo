import {
  render,
  screen,
  fireEvent,
  within,
  waitFor,
} from "@testing-library/react";
import { vi } from "vitest";
import styles from "../src/Pages/Rates/Rates.module.css";
import { describe, expect, it } from "vitest";
import Rates from "../src/Pages/Rates";
import {
  verifyFlagElement,
  selectCurrencyUsingDropdown,
} from "./utils/helpers";

beforeEach(() => {
  vi.stubGlobal(
    "fetch",
    vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ retailRate: 1.54 }),
      })
    )
  );
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("Rates Page Test", () => {
  const mockSetSelected = vi.fn();
  const fromCurrency = "AU";
  const ToCurrency = "US";

  it("Verify default page rendering", async () => {
    render(<Rates />);
    const title = screen.getByText("Currency Conversion");
    expect(title).toBeInTheDocument();

    const label = screen.getByText("From");
    expect(label).toBeInTheDocument();

    verifyFlagElement(fromCurrency);
    verifyFlagElement(ToCurrency);

    expect(screen.getByLabelText("Transfer amount")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("e.g. 100")).toBeInTheDocument();
  });

  it("Verify page rendering after from/to currency change", async () => {
    render(<Rates />);

    // change from/to currency using dropdown
    const fromLabel = "From";
    const fromCurrencyCode = "SGD";
    selectCurrencyUsingDropdown(fromLabel, fromCurrencyCode);

    const toLabel = "To";
    const toCurrencyCode = "INR";
    selectCurrencyUsingDropdown(toLabel, toCurrencyCode);

    // validate flag after from/to currency change
    const newFromCurrency = "SG";
    const newToCurrency = "IN";
    verifyFlagElement(newFromCurrency);
    verifyFlagElement(newToCurrency);

    // wait for the rate to update (rerender via state)
    await waitFor(() => expect(screen.getByText(/1\.54/)).toBeInTheDocument());

    const input = screen.getByPlaceholderText("e.g. 100");
    fireEvent.change(input, { target: { value: "100" } });
    expect(input).toHaveValue("100");

    await waitFor(() =>
      expect(screen.getByText(/True Amount:/i)).toBeInTheDocument()
    );

    const trueAmountElm = screen.getByText(/True Amount:/i).parentElement!;
    const markupAmountElm = screen.getByText(/Markup Amount:/i).parentElement!;
    expect(trueAmountElm.textContent).toBe("True Amount: 154.0000 INR");
    expect(markupAmountElm.textContent).toBe("Markup Amount: 153.2300 INR");
  });

  it("matches snapshot with default rendering", () => {
    const { container } = render(<Rates />);
    expect(container).toMatchSnapshot();
  });

  it("matches snapshot after changing from/to currency", () => {
    const { container } = render(<Rates />);
    // change from/to currency using dropdown
    const fromLabel = "From";
    const fromCurrencyCode = "SGD";
    selectCurrencyUsingDropdown(fromLabel, fromCurrencyCode);

    const toLabel = "To";
    const toCurrencyCode = "INR";
    selectCurrencyUsingDropdown(toLabel, toCurrencyCode);
    expect(container).toMatchSnapshot();
  });
});
