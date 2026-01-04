import React from "react";

const StatCard = ({ label, value, accent }) => (
  <div className={`rounded-xl p-4 shadow-sm border ${accent.bg} ${accent.border}`}>
    <p className={`text-sm ${accent.textSub}`}>{label}</p>
    <p className={`text-2xl font-bold ${accent.textMain}`}>{value}</p>
  </div>
);

const Stats = ({ counts = {}, mode = "light" }) => {
  const base = mode === "dark";
  const accents = {
    active: {
      bg: base ? "bg-gray-800" : "bg-white",
      border: base ? "border-gray-700" : "border-gray-200",
      textMain: "text-green-500",
      textSub: base ? "text-gray-400" : "text-gray-600",
    },
    completed: {
      bg: base ? "bg-gray-800" : "bg-white",
      border: base ? "border-gray-700" : "border-gray-200",
      textMain: "text-emerald-500",
      textSub: base ? "text-gray-400" : "text-gray-600",
    },
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      <StatCard label="Active" value={counts.active ?? 0} accent={accents.active} />
      <StatCard label="Completed" value={counts.completed ?? 0} accent={accents.completed} />
    </div>
  );
};

export default Stats;
