'use client'

import { useEffect, useRef, useState } from 'react'
import Chart from 'chart.js/auto'
import { SalesData } from '../actions/process-sales-data'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface SalesChartProps {
  salesData: SalesData[]
  predictions: {[key: string]: number[]}
}

export default function SalesChart({ salesData, predictions }: SalesChartProps) {
  const chartRef = useRef<HTMLCanvasElement | null>(null)
  const chartInstance = useRef<Chart | null>(null)
  const [selectedArticles, setSelectedArticles] = useState<string[]>([])

  const articles = Array.from(new Set(salesData.map(d => d.article)))

  useEffect(() => {
    if (chartRef.current) {
      const ctx = chartRef.current.getContext('2d')

      if (ctx) {
        if (chartInstance.current) {
          chartInstance.current.destroy()
        }

        const groupedData = salesData.reduce((acc, { date, article, sales }) => {
          if (!acc[article]) {
            acc[article] = {}
          }
          acc[article][date] = (acc[article][date] || 0) + sales
          return acc
        }, {} as Record<string, Record<string, number>>)

        const dates = Array.from(new Set(salesData.map(d => d.date))).sort()
        const filteredArticles = selectedArticles.length > 0 ? selectedArticles : articles

        const datasets = filteredArticles.flatMap(article => {
          const historicalData = dates.map(date => groupedData[article][date] || 0)
          const predictionData = new Array(dates.length).fill(null).concat(predictions[article] || [])
          
          return [
            {
              label: `${article} (Historical)`,
              data: historicalData,
              borderColor: `hsl(${Math.random() * 360}, 70%, 50%)`,
              tension: 0.1
            },
            {
              label: `${article} (Predicted)`,
              data: predictionData,
              borderColor: `hsl(${Math.random() * 360}, 70%, 50%)`,
              borderDash: [5, 5],
              tension: 0.1
            }
          ]
        })

        const allDates = [...dates, ...dates.slice(-1).map((lastDate, index) => {
          const date = new Date(lastDate)
          date.setDate(date.getDate() + index + 1)
          return date.toISOString().split('T')[0]
        })]

        chartInstance.current = new Chart(ctx, {
          type: 'line',
          data: {
            labels: allDates,
            datasets: datasets
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              y: {
                beginAtZero: true,
                title: {
                  display: true,
                  text: 'Sales'
                }
              },
              x: {
                title: {
                  display: true,
                  text: 'Date'
                }
              }
            },
            plugins: {
              legend: {
                position: 'top',
              },
              title: {
                display: true,
                text: 'Sales by Article Over Time (with Predictions)'
              }
            }
          }
        })
      }
    }

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy()
      }
    }
  }, [salesData, predictions, selectedArticles])

  const handleArticleSelection = (value: string) => {
    setSelectedArticles(prev => 
      prev.includes(value) 
        ? prev.filter(a => a !== value)
        : [...prev, value]
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sales Chart</CardTitle>
        <CardDescription>Select articles to compare</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <Select onValueChange={handleArticleSelection}>
            <SelectTrigger>
              <SelectValue placeholder="Select articles" />
            </SelectTrigger>
            <SelectContent>
              {articles.map(article => (
                <SelectItem key={article} value={article}>
                  {article}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="h-[400px]">
          <canvas ref={chartRef}></canvas>
        </div>
      </CardContent>
    </Card>
  )
}

