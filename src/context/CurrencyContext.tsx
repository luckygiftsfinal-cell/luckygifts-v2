import React, { createContext, useContext, useState, useEffect } from "react";

const rates = {
  USD: 1,
  EUR: 0.92,
  AED: 3.67
};

const symbols = {
  USD: "$",
  EUR: "€",
  AED: "AED"
};

type CurrencyCode = keyof typeof rates;

interface CurrencyContextType {
  currency: CurrencyCode;
  setCurrency: (code: CurrencyCode) => void;
  formatPrice: (amountInUSD: number) => string;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export const CurrencyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currency, setCurrencyState] = useState<CurrencyCode>(() => {
    return (localStorage.getItem("currency") as CurrencyCode) || "USD";
  });

  const setCurrency = (code: CurrencyCode) => {
    setCurrencyState(code);
    localStorage.setItem("currency", code);
  };

  const formatPrice = (amountInUSD: number) => {
    const converted = amountInUSD * rates[currency];
    const symbol = symbols[currency];
    
    if (currency === "AED") {
      return `${converted.toLocaleString()} ${symbol}`;
    }
    return `${symbol}${converted.toLocaleString()}`;
  };

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, formatPrice }}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (!context) throw new Error("useCurrency must be used within CurrencyProvider");
  return context;
};
