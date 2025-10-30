/**
 * Economic Intelligence Service for ClimateGuard
 * Integrates World Bank economic data for business decision support and financial risk assessment
 */

export interface EconomicData {
  country: string;
  countryCode: string;
  region: string;
  incomeLevel: string;
  gdp: {
    total: number; // USD billions
    perCapita: number; // USD
    growthRate: number; // percentage
    year: number;
  };
  climateCosts: {
    annualDamages: number; // USD billions
    adaptationCosts: number; // USD billions
    percentageOfGDP: number;
    projectedIncrease: number; // percentage by 2050
  };
  economicVulnerability: {
    score: number; // 0-100
    factors: {
      agricultureDependency: number;
      coastalExposure: number;
      infrastructureAge: number;
      insurancePenetration: number;
      socialSafety: number;
    };
    resilience: number; // 0-100
  };
  sectors: {
    [key: string]: {
      gdpContribution: number; // percentage
      climateRisk: number; // 0-100
      adaptationPotential: number; // 0-100
      employmentImpact: number; // millions of jobs
    };
  };
}

export interface BusinessImpactAssessment {
  sector: string;
  region: string;
  businessSize: "small" | "medium" | "large" | "enterprise";
  riskProfile: {
    overall: number; // 0-100
    operational: number;
    financial: number;
    regulatory: number;
    reputational: number;
  };
  financialProjections: {
    potentialLosses: {
      lowScenario: number;
      mediumScenario: number;
      highScenario: number;
    };
    adaptationCosts: {
      immediate: number;
      mediumTerm: number;
      longTerm: number;
    };
    opportunityCosts: number;
    insurancePremiums: number;
  };
  recommendations: {
    immediate: string[];
    shortTerm: string[];
    longTerm: string[];
    investment: string[];
  };
  complianceRequirements: {
    current: string[];
    upcoming: string[];
    voluntary: string[];
  };
}

export interface InvestmentOpportunity {
  id: string;
  title: string;
  sector: string;
  type: "adaptation" | "mitigation" | "resilience" | "green_tech";
  investmentRequired: number;
  potentialReturn: {
    financial: number; // percentage ROI
    environmental: number; // CO2 reduction tons
    social: number; // jobs created
  };
  riskLevel: "low" | "medium" | "high";
  timeHorizon: number; // years
  marketSize: number; // USD billions
  description: string;
  keyBenefits: string[];
  challenges: string[];
  location?: string;
}

class EconomicIntelligenceService {
  private static instance: EconomicIntelligenceService;
  private economicDataCache: Map<string, EconomicData> = new Map();
  private lastUpdate: Date | null = null;
  private listeners: Array<(data: EconomicData[]) => void> = [];

  private constructor() {
    console.log("[EconomicIntelligence] Service initialized");
  }

  public static getInstance(): EconomicIntelligenceService {
    if (!EconomicIntelligenceService.instance) {
      EconomicIntelligenceService.instance = new EconomicIntelligenceService();
    }
    return EconomicIntelligenceService.instance;
  }

  /**
   * Fetch economic data for a specific country
   */
  public async getCountryEconomicData(
    countryCode: string
  ): Promise<EconomicData> {
    try {
      // Check cache first
      if (this.economicDataCache.has(countryCode)) {
        return this.economicDataCache.get(countryCode)!;
      }

      // In production, this would call World Bank API
      // For now, we'll simulate with comprehensive mock data
      const mockData = this.generateMockEconomicData(countryCode);

      this.economicDataCache.set(countryCode, mockData);
      return mockData;
    } catch (error) {
      console.error(
        `[EconomicIntelligence] Error fetching data for ${countryCode}:`,
        error
      );
      throw new Error(`Failed to fetch economic data for ${countryCode}`);
    }
  }

  /**
   * Get economic data for multiple countries
   */
  public async getMultipleCountriesData(
    countryCodes: string[]
  ): Promise<EconomicData[]> {
    try {
      const promises = countryCodes.map((code) =>
        this.getCountryEconomicData(code)
      );
      const results = await Promise.allSettled(promises);

      return results
        .filter(
          (result): result is PromiseFulfilledResult<EconomicData> =>
            result.status === "fulfilled"
        )
        .map((result) => result.value);
    } catch (error) {
      console.error(
        "[EconomicIntelligence] Error fetching multiple countries data:",
        error
      );
      throw error;
    }
  }

  /**
   * Generate business impact assessment
   */
  public async generateBusinessImpact(
    sector: string,
    region: string,
    businessSize: BusinessImpactAssessment["businessSize"],
    countryCode?: string
  ): Promise<BusinessImpactAssessment> {
    try {
      const economicData = countryCode
        ? await this.getCountryEconomicData(countryCode)
        : null;

      // Generate comprehensive business impact assessment
      const assessment: BusinessImpactAssessment = {
        sector,
        region,
        businessSize,
        riskProfile: this.calculateBusinessRisk(
          sector,
          region,
          businessSize,
          economicData
        ),
        financialProjections: this.calculateFinancialProjections(
          sector,
          businessSize,
          economicData
        ),
        recommendations: this.generateBusinessRecommendations(
          sector,
          businessSize
        ),
        complianceRequirements: this.getComplianceRequirements(sector, region),
      };

      return assessment;
    } catch (error) {
      console.error(
        "[EconomicIntelligence] Error generating business impact:",
        error
      );
      throw error;
    }
  }

  /**
   * Get climate investment opportunities
   */
  public async getInvestmentOpportunities(
    sector?: string,
    region?: string,
    investmentRange?: { min: number; max: number }
  ): Promise<InvestmentOpportunity[]> {
    try {
      // In production, this would query investment databases
      const opportunities = this.generateInvestmentOpportunities();

      // Filter based on criteria
      let filtered = opportunities;

      if (sector) {
        filtered = filtered.filter((opp) => opp.sector === sector);
      }

      if (region) {
        filtered = filtered.filter((opp) => opp.location?.includes(region));
      }

      if (investmentRange) {
        filtered = filtered.filter(
          (opp) =>
            opp.investmentRequired >= investmentRange.min &&
            opp.investmentRequired <= investmentRange.max
        );
      }

      return filtered.sort(
        (a, b) => b.potentialReturn.financial - a.potentialReturn.financial
      );
    } catch (error) {
      console.error(
        "[EconomicIntelligence] Error fetching investment opportunities:",
        error
      );
      throw error;
    }
  }

  /**
   * Calculate climate economic impact for a region
   */
  public async calculateRegionalImpact(region: string): Promise<{
    totalGDP: number;
    climateRisk: number;
    adaptationCosts: number;
    economicLosses: number;
    jobsAtRisk: number;
    sectors: Array<{ name: string; impact: number; employment: number }>;
  }> {
    try {
      // Get regional economic data
      const regionCountries = this.getRegionCountries(region);
      const economicData = await this.getMultipleCountriesData(regionCountries);

      const totalGDP = economicData.reduce(
        (sum, country) => sum + country.gdp.total,
        0
      );
      const avgClimateRisk =
        economicData.reduce(
          (sum, country) => sum + country.economicVulnerability.score,
          0
        ) / economicData.length;
      const totalAdaptationCosts = economicData.reduce(
        (sum, country) => sum + country.climateCosts.adaptationCosts,
        0
      );
      const totalEconomicLosses = economicData.reduce(
        (sum, country) => sum + country.climateCosts.annualDamages,
        0
      );

      // Calculate jobs at risk (simplified calculation)
      const jobsAtRisk = Math.round(
        totalGDP * 1000 * (avgClimateRisk / 100) * 0.1
      ); // millions

      // Aggregate sector data
      const sectorImpacts = this.aggregateSectorData(economicData);

      return {
        totalGDP,
        climateRisk: avgClimateRisk,
        adaptationCosts: totalAdaptationCosts,
        economicLosses: totalEconomicLosses,
        jobsAtRisk,
        sectors: sectorImpacts,
      };
    } catch (error) {
      console.error(
        "[EconomicIntelligence] Error calculating regional impact:",
        error
      );
      throw error;
    }
  }

  /**
   * Generate mock economic data (in production, would fetch from World Bank API)
   */
  private generateMockEconomicData(countryCode: string): EconomicData {
    const countries: { [key: string]: Partial<EconomicData> } = {
      US: {
        country: "United States",
        region: "North America",
        incomeLevel: "High income",
        gdp: { total: 21400, perCapita: 65000, growthRate: 2.1, year: 2023 },
      },
      CN: {
        country: "China",
        region: "East Asia & Pacific",
        incomeLevel: "Upper middle income",
        gdp: { total: 14340, perCapita: 10500, growthRate: 6.1, year: 2023 },
      },
      IN: {
        country: "India",
        region: "South Asia",
        incomeLevel: "Lower middle income",
        gdp: { total: 3180, perCapita: 2300, growthRate: 7.4, year: 2023 },
      },
      DE: {
        country: "Germany",
        region: "Europe & Central Asia",
        incomeLevel: "High income",
        gdp: { total: 3850, perCapita: 46000, growthRate: 0.6, year: 2023 },
      },
      BR: {
        country: "Brazil",
        region: "Latin America & Caribbean",
        incomeLevel: "Upper middle income",
        gdp: { total: 1610, perCapita: 7600, growthRate: 1.1, year: 2023 },
      },
    };

    const baseData = countries[countryCode] || {
      country: "Unknown Country",
      region: "Unknown",
      incomeLevel: "Unknown",
      gdp: { total: 500, perCapita: 5000, growthRate: 2.0, year: 2023 },
    };

    // Calculate climate costs based on GDP
    const gdpTotal = baseData.gdp!.total;
    const climatePercentage = Math.random() * 3 + 1; // 1-4% of GDP

    return {
      country: baseData.country!,
      countryCode,
      region: baseData.region!,
      incomeLevel: baseData.incomeLevel!,
      gdp: baseData.gdp!,
      climateCosts: {
        annualDamages: gdpTotal * (climatePercentage / 100),
        adaptationCosts: gdpTotal * (climatePercentage / 100) * 0.5,
        percentageOfGDP: climatePercentage,
        projectedIncrease: Math.random() * 50 + 25, // 25-75% increase by 2050
      },
      economicVulnerability: {
        score: Math.floor(Math.random() * 40) + 30, // 30-70
        factors: {
          agricultureDependency: Math.random() * 100,
          coastalExposure: Math.random() * 100,
          infrastructureAge: Math.random() * 100,
          insurancePenetration: Math.random() * 100,
          socialSafety: Math.random() * 100,
        },
        resilience: Math.floor(Math.random() * 30) + 40, // 40-70
      },
      sectors: {
        agriculture: {
          gdpContribution: Math.random() * 15 + 5,
          climateRisk: Math.random() * 40 + 60,
          adaptationPotential: Math.random() * 50 + 30,
          employmentImpact: Math.random() * 50 + 10,
        },
        manufacturing: {
          gdpContribution: Math.random() * 25 + 15,
          climateRisk: Math.random() * 30 + 30,
          adaptationPotential: Math.random() * 60 + 20,
          employmentImpact: Math.random() * 100 + 50,
        },
        services: {
          gdpContribution: Math.random() * 20 + 50,
          climateRisk: Math.random() * 20 + 20,
          adaptationPotential: Math.random() * 70 + 30,
          employmentImpact: Math.random() * 200 + 100,
        },
        tourism: {
          gdpContribution: Math.random() * 10 + 2,
          climateRisk: Math.random() * 50 + 50,
          adaptationPotential: Math.random() * 40 + 20,
          employmentImpact: Math.random() * 30 + 5,
        },
      },
    };
  }

  /**
   * Calculate business risk profile
   */
  private calculateBusinessRisk(
    sector: string,
    region: string,
    businessSize: BusinessImpactAssessment["businessSize"],
    economicData: EconomicData | null
  ): BusinessImpactAssessment["riskProfile"] {
    const baseRisk = economicData?.economicVulnerability.score || 50;
    const sectorRisk = economicData?.sectors[sector]?.climateRisk || 50;

    const sizeMultiplier = {
      small: 1.2,
      medium: 1.0,
      large: 0.8,
      enterprise: 0.6,
    }[businessSize];

    const operational = Math.min(100, sectorRisk * sizeMultiplier);
    const financial = Math.min(100, baseRisk * sizeMultiplier);
    const regulatory = Math.random() * 30 + 40;
    const reputational = Math.random() * 20 + 30;
    const overall = (operational + financial + regulatory + reputational) / 4;

    return {
      overall: Math.round(overall),
      operational: Math.round(operational),
      financial: Math.round(financial),
      regulatory: Math.round(regulatory),
      reputational: Math.round(reputational),
    };
  }

  /**
   * Calculate financial projections
   */
  private calculateFinancialProjections(
    sector: string,
    businessSize: BusinessImpactAssessment["businessSize"],
    economicData: EconomicData | null
  ): BusinessImpactAssessment["financialProjections"] {
    const baseAmount = {
      small: 100000,
      medium: 1000000,
      large: 10000000,
      enterprise: 100000000,
    }[businessSize];

    const riskMultiplier =
      (economicData?.economicVulnerability.score || 50) / 100;

    return {
      potentialLosses: {
        lowScenario: Math.round(baseAmount * 0.05 * riskMultiplier),
        mediumScenario: Math.round(baseAmount * 0.15 * riskMultiplier),
        highScenario: Math.round(baseAmount * 0.35 * riskMultiplier),
      },
      adaptationCosts: {
        immediate: Math.round(baseAmount * 0.02),
        mediumTerm: Math.round(baseAmount * 0.08),
        longTerm: Math.round(baseAmount * 0.15),
      },
      opportunityCosts: Math.round(baseAmount * 0.05 * riskMultiplier),
      insurancePremiums: Math.round(baseAmount * 0.01 * riskMultiplier),
    };
  }

  /**
   * Generate business recommendations
   */
  private generateBusinessRecommendations(
    sector: string,
    businessSize: BusinessImpactAssessment["businessSize"]
  ): BusinessImpactAssessment["recommendations"] {
    return {
      immediate: [
        "Conduct climate risk assessment",
        "Review insurance coverage",
        "Establish emergency response protocols",
        "Monitor supply chain vulnerabilities",
      ],
      shortTerm: [
        "Develop climate adaptation strategy",
        "Invest in resilient infrastructure",
        "Diversify supply chains",
        "Train staff on climate risks",
      ],
      longTerm: [
        "Integrate climate considerations into business strategy",
        "Explore green technology investments",
        "Develop climate-positive products/services",
        "Establish sustainability partnerships",
      ],
      investment: [
        "Energy efficiency upgrades",
        "Renewable energy systems",
        "Climate monitoring technology",
        "Resilient infrastructure improvements",
      ],
    };
  }

  /**
   * Get compliance requirements
   */
  private getComplianceRequirements(
    sector: string,
    region: string
  ): BusinessImpactAssessment["complianceRequirements"] {
    return {
      current: [
        "Environmental impact reporting",
        "Carbon emissions disclosure",
        "Workplace safety standards",
      ],
      upcoming: [
        "Climate risk disclosure (2025)",
        "Supply chain due diligence (2026)",
        "Carbon border adjustments (2027)",
      ],
      voluntary: [
        "Science-based targets",
        "TCFD recommendations",
        "UN Global Compact",
        "B-Corp certification",
      ],
    };
  }

  /**
   * Generate investment opportunities
   */
  private generateInvestmentOpportunities(): InvestmentOpportunity[] {
    return [
      {
        id: "renewable_energy_1",
        title: "Solar Farm Development",
        sector: "energy",
        type: "mitigation",
        investmentRequired: 50000000,
        potentialReturn: {
          financial: 12.5,
          environmental: 100000,
          social: 200,
        },
        riskLevel: "medium",
        timeHorizon: 10,
        marketSize: 150,
        description:
          "Large-scale solar energy installation with battery storage",
        keyBenefits: [
          "Stable returns",
          "Government incentives",
          "Growing market",
        ],
        challenges: [
          "Weather dependency",
          "Grid integration",
          "Initial capital",
        ],
        location: "Southwest US",
      },
      {
        id: "adaptation_infra_1",
        title: "Flood Defense Systems",
        sector: "infrastructure",
        type: "adaptation",
        investmentRequired: 25000000,
        potentialReturn: {
          financial: 8.5,
          environmental: 0,
          social: 5000,
        },
        riskLevel: "low",
        timeHorizon: 15,
        marketSize: 80,
        description:
          "Smart flood barriers and drainage systems for coastal cities",
        keyBenefits: [
          "Essential infrastructure",
          "Long-term contracts",
          "Public backing",
        ],
        challenges: [
          "Regulatory approvals",
          "Long development time",
          "Technical complexity",
        ],
        location: "Coastal regions",
      },
      {
        id: "green_tech_1",
        title: "Carbon Capture Technology",
        sector: "technology",
        type: "mitigation",
        investmentRequired: 100000000,
        potentialReturn: {
          financial: 20.0,
          environmental: 500000,
          social: 800,
        },
        riskLevel: "high",
        timeHorizon: 8,
        marketSize: 200,
        description:
          "Direct air capture and utilization technology development",
        keyBenefits: [
          "High growth potential",
          "Patent opportunities",
          "Climate impact",
        ],
        challenges: [
          "Technology risk",
          "Market uncertainty",
          "High capital needs",
        ],
        location: "Global",
      },
    ];
  }

  /**
   * Get countries in a region
   */
  private getRegionCountries(region: string): string[] {
    const regionMap: { [key: string]: string[] } = {
      "North America": ["US", "CA", "MX"],
      Europe: ["DE", "FR", "GB", "IT", "ES"],
      Asia: ["CN", "IN", "JP", "KR", "ID"],
      "South America": ["BR", "AR", "CL", "CO", "PE"],
      Africa: ["NG", "ZA", "EG", "KE", "GH"],
    };

    return regionMap[region] || ["US"];
  }

  /**
   * Aggregate sector data across countries
   */
  private aggregateSectorData(economicData: EconomicData[]) {
    const sectors = ["agriculture", "manufacturing", "services", "tourism"];

    return sectors.map((sector) => {
      const totalGDP = economicData.reduce(
        (sum, country) => sum + country.gdp.total,
        0
      );
      const sectorContribution = economicData.reduce(
        (sum, country) =>
          sum +
          ((country.sectors[sector]?.gdpContribution || 0) *
            country.gdp.total) /
            100,
        0
      );
      const avgImpact =
        economicData.reduce(
          (sum, country) => sum + (country.sectors[sector]?.climateRisk || 0),
          0
        ) / economicData.length;
      const totalEmployment = economicData.reduce(
        (sum, country) =>
          sum + (country.sectors[sector]?.employmentImpact || 0),
        0
      );

      return {
        name: sector,
        impact: Math.round(avgImpact),
        employment: Math.round(totalEmployment),
      };
    });
  }

  /**
   * Add listener for economic data updates
   */
  public addListener(callback: (data: EconomicData[]) => void): void {
    this.listeners.push(callback);
  }

  /**
   * Remove listener
   */
  public removeListener(callback: (data: EconomicData[]) => void): void {
    this.listeners = this.listeners.filter((listener) => listener !== callback);
  }

  /**
   * Clear cache and refresh data
   */
  public async refreshData(): Promise<void> {
    this.economicDataCache.clear();
    this.lastUpdate = new Date();
  }
}

// Export singleton instance
export const economicIntelligence = EconomicIntelligenceService.getInstance();
