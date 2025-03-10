import React, { useState, useEffect, useRef } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Tooltip,
  Legend,
  Plugin,
  ChartDataset,
  Point
} from 'chart.js'
import { Line } from 'react-chartjs-2'
import { PriceHistoryGraphProps } from '../../types/Components'
import { Expand, Shrink } from 'lucide-react'
import './StockGraph.css'
import { mockHistory } from '../../assets/data/sampleStocks'
import { server } from '../../App.tsx'

ChartJS.register(LineElement, PointElement, LinearScale, CategoryScale, Tooltip, Legend)

interface CustomDataset extends ChartDataset<"line", (number | Point | null)[]> {
  image?: HTMLImageElement
}

interface StockHistoryData {
  name: string;
  oldValue: number;
  newValue: number;
  totalBuys: number;
  totalSells: number;
  totalQuantity: number;
  _id: string;
}

interface StockHistoryResponse {
  success: boolean;
  data: {
    [chapter: string]: StockHistoryData[];
  };
  message: string;
  statusCode: number;
}

const getColorForCharacter = (name: string) => {
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  const hue = Math.abs(hash) % 360
  return `hsl(${hue}, 65%, 50%)`
}

///////////////////////////////////////
//  TEMPORARY, TO REMOVE LATER !!!! //
/////////////////////////////////////

const generateMockStockHistory = () => {
  return mockHistory;
};

///////////////////////////////////////
//  TEMPORARY, TO REMOVE LATER !!!! //
/////////////////////////////////////


const DualRangeSlider: React.FC<{ min: number; max: number; start: number; end: number; onChange: (start: number, end: number) => void }> = ({ min, max, start, end, onChange }) => {
  const [localStart, setLocalStart] = useState(start)
  const [localEnd, setLocalEnd] = useState(end)

  useEffect(() => {
    setLocalStart(start)
    setLocalEnd(end)
  }, [start, end])

  const handleStartChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value)
    if (value < localEnd) {
      setLocalStart(value)
      onChange(value, localEnd)
    }
  }

  const handleEndChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value)
    if (value > localStart) {
      setLocalEnd(value)
      onChange(localStart, value)
    }
  }

  return (
    <div className="dual-range-slider">
      <div className="slider-container-with-label">
        <div className="range-label">Ch: {localStart}-{localEnd}</div>
        <div className="slider-track-container">
          <div className="track"></div>
          <input
            type="range"
            min={min}
            max={max}
            value={localStart}
            onChange={handleStartChange}
            className="range-slider range-slider-start"
          />
          <input
            type="range"
            min={min}
            max={max}
            value={localEnd}
            onChange={handleEndChange}
            className="range-slider range-slider-end"
          />
        </div>
      </div>
    </div>
  )
}

const PriceHistoryGraph: React.FC<PriceHistoryGraphProps> = ({ stocks, ownedStocks, onVisibilityChange, currentFilter }) => {
  const [chapterStart, setChapterStart] = useState<number>(0)
  const [chapterEnd, setChapterEnd] = useState<number>(0)
  const [chapterScale, setChapterScale] = useState<number>(1)
  const [filter, setFilter] = useState<'all' | 'owned' | 'popular' | 'unowned' | 'custom'>('all')
  const [isSidePanelOpen, setIsSidePanelOpen] = useState<boolean>(false)
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [isMobile, setIsMobile] = useState<boolean>(false)
  const [images, setImages] = useState<Record<string, HTMLImageElement>>({})
  const graphRef = useRef<HTMLDivElement>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [availableChapters, setAvailableChapters] = useState<number[]>([])
  const [usingMockData, setUsingMockData] = useState<boolean>(false);

  const { data: stockHistoryData, isLoading } = useQuery<StockHistoryResponse>({
    queryKey: ['stockHistory'],
    queryFn: async () => {
      const response = await fetch('https://backend.stockpiece.fun/api/v1/market/statistics/all')
      if (!response.ok) {
        throw new Error('Failed to fetch stock history')
      }
      return response.json()
    },
    staleTime: 15 * 60 * 1000, // Consider data fresh for 5 minutes
    gcTime: 30 * 60 * 1000, // Keep data in cache for 30 minutes
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: 0
  })

  // Process stock history data
  const stockHistory = React.useMemo(() => {
    if (!stockHistoryData?.success) {
      return {} // Return empty object if request failed
    }


    const hasData = Object.keys(stockHistoryData.data).length > 0;
    // 
    // TO REMOVE

    
    if (!hasData) {
      setUsingMockData(true);
      return generateMockStockHistory();
    }

    setUsingMockData(false);
    const processedHistory: Record<string, { chapter: number, value: number }[]> = {}
    const chapters: number[] = []

    // Convert the chapter keys to numbers and sort them
    const sortedChapters = Object.keys(stockHistoryData.data)
      .map(chapter => parseInt(chapter))
      .sort((a, b) => a - b)

    // Initialize the history arrays for each character
    stocks.forEach(stock => {
      processedHistory[stock.id] = []
    })

    // Populate the history data
    sortedChapters.forEach(chapter => {
      chapters.push(chapter)
      const chapterData = stockHistoryData.data[chapter.toString()]

      chapterData.forEach(stockData => {
        const stockId = stocks.find(s => s.name === stockData.name)?.id
        if (stockId && processedHistory[stockId]) {
          processedHistory[stockId].push({
            chapter,
            value: stockData.newValue
          })
        }
      })
    })

    return processedHistory
  }, [stockHistoryData, stocks])

  // Set available chapters when stock history data changes
  useEffect(() => {
    if (stockHistoryData?.success) {
      const chapters = Object.keys(stockHistoryData.data);
      if (chapters.length === 0) {  // TO REMOVE
        // No real data available, use mock data chapters
        const mockChapters = Array.from({ length: 20 }, (_, i) => i + 1);
        setAvailableChapters(mockChapters);

        // Set initial chapter range for mock data
        if (chapterStart === 0 && chapterEnd === 0) {
          setChapterStart(1);
          setChapterEnd(20);
        }
      } else {
        // Use real data chapters
        const sortedChapters = chapters
          .map(chapter => parseInt(chapter))
          .sort((a, b) => a - b);

        setAvailableChapters(sortedChapters);

        // Set initial chapter range
        if (sortedChapters.length > 0 && chapterStart === 0 && chapterEnd === 0) {
          setChapterStart(sortedChapters[0]);
          setChapterEnd(sortedChapters[sortedChapters.length - 1]);
        }
      }
    } 
    else if (usingMockData && availableChapters.length === 0 ) {
      const mockChapters = Array.from({ length: 20 }, (_, i) => i + 1);
      setAvailableChapters(mockChapters);

      // Set initial chapter range for mock data
      if (chapterStart === 0 && chapterEnd === 0) {
        setChapterStart(1);
        setChapterEnd(20);
      }
    }
  }, [stockHistoryData, chapterStart, chapterEnd, usingMockData])

  useEffect(() => {
    const imageMap: Record<string, HTMLImageElement> = {}
    stocks.forEach(stock => {
      if (stock.image) {
        const img = new Image()
        img.src = stock.image
        imageMap[stock.id] = img
      }
    })
    setImages(imageMap)
  }, [stocks])

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768)
    }
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    const newFilter = mapFilter(currentFilter)
    handleFilterChange(newFilter, false)
  }, [currentFilter])

  const mapFilter = (f: 'All' | 'Owned' | 'Popular') => {
    switch (f) {
      case 'All': return 'all'
      case 'Owned': return 'owned'
      case 'Popular': return 'popular'
      default: return 'all'
    }
  }

  const checkCustomState = () => {
    const isCustom = !stocks.every(stock => {
      if (filter === 'all') return stock.visibility === 'show'
      if (filter === 'owned')
        return ownedStocks.includes(stock.id) ? stock.visibility === 'show' : stock.visibility === 'hide'
      if (filter === 'popular')
        return stock.popularity > 7 ? stock.visibility === 'show' : 'hide'
      if (filter === 'unowned')
        return !ownedStocks.includes(stock.id) ? stock.visibility === 'show' : stock.visibility === 'hide'
      return true
    })
    if (isCustom && filter !== 'custom') {
      setFilter('custom')
    }
  }

  useEffect(() => {
    checkCustomState()
  }, [stocks])

  const handleFilterChange = (newFilter: 'all' | 'owned' | 'popular' | 'unowned' | 'custom', updateVisibilities = true) => {
    setFilter(newFilter)
    if (updateVisibilities && newFilter !== 'custom') {
      stocks.forEach(stock => {
        let newVisibility: 'show' | 'hide' = 'show'
        switch (newFilter) {
          case 'all':
            newVisibility = 'show'
            break
          case 'owned':
            newVisibility = ownedStocks.includes(stock.id) ? 'show' : 'hide'
            break
          case 'unowned':
            newVisibility = !ownedStocks.includes(stock.id) ? 'show' : 'hide'
            break
          case 'popular':
            // Select top 20% of stocks by popularity
            const topCount = Math.ceil(stocks.length * 0.2);
            const sortedByPopularity = [...stocks].sort((a, b) => b.popularity - a.popularity);
            const topStockIds = sortedByPopularity.slice(0, topCount).map(s => s.id);
            newVisibility = topStockIds.includes(stock.id) ? 'show' : 'hide';
            break;
        }
        onVisibilityChange(stock.id, newVisibility)
      })
    }
  }

  // Memoize chart data to prevent unnecessary recalculations
  const { labels, datasets, dynamicScaleFactor, dynamicScaleUnit } = React.useMemo(() => {
    const filteredLabels = availableChapters.filter(chapter => chapter >= chapterStart && chapter <= chapterEnd)
    const labels = filteredLabels.filter((_, i) => i % chapterScale === 0)

    const datasets: CustomDataset[] = stocks
      .filter(stock => stock.visibility !== 'hide' && stockHistory[stock.id]?.length > 0)
      .map(stock => {
        const stockData = stockHistory[stock.id] || []
        const filteredData = stockData.filter(entry => entry.chapter >= chapterStart && entry.chapter <= chapterEnd)

        // Find the closest data points for each label
        const data = labels.map(chapter => {
          const closest = filteredData.find(entry => entry.chapter === chapter)
          return closest ? closest.value : null
        })

        return {
          label: stock.name,
          data,
          borderColor: getColorForCharacter(stock.name),
          borderWidth: 2,
          pointRadius: 0,
          tension: 0.4,
          image: images[stock.id]
        }
      })

    const displayedAllValues: number[] = []
    stocks.forEach(stock => {
      if (stock.visibility !== 'hide' && stockHistory[stock.id]?.length > 0) {
        const stockData = stockHistory[stock.id] || []
        const filteredData = stockData.filter(entry => entry.chapter >= chapterStart && entry.chapter <= chapterEnd)

        labels.forEach(chapter => {
          const closest = filteredData.find(entry => entry.chapter === chapter)
          if (closest) {
            displayedAllValues.push(closest.value)
          }
        })
      }
    })

    const maxValue = displayedAllValues.length > 0 ? Math.max(...displayedAllValues) : 0
    let dynamicScaleFactor = 1
    let dynamicScaleUnit = ""
    if (maxValue >= 1e9) {
      dynamicScaleFactor = 1e9
      dynamicScaleUnit = "B"
    } else if (maxValue >= 1e6) {
      dynamicScaleFactor = 1e6
      dynamicScaleUnit = "M"
    } else if (maxValue >= 1e3) {
      dynamicScaleFactor = 1e3
      dynamicScaleUnit = "K"
    }

    return { labels, datasets, dynamicScaleFactor, dynamicScaleUnit }
  }, [stocks, stockHistory, availableChapters, chapterStart, chapterEnd, chapterScale, images])

  const plugins: Plugin<'line'>[] = [
    {
      id: 'endPointMarker',
      afterDatasetsDraw: (chart) => {
        const ctx = chart.ctx
        ctx.save()
        chart.data.datasets.forEach((dataset, i) => {
          const ds = dataset as CustomDataset
          const meta = chart.getDatasetMeta(i)
          if (meta.hidden) return
          const lastPoint = meta.data[meta.data.length - 1]
          if (!lastPoint) return

          const x = lastPoint.x
          const y = lastPoint.y
          const radius = 15
          const centerX = x
          let centerY = y - radius;
          if (centerY - radius < 0) {
            centerY = radius;
          }
          if (ds.image && ds.image.complete) {
            ctx.save()
            ctx.beginPath()
            ctx.arc(centerX, centerY, radius, 0, Math.PI * 2)
            ctx.clip()
            ctx.drawImage(ds.image, centerX - radius, centerY - radius, 2 * radius, 2 * radius)
            ctx.restore()
            ctx.beginPath()
            ctx.arc(centerX, centerY, radius, 0, Math.PI * 2)
            ctx.strokeStyle = ds.borderColor as string
            ctx.lineWidth = 2
            ctx.stroke()
          } else {
            ctx.beginPath()
            ctx.arc(centerX, centerY, radius, 0, Math.PI * 2)
            ctx.fillStyle = ds.borderColor as string
            ctx.fill()
            ctx.fillStyle = '#ffffff'
            ctx.font = 'bold 14px "Pirata One"'
            ctx.textAlign = 'center'
            ctx.textBaseline = 'middle'
            ctx.fillText(ds.label?.[0] || '', centerX, centerY)
          }
        })
        ctx.restore()
      }
    }
  ]

  const options = React.useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'nearest' as const, intersect: false },
    layout: { padding: { right: 20, top: 10 } },
    plugins: {
      tooltip: {
        callbacks: {
          title: (tooltipItems: any[]) => `Chapter ${tooltipItems[0].label}`,
          label: (context: any) => {
            const value = context.parsed.y
            return `${context.dataset.label}: ${(value / dynamicScaleFactor).toFixed(1)}${dynamicScaleUnit}`
          }
        },
        displayColors: false,
        backgroundColor: '#fff5e6',
        titleFont: { family: 'Pirata One', size: 18, weight: 'bold' as const },
        bodyFont: { family: 'Pirata One', size: 16 },
        padding: 12,
        borderColor: '#3e2f28',
        borderWidth: 2,
        bodyColor: '#3e2f28',
        titleColor: '#b22222',
        cornerRadius: 5,
        boxShadow: '3px 3px 0 #3e2f28'
      },
      legend: { display: false }
    },
    scales: {
      x: {
        title: { display: true, text: 'Chapters', font: { family: 'Pirata One', size: 14 }, color: '#3e2f28' },
        ticks: { color: '#3e2f28', font: { family: 'Pirata One', size: 12 } },
        grid: { color: '#3e2f2833' }
      },
      y: {
        title: { display: !isMobile, text: isMobile ? '' : `Berry (${dynamicScaleUnit})`, font: { family: 'Pirata One', size: 14 }, color: '#3e2f28' },
        ticks: {
          color: '#3e2f28', font: { family: 'Pirata One', size: 12 }, callback: function (tickValue: number | string): string {
            const value = Number(tickValue)
            return `${(value / dynamicScaleFactor).toFixed(1)}${dynamicScaleUnit}`
          }
        },
        grid: { color: '#3e2f2833' }
      }
    }
  }), [dynamicScaleFactor, dynamicScaleUnit, isMobile])

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(document.fullscreenElement === graphRef.current)
    }
    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange)
  }, [])

  const handleFullscreen = async () => {
    if (!isFullscreen) {
      try {
        const isIOS = /(iPad|iPhone|iPod)/g.test(navigator.userAgent);

        if (graphRef.current && !isIOS) {
          await graphRef.current.requestFullscreen();

          if ('orientation' in screen && 'lock' in (screen.orientation as any)) {
            try {
              await (screen.orientation as any).lock('landscape');
            } catch (orientationErr) {
              console.error('Failed to lock screen orientation:', orientationErr);
            }
          }
        } else {
          if (graphRef.current) {
            const originalStyles = {
              position: graphRef.current.style.position,
              top: graphRef.current.style.top,
              left: graphRef.current.style.left,
              width: graphRef.current.style.width,
              height: graphRef.current.style.height,
              zIndex: graphRef.current.style.zIndex
            };

            graphRef.current.dataset.originalStyles = JSON.stringify(originalStyles);

            graphRef.current.classList.add('fullscreen-ios');

            // Explicitly reposition the fullscreen button for iOS
            const fsButton = graphRef.current.querySelector('.fullscreen-button') as HTMLElement;
            if (fsButton) {
              fsButton.style.left = '10px';
              fsButton.style.right = 'auto';
            }

            // Add iOS orientation tip
            const orientationTip = document.createElement('div');
            orientationTip.innerText = "IOS doesn't support fullscreen :( Might not work well."
            orientationTip.id = 'ios-orientation-tip';
            orientationTip.className = 'ios-orientation-tip';

            // Auto-hide the tip after 5 seconds
            setTimeout(() => {
              orientationTip.classList.add('fade-out');
              setTimeout(() => {
                if (graphRef.current && graphRef.current.contains(orientationTip)) {
                  graphRef.current.removeChild(orientationTip);
                }
              }, 3000);
            }, 5000);

            graphRef.current.appendChild(orientationTip);
          }
        }
        setIsFullscreen(true);
      } catch (err) {
        console.error('Failed to enter fullscreen or lock orientation', err);
      }
    } else {
      // Check for iOS only when needed
      const isIOS = /(iPad|iPhone|iPod)/g.test(navigator.userAgent);

      // Exit fullscreen for standard devices
      if (!isIOS && document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        // Exit custom fullscreen for iOS
        exitCustomFullscreen();
      }
      setIsFullscreen(false);
    }
  };

  const exitCustomFullscreen = () => {
    if (graphRef.current && graphRef.current.dataset.originalStyles) {
      const originalStyles = JSON.parse(graphRef.current.dataset.originalStyles);
      Object.assign(graphRef.current.style, originalStyles);

      // Remove iOS-specific class
      graphRef.current.classList.remove('fullscreen-ios');

      // Reset fullscreen button position
      const fsButton = graphRef.current.querySelector('.fullscreen-button') as HTMLElement;
      if (fsButton) {
        fsButton.style.left = '';
        fsButton.style.right = '10px';
      }

      // Remove orientation tip if it exists
      const orientationTip = document.getElementById('ios-orientation-tip');
      if (orientationTip && graphRef.current.contains(orientationTip)) {
        graphRef.current.removeChild(orientationTip);
      }
    }
  };
  return (
    <div className={`graph-container ${isFullscreen ? 'fullscreen' : ''}`} ref={graphRef}>
      <div className="graph-controls">
        <div className="advanced-options-button">
          <select value={filter} onChange={(e) => handleFilterChange(e.target.value as any)} className="pirate-select">
            <option value="all">All Stocks</option>
            <option value="popular">Popular Stocks</option>
            <option value="owned">My Crew</option>
            <option value="unowned">Unowned</option>
            <option value="custom" style={{ display: filter === 'custom' ? 'block' : 'none' }}>Custom</option>
          </select>
          <div className="settings-tooltip-container">
            <img src="/assets/settings.png" alt="Pirate Wheel" className="pirate-wheel" onClick={() => setIsSidePanelOpen(!isSidePanelOpen)} />
          </div>
        </div>
        <div className="slider-container">
          <DualRangeSlider
            min={availableChapters.length > 0 ? availableChapters[0] : 0}
            max={availableChapters.length > 0 ? availableChapters[availableChapters.length - 1] : 0}
            start={chapterStart}
            end={chapterEnd}
            onChange={(s, e) => { setChapterStart(s); setChapterEnd(e) }}
          />
          <div className="scale-slider">
            <span>Scale: {chapterScale}</span>
            <input type="range" min="1" max={Math.max(2, Math.floor((availableChapters.filter(chapter => chapter >= chapterStart && chapter <= chapterEnd).length) / 5))} value={chapterScale} onChange={(e) => setChapterScale(Number(e.target.value))} />
          </div>
        </div>
      </div>
      <div className={`side-panel ${isSidePanelOpen ? 'open' : ''}`}>
        <div className="panel-header">
          <select value={filter} onChange={(e) => handleFilterChange(e.target.value as any)} className="pirate-select sidebar-select">
            <option value="all">All Stocks</option>
            <option value="popular">Popular Stocks</option>
            <option value="owned">My Crew</option>
            <option value="unowned">Unowned</option>
            <option value="custom" style={{ display: filter === 'custom' ? 'block' : 'none' }}>Custom</option>
          </select>
          <div className="settings-tooltip-container">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="pirate-wheel" fill="currentColor" onClick={() => setIsSidePanelOpen(false)}>
              <path d="M18.3 5.71a.996.996 0 00-1.41 0L12 10.59 7.11 5.7A.996.996 0 105.7 7.11L10.59 12 5.7 16.89a.996.996 0 101.41 1.41L12 13.41l4.89 4.89a.996.996 0 101.41-1.41L13.41 12l4.89-4.89c.38-.38.38-1.02 0-1.4z" />
            </svg>
          </div>
        </div>
        <div className="panel-controls">
          <input type="text" className="search-bar" placeholder="Search characters.." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
        </div>
        <div className="character-list">
          {stocks.filter(stock => stock.name.toLowerCase().includes(searchQuery.toLowerCase())).map(stock => (
            <div key={stock.id} className="character-checkbox">
              <input type="checkbox" id={stock.id} checked={stock.visibility !== 'hide'} onChange={(e) => { onVisibilityChange(stock.id, e.target.checked ? 'show' : 'hide') }} />
              <label htmlFor={stock.id}>
                <span className="color-box" style={{ backgroundColor: getColorForCharacter(stock.name) }} />
                {stock.name}
              </label>
            </div>
          ))}
        </div>
      </div>
      <div className="chart-wrapper">
        {isLoading ? (
          <div className="graph-spinner-overlay">
            <div className="spinner"></div>
          </div>
        ) : (
          <>
            {usingMockData && (
              <div className="mock-data-notice">
                <p>This is an example history. Actual history will be shown from next chapter</p>
              </div>
            )}
            <Line
              key={`chart-${chapterStart}-${chapterEnd}-${chapterScale}`}
              data={{ labels, datasets }}
              options={options}
              plugins={plugins}
            />
          </>
        )}

      </div>
      <div className="fullscreen-button">
        <button onClick={handleFullscreen}>
          {isFullscreen ? <Shrink className="fullscreen-icon" /> : <Expand className="fullscreen-icon" />}
        </button>
      </div>
    </div>
  )
}

export default PriceHistoryGraph