/**
 * React Hooks for Economic Intelligence
 * Provides easy access to World Bank economic data and business impact analysis
 */

import { useState, useEffect, useCallback } from "react";
import {
  economicIntelligence,
  EconomicData,
  BusinessImpactAssessment,
  InvestmentOpportunity,
} from "@/lib/economic-intelligence";

/**
 * Hook for country economic data
 */
export function useCountryEconomicData(countryCode: string) {
  const [data, setData] = useState<EconomicData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async (code: string) => {
    if (!code) return;

    setLoading(true);
    setError(null);

    try {
      const economicData = await economicIntelligence.getCountryEconomicData(
        code
      );
      setData(economicData);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch economic data"
      );
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData(countryCode);
  }, [countryCode, fetchData]);

  const refetch = useCallback(() => {
    fetchData(countryCode);
  }, [countryCode, fetchData]);

  return {
    data,
    loading,
    error,
    refetch,
  };
}

/**
 * Hook for multiple countries economic comparison
 */
export function useMultiCountryComparison(countryCodes: string[]) {
  const [data, setData] = useState<EconomicData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async (codes: string[]) => {
    if (!codes.length) return;

    setLoading(true);
    setError(null);

    try {
      const economicData = await economicIntelligence.getMultipleCountriesData(
        codes
      );
      setData(economicData);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch comparison data"
      );
      setData([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData(countryCodes);
  }, [countryCodes, fetchData]);

  const comparison = useCallback(() => {
    if (data.length === 0) return null;

    // Calculate comparison metrics
    const totalGDP = data.reduce((sum, country) => sum + country.gdp.total, 0);
    const avgVulnerability =
      data.reduce(
        (sum, country) => sum + country.economicVulnerability.score,
        0
      ) / data.length;
    const totalClimateCosts = data.reduce(
      (sum, country) => sum + country.climateCosts.annualDamages,
      0
    );

    const mostVulnerable = data.reduce((prev, current) =>
      prev.economicVulnerability.score > current.economicVulnerability.score
        ? prev
        : current
    );

    const leastVulnerable = data.reduce((prev, current) =>
      prev.economicVulnerability.score < current.economicVulnerability.score
        ? prev
        : current
    );

    return {
      totalGDP,
      avgVulnerability,
      totalClimateCosts,
      mostVulnerable,
      leastVulnerable,
      climateCostPercentage: (totalClimateCosts / totalGDP) * 100,
    };
  }, [data]);

  return {
    data,
    loading,
    error,
    comparison: comparison(),
    refetch: () => fetchData(countryCodes),
  };
}

/**
 * Hook for business impact assessment
 */
export function useBusinessImpactAssessment() {
  const [assessment, setAssessment] = useState<BusinessImpactAssessment | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateAssessment = useCallback(
    async (
      sector: string,
      region: string,
      businessSize: BusinessImpactAssessment["businessSize"],
      countryCode?: string
    ) => {
      setLoading(true);
      setError(null);

      try {
        const impact = await economicIntelligence.generateBusinessImpact(
          sector,
          region,
          businessSize,
          countryCode
        );
        setAssessment(impact);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to generate business assessment"
        );
        setAssessment(null);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const clearAssessment = useCallback(() => {
    setAssessment(null);
    setError(null);
  }, []);

  return {
    assessment,
    loading,
    error,
    generateAssessment,
    clearAssessment,
  };
}

/**
 * Hook for investment opportunities
 */
export function useInvestmentOpportunities(
  sector?: string,
  region?: string,
  investmentRange?: { min: number; max: number }
) {
  const [opportunities, setOpportunities] = useState<InvestmentOpportunity[]>(
    []
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchOpportunities = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await economicIntelligence.getInvestmentOpportunities(
        sector,
        region,
        investmentRange
      );
      setOpportunities(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to fetch investment opportunities"
      );
      setOpportunities([]);
    } finally {
      setLoading(false);
    }
  }, [sector, region, investmentRange]);

  useEffect(() => {
    fetchOpportunities();
  }, [fetchOpportunities]);

  const opportunityStats = useCallback(() => {
    if (opportunities.length === 0) return null;

    const totalInvestment = opportunities.reduce(
      (sum, opp) => sum + opp.investmentRequired,
      0
    );
    const avgReturn =
      opportunities.reduce(
        (sum, opp) => sum + opp.potentialReturn.financial,
        0
      ) / opportunities.length;
    const totalCO2Reduction = opportunities.reduce(
      (sum, opp) => sum + opp.potentialReturn.environmental,
      0
    );
    const totalJobsCreated = opportunities.reduce(
      (sum, opp) => sum + opp.potentialReturn.social,
      0
    );

    const riskDistribution = opportunities.reduce((acc, opp) => {
      acc[opp.riskLevel] = (acc[opp.riskLevel] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalInvestment,
      avgReturn,
      totalCO2Reduction,
      totalJobsCreated,
      riskDistribution,
      opportunityCount: opportunities.length,
    };
  }, [opportunities]);

  return {
    opportunities,
    loading,
    error,
    stats: opportunityStats(),
    refetch: fetchOpportunities,
  };
}

/**
 * Hook for regional economic impact
 */
export function useRegionalImpact(region: string) {
  const [impact, setImpact] = useState<{
    totalGDP: number;
    climateRisk: number;
    adaptationCosts: number;
    economicLosses: number;
    jobsAtRisk: number;
    sectors: Array<{ name: string; impact: number; employment: number }>;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchImpact = useCallback(async (regionName: string) => {
    if (!regionName) return;

    setLoading(true);
    setError(null);

    try {
      const data = await economicIntelligence.calculateRegionalImpact(
        regionName
      );
      setImpact(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to calculate regional impact"
      );
      setImpact(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchImpact(region);
  }, [region, fetchImpact]);

  return {
    impact,
    loading,
    error,
    refetch: () => fetchImpact(region),
  };
}

/**
 * Hook for economic data statistics
 */
export function useEconomicStats(countryCodes: string[]) {
  const { data, loading, error } = useMultiCountryComparison(countryCodes);

  const stats = useCallback(() => {
    if (!data.length) return null;

    // GDP statistics
    const gdpStats = {
      total: data.reduce((sum, country) => sum + country.gdp.total, 0),
      average:
        data.reduce((sum, country) => sum + country.gdp.total, 0) / data.length,
      highest: Math.max(...data.map((country) => country.gdp.total)),
      lowest: Math.min(...data.map((country) => country.gdp.total)),
    };

    // Vulnerability statistics
    const vulnerabilityStats = {
      average:
        data.reduce(
          (sum, country) => sum + country.economicVulnerability.score,
          0
        ) / data.length,
      highest: Math.max(
        ...data.map((country) => country.economicVulnerability.score)
      ),
      lowest: Math.min(
        ...data.map((country) => country.economicVulnerability.score)
      ),
    };

    // Climate cost statistics
    const climateCostStats = {
      total: data.reduce(
        (sum, country) => sum + country.climateCosts.annualDamages,
        0
      ),
      asPercentageOfGDP:
        data.reduce(
          (sum, country) => sum + country.climateCosts.percentageOfGDP,
          0
        ) / data.length,
      adaptationCosts: data.reduce(
        (sum, country) => sum + country.climateCosts.adaptationCosts,
        0
      ),
    };

    // Sector analysis
    const sectorAnalysis = {
      agriculture: {
        avgContribution:
          data.reduce(
            (sum, country) =>
              sum + (country.sectors.agriculture?.gdpContribution || 0),
            0
          ) / data.length,
        avgRisk:
          data.reduce(
            (sum, country) =>
              sum + (country.sectors.agriculture?.climateRisk || 0),
            0
          ) / data.length,
      },
      manufacturing: {
        avgContribution:
          data.reduce(
            (sum, country) =>
              sum + (country.sectors.manufacturing?.gdpContribution || 0),
            0
          ) / data.length,
        avgRisk:
          data.reduce(
            (sum, country) =>
              sum + (country.sectors.manufacturing?.climateRisk || 0),
            0
          ) / data.length,
      },
      services: {
        avgContribution:
          data.reduce(
            (sum, country) =>
              sum + (country.sectors.services?.gdpContribution || 0),
            0
          ) / data.length,
        avgRisk:
          data.reduce(
            (sum, country) =>
              sum + (country.sectors.services?.climateRisk || 0),
            0
          ) / data.length,
      },
    };

    return {
      gdp: gdpStats,
      vulnerability: vulnerabilityStats,
      climateCosts: climateCostStats,
      sectors: sectorAnalysis,
      dataPoints: data.length,
    };
  }, [data]);

  return {
    stats: stats(),
    loading,
    error,
    countries: data,
  };
}

/**
 * Hook for economic risk alerts
 */
export function useEconomicRiskAlerts(
  countryCodes: string[],
  thresholds: {
    vulnerability?: number;
    climateCostPercentage?: number;
    gdpGrowthRate?: number;
  }
) {
  const { data } = useMultiCountryComparison(countryCodes);

  const alerts = useCallback(() => {
    if (!data.length) return [];

    const riskAlerts: Array<{
      type: "vulnerability" | "climate_cost" | "growth" | "sector_risk";
      severity: "low" | "medium" | "high" | "critical";
      country: string;
      message: string;
      value: number;
      threshold: number;
    }> = [];

    data.forEach((country) => {
      // Vulnerability alerts
      if (
        thresholds.vulnerability &&
        country.economicVulnerability.score > thresholds.vulnerability
      ) {
        riskAlerts.push({
          type: "vulnerability",
          severity:
            country.economicVulnerability.score > 80
              ? "critical"
              : country.economicVulnerability.score > 65
              ? "high"
              : "medium",
          country: country.country,
          message: `High economic vulnerability to climate change`,
          value: country.economicVulnerability.score,
          threshold: thresholds.vulnerability,
        });
      }

      // Climate cost alerts
      if (
        thresholds.climateCostPercentage &&
        country.climateCosts.percentageOfGDP > thresholds.climateCostPercentage
      ) {
        riskAlerts.push({
          type: "climate_cost",
          severity:
            country.climateCosts.percentageOfGDP > 5
              ? "critical"
              : country.climateCosts.percentageOfGDP > 3
              ? "high"
              : "medium",
          country: country.country,
          message: `Climate costs exceed ${thresholds.climateCostPercentage}% of GDP`,
          value: country.climateCosts.percentageOfGDP,
          threshold: thresholds.climateCostPercentage,
        });
      }

      // GDP growth alerts
      if (
        thresholds.gdpGrowthRate &&
        country.gdp.growthRate < thresholds.gdpGrowthRate
      ) {
        riskAlerts.push({
          type: "growth",
          severity:
            country.gdp.growthRate < 0
              ? "critical"
              : country.gdp.growthRate < 1
              ? "high"
              : "medium",
          country: country.country,
          message: `GDP growth below expected threshold`,
          value: country.gdp.growthRate,
          threshold: thresholds.gdpGrowthRate,
        });
      }

      // Sector risk alerts
      Object.entries(country.sectors).forEach(([sector, data]) => {
        if (data.climateRisk > 80) {
          riskAlerts.push({
            type: "sector_risk",
            severity: data.climateRisk > 90 ? "critical" : "high",
            country: country.country,
            message: `${sector} sector at high climate risk`,
            value: data.climateRisk,
            threshold: 80,
          });
        }
      });
    });

    return riskAlerts.sort((a, b) => {
      const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
      return severityOrder[b.severity] - severityOrder[a.severity];
    });
  }, [data, thresholds]);

  return {
    alerts: alerts(),
    alertCount: alerts().length,
    criticalAlerts: alerts().filter((alert) => alert.severity === "critical")
      .length,
    highAlerts: alerts().filter((alert) => alert.severity === "high").length,
  };
}
