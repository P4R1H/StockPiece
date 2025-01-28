import { useState } from 'react';
import { Chart as ChartJS, LineElement, PointElement, LinearScale, CategoryScale, Tooltip, Legend } from 'chart.js';
import { Line } from 'react-chartjs-2';
import { CharacterStock } from '../../types/CharacterStock';
import './PriceHistoryGraph.css';

ChartJS.register(LineElement, PointElement, LinearScale, CategoryScale, Tooltip, Legend);

interface PriceHistoryGraphProps {
  stocks: CharacterStock[];
  ownedStocks: string[];
}

const PriceHistoryGraph: React.FC<PriceHistoryGraphProps> = ({ stocks, ownedStocks }) => {
  const [filter, setFilter] = useState<'all' | 'owned' | 'popular' | 'unowned'>('all');
  const [visibleChapters, setVisibleChapters] = useState<number>(10);
  const [chapterScale, setChapterScale] = useState<number>(1);

  const generatePirateColor = () => {
    const colors = ['#3e2f28', '#b22222', '#1e90ff', '#228b22', '#8b4513', '#ffd700'];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  const generateHistory = (length: number) => 
    Array.from({ length }, (_, i) => Math.floor(Math.random() * 5000000) + 1000000);

  const filteredStocks = stocks.filter(stock => {
    if (filter === 'owned') return ownedStocks.includes(stock.name);
    if (filter === 'unowned') return !ownedStocks.includes(stock.name);
    if (filter === 'popular') return stock.popularity > 75;
    return true;
  });

  const labels = Array.from(
    { length: Math.ceil(visibleChapters / chapterScale) },
    (_, index) => index * chapterScale + 1
  );

  const datasets = filteredStocks.map(stock => {
    const history = generateHistory(visibleChapters);
    const data = labels.map(chapter => history[chapter - 1]);
    return {
      label: stock.name,
      data,
      borderColor: generatePirateColor(),
      borderWidth: 2,
      pointRadius: 0,
      tension: 0.4,
    };
  });

  const plugins = [{
    id: 'endPointMarker',
    afterDatasetsDraw: (chart) => {
      const ctx = chart.ctx;
      ctx.save();
      chart.data.datasets.forEach((dataset, i) => {
        const meta = chart.getDatasetMeta(i);
        if (meta.hidden) return;
        
        const lastPoint = meta.data[meta.data.length - 1];
        const x = lastPoint.x;
        const y = lastPoint.y;

        // Draw pirate emblem
        ctx.beginPath();
        ctx.arc(x, y - 10, 15, 0, Math.PI * 2);
        ctx.fillStyle = dataset.borderColor;
        ctx.fill();
        
        // Draw initial letter
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 14px "Pirata One"';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(dataset.label[0], x, y - 10);
      });
      ctx.restore();
    }
  }];

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'nearest' as const,
      intersect: false,
    },
    plugins: {
      tooltip: {
        callbacks: {
          title: (tooltipItems: any[]) => `Chapter ${tooltipItems[0].label}`,
          label: (context: any) => {
            const value = context.parsed.y;
            return `${context.dataset.label}: ${(value / 1000000).toFixed(1)}M`;
          }
        },
        displayColors: false,
        backgroundColor: '#3e2f28',  // Changed to dark brown
        titleColor: '#ffd700',      // Gold color for title
        bodyColor: '#ffffff',       // White color for body text
        titleFont: { family: 'Pirata One', size: 14 },
        bodyFont: { family: 'Pirata One', size: 13 },
        padding: 10,
        cornerRadius: 6
      },
      legend: {
        labels: {
          font: { family: 'Pirata One' },
          color: '#3e2f28',
          usePointStyle: true,
        }
      }
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Chapters',
          font: { family: 'Pirata One' },
          color: '#3e2f28'
        },
        ticks: {
          color: '#3e2f28',
          font: { family: 'Pirata One' }
        },
        grid: { color: '#3e2f2833' }
      },
      y: {
        title: {
          display: true,
          text: 'Belly (百万)',
          font: { family: 'Pirata One' },
          color: '#3e2f28'
        },
        ticks: {
          color: '#3e2f28',
          font: { family: 'Pirata One' },
          callback: (value: number) => `${(value / 1000000).toFixed(1)}M`
        },
        grid: { color: '#3e2f2833' }
      }
    }
  };

  return (
    <div className="graph-container">
      <div className="graph-controls">
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value as any)}
          className="pirate-select"
        >
          <option value="all">All Stocks</option>
          <option value="popular">Popular Stocks</option>
          <option value="owned">My Crew</option>
          <option value="unowned">Unowned</option>
        </select>

        <div className="slider-container">
          <div className="chapter-slider">
            <span>Chapters: {visibleChapters}</span>
            <input
              type="range"
              min="10"
              max="100"
              value={visibleChapters}
              onChange={(e) => setVisibleChapters(Number(e.target.value))}
            />
          </div>
          
          <div className="scale-slider">
            <span>Scale: {chapterScale}</span>
            <input
              type="range"
              min="1"
              max="10"
              value={chapterScale}
              onChange={(e) => setChapterScale(Number(e.target.value))}
            />
          </div>
        </div>
      </div>

      <div className="chart-wrapper">
        <Line 
          data={{ labels, datasets }}
          options={options}
          plugins={plugins}
        />
      </div>
    </div>
  );
};

export default PriceHistoryGraph;