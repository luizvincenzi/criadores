'use client';

import React from 'react';
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
  ChartOptions,
} from 'chart.js';
import { Radar } from 'react-chartjs-2';

ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);

interface RadarChartProps {
  title: string;
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string;
    borderColor?: string;
  }[];
  maxScale?: number;
  size?: 'small' | 'medium' | 'large';
}

export function RadarChart({ title, labels, datasets, maxScale = 5, size = 'medium' }: RadarChartProps) {
  const sizeClasses = {
    small: 'max-w-sm',
    medium: 'max-w-md',
    large: 'max-w-2xl',
  };
  const data = {
    labels,
    datasets: datasets.map((dataset, index) => {
      const colors = [
        { bg: 'rgba(59, 130, 246, 0.2)', border: 'rgb(59, 130, 246)' },
        { bg: 'rgba(251, 146, 60, 0.2)', border: 'rgb(251, 146, 60)' },
        { bg: 'rgba(34, 197, 94, 0.2)', border: 'rgb(34, 197, 94)' },
        { bg: 'rgba(168, 85, 247, 0.2)', border: 'rgb(168, 85, 247)' },
      ];
      const color = colors[index % colors.length];
      
      return {
        label: dataset.label,
        data: dataset.data,
        backgroundColor: dataset.backgroundColor || color.bg,
        borderColor: dataset.borderColor || color.border,
        borderWidth: 2,
        pointBackgroundColor: dataset.borderColor || color.border,
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: dataset.borderColor || color.border,
      };
    }),
  };

  const options: ChartOptions<'radar'> = {
    responsive: true,
    maintainAspectRatio: true,
    scales: {
      r: {
        angleLines: {
          display: true,
          color: 'rgba(0, 0, 0, 0.1)',
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
        pointLabels: {
          font: {
            size: 12,
            weight: '500',
          },
          color: '#374151',
        },
        ticks: {
          stepSize: 1,
          backdropColor: 'transparent',
          color: '#9CA3AF',
        },
        suggestedMin: 0,
        suggestedMax: maxScale,
      },
    },
    plugins: {
      legend: {
        display: datasets.length > 1,
        position: 'top' as const,
        labels: {
          padding: 15,
          font: {
            size: 12,
            weight: '500',
          },
          usePointStyle: true,
          pointStyle: 'rect',
        },
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        titleFont: {
          size: 13,
          weight: 'bold',
        },
        bodyFont: {
          size: 12,
        },
        callbacks: {
          label: function(context) {
            return `${context.dataset.label}: ${context.parsed.r.toFixed(1)}/${maxScale}`;
          },
        },
      },
    },
  };

  return (
    <div className="bg-white rounded-lg p-6 border border-gray-200">
      <h4 className="text-center font-semibold text-gray-800 mb-4">{title}</h4>
      <div className={`${sizeClasses[size]} mx-auto`}>
        <Radar data={data} options={options} />
      </div>
    </div>
  );
}

