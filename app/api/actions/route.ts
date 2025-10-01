export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const riskType = searchParams.get("risk_type")
  const severity = searchParams.get("severity")

  const allActions = [
    {
      id: 1,
      title: "Activate Emergency Cooling Centers",
      description: "Open public cooling centers for vulnerable populations during extreme heat events",
      priority: "High",
      timeline: "Immediate",
      resources_required: "Staff, facilities, transportation",
      status: "Ready",
      risk_types: ["heatwave"],
      severity_levels: ["High", "Medium"],
    },
    {
      id: 2,
      title: "Issue Flood Warning Alert",
      description: "Send emergency alerts to residents in flood-prone areas",
      priority: "Critical",
      timeline: "Immediate",
      resources_required: "Emergency broadcast system",
      status: "Active",
      risk_types: ["flood"],
      severity_levels: ["High", "Medium"],
    },
    {
      id: 3,
      title: "Implement Water Conservation Measures",
      description: "Restrict non-essential water use and promote conservation practices",
      priority: "High",
      timeline: "1-3 days",
      resources_required: "Public communication, enforcement",
      status: "Planning",
      risk_types: ["drought"],
      severity_levels: ["High", "Medium"],
    },
    {
      id: 4,
      title: "Deploy Mobile Medical Units",
      description: "Position medical units in high-risk areas for heat-related emergencies",
      priority: "High",
      timeline: "2-6 hours",
      resources_required: "Medical staff, vehicles, supplies",
      status: "Standby",
      risk_types: ["heatwave"],
      severity_levels: ["High"],
    },
    {
      id: 5,
      title: "Sandbag Distribution",
      description: "Distribute sandbags to residents in flood-prone areas",
      priority: "Medium",
      timeline: "4-12 hours",
      resources_required: "Sandbags, volunteers, distribution points",
      status: "Ready",
      risk_types: ["flood"],
      severity_levels: ["High", "Medium"],
    },
    {
      id: 6,
      title: "Agricultural Drought Support",
      description: "Provide emergency water supplies and financial assistance to farmers",
      priority: "Medium",
      timeline: "1-7 days",
      resources_required: "Water trucks, funding, coordination",
      status: "Planning",
      risk_types: ["drought"],
      severity_levels: ["High", "Medium"],
    },
  ]

  let filteredActions = allActions

  if (riskType) {
    filteredActions = filteredActions.filter((action) => action.risk_types.includes(riskType.toLowerCase()))
  }

  if (severity) {
    filteredActions = filteredActions.filter((action) => action.severity_levels.includes(severity))
  }

  return Response.json({
    actions: filteredActions,
    total: filteredActions.length,
    filters_applied: {
      risk_type: riskType,
      severity: severity,
    },
  })
}
