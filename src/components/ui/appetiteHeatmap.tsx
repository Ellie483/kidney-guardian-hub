import React, { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Tooltip } from "recharts";

interface AppetiteAgeData {
  age_group: string;
  appetite: string;
  low_risk: number | null;
  moderate_risk: number | null;
  high_risk: number | null;
  severe_disease: number | null;
}

const riskLevels = ["low_risk", "moderate_risk", "high_risk", "severe_disease"];

const riskColors: Record<string, string> = {
  low_risk: "#22C55E",        // bright green
  moderate_risk: "#FACC15",   // bright yellow
  high_risk: "#F87171",       // bright red
  severe_disease: "#DC2626",  // vivid dark red
};



export default function AppetiteHeatmapGrid() {
  const [data, setData] = useState<AppetiteAgeData[]>([]);

  useEffect(() => {
    fetch("http://localhost:5000/analysis/appetite-age-target") // your API endpoint
      .then((res) => res.json())
      .then(setData);
  }, []);

  return (
    <Card className="shadow-card border-0 p-4 overflow-x-auto">
      <h2 className="text-lg font-semibold mb-4">CKD Risk Heatmap Grid</h2>
      <table className="border-collapse w-full text-center">
        <thead>
          <tr>
            <th className="border p-2 sticky top-0 bg-white z-10">Age (Appetite)</th>
            {riskLevels.map((risk) => (
              <th key={risk} className="border p-2 sticky top-0 bg-white z-10">
                {risk.replace(/_/g, " ")}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row) => {
            const label = `${row.age_group} (${row.appetite})`;
            return (
              <tr key={label}>
                <td className="border p-2 text-left">{label}</td>
                {riskLevels.map((risk) => {
                  const value = Number(row[risk as keyof AppetiteAgeData] ?? 0);
                  const opacity = Math.max(value / 100, 0.15);
                  return (
                    <td
                      key={risk}
                      className="border p-2"
                      style={{
                        backgroundColor: riskColors[risk],
                        
                        color: "white",
                        fontWeight: "bold",
                      }}
                      title={`${value.toFixed(1)}%`}
                    >
                      {value.toFixed(1)}%
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
      <div className="flex justify-center gap-4 mt-4 text-sm">
        {riskLevels.map((risk) => (
          <div key={risk} className="flex items-center gap-1">
            <span
              className="inline-block w-4 h-4 rounded"
              style={{ backgroundColor: riskColors[risk] }}
            />
            {risk.replace(/_/g, " ")}
          </div>
        ))}
      </div>
    </Card>
  );
}
