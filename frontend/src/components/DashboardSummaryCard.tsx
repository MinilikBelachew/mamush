import React from "react";

type Props = {
  label: string;
  title: string;
  value: number | string;
  icon: React.ReactNode;
  color: string; // tailwind gradient e.g. "from-indigo-200 to-indigo-400"
};

export default function DashboardSummaryCard({
  title,
  label,
  value,
  icon,
  color,
}: Props) {
  const colorClasses = {
    blue: "from-blue-100 to-blue-200",
    green: "from-green-100 to-green-200",
    purple: "from-purple-100 to-purple-200",
    orange: "from-orange-100 to-orange-200",
  };
  return (
    <div
      className={`rounded-xl bg-gradient-to-br ${colorClasses[color as keyof typeof colorClasses]} shadow-md flex items-center px-6 py-6 gap-5`}
    >
      <div className="rounded-full bg-white/80 p-3 shadow">{icon}</div>
      <div>
        <div className="text-gray-700 text-lg font-semibold">{label}</div>
        <div className="text-gray-700 text-lg font-semibold">{title}</div>

        <div className="text-3xl font-extrabold text-indigo-900">{value}</div>
      </div>
    </div>
  );
}
