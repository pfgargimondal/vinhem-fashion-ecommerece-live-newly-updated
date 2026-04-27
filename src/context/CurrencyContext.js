import { createContext, useContext, useEffect, useState } from "react";

const CurrencyContext = createContext();

export const CurrencyProvider = ({ children }) => {

 const [selectedCurrency, setSelectedCurrency] = useState(() => {
    const savedCurrency = localStorage.getItem("selectedCurrency");
    return savedCurrency
      ? JSON.parse(savedCurrency)
      : {
          country: "India",
          currency_code: "INR",
          exchange_rate_to_inr: 1,
          locale: "en-IN",
        };
  });

  // ✅ Save to localStorage whenever it changes
  useEffect(() => {
    if (selectedCurrency) {
      localStorage.setItem("selectedCurrency", JSON.stringify(selectedCurrency));
    }
  }, [selectedCurrency]);

  const formatPrice = (priceInInr = 0, options = {}) => {
    const { showDecimals = false, returnParts = false } = options;

    const currency = selectedCurrency || {
      currency_code: "INR",
      exchange_rate_to_inr: 1,
      locale: "en-IN",
    };

    // ✅ Keep exact decimal for calculation
    const convertedPrice =
      priceInInr / (currency.exchange_rate_to_inr || 1);

    // ✅ Round ONLY for display
    const displayPrice = showDecimals
      ? convertedPrice
      : Math.round(convertedPrice);

    const formatter = new Intl.NumberFormat(currency.locale || "en-IN", {
      style: "currency",
      currency: currency.currency_code || "INR",
      minimumFractionDigits: showDecimals ? 2 : 0,
      maximumFractionDigits: showDecimals ? 2 : 0,
    });

    if (!returnParts) {
      return formatter.format(displayPrice);
    }

    const parts = formatter.formatToParts(displayPrice);

    const symbol = parts.find(p => p.type === "currency")?.value || "";
    const number = parts
      .filter(p => p.type !== "currency")
      .map(p => p.value)
      .join("")
      .trim();

    return {
      symbol,
      number,
      raw: convertedPrice, // 🔥 still original decimal for backend usage
    };
  };



  return (
    <CurrencyContext.Provider value={{ selectedCurrency, setSelectedCurrency, formatPrice}}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => useContext(CurrencyContext);
