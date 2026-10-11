import React from "react";
import {
  Home,
  Wallet,
  Scale,
  PiggyBank,
  FileText,
  TrendingUp,
  Percent,
  LineChart,
  Maximize2,
  Building2,
  Hammer,
  Handshake,
  Calculator,
} from "lucide-react";

const ICON_MAP = {
  Home,
  Wallet,
  Scale,
  PiggyBank,
  FileText,
  TrendingUp,
  Percent,
  LineChart,
  Maximize2,
  Building2,
  Hammer,
  Handshake,
};

export default function CalculatorIcon({ name, className = "w-5 h-5", strokeWidth = 2 }) {
  const IconComponent = ICON_MAP[name] || Calculator;
  return <IconComponent className={className} strokeWidth={strokeWidth} />;
}
