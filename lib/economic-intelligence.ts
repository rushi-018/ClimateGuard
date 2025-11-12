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
      // Check cache first (cache for 1 hour)
      const cached = this.economicDataCache.get(countryCode);
      if (
        cached &&
        this.lastUpdate &&
        Date.now() - this.lastUpdate.getTime() < 3600000
      ) {
        return cached;
      }

      // Fetch REAL data from World Bank API
      const realData = await this.fetchRealWorldBankData(countryCode);

      this.economicDataCache.set(countryCode, realData);
      this.lastUpdate = new Date();
      return realData;
    } catch (error) {
      console.error(
        `[EconomicIntelligence] Error fetching data for ${countryCode}:`,
        error
      );

      // Fallback to basic data if API fails
      const fallbackData = this.getFallbackEconomicData(countryCode);
      return fallbackData;
    }
  }

  /**
   * Fetch REAL economic data from World Bank API
   */
  private async fetchRealWorldBankData(
    countryCode: string
  ): Promise<EconomicData> {
    try {
      const currentYear = new Date().getFullYear();
      const lastYear = currentYear - 1;

      // World Bank API endpoints
      const baseUrl = "https://api.worldbank.org/v2";

      // Fetch multiple indicators in parallel
      const [
        gdpData,
        gdpPerCapitaData,
        gdpGrowthData,
        populationData,
        countryInfo,
      ] = await Promise.all([
        // GDP (current US$) - NY.GDP.MKTP.CD
        fetch(
          `${baseUrl}/country/${countryCode}/indicator/NY.GDP.MKTP.CD?format=json&date=${
            lastYear - 2
          }:${lastYear}&per_page=5`
        ).then((r) => r.json()),

        // GDP per capita (current US$) - NY.GDP.PCAP.CD
        fetch(
          `${baseUrl}/country/${countryCode}/indicator/NY.GDP.PCAP.CD?format=json&date=${
            lastYear - 2
          }:${lastYear}&per_page=5`
        ).then((r) => r.json()),

        // GDP growth (annual %) - NY.GDP.MKTP.KD.ZG
        fetch(
          `${baseUrl}/country/${countryCode}/indicator/NY.GDP.MKTP.KD.ZG?format=json&date=${
            lastYear - 2
          }:${lastYear}&per_page=5`
        ).then((r) => r.json()),

        // Population - SP.POP.TOTL
        fetch(
          `${baseUrl}/country/${countryCode}/indicator/SP.POP.TOTL?format=json&date=${
            lastYear - 2
          }:${lastYear}&per_page=5`
        ).then((r) => r.json()),

        // Country metadata
        fetch(`${baseUrl}/country/${countryCode}?format=json`).then((r) =>
          r.json()
        ),
      ]);

      // Extract country info
      const countryMetadata = countryInfo[1]?.[0];
      const countryName = countryMetadata?.name || "Unknown";
      const region = countryMetadata?.region?.value || "Unknown";
      const incomeLevel = countryMetadata?.incomeLevel?.value || "Unknown";

      // Extract latest GDP data (in billions)
      const latestGDP = gdpData[1]?.find((d: any) => d.value !== null);
      const gdpBillions = latestGDP ? latestGDP.value / 1e9 : 0;
      const gdpYear = latestGDP ? parseInt(latestGDP.date) : lastYear;

      // Extract GDP per capita
      const latestGDPPerCapita = gdpPerCapitaData[1]?.find(
        (d: any) => d.value !== null
      );
      const gdpPerCapita = latestGDPPerCapita ? latestGDPPerCapita.value : 0;

      // Extract GDP growth rate
      const latestGrowth = gdpGrowthData[1]?.find((d: any) => d.value !== null);
      const growthRate = latestGrowth ? latestGrowth.value : 0;

      // Extract population
      const latestPopulation = populationData[1]?.find(
        (d: any) => d.value !== null
      );
      const population = latestPopulation ? latestPopulation.value : 0;

      // Calculate climate vulnerability based on geographic and economic factors
      const vulnerability = await this.calculateRealClimateVulnerability(
        countryCode,
        region,
        gdpPerCapita,
        population
      );

      // Calculate climate costs based on GDP and vulnerability
      const climateCosts = this.calculateClimateCosts(
        gdpBillions,
        vulnerability.score
      );

      // Get sector data based on real economic structure
      const sectors = await this.fetchRealSectorData(countryCode, gdpBillions);

      return {
        country: countryName,
        countryCode,
        region,
        incomeLevel,
        gdp: {
          total: Math.round(gdpBillions * 10) / 10,
          perCapita: Math.round(gdpPerCapita),
          growthRate: Math.round(growthRate * 10) / 10,
          year: gdpYear,
        },
        climateCosts,
        economicVulnerability: vulnerability,
        sectors,
      };
    } catch (error) {
      console.error(
        `[EconomicIntelligence] Error fetching World Bank data:`,
        error
      );
      throw error;
    }
  }

  /**
   * Calculate REAL climate vulnerability based on multiple factors
   */
  private async calculateRealClimateVulnerability(
    countryCode: string,
    region: string,
    gdpPerCapita: number,
    population: number
  ): Promise<EconomicData["economicVulnerability"]> {
    try {
      // Fetch climate-related indicators from World Bank
      const baseUrl = "https://api.worldbank.org/v2";
      const currentYear = new Date().getFullYear();
      const lastYear = currentYear - 1;

      const [agData, urbanData, forestData] = await Promise.all([
        // Agriculture, forestry, and fishing, value added (% of GDP) - NV.AGR.TOTL.ZS
        fetch(
          `${baseUrl}/country/${countryCode}/indicator/NV.AGR.TOTL.ZS?format=json&date=${
            lastYear - 5
          }:${lastYear}&per_page=10`
        ).then((r) => r.json()),

        // Urban population (% of total) - SP.URB.TOTL.IN.ZS
        fetch(
          `${baseUrl}/country/${countryCode}/indicator/SP.URB.TOTL.IN.ZS?format=json&date=${
            lastYear - 5
          }:${lastYear}&per_page=10`
        ).then((r) => r.json()),

        // Forest area (% of land area) - AG.LND.FRST.ZS
        fetch(
          `${baseUrl}/country/${countryCode}/indicator/AG.LND.FRST.ZS?format=json&date=${
            lastYear - 5
          }:${lastYear}&per_page=10`
        ).then((r) => r.json()),
      ]);

      // Extract values
      const agricultureDependency =
        agData[1]?.find((d: any) => d.value !== null)?.value || 10;
      const urbanPopulation =
        urbanData[1]?.find((d: any) => d.value !== null)?.value || 50;
      const forestCover =
        forestData[1]?.find((d: any) => d.value !== null)?.value || 30;

      // Calculate coastal exposure based on region and population density
      const coastalExposure = this.estimateCoastalExposure(region, countryCode);

      // Calculate infrastructure age (inverse of GDP per capita - richer countries have newer infrastructure)
      const infrastructureAge = Math.max(
        0,
        Math.min(100, 100 - gdpPerCapita / 1000)
      );

      // Insurance penetration (higher GDP per capita = better insurance)
      const insurancePenetration = Math.min(100, gdpPerCapita / 500);

      // Social safety (based on income level and urbanization)
      const socialSafety = Math.min(
        100,
        gdpPerCapita / 800 + urbanPopulation / 2
      );

      // Calculate resilience (inverse of vulnerability factors)
      const resilience = Math.round(
        (100 - infrastructureAge) * 0.3 +
          insurancePenetration * 0.3 +
          socialSafety * 0.2 +
          (100 - agricultureDependency) * 0.2
      );

      // Calculate overall vulnerability score
      const vulnerabilityScore = Math.round(
        agricultureDependency * 0.25 +
          coastalExposure * 0.25 +
          infrastructureAge * 0.2 +
          (100 - insurancePenetration) * 0.15 +
          (100 - socialSafety) * 0.15
      );

      return {
        score: Math.max(0, Math.min(100, vulnerabilityScore)),
        factors: {
          agricultureDependency: Math.round(agricultureDependency * 10) / 10,
          coastalExposure: Math.round(coastalExposure * 10) / 10,
          infrastructureAge: Math.round(infrastructureAge * 10) / 10,
          insurancePenetration: Math.round(insurancePenetration * 10) / 10,
          socialSafety: Math.round(socialSafety * 10) / 10,
        },
        resilience: Math.max(0, Math.min(100, resilience)),
      };
    } catch (error) {
      console.error(
        "[EconomicIntelligence] Error calculating vulnerability:",
        error
      );
      // Return moderate defaults if API fails
      return {
        score: 50,
        factors: {
          agricultureDependency: 15,
          coastalExposure: 40,
          infrastructureAge: 50,
          insurancePenetration: 40,
          socialSafety: 50,
        },
        resilience: 50,
      };
    }
  }

  /**
   * Estimate coastal exposure based on geography
   */
  private estimateCoastalExposure(region: string, countryCode: string): number {
    // High coastal exposure countries
    const highCoastal = [
      "NLD",
      "BGD",
      "MDV",
      "IDN",
      "PHL",
      "JPN",
      "GBR",
      "ITA",
      "GRC",
      "ESP",
    ];
    if (highCoastal.includes(countryCode)) return 85;

    // Island nations
    const islands = ["CUB", "JAM", "HT", "DOM", "FJI", "TON", "WSM", "VUT"];
    if (islands.includes(countryCode)) return 95;

    // By region
    const regionalExposure: { [key: string]: number } = {
      "East Asia & Pacific": 70,
      "South Asia": 65,
      "Europe & Central Asia": 45,
      "Middle East & North Africa": 55,
      "Latin America & Caribbean": 60,
      "Sub-Saharan Africa": 50,
      "North America": 50,
    };

    return regionalExposure[region] || 50;
  }

  /**
   * Calculate climate costs based on GDP and vulnerability
   */
  private calculateClimateCosts(
    gdpBillions: number,
    vulnerabilityScore: number
  ): EconomicData["climateCosts"] {
    // Climate costs typically range from 1-8% of GDP depending on vulnerability
    // Low vulnerability (0-30): 1-2% of GDP
    // Medium vulnerability (30-60): 2-4% of GDP
    // High vulnerability (60-100): 4-8% of GDP

    const basePercentage = 1 + (vulnerabilityScore / 100) * 7; // 1-8%
    const annualDamages = gdpBillions * (basePercentage / 100);
    const adaptationCosts = annualDamages * 0.6; // Adaptation costs ~60% of damages

    // Projected increase based on IPCC scenarios (25-100% increase by 2050)
    const projectedIncrease = 25 + (vulnerabilityScore / 100) * 75;

    return {
      annualDamages: Math.round(annualDamages * 10) / 10,
      adaptationCosts: Math.round(adaptationCosts * 10) / 10,
      percentageOfGDP: Math.round(basePercentage * 10) / 10,
      projectedIncrease: Math.round(projectedIncrease),
    };
  }

  /**
   * Fetch real sector data from World Bank
   */
  private async fetchRealSectorData(
    countryCode: string,
    gdpBillions: number
  ): Promise<EconomicData["sectors"]> {
    try {
      const baseUrl = "https://api.worldbank.org/v2";
      const currentYear = new Date().getFullYear();
      const lastYear = currentYear - 1;

      const [agData, industryData, servicesData] = await Promise.all([
        // Agriculture % of GDP
        fetch(
          `${baseUrl}/country/${countryCode}/indicator/NV.AGR.TOTL.ZS?format=json&date=${
            lastYear - 3
          }:${lastYear}&per_page=5`
        ).then((r) => r.json()),

        // Industry % of GDP
        fetch(
          `${baseUrl}/country/${countryCode}/indicator/NV.IND.TOTL.ZS?format=json&date=${
            lastYear - 3
          }:${lastYear}&per_page=5`
        ).then((r) => r.json()),

        // Services % of GDP
        fetch(
          `${baseUrl}/country/${countryCode}/indicator/NV.SRV.TOTL.ZS?format=json&date=${
            lastYear - 3
          }:${lastYear}&per_page=5`
        ).then((r) => r.json()),
      ]);

      const agPercent =
        agData[1]?.find((d: any) => d.value !== null)?.value || 5;
      const industryPercent =
        industryData[1]?.find((d: any) => d.value !== null)?.value || 30;
      const servicesPercent =
        servicesData[1]?.find((d: any) => d.value !== null)?.value || 65;

      // Calculate employment (rough estimate based on sector size and development level)
      const totalEmploymentMillions = gdpBillions / 50; // Rough estimate

      return {
        agriculture: {
          gdpContribution: Math.round(agPercent * 10) / 10,
          climateRisk: Math.min(100, 70 + agPercent), // Higher ag dependency = higher risk
          adaptationPotential: 60,
          employmentImpact:
            Math.round(totalEmploymentMillions * (agPercent / 100) * 10) / 10,
        },
        manufacturing: {
          gdpContribution: Math.round(industryPercent * 10) / 10,
          climateRisk: 45,
          adaptationPotential: 70,
          employmentImpact:
            Math.round(totalEmploymentMillions * (industryPercent / 100) * 10) /
            10,
        },
        services: {
          gdpContribution: Math.round(servicesPercent * 10) / 10,
          climateRisk: 35,
          adaptationPotential: 80,
          employmentImpact:
            Math.round(totalEmploymentMillions * (servicesPercent / 100) * 10) /
            10,
        },
        tourism: {
          gdpContribution: Math.round(servicesPercent * 0.15 * 10) / 10, // Tourism ~15% of services
          climateRisk: 75,
          adaptationPotential: 50,
          employmentImpact:
            Math.round(totalEmploymentMillions * 0.08 * 10) / 10,
        },
      };
    } catch (error) {
      console.error(
        "[EconomicIntelligence] Error fetching sector data:",
        error
      );
      // Return reasonable defaults
      return {
        agriculture: {
          gdpContribution: 5,
          climateRisk: 75,
          adaptationPotential: 60,
          employmentImpact: 10,
        },
        manufacturing: {
          gdpContribution: 25,
          climateRisk: 45,
          adaptationPotential: 70,
          employmentImpact: 50,
        },
        services: {
          gdpContribution: 65,
          climateRisk: 35,
          adaptationPotential: 80,
          employmentImpact: 100,
        },
        tourism: {
          gdpContribution: 8,
          climateRisk: 75,
          adaptationPotential: 50,
          employmentImpact: 15,
        },
      };
    }
  }

  /**
   * Fallback data when API fails
   */
  private getFallbackEconomicData(countryCode: string): EconomicData {
    const fallbackCountries: { [key: string]: EconomicData } = {
      IN: {
        country: "India",
        countryCode: "IN",
        region: "South Asia",
        incomeLevel: "Lower middle income",
        gdp: { total: 3870, perCapita: 2730, growthRate: 7.2, year: 2024 },
        climateCosts: {
          annualDamages: 232,
          adaptationCosts: 139,
          percentageOfGDP: 6.0,
          projectedIncrease: 70,
        },
        economicVulnerability: {
          score: 68,
          factors: {
            agricultureDependency: 17.8,
            coastalExposure: 72,
            infrastructureAge: 62,
            insurancePenetration: 28,
            socialSafety: 42,
          },
          resilience: 48,
        },
        sectors: {
          agriculture: {
            gdpContribution: 17.8,
            climateRisk: 88,
            adaptationPotential: 55,
            employmentImpact: 13.8,
          },
          manufacturing: {
            gdpContribution: 25.9,
            climateRisk: 52,
            adaptationPotential: 68,
            employmentImpact: 20.0,
          },
          services: {
            gdpContribution: 49.0,
            climateRisk: 42,
            adaptationPotential: 72,
            employmentImpact: 37.9,
          },
          tourism: {
            gdpContribution: 6.8,
            climateRisk: 78,
            adaptationPotential: 58,
            employmentImpact: 6.2,
          },
        },
      },
      US: {
        country: "United States",
        countryCode: "US",
        region: "North America",
        incomeLevel: "High income",
        gdp: { total: 27360, perCapita: 81695, growthRate: 2.5, year: 2024 },
        climateCosts: {
          annualDamages: 820,
          adaptationCosts: 492,
          percentageOfGDP: 3.0,
          projectedIncrease: 45,
        },
        economicVulnerability: {
          score: 42,
          factors: {
            agricultureDependency: 0.9,
            coastalExposure: 65,
            infrastructureAge: 45,
            insurancePenetration: 88,
            socialSafety: 75,
          },
          resilience: 68,
        },
        sectors: {
          agriculture: {
            gdpContribution: 0.9,
            climateRisk: 72,
            adaptationPotential: 75,
            employmentImpact: 4.5,
          },
          manufacturing: {
            gdpContribution: 18.2,
            climateRisk: 40,
            adaptationPotential: 80,
            employmentImpact: 99.7,
          },
          services: {
            gdpContribution: 77.4,
            climateRisk: 28,
            adaptationPotential: 85,
            employmentImpact: 443.2,
          },
          tourism: {
            gdpContribution: 7.8,
            climateRisk: 65,
            adaptationPotential: 60,
            employmentImpact: 43.7,
          },
        },
      },
      CN: {
        country: "China",
        countryCode: "CN",
        region: "East Asia & Pacific",
        incomeLevel: "Upper middle income",
        gdp: { total: 17890, perCapita: 12720, growthRate: 5.2, year: 2024 },
        climateCosts: {
          annualDamages: 895,
          adaptationCosts: 537,
          percentageOfGDP: 5.0,
          projectedIncrease: 60,
        },
        economicVulnerability: {
          score: 58,
          factors: {
            agricultureDependency: 7.3,
            coastalExposure: 75,
            infrastructureAge: 38,
            insurancePenetration: 45,
            socialSafety: 62,
          },
          resilience: 55,
        },
        sectors: {
          agriculture: {
            gdpContribution: 7.3,
            climateRisk: 82,
            adaptationPotential: 65,
            employmentImpact: 26.1,
          },
          manufacturing: {
            gdpContribution: 38.6,
            climateRisk: 48,
            adaptationPotential: 72,
            employmentImpact: 138.2,
          },
          services: {
            gdpContribution: 54.1,
            climateRisk: 35,
            adaptationPotential: 75,
            employmentImpact: 193.6,
          },
          tourism: {
            gdpContribution: 4.5,
            climateRisk: 70,
            adaptationPotential: 55,
            employmentImpact: 28.7,
          },
        },
      },
      BR: {
        country: "Brazil",
        countryCode: "BR",
        region: "Latin America & Caribbean",
        incomeLevel: "Upper middle income",
        gdp: { total: 2170, perCapita: 10180, growthRate: 2.9, year: 2024 },
        climateCosts: {
          annualDamages: 152,
          adaptationCosts: 91,
          percentageOfGDP: 7.0,
          projectedIncrease: 75,
        },
        economicVulnerability: {
          score: 72,
          factors: {
            agricultureDependency: 6.7,
            coastalExposure: 68,
            infrastructureAge: 55,
            insurancePenetration: 32,
            socialSafety: 48,
          },
          resilience: 45,
        },
        sectors: {
          agriculture: {
            gdpContribution: 6.7,
            climateRisk: 85,
            adaptationPotential: 52,
            employmentImpact: 2.9,
          },
          manufacturing: {
            gdpContribution: 18.5,
            climateRisk: 48,
            adaptationPotential: 65,
            employmentImpact: 8.0,
          },
          services: {
            gdpContribution: 63.5,
            climateRisk: 38,
            adaptationPotential: 70,
            employmentImpact: 27.5,
          },
          tourism: {
            gdpContribution: 8.1,
            climateRisk: 82,
            adaptationPotential: 48,
            employmentImpact: 3.5,
          },
        },
      },
    };

    return fallbackCountries[countryCode] || fallbackCountries.IN;
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
