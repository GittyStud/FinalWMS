import React, { useState, useEffect, useCallback } from "react";
import { LayoutDashboard } from "lucide-react";
import PageHeader from "../components/ui/PageHeader";
import AlertsPanel from "../components/ui/AlertsPanel";

const API_BASE_URL = "";
const API_KEY = "";

const DashboardPage = ({ role }) => {
  const [analysis, setAnalysis] = useState("Loading key metrics and alerts...");

  const fetchAnalysis = useCallback(async () => {
    if (!API_KEY) {
      setAnalysis("Inventory \n" + "Order Rate \n" + "Top Alert.");
      return;
    }

    // Existing dummy API logic for KPI analysis
    const userQuery =
      'Generate a concise summary of three key performance indicators (KPIs) for a modern warehouse management system dashboard: Inventory Accuracy, Order Fulfillment Rate, and Top Alert (e.g., "30 products below reorder point"). Format it for a manager\'s quick review.';

    try {
      const payload = {
        contents: [{ parts: [{ text: userQuery }] }],
        tools: [{ google_search: {} }],
      };

      for (let attempt = 0; attempt < 3; attempt++) {
        const response = await fetch("${API_BASE_URL}?key=${API_KEY}", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (response.status === 429 && attempt < 2) {
          await new Promise((resolve) =>
            setTimeout(resolve, 1000 * Math.pow(2, attempt))
          );
          continue;
        }

        if (!response.ok)
          throw new Error("API call failed with status: ${response.status}");

        const result = await response.json();
        const text =
          result.candidates?.[0]?.content?.parts?.[0]?.text ||
          "Analysis failed to load.";
        setAnalysis(text);
        return;
      }
    } catch (error) {
      console.error("Error fetching analysis:", error);
      setAnalysis(
        "Failed to fetch real-time analysis due to API error. Using mock data."
      );
    }
  }, []);

  useEffect(() => {
    fetchAnalysis();
  }, [fetchAnalysis]);

  return (
    <>
      <PageHeader
        icon={LayoutDashboard}
        title="WMS Dashboard"
        description="Real-time status, key metrics, and immediate alerts."
        role={role}
      />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 bg-white p-6 rounded-xl shadow-lg">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">
            Key Performance Indicators (KPIs)
          </h2>
          <div className="text-gray-600 space-y-3">
            {analysis.split("\n").map((line, index) => (
              <p key={index} className="text-base leading-relaxed">
                {line}
              </p>
            ))}
            {!API_KEY && (
              <p className="text-red-500 pt-2 text-sm italic">
                Note: API_KEY is missing. Mock data on display.
              </p>
            )}
          </div>
        </div>
        <AlertsPanel />
      </div>
      <div className="mt-6 p-6 bg-white rounded-xl shadow-lg">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">
          Visual Analytics (Req. 5)
        </h2>
        <div className="h-64 flex items-center justify-center text-gray-400 border border-dashed rounded-lg">
          [Placeholder for Charts: Inventory by Category, Fulfillment Trend]
        </div>
      </div>
    </>
  );
};

export default DashboardPage;