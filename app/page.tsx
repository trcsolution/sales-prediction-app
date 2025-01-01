'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { BarChart, Upload, FileText, Download, CreditCard, Database } from 'lucide-react'
import { processSalesData, SalesData } from './actions/process-sales-data'
import { predictSales } from './utils/predictions'
import SalesChart from './components/sales-chart'
import UserActions from './components/user-actions'
import { useUser } from './hooks/useUser'
import { setupDatabase } from './actions/setup-db'

export default function Home() {
  const [salesData, setSalesData] = useState<SalesData[]>([])
  const [predictions, setPredictions] = useState<{[key: string]: number[]}>({})
  const [isLoading, setIsLoading] = useState(false)
  const [fileName, setFileName] = useState<string | null>(null)
  const [daysToPredict, setDaysToPredict] = useState(7)
  const { user, loading } = useUser()

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setIsLoading(true)
      setFileName(file.name)
      const reader = new FileReader()
      reader.onload = async (e) => {
        const text = e.target?.result
        if (typeof text === 'string') {
          const data = await processSalesData(text)
          setSalesData(data)
          const predictionsResult = await predictSales(data, daysToPredict)
          setPredictions(predictionsResult)
        }
        setIsLoading(false)
      }
      reader.readAsText(file)
    }
  }

  const handleDownload = () => {
    const content = Object.entries(predictions).map(([article, values]) => 
      `${article},${values.join(',')}`
    ).join('\n')
    const blob = new Blob([content], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'sales_predictions.csv'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleSetupDatabase = async () => {
    const result = await setupDatabase()
    if (result.success) {
      alert('Database setup completed successfully')
    } else {
      alert(`Failed to set up database: ${result.error}`)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl sm:tracking-tight lg:text-6xl">
            Sales Data Analyzer 1.0
          </h1>
          <div className="flex items-center space-x-4">
            <UserActions />
            <Link href="/subscription">
              <Button variant="outline" className="flex items-center space-x-2">
                <CreditCard className="w-4 h-4" />
                <span>Subscription Plans</span>
              </Button>
            </Link>
            {user && (
              <Button variant="outline" className="flex items-center space-x-2" onClick={handleSetupDatabase}>
                <Database className="w-4 h-4" />
                <span>Setup Database</span>
              </Button>
            )}
          </div>
        </div>
        <p className="mt-5 max-w-xl mx-auto text-xl text-gray-500">
          Upload your sales data CSV file, visualize trends, and get predictions for future sales.
        </p>

        <div className="mt-12">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Upload Sales Data</CardTitle>
              <CardDescription>
                Upload a CSV file with columns: date, article, sales
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="grid w-full max-w-sm items-center gap-1.5">
                    <Label htmlFor="file-upload">CSV File</Label>
                    <Input
                      id="file-upload"
                      type="file"
                      accept=".csv"
                      onChange={handleFileUpload}
                    />
                  </div>
                  <Button
                    onClick={() => document.getElementById('file-upload')?.click()}
                    className="flex items-center space-x-2"
                  >
                    <Upload className="w-4 h-4" />
                    <span>Upload</span>
                  </Button>
                </div>
                {fileName && (
                  <div className="flex items-center space-x-2 text-sm text-gray-500">
                    <FileText className="w-4 h-4" />
                    <span>{fileName}</span>
                  </div>
                )}
                {isLoading && <p className="text-sm text-gray-500">Processing data...</p>}
                <div className="flex items-center space-x-4">
                  <div className="grid w-full max-w-sm items-center gap-1.5">
                    <Label htmlFor="days-to-predict">Days to Predict</Label>
                    <Input
                      id="days-to-predict"
                      type="number"
                      value={daysToPredict}
                      onChange={(e) => setDaysToPredict(parseInt(e.target.value))}
                      min={1}
                      max={30}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {salesData.length > 0 && (
          <div className="mt-12">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl flex items-center space-x-2">
                  <BarChart className="w-6 h-6" />
                  <span>Sales Data Visualization</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <SalesChart salesData={salesData} predictions={predictions} />
              </CardContent>
            </Card>
          </div>
        )}

        {Object.keys(predictions).length > 0 && (
          <div className="mt-8 flex justify-center">
            <Button onClick={handleDownload} className="flex items-center space-x-2">
              <Download className="w-4 h-4" />
              <span>Download Predictions</span>
            </Button>
          </div>
        )}

        <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Easy Upload</CardTitle>
            </CardHeader>
            <CardContent>
              Simply upload your CSV file containing sales data for multiple articles over various dates.
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Instant Visualization</CardTitle>
            </CardHeader>
            <CardContent>
              See your sales data come to life with our interactive chart, allowing you to spot trends easily.
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>AI-Powered Predictions</CardTitle>
            </CardHeader>
            <CardContent>
              Leverage TensorFlow.js to get sales predictions for each product and download the results.
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

