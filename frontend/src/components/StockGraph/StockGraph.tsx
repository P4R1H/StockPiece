import { useState, useEffect } from 'react';
import { Chart as ChartJS, LineElement, PointElement, LinearScale, CategoryScale, Tooltip, Legend, Plugin } from 'chart.js';
import { Line } from 'react-chartjs-2';
import { PriceHistoryGraphProps } from '../../types/Components';
import './StockGraph.css';

ChartJS.register(LineElement, PointElement, LinearScale, CategoryScale, Tooltip, Legend);

const getColorForCharacter = (name: string) => {
  const colors = ['#3e2f28', '#b22222', '#1e90ff', '#228b22', '#8b4513', '#ffd700'];
  const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return colors[hash % colors.length];
};

const PriceHistoryGraph: React.FC<PriceHistoryGraphProps> = ({ 
  stocks, 
  ownedStocks,
  onVisibilityChange,
  currentFilter
}) => {
  const [filter, setFilter] = useState<'all' | 'owned' | 'popular' | 'unowned' | 'custom'>('all');
  const [visibleChapters, setVisibleChapters] = useState<number>(10);
  const [chapterScale, setChapterScale] = useState<number>(1);
  const [isSidePanelOpen, setIsSidePanelOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  useEffect(() => {
    const newFilter = mapFilter(currentFilter);
    handleFilterChange(newFilter, false);
  }, [currentFilter]);

  const mapFilter = (f: 'All' | 'Owned' | 'Popular') => {
    switch (f) {
      case 'All': return 'all';
      case 'Owned': return 'owned';
      case 'Popular': return 'popular';
      default: return 'all';
    }
  };

  const checkCustomState = () => {
    const isCustom = !stocks.every(stock => {
      if (filter === 'all') return stock.visibility === 'show';
      if (filter === 'owned') return ownedStocks.includes(stock.id) ? stock.visibility === 'show' : stock.visibility === 'hide';
      if (filter === 'popular') return stock.popularity > 7 ? stock.visibility === 'show' : stock.visibility === 'hide';
      if (filter === 'unowned') return !ownedStocks.includes(stock.id) ? stock.visibility === 'show' : stock.visibility === 'hide';
      return true;
    });
    
    if (isCustom && filter !== 'custom') {
      setFilter('custom');
    }
  };

  useEffect(() => {
    checkCustomState();
  }, [stocks]);

  const generateHistory = (length: number) => 
    Array.from({ length }, () => Math.floor(Math.random() * 5000000) + 1000000);

  const handleFilterChange = (newFilter: 'all' | 'owned' | 'popular' | 'unowned' | 'custom', updateVisibilities = true) => {
    setFilter(newFilter);
    
    if (updateVisibilities && newFilter !== 'custom') {
      stocks.forEach((stock) => {
        let newVisibility: 'show' | 'hide' = 'show';
        switch (newFilter) {
          case 'all':
            newVisibility = 'show';
            break;
          case 'owned':
            newVisibility = ownedStocks.includes(stock.id) ? 'show' : 'hide';
            break;
          case 'unowned':
            newVisibility = !ownedStocks.includes(stock.id) ? 'show' : 'hide';
            break;
          case 'popular':
            newVisibility = stock.popularity > 7 ? 'show' : 'hide';
            break;
        }
        onVisibilityChange(stock.id, newVisibility);
      });
    }
  };

  const labels = Array.from(
    { length: Math.ceil(visibleChapters / chapterScale) },
    (_, index) => index * chapterScale + 1
  );

  const datasets = stocks
    .filter(stock => stock.visibility !== 'hide')
    .map(stock => {
      const history = generateHistory(visibleChapters);
      const data = labels.map(chapter => history[chapter - 1]);
      return {
        label: stock.name,
        data,
        borderColor: getColorForCharacter(stock.name),
        borderWidth: 2,
        pointRadius: 0,
        tension: 0.4,
      };
    });

  const plugins: Plugin<'line'>[] = [{
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

        ctx.beginPath();
        ctx.arc(x, y - 10, 15, 0, Math.PI * 2);
        ctx.fillStyle = dataset.borderColor as string;
        ctx.fill();
        
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 14px "Pirata One"';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(dataset.label?.[0] || '', x, y - 10);
      });
      ctx.restore();
    }
  }];

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'nearest' as const, intersect: false },
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
        backgroundColor: '#fff5e6',
        titleFont: { family: 'Pirata One', size: 16 },
        bodyFont: { family: 'Pirata One', size: 14 },
        borderColor: '#3e2f28',
        borderWidth: 2,
        bodyColor: '#3e2f28',
        titleColor: '#b22222',
        padding: 12,
        cornerRadius: 5,
        boxShadow: '3px 3px 0 #3e2f28'
      },
      legend: { display: false }
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Chapters',
          font: { family: 'Pirata One', size: 14 },
          color: '#3e2f28'
        },
        ticks: { color: '#3e2f28', font: { family: 'Pirata One', size: 12 } },
        grid: { color: '#3e2f2833' }
      },
      y: {
        title: {
          display: true,
          text: 'Belly (百万)',
          font: { family: 'Pirata One', size: 14 },
          color: '#3e2f28'
        },
        ticks: {
          color: '#3e2f28',
          font: { family: 'Pirata One', size: 12 },
          callback: function(tickValue: number | string): string {
            const value = Number(tickValue);
            return `${(value / 1000000).toFixed(1)}M`;
          }
        },
        grid: { color: '#3e2f2833' }
      }
    }
  };

  return (
    <div className="graph-container">
      <div className="graph-controls">
        <div className="advanced-options-button">
          <select
            value={filter}
            onChange={(e) => handleFilterChange(e.target.value as any)}
            className="pirate-select"
          >
            <option value="all">All Stocks</option>
            <option value="popular">Popular Stocks</option>
            <option value="owned">My Crew</option>
            <option value="unowned">Unowned</option>
            <option value="custom" style={{display: filter === 'custom' ? 'block' : 'none'}}>Custom</option>
          </select>
          <div className="settings-tooltip-container">
            <img
              src="/assets/settings.png"
              alt="Pirate Wheel"
              className="pirate-wheel"
              onClick={() => setIsSidePanelOpen(!isSidePanelOpen)}
            />
          </div>
        </div>

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

      <div className={`side-panel ${isSidePanelOpen ? 'open' : ''}`}>
        <div className="panel-header">
          <select
            value={filter}
            onChange={(e) => handleFilterChange(e.target.value as any)}
            className="pirate-select sidebar-select"
          >
            <option value="all">All Stocks</option>
            <option value="popular">Popular Stocks</option>
            <option value="owned">My Crew</option>
            <option value="unowned">Unowned</option>
            <option value="custom" style={{display: filter === 'custom' ? 'block' : 'none'}}>Custom</option>
          </select>
          <button className="close-button" onClick={() => setIsSidePanelOpen(false)}>
            ×
          </button>
        </div>

        <div className="panel-controls">
          <input
            type="text"
            className="search-bar"
            placeholder="Search characters..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="character-list">
          {stocks
            .filter(stock => stock.name.toLowerCase().includes(searchQuery.toLowerCase()))
            .map(stock => (
              <div key={stock.id} className="character-checkbox">
                <input
                  type="checkbox"
                  id={stock.id}
                  checked={stock.visibility !== 'hide'}
                  onChange={(e) => {
                    onVisibilityChange(
                      stock.id,
                      e.target.checked ? 'show' : 'hide'
                    );
                  }}
                />
                <label htmlFor={stock.id}>
                  <span 
                    className="color-box"
                    style={{ backgroundColor: getColorForCharacter(stock.name) }}
                  />
                  {stock.name}
                </label>
              </div>
            ))}
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