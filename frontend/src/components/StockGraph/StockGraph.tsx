import { useState, useEffect } from 'react'
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
import './StockGraph.css'

ChartJS.register(LineElement, PointElement, LinearScale, CategoryScale, Tooltip, Legend)

interface CustomDataset extends ChartDataset<"line", (number | Point | null)[]> {
  image?: HTMLImageElement
}

const getColorForCharacter = (name: string) => {
  const colors = ['#3e2f28', '#b22222', '#1e90ff', '#228b22', '#8b4513', '#ffd700']
  const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  return colors[hash % colors.length]
}

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
        return stock.popularity > 7 ? stock.visibility === 'show' : stock.visibility === 'hide'
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
            newVisibility = stock.popularity > 7 ? 'show' : 'hide'
            break
        }
        onVisibilityChange(stock.id, newVisibility)
      })
    }
  }

  useEffect(() => {
    if (stocks.length > 0 && stocks[0].valueHistory && stocks[0].valueHistory.length > 0) {
      const minChapter = stocks[0].valueHistory[0].chapter
      const maxChapter = stocks[0].valueHistory[stocks[0].valueHistory.length - 1].chapter
      setChapterStart(minChapter)
      setChapterEnd(maxChapter)
    }
  }, [stocks])

  const filteredHistory = stocks.length > 0 && stocks[0].valueHistory ? stocks[0].valueHistory.filter(entry => entry.chapter >= chapterStart && entry.chapter <= chapterEnd) : []
  const labels = filteredHistory.filter((_, i) => i % chapterScale === 0).map(entry => entry.chapter)
  
  const datasets: CustomDataset[] = stocks
    .filter(stock => stock.visibility !== 'hide' && stock.valueHistory?.length > 0)
    .map(stock => {
      const filteredData = stock.valueHistory.filter(entry => entry.chapter >= chapterStart && entry.chapter <= chapterEnd)
      const data = filteredData.filter((_, i) => i % chapterScale === 0).map(entry => entry.value)
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
    if (stock.visibility !== 'hide' && stock.valueHistory?.length > 0) {
      const filteredData = stock.valueHistory.filter(entry => entry.chapter >= chapterStart && entry.chapter <= chapterEnd)
      filteredData.filter((_, i) => i % chapterScale === 0).forEach(entry => displayedAllValues.push(entry.value))
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
          const x = lastPoint.x
          const y = lastPoint.y
          const radius = 15
          const centerX = x
          const centerY = y - radius
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

  const options = {
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
        title: { display: !isMobile, text: isMobile ? '' : `Belly (${dynamicScaleUnit})`, font: { family: 'Pirata One', size: 14 }, color: '#3e2f28' },
        ticks: { color: '#3e2f28', font: { family: 'Pirata One', size: 12 }, callback: function (tickValue: number | string): string {
          const value = Number(tickValue)
          return `${(value / dynamicScaleFactor).toFixed(1)}${dynamicScaleUnit}`
        }},
        grid: { color: '#3e2f2833' }
      }
    }
  }

  return (
    <div className="graph-container">
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
          <DualRangeSlider min={stocks.length > 0 && stocks[0].valueHistory ? stocks[0].valueHistory[0].chapter : 0} max={stocks.length > 0 && stocks[0].valueHistory ? stocks[0].valueHistory[stocks[0].valueHistory.length - 1].chapter : 0} start={chapterStart} end={chapterEnd} onChange={(s, e) => { setChapterStart(s); setChapterEnd(e) }} />
          <div className="scale-slider">
            <span>Scale: {chapterScale}</span>
            <input type="range" min="1" max={filteredHistory.length} value={chapterScale} onChange={(e) => setChapterScale(Number(e.target.value))} />
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
          <button className="close-button" onClick={() => setIsSidePanelOpen(false)}>×</button>
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
        <Line data={{ labels, datasets }} options={options} plugins={plugins} />
      </div>
    </div>
  )
}

export default PriceHistoryGraph
