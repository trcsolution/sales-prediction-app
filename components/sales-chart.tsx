'use client'

import { useEffect, useRef, useState } from 'react'
import Chart from 'chart.js/auto'
import { SalesData } from '@/app/actions/process-sales-data'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface SalesChartProps {
  salesData: SalesData[]
  predictions: SalesData[]
  startDate: string
  daysToPredict: number
}

export default function SalesChart({ salesData, predictions, startDate, daysToPredict }: SalesChartProps) {
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

        const startDateObj = new Date(startDate)
        const endDateObj = new Date(startDateObj)
        endDateObj.setDate(endDateObj.getDate() + daysToPredict - 1)

        const groupedData = salesData.reduce((acc, { date, article, sales }) => {
          if (!acc[article]) {
            acc[article] = {}
          }
          acc[article][date] = (acc[article][date] || 0) + sales
          return acc
        }, {} as Record<string, Record<string, number>>)

        const filteredArticles = selectedArticles.length > 0 ? selectedArticles : articles

        const allDates = [];
        const lastHistoricalDate = new Date(Math.max(...salesData.map(d => new Date(d.date).getTime())));
        for (let i = 0; i < daysToPredict; i++) {
          const date = new Date(startDateObj);
          date.setDate(date.getDate() + i);
          allDates.push(date.toISOString().split('T')[0]);
        }


        const datasets = filteredArticles.flatMap(article => {
          const historicalData = salesData
            .filter(d => d.article === article && new Date(d.date) <= lastHistoricalDate)
            .reduce((acc, d) => {
              acc[d.date] = (acc[d.date] || 0) + d.sales;
              return acc;
            }, {} as Record<string, number>);

          const predictionData = predictions
            .filter(p => p.article === article)
            .reduce((acc, p) => {
              acc[p.date] = p.sales;
              return acc;
            }, {} as Record<string, number>)

          const combinedData = allDates.map(date => {
            const dateObj = new Date(date);
            if (dateObj <= lastHistoricalDate) {
              return historicalData[date] || null;
            } else {
              return predictionData[date] || null;
            }
          });
          
          return [{
            label: article,
            data: combinedData,
            borderColor: `hsl(${Math.random() * 360}, 70%, 50%)`,
            tension: 0.1,
            segment: {
              borderDash: ctx => new Date(allDates[ctx.p0.parsed.x]) > lastHistoricalDate ? [5, 5] : undefined,
            }
          }]
        })

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
                },
                ticks: {
                  maxRotation: 45,
                  minRotation: 45
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
  }, [salesData, predictions, selectedArticles, startDate, daysToPredict])

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

