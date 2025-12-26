
import React from 'react';

interface RiskBadgeProps {
  level: 'low' | 'medium' | 'high';
}

const RiskBadge: React.FC<RiskBadgeProps> = ({ level }) => {
  const styles = {
    low: "bg-emerald-100 text-emerald-700 border-emerald-200",
    medium: "bg-amber-100 text-amber-700 border-amber-200",
    high: "bg-rose-100 text-rose-700 border-rose-200",
  };

  const labels = {
    low: "Low Risk",
    medium: "Medium Risk",
    high: "High Risk",
  };

  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${styles[level]}`}>
      {labels[level]}
    </span>
  );
};

export default RiskBadge;
