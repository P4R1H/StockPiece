import React from 'react';
import { Line } from 'react-chartjs-2';
import { CharacterStock } from '../../types/CharacterStock';
import 'chart.js/auto';
import './PriceHistoryGraph.css';

interface PriceHistoryGraphProps {
  stocks: CharacterStock[];
}

const PriceHistoryGraph: React.FC<PriceHistoryGraphProps> = ({ stocks }) => {
  // Generate random colors for each stock's line
  const generateRandomColor = () => {
    return `#${Math.floor(Math.random() * 16777215).toString(16)}`;
  };

  const data = {
    labels: Array.from({ length: 10 }, (_, i) => `Chapter ${i + 1}`), // Placeholder chapters
    datasets: stocks.map(stock => ({
      label: stock.name,
      data: Array.from({ length: 10 }, () => Math.floor(Math.random() * 5000)), // Placeholder price history
      borderColor: generateRandomColor(),
      tension: 0.4,
      fill: false,
      borderWidth: 3,
      pointRadius: 5,
      pointBackgroundColor: '#ffcc00',
      pointBorderColor: '#3e2f28',
    })),
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          font: {
            family: 'Pirata One, cursive',
            size: 16,
          },
          color: '#3e2f28',
        },
      },
      title: {
        display: true,
        text: 'Stock Price History (Bellies)',
        font: {
          family: 'Pirata One, cursive',
          size: 20,
        },
        color: '#3e2f28',
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Chapter Number',
          font: {
            family: 'Pirata One, cursive',
            size: 16,
          },
          color: '#3e2f28',
        },
        grid: {
          color: '#3e2f28',
          borderColor: '#3e2f28',
        },
        ticks: {
          color: '#3e2f28',
          font: {
            family: 'Pirata One, cursive',
            size: 14,
          },
        },
      },
      y: {
        title: {
          display: true,
          text: 'Price (Bellies)',
          font: {
            family: 'Pirata One, cursive',
            size: 16,
          },
          color: '#3e2f28',
        },
        grid: {
          color: '#3e2f28',
          borderColor: '#3e2f28',
        },
        ticks: {
          color: '#3e2f28',
          font: {
            family: 'Pirata One, cursive',
            size: 14,
          },
        },
      },
    },
  };

  return (
    <div className="price-history-graph">
      <Line data={data} options={options} />
    </div>
  );
};

export default PriceHistoryGraph;