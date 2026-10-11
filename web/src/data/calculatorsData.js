/**
 * Astittva Real Estate - Calculators Master Data & Configuration
 * Defines metadata, input parameters, calculation logic, and categorization
 * for all 12 property, investment, and construction calculators.
 */

export const CALCULATOR_CATEGORIES = [
  {
    id: "buyers",
    name: "For Buyers",
    shortName: "Buyers",
    tagline: "Financing, affordability & purchase planning",
  },
  {
    id: "investors",
    name: "For Investors",
    shortName: "Investors",
    tagline: "Returns, yield & capital appreciation",
  },
  {
    id: "construction",
    name: "Property & Construction",
    shortName: "Property & Construction",
    tagline: "Area conversions, costs & transaction fees",
  },
];

export const CALCULATORS = [
  // --- FOR BUYERS ---
  {
    id: "home-loan-emi",
    slug: "home-loan-emi",
    path: "/calculators/home-loan-emi",
    name: "Home Loan EMI Calculator",
    shortName: "Home Loan EMI",
    category: "buyers",
    categoryLabel: "For Buyers",
    targetAudience: "Buyers",
    iconName: "Home",
    shortDescription: "Calculate your monthly EMI, total interest and total repayment.",
    description:
      "Plan your home purchase by calculating exact monthly loan installments (EMI), overall interest burden, and total repayment schedule across different bank tenures.",
    defaultValues: {
      loanAmount: 6000000,
      interestRate: 8.5,
      tenureYears: 20,
    },
    fields: [
      {
        key: "loanAmount",
        label: "Loan Amount",
        type: "currency",
        min: 500000,
        max: 50000000,
        step: 100000,
        quickPresets: [3000000, 5000000, 7500000, 10000000, 20000000],
      },
      {
        key: "interestRate",
        label: "Interest Rate (% p.a.)",
        type: "percent",
        min: 6.5,
        max: 15.0,
        step: 0.1,
        quickPresets: [7.5, 8.25, 8.5, 9.0, 9.5],
      },
      {
        key: "tenureYears",
        label: "Loan Tenure (Years)",
        type: "number",
        min: 1,
        max: 30,
        step: 1,
        quickPresets: [10, 15, 20, 25, 30],
      },
    ],
    calculate: (inputs) => {
      const P = Number(inputs.loanAmount) || 0;
      const R = Number(inputs.interestRate) || 0;
      const years = Number(inputs.tenureYears) || 0;

      if (P <= 0 || R <= 0 || years <= 0) {
        return {
          monthlyEmi: 0,
          totalInterest: 0,
          totalPayment: 0,
          principalAmount: P,
          interestRatio: 0,
        };
      }

      const r = R / (12 * 100);
      const n = years * 12;
      const emi = (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
      const totalPayment = emi * n;
      const totalInterest = totalPayment - P;

      return {
        monthlyEmi: Math.round(emi),
        totalInterest: Math.round(totalInterest),
        totalPayment: Math.round(totalPayment),
        principalAmount: Math.round(P),
        interestRatio: Math.round((totalInterest / totalPayment) * 100),
      };
    },
  },
  {
    id: "property-affordability",
    slug: "property-affordability",
    path: "/calculators/property-affordability",
    name: "Property Affordability Calculator",
    shortName: "Property Affordability",
    category: "buyers",
    categoryLabel: "For Buyers",
    targetAudience: "Buyers",
    iconName: "Wallet",
    shortDescription: "Estimate property budget based on income, savings and loan capacity.",
    description:
      "Understand your true home buying capacity. This calculator evaluates your net take-home salary, current EMIs, and cash reserves to determine a comfortable purchase price.",
    defaultValues: {
      monthlyIncome: 150000,
      existingEmis: 15000,
      downPaymentSavings: 1500000,
      tenureYears: 20,
      interestRate: 8.5,
    },
    fields: [
      {
        key: "monthlyIncome",
        label: "Net Monthly Income",
        type: "currency",
        min: 25000,
        max: 2000000,
        step: 5000,
        quickPresets: [75000, 100000, 150000, 250000, 500000],
      },
      {
        key: "existingEmis",
        label: "Existing Monthly Obligations / EMIs",
        type: "currency",
        min: 0,
        max: 500000,
        step: 2000,
        quickPresets: [0, 10000, 25000, 50000],
      },
      {
        key: "downPaymentSavings",
        label: "Available Cash for Down Payment",
        type: "currency",
        min: 200000,
        max: 30000000,
        step: 100000,
        quickPresets: [1000000, 2000000, 3500000, 5000000],
      },
      {
        key: "tenureYears",
        label: "Expected Loan Tenure (Years)",
        type: "number",
        min: 5,
        max: 30,
        step: 1,
        quickPresets: [15, 20, 25],
      },
      {
        key: "interestRate",
        label: "Expected Home Loan Rate (% p.a.)",
        type: "percent",
        min: 7.0,
        max: 13.0,
        step: 0.1,
        quickPresets: [8.25, 8.5, 9.0],
      },
    ],
    calculate: (inputs) => {
      const income = Number(inputs.monthlyIncome) || 0;
      const obligations = Number(inputs.existingEmis) || 0;
      const savings = Number(inputs.downPaymentSavings) || 0;
      const years = Number(inputs.tenureYears) || 20;
      const rate = Number(inputs.interestRate) || 8.5;

      const maxFoirEmi = Math.max(0, income * 0.5 - obligations);
      const r = rate / (12 * 100);
      const n = years * 12;

      const maxLoan =
        r > 0 && n > 0
          ? (maxFoirEmi * (Math.pow(1 + r, n) - 1)) / (r * Math.pow(1 + r, n))
          : 0;

      const totalBudget = maxLoan + savings;
      const loanPercent = totalBudget > 0 ? (maxLoan / totalBudget) * 100 : 0;
      const downPaymentPercent = 100 - loanPercent;

      return {
        totalBudget: Math.round(totalBudget),
        maxLoanCapacity: Math.round(maxLoan),
        maxMonthlyEmi: Math.round(maxFoirEmi),
        downPaymentSavings: Math.round(savings),
        loanPercent: Math.round(loanPercent),
        downPaymentPercent: Math.round(downPaymentPercent),
      };
    },
  },
  {
    id: "rent-vs-buy",
    slug: "rent-vs-buy",
    path: "/calculators/rent-vs-buy",
    name: "Rent vs Buy Calculator",
    shortName: "Rent vs Buy",
    category: "buyers",
    categoryLabel: "For Buyers",
    targetAudience: "Tenants & Buyers",
    iconName: "Scale",
    shortDescription: "Compare the long-term financial impact of renting versus buying.",
    description:
      "Determine whether you should purchase a home or continue renting. Analyzes mortgage payments, property appreciation, rent escalations, and investment opportunity costs over time.",
    defaultValues: {
      monthlyRent: 28000,
      annualRentIncrease: 6,
      propertyPrice: 7500000,
      downPaymentPercent: 20,
      interestRate: 8.5,
      loanTenureYears: 20,
      appreciationRate: 6.5,
      timeHorizon: 10,
    },
    fields: [
      {
        key: "monthlyRent",
        label: "Current Monthly Rent",
        type: "currency",
        min: 5000,
        max: 300000,
        step: 1000,
        quickPresets: [20000, 30000, 45000, 60000],
      },
      {
        key: "propertyPrice",
        label: "Target Property Purchase Price",
        type: "currency",
        min: 2000000,
        max: 50000000,
        step: 200000,
        quickPresets: [5000000, 7500000, 10000000, 15000000],
      },
      {
        key: "downPaymentPercent",
        label: "Down Payment (%)",
        type: "percent",
        min: 10,
        max: 50,
        step: 5,
        quickPresets: [15, 20, 25, 30],
      },
      {
        key: "appreciationRate",
        label: "Expected Property Appreciation (% p.a.)",
        type: "percent",
        min: 3,
        max: 12,
        step: 0.5,
        quickPresets: [5, 6.5, 8],
      },
      {
        key: "timeHorizon",
        label: "Comparison Horizon (Years)",
        type: "number",
        min: 3,
        max: 25,
        step: 1,
        quickPresets: [5, 10, 15, 20],
      },
    ],
    calculate: (inputs) => {
      const rent = Number(inputs.monthlyRent) || 25000;
      const rentInc = (Number(inputs.annualRentIncrease) || 6) / 100;
      const price = Number(inputs.propertyPrice) || 6000000;
      const dpPct = (Number(inputs.downPaymentPercent) || 20) / 100;
      const rate = (Number(inputs.interestRate) || 8.5) / (12 * 100);
      const years = Number(inputs.timeHorizon) || 10;
      const appRate = (Number(inputs.appreciationRate) || 6.5) / 100;

      let totalRentPaid = 0;
      let currRent = rent;
      for (let y = 1; y <= years; y++) {
        totalRentPaid += currRent * 12;
        currRent *= 1 + rentInc;
      }

      const dpAmount = price * dpPct;
      const investedDpReturn = dpAmount * Math.pow(1 + 0.09, years);
      const netRentWealth = investedDpReturn - totalRentPaid;

      const loanAmount = price - dpAmount;
      const totalMonths = 20 * 12;
      const emi =
        (loanAmount * rate * Math.pow(1 + rate, totalMonths)) /
        (Math.pow(1 + rate, totalMonths) - 1);
      const monthsInHorizon = years * 12;
      const totalEmiPaid = emi * Math.min(monthsInHorizon, totalMonths);
      const futurePropertyValue = price * Math.pow(1 + appRate, years);

      const remainingMonths = Math.max(0, totalMonths - monthsInHorizon);
      const remainingLoan =
        remainingMonths > 0
          ? (emi * (Math.pow(1 + rate, remainingMonths) - 1)) /
            (rate * Math.pow(1 + rate, remainingMonths))
          : 0;

      const netBuyEquity = futurePropertyValue - remainingLoan;

      const isBuyingBetter = netBuyEquity > netRentWealth;
      const difference = Math.abs(netBuyEquity - netRentWealth);

      return {
        verdict: isBuyingBetter ? "Buying is financially superior" : "Renting is financially superior",
        isBuyingBetter,
        netDifference: Math.round(difference),
        futurePropertyValue: Math.round(futurePropertyValue),
        totalRentPaid: Math.round(totalRentPaid),
        totalEmiPaid: Math.round(totalEmiPaid),
        monthlyEmi: Math.round(emi),
      };
    },
  },
  {
    id: "down-payment",
    slug: "down-payment",
    path: "/calculators/down-payment",
    name: "Down Payment Calculator",
    shortName: "Down Payment",
    category: "buyers",
    categoryLabel: "For Buyers",
    targetAudience: "Buyers",
    iconName: "PiggyBank",
    shortDescription: "Estimate upfront payment and required home loan amount.",
    description:
      "Compute the total cash required at signing, including basic down payment, government stamp duty, registration charges, and interior provisioning buffers.",
    defaultValues: {
      propertyPrice: 8500000,
      downPaymentPercent: 20,
      stampDutyPercent: 6.5,
      bufferAmount: 250000,
    },
    fields: [
      {
        key: "propertyPrice",
        label: "Property Purchase Price",
        type: "currency",
        min: 1500000,
        max: 60000000,
        step: 250000,
        quickPresets: [4500000, 7500000, 10000000, 15000000],
      },
      {
        key: "downPaymentPercent",
        label: "Down Payment Percentage (%)",
        type: "percent",
        min: 10,
        max: 40,
        step: 1,
        quickPresets: [15, 20, 25, 30],
      },
      {
        key: "stampDutyPercent",
        label: "Estimated Stamp Duty & Govt Charges (%)",
        type: "percent",
        min: 4,
        max: 9,
        step: 0.5,
        quickPresets: [5.5, 6.0, 6.5, 7.0],
      },
      {
        key: "bufferAmount",
        label: "Furnishing & Incidental Buffer",
        type: "currency",
        min: 0,
        max: 1500000,
        step: 50000,
        quickPresets: [100000, 250000, 500000],
      },
    ],
    calculate: (inputs) => {
      const price = Number(inputs.propertyPrice) || 0;
      const dpPct = (Number(inputs.downPaymentPercent) || 20) / 100;
      const stampPct = (Number(inputs.stampDutyPercent) || 6.5) / 100;
      const buffer = Number(inputs.bufferAmount) || 0;

      const downPayment = price * dpPct;
      const loanAmount = price - downPayment;
      const stampDuty = price * stampPct;
      const totalUpfront = downPayment + stampDuty + buffer;

      return {
        totalUpfront: Math.round(totalUpfront),
        downPaymentAmount: Math.round(downPayment),
        loanAmount: Math.round(loanAmount),
        stampDuty: Math.round(stampDuty),
        bufferAmount: Math.round(buffer),
      };
    },
  },
  {
    id: "registration-cost",
    slug: "registration-cost",
    path: "/calculators/registration-cost",
    name: "Property Registration Cost Calculator",
    shortName: "Registration Cost",
    category: "buyers",
    categoryLabel: "For Buyers",
    targetAudience: "Buyers",
    iconName: "FileText",
    shortDescription: "Estimate stamp duty and registration expenses.",
    description:
      "Calculate statutory government duties including State Stamp Duty, Sub-Registrar Office registration fees, and legal documentation costs for real estate in India / West Bengal.",
    defaultValues: {
      agreementValue: 7000000,
      locationType: "urban",
      legalCharges: 25000,
    },
    fields: [
      {
        key: "agreementValue",
        label: "Property Market / Agreement Value",
        type: "currency",
        min: 1000000,
        max: 80000000,
        step: 250000,
        quickPresets: [4000000, 6000000, 8500000, 12000000],
      },
      {
        key: "locationType",
        label: "Jurisdiction Area",
        type: "select",
        options: [
          { value: "urban", label: "Urban / Municipal Corporation (Kolkata/Howrah/New Town - 6%)" },
          { value: "rural", label: "Panchayat / Non-Municipal Area (5%)" },
        ],
      },
      {
        key: "legalCharges",
        label: "Legal, Advocate & Mutation Estimate",
        type: "currency",
        min: 5000,
        max: 100000,
        step: 5000,
        quickPresets: [15000, 25000, 40000],
      },
    ],
    calculate: (inputs) => {
      const val = Number(inputs.agreementValue) || 0;
      const isUrban = inputs.locationType === "urban";
      const stampRate = isUrban ? 0.06 : 0.05;
      const registrationRate = 0.01;
      const legal = Number(inputs.legalCharges) || 20000;

      const stampDuty = val * stampRate;
      const regFee = val * registrationRate;
      const totalCost = stampDuty + regFee + legal;
      const effectiveRate = val > 0 ? (totalCost / val) * 100 : 0;

      return {
        totalCost: Math.round(totalCost),
        stampDuty: Math.round(stampDuty),
        registrationFee: Math.round(regFee),
        legalCharges: Math.round(legal),
        effectiveRate: effectiveRate.toFixed(2),
      };
    },
  },

  // --- FOR INVESTORS ---
  {
    id: "property-roi",
    slug: "property-roi",
    path: "/calculators/property-roi",
    name: "Property ROI Calculator",
    shortName: "Property ROI",
    category: "investors",
    categoryLabel: "For Investors",
    targetAudience: "Investors",
    iconName: "TrendingUp",
    shortDescription: "Calculate expected return on investment from a property.",
    description:
      "Assess your total return across both ongoing rental income streams and capital appreciation. Calculates total profit, ROI percentage, and compound annual growth (CAGR).",
    defaultValues: {
      purchasePrice: 9000000,
      acquisitionCosts: 600000,
      monthlyRent: 35000,
      expectedSalePrice: 15000000,
      holdingYears: 7,
    },
    fields: [
      {
        key: "purchasePrice",
        label: "Initial Purchase Price",
        type: "currency",
        min: 2000000,
        max: 80000000,
        step: 250000,
        quickPresets: [5000000, 8000000, 12000000, 20000000],
      },
      {
        key: "acquisitionCosts",
        label: "Stamp Duty, Brokerage & Initial Fitouts",
        type: "currency",
        min: 100000,
        max: 5000000,
        step: 50000,
        quickPresets: [300000, 600000, 1000000],
      },
      {
        key: "monthlyRent",
        label: "Expected Monthly Rental Income",
        type: "currency",
        min: 10000,
        max: 400000,
        step: 2500,
        quickPresets: [25000, 40000, 65000, 100000],
      },
      {
        key: "expectedSalePrice",
        label: "Projected Sale Price at Exit",
        type: "currency",
        min: 3000000,
        max: 150000000,
        step: 500000,
        quickPresets: [9000000, 14000000, 20000000],
      },
      {
        key: "holdingYears",
        label: "Investment Horizon (Years)",
        type: "number",
        min: 1,
        max: 20,
        step: 1,
        quickPresets: [3, 5, 7, 10],
      },
    ],
    calculate: (inputs) => {
      const purchase = Number(inputs.purchasePrice) || 0;
      const initialCosts = Number(inputs.acquisitionCosts) || 0;
      const rent = Number(inputs.monthlyRent) || 0;
      const sale = Number(inputs.expectedSalePrice) || 0;
      const years = Number(inputs.holdingYears) || 5;

      const totalInvestment = purchase + initialCosts;
      const totalRentCollected = rent * 12 * years;
      const capitalGains = sale - totalInvestment;
      const netProfit = capitalGains + totalRentCollected;
      const totalRoiPct = totalInvestment > 0 ? (netProfit / totalInvestment) * 100 : 0;

      const totalCashOut = sale + totalRentCollected;
      const cagr =
        totalInvestment > 0 && years > 0
          ? (Math.pow(totalCashOut / totalInvestment, 1 / years) - 1) * 100
          : 0;

      return {
        totalRoiPct: totalRoiPct.toFixed(1),
        cagr: cagr.toFixed(1),
        netProfit: Math.round(netProfit),
        capitalGains: Math.round(capitalGains),
        totalRentCollected: Math.round(totalRentCollected),
        totalInvestment: Math.round(totalInvestment),
      };
    },
  },
  {
    id: "rental-yield",
    slug: "rental-yield",
    path: "/calculators/rental-yield",
    name: "Rental Yield Calculator",
    shortName: "Rental Yield",
    category: "investors",
    categoryLabel: "For Investors",
    targetAudience: "Investors",
    iconName: "Percent",
    shortDescription: "Calculate annual rental return as a percentage of property value.",
    description:
      "Measure recurring cashflow yields on residential and commercial assets. Evaluates both Gross Yield and Net Yield factoring maintenance fees, vacancy downtime, and municipal taxes.",
    defaultValues: {
      propertyValue: 8000000,
      monthlyRent: 30000,
      annualMaintenance: 36000,
      propertyTax: 12000,
      vacancyWeeks: 3,
    },
    fields: [
      {
        key: "propertyValue",
        label: "Total Property Investment / Cost",
        type: "currency",
        min: 2000000,
        max: 80000000,
        step: 250000,
        quickPresets: [4000000, 6500000, 8500000, 15000000],
      },
      {
        key: "monthlyRent",
        label: "Monthly Rental Realization",
        type: "currency",
        min: 8000,
        max: 500000,
        step: 2000,
        quickPresets: [20000, 30000, 50000, 85000],
      },
      {
        key: "annualMaintenance",
        label: "Annual Society Maintenance & Repairs",
        type: "currency",
        min: 0,
        max: 200000,
        step: 5000,
        quickPresets: [24000, 36000, 60000],
      },
      {
        key: "propertyTax",
        label: "Annual Property Tax & Insurance",
        type: "currency",
        min: 0,
        max: 100000,
        step: 2000,
        quickPresets: [6000, 12000, 25000],
      },
      {
        key: "vacancyWeeks",
        label: "Estimated Annual Vacancy (Weeks)",
        type: "number",
        min: 0,
        max: 12,
        step: 1,
        quickPresets: [0, 2, 4, 8],
      },
    ],
    calculate: (inputs) => {
      const val = Number(inputs.propertyValue) || 0;
      const rent = Number(inputs.monthlyRent) || 0;
      const maint = Number(inputs.annualMaintenance) || 0;
      const tax = Number(inputs.propertyTax) || 0;
      const vacancyWeeks = Number(inputs.vacancyWeeks) || 0;

      const grossAnnualRent = rent * 12;
      const weeklyRent = (rent * 12) / 52;
      const vacancyLoss = weeklyRent * vacancyWeeks;
      const adjustedGrossRent = Math.max(0, grossAnnualRent - vacancyLoss);
      const netAnnualIncome = Math.max(0, adjustedGrossRent - maint - tax);

      const grossYield = val > 0 ? (grossAnnualRent / val) * 100 : 0;
      const netYield = val > 0 ? (netAnnualIncome / val) * 100 : 0;

      return {
        grossYield: grossYield.toFixed(2),
        netYield: netYield.toFixed(2),
        netAnnualIncome: Math.round(netAnnualIncome),
        monthlyNetCashflow: Math.round(netAnnualIncome / 12),
        grossAnnualRent: Math.round(grossAnnualRent),
      };
    },
  },
  {
    id: "property-appreciation",
    slug: "property-appreciation",
    path: "/calculators/property-appreciation",
    name: "Property Appreciation Calculator",
    shortName: "Property Appreciation",
    category: "investors",
    categoryLabel: "For Investors",
    targetAudience: "Investors",
    iconName: "LineChart",
    shortDescription: "Estimate the future value of a property based on appreciation.",
    description:
      "Project compounding capital growth of real estate assets across Kolkata's micro-markets (New Town, Rajarhat, EM Bypass, Alipore) based on historical growth benchmarks.",
    defaultValues: {
      currentValue: 10000000,
      annualGrowthRate: 7.5,
      years: 10,
    },
    fields: [
      {
        key: "currentValue",
        label: "Current Property Value",
        type: "currency",
        min: 2500000,
        max: 100000000,
        step: 500000,
        quickPresets: [5000000, 10000000, 15000000, 25000000],
      },
      {
        key: "annualGrowthRate",
        label: "Projected Appreciation Rate (% p.a.)",
        type: "percent",
        min: 2,
        max: 18,
        step: 0.5,
        quickPresets: [5.0, 7.0, 8.5, 10.0, 12.0],
      },
      {
        key: "years",
        label: "Holding Timeframe (Years)",
        type: "number",
        min: 1,
        max: 30,
        step: 1,
        quickPresets: [5, 10, 15, 20],
      },
    ],
    calculate: (inputs) => {
      const current = Number(inputs.currentValue) || 0;
      const rate = (Number(inputs.annualGrowthRate) || 7.5) / 100;
      const years = Number(inputs.years) || 10;

      const futureValue = current * Math.pow(1 + rate, years);
      const totalGrowth = futureValue - current;
      const multiplier = current > 0 ? (futureValue / current).toFixed(2) : "0";

      const milestones = [
        { year: 3, value: Math.round(current * Math.pow(1 + rate, 3)) },
        { year: 5, value: Math.round(current * Math.pow(1 + rate, 5)) },
        { year: 10, value: Math.round(current * Math.pow(1 + rate, 10)) },
      ];

      return {
        futureValue: Math.round(futureValue),
        totalGrowth: Math.round(totalGrowth),
        multiplier: `${multiplier}x`,
        milestones,
      };
    },
  },

  // --- PROPERTY & CONSTRUCTION ---
  {
    id: "area-conversion",
    slug: "area-conversion",
    path: "/calculators/area-conversion",
    name: "Area Conversion Calculator",
    shortName: "Area Conversion",
    category: "construction",
    categoryLabel: "Property & Construction",
    targetAudience: "Buyers & Dealers",
    iconName: "Maximize2",
    shortDescription: "Convert between sq. ft., sq. m., acres, and square yards.",
    description:
      "Seamlessly convert land and apartment measurements between standard Indian & regional units including Square Feet, Square Meters, Square Yards (Gaj), Acres, Kottah (Katha), and Bigha.",
    defaultValues: {
      inputValue: 1500,
      fromUnit: "sqft",
    },
    fields: [
      {
        key: "inputValue",
        label: "Area Value to Convert",
        type: "number",
        min: 1,
        max: 1000000,
        step: 10,
        quickPresets: [750, 1250, 1800, 2500, 43560],
      },
      {
        key: "fromUnit",
        label: "Source Unit",
        type: "select",
        options: [
          { value: "sqft", label: "Square Feet (Sq. Ft.)" },
          { value: "sqm", label: "Square Meters (Sq. M.)" },
          { value: "sqyd", label: "Square Yards / Gaj (Sq. Yd.)" },
          { value: "acre", label: "Acres" },
          { value: "kottah", label: "Kottah / Katha (Bengal: 720 sqft)" },
          { value: "bigha", label: "Bigha (Bengal: 14,400 sqft / 20 Kottah)" },
          { value: "hectare", label: "Hectares" },
        ],
      },
    ],
    calculate: (inputs) => {
      const val = Number(inputs.inputValue) || 0;
      const unit = inputs.fromUnit || "sqft";

      const toSqFtMultipliers = {
        sqft: 1,
        sqm: 10.7639104,
        sqyd: 9,
        acre: 43560,
        kottah: 720,
        bigha: 14400,
        hectare: 107639.104,
      };

      const sqft = val * (toSqFtMultipliers[unit] || 1);

      return {
        sqft: sqft.toLocaleString("en-IN", { maximumFractionDigits: 2 }),
        sqm: (sqft / 10.7639104).toLocaleString("en-IN", { maximumFractionDigits: 2 }),
        sqyd: (sqft / 9).toLocaleString("en-IN", { maximumFractionDigits: 2 }),
        acre: (sqft / 43560).toLocaleString("en-IN", { maximumFractionDigits: 4 }),
        kottah: (sqft / 720).toLocaleString("en-IN", { maximumFractionDigits: 3 }),
        bigha: (sqft / 14400).toLocaleString("en-IN", { maximumFractionDigits: 3 }),
        hectare: (sqft / 107639.104).toLocaleString("en-IN", { maximumFractionDigits: 4 }),
      };
    },
  },
  {
    id: "price-per-sqft",
    slug: "price-per-sqft",
    path: "/calculators/price-per-sqft",
    name: "Price Per Sq. Ft. Calculator",
    shortName: "Price Per Sq. Ft.",
    category: "construction",
    categoryLabel: "Property & Construction",
    targetAudience: "Buyers & Sellers",
    iconName: "Building2",
    shortDescription: "Calculate property rate per square foot.",
    description:
      "Compute precise rates on both Super Built-up and Carpet areas. Understand the developer's loading factor and verify true square-foot pricing before booking.",
    defaultValues: {
      totalPrice: 8500000,
      superBuiltupArea: 1650,
      carpetArea: 1200,
    },
    fields: [
      {
        key: "totalPrice",
        label: "Total Property Cost / Agreement Price",
        type: "currency",
        min: 2000000,
        max: 80000000,
        step: 250000,
        quickPresets: [5000000, 7500000, 10000000, 15000000],
      },
      {
        key: "superBuiltupArea",
        label: "Super Built-up Area (Sq. Ft.)",
        type: "number",
        min: 300,
        max: 10000,
        step: 25,
        quickPresets: [850, 1250, 1650, 2200],
      },
      {
        key: "carpetArea",
        label: "Carpet Area (Sq. Ft.)",
        type: "number",
        min: 200,
        max: 8000,
        step: 25,
        quickPresets: [650, 950, 1200, 1750],
      },
    ],
    calculate: (inputs) => {
      const price = Number(inputs.totalPrice) || 0;
      const sbu = Number(inputs.superBuiltupArea) || 0;
      const carpet = Number(inputs.carpetArea) || 0;

      const ratePerSbu = sbu > 0 ? price / sbu : 0;
      const ratePerCarpet = carpet > 0 ? price / carpet : 0;
      const loading = carpet > 0 && sbu >= carpet ? ((sbu - carpet) / carpet) * 100 : 0;

      return {
        ratePerSbu: Math.round(ratePerSbu),
        ratePerCarpet: Math.round(ratePerCarpet),
        loadingFactor: loading.toFixed(1),
        superBuiltupArea: sbu,
        carpetArea: carpet,
      };
    },
  },
  {
    id: "construction-cost",
    slug: "construction-cost",
    path: "/calculators/construction-cost",
    name: "Construction Cost Calculator",
    shortName: "Construction Cost",
    category: "construction",
    categoryLabel: "Property & Construction",
    targetAudience: "Landowners",
    iconName: "Hammer",
    shortDescription: "Estimate the approximate construction budget.",
    description:
      "Estimate residential and bungalow construction expenditure. Covers structural civil works, architectural fittings, electrical/sanitary infrastructure, and municipal approval provisions.",
    defaultValues: {
      plotArea: 1800,
      numberOfFloors: 2,
      constructionGrade: "premium",
    },
    fields: [
      {
        key: "plotArea",
        label: "Built-up Footprint Per Floor (Sq. Ft.)",
        type: "number",
        min: 500,
        max: 10000,
        step: 50,
        quickPresets: [1000, 1500, 2000, 3000],
      },
      {
        key: "numberOfFloors",
        label: "Number of Floors (G + Floors)",
        type: "number",
        min: 1,
        max: 6,
        step: 1,
        quickPresets: [1, 2, 3, 4],
      },
      {
        key: "constructionGrade",
        label: "Finishing & Specification Quality",
        type: "select",
        options: [
          { value: "standard", label: "Standard Quality (~₹1,750 / sq. ft.)" },
          { value: "premium", label: "Premium Luxury (~₹2,350 / sq. ft.)" },
          { value: "ultra-luxe", label: "Ultra Luxury Heritage (~₹3,200 / sq. ft.)" },
        ],
      },
    ],
    calculate: (inputs) => {
      const area = Number(inputs.plotArea) || 0;
      const floors = Number(inputs.numberOfFloors) || 1;
      const grade = inputs.constructionGrade || "premium";

      const rates = {
        standard: 1750,
        premium: 2350,
        "ultra-luxe": 3200,
      };

      const ratePerSqft = rates[grade] || 2350;
      const totalSlabArea = area * floors;
      const totalCost = totalSlabArea * ratePerSqft;

      const civilCost = totalCost * 0.55;
      const finishingCost = totalCost * 0.30;
      const mepCost = totalCost * 0.15;

      return {
        totalCost: Math.round(totalCost),
        ratePerSqft,
        totalSlabArea,
        civilCost: Math.round(civilCost),
        finishingCost: Math.round(finishingCost),
        mepCost: Math.round(mepCost),
      };
    },
  },
  {
    id: "brokerage",
    slug: "brokerage",
    path: "/calculators/brokerage",
    name: "Brokerage Calculator",
    shortName: "Brokerage",
    category: "construction",
    categoryLabel: "Property & Construction",
    targetAudience: "Dealers & Agents",
    iconName: "Handshake",
    shortDescription: "Calculate brokerage based on property value or rental amount.",
    description:
      "Calculate statutory real estate consultancy commissions for residential sales, commercial acquisitions, or long-term lease transactions including applicable 18% GST.",
    defaultValues: {
      dealType: "sale",
      dealValue: 8000000,
      commissionRate: 2,
      includeGst: true,
    },
    fields: [
      {
        key: "dealType",
        label: "Transaction Nature",
        type: "select",
        options: [
          { value: "sale", label: "Outright Property Sale / Purchase" },
          { value: "rent", label: "Rental / Commercial Lease" },
        ],
      },
      {
        key: "dealValue",
        label: "Transaction Value (Purchase Price or Monthly Rent)",
        type: "currency",
        min: 10000,
        max: 80000000,
        step: 50000,
        quickPresets: [35000, 5000000, 8500000, 15000000],
      },
      {
        key: "commissionRate",
        label: "Agreed Fee Structure",
        type: "select",
        options: [
          { value: "1", label: "1% Brokerage (Standard Direct)" },
          { value: "2", label: "2% Brokerage (Full Advisory / Representation)" },
          { value: "1month", label: "1 Month Rent (Standard Rental Lease)" },
        ],
      },
    ],
    calculate: (inputs) => {
      const isSale = inputs.dealType === "sale";
      const val = Number(inputs.dealValue) || 0;
      const rateType = inputs.commissionRate || (isSale ? "2" : "1month");

      let baseCommission = 0;
      if (rateType === "1month") {
        baseCommission = val;
      } else {
        const pct = Number(rateType) || (isSale ? 2 : 1);
        baseCommission = (val * pct) / 100;
      }

      const gst = baseCommission * 0.18;
      const totalPayable = baseCommission + gst;

      return {
        totalPayable: Math.round(totalPayable),
        baseCommission: Math.round(baseCommission),
        gstAmount: Math.round(gst),
      };
    },
  },
];

export function getCalculatorBySlug(slug) {
  return CALCULATORS.find((c) => c.slug === slug || c.id === slug);
}
