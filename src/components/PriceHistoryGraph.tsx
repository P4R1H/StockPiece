import React from 'react';
import { Line } from 'react-chartjs-2';
import { CharacterStock } from '../types/CharacterStock';
import 'chart.js/auto'; // Automatically register Chart.js components
import './PriceHistoryGraph.css';

interface PriceHistoryGraphProps {
  stocks: CharacterStock[];
}

const PriceHistoryGraph: React.FC<PriceHistoryGraphProps> = ({ stocks }) => {
  const data = {
    labels: Array.from({ length: 10 }, (_, i) => `Chapter ${i + 1}`), // Placeholder chapters
    datasets: stocks.map(stock => ({
      label: stock.name,
      data: Array.from({ length: 10 }, () => Math.floor(Math.random() * 5000)), // Placeholder price history
      borderColor: `#${Math.floor(Math.random() * 16777215).toString(16)}`,
      tension: 0.4,
      fill: false,
    })),
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { position: 'top' as const },
    },
    scales: {
      x: { title: { display: true, text: 'Chapter Number' } },
      y: { title: { display: true, text: 'Price (Bellies)' } },
    },
  };

  return (
    <div className="price-history-graph">
      <h2>Stock Price History</h2>
      <Line data={data} options={options} />
    </div>
  );
};

export default PriceHistoryGraph;
