'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { BarChart, Upload, FileText, Download, CreditCard, RefreshCw } from 'lucide-react'
import { processSalesData, SalesData } from './actions/process-sales-data'
import { predictSales } from './utils/predictions'
import SalesChart from '@/components/sales-chart'
import { ProgressBar } from '@/components/progress-bar'

export default function Home() {
  const [salesData, setSalesData] = useState<SalesData[]>([])
  const [predictions, setPredictions] = useState<SalesData[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [fileName, setFileName] = useState<string | null>(null)
  const [daysToPredict, setDaysToPredict] = useState<string>('7')
  const [startDate, setStartDate] = useState<string>(new Date().toISOString().split('T')[0])
  const [predictionsCalculated, setPredictionsCalculated] = useState(false);

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
          setIsLoading(false)
        }
      }
      reader.readAsText(file)
    }
  }

  const recalculatePredictions = async (data: SalesData[]) => {
    setIsLoading(true);
    setPredictionsCalculated(false);
    try {
      const predictionsResult = await predictSales(data, parseInt(daysToPredict, 10) || 7, startDate);
      setPredictions(predictionsResult);
      setPredictionsCalculated(true);
    } catch (error) {
      console.error('Error calculating predictions:', error);
      alert('An error occurred while calculating predictions. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = () => {
    const headers = ['date', 'article', 'sales']
    const rows = predictions.map(p => [p.date, p.article, p.sales.toString()])

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n')
    
    //alert(csvContent);

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.setAttribute('href', url)
    link.setAttribute('download', 'sales_predictions.csv')
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl sm:tracking-tight lg:text-6xl">
            Prediction Sales
          </h1>
          <div className="flex items-center space-x-4">
            <Link href="/subscription">
              <Button variant="outline" className="flex items-center space-x-2">
                <CreditCard className="w-4 h-4" />
                <span>Subscription Plans</span>
              </Button>
            </Link>
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
                    <Label htmlFor="start-date">Start Date</Label>
                    <Input
                      id="start-date"
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                    />
                  </div>
                  <div className="grid w-full max-w-sm items-center gap-1.5">
                    <Label htmlFor="days-to-predict">Days to Predict</Label>
                    <Input
                      id="days-to-predict"
                      type="number"
                      value={daysToPredict}
                      onChange={(e) => {
                        const value = e.target.value;
                        setDaysToPredict(value === '' ? '' : String(Math.max(1, Math.min(30, Number(value)))))
                      }}
                      min={1}
                      max={30}
                    />
                  </div>
                  <Button
                    onClick={() => recalculatePredictions(salesData)}
                    className="flex items-center space-x-2"
                    disabled={salesData.length === 0 || isLoading}
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span>Recalculate</span>
                  </Button>
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
                  <span>Prediction Sales Visualization</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <ProgressBar />
                ) : (
                  <SalesChart 
                    salesData={salesData} 
                    predictions={predictions} 
                    startDate={startDate}
                    daysToPredict={parseInt(daysToPredict, 10) || 7}
                  />
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {predictionsCalculated && predictions.length > 0 && (
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
              <CardTitle>Interactive Prediction Chart</CardTitle>
            </CardHeader>
            <CardContent>
              Visualize your historical sales data alongside AI-generated predictions in an interactive chart. Compare trends and forecast future sales for multiple articles.
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>AI-Powered Predictions</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Leverage TensorFlow.js to get sales predictions for each product. Our prediction method uses:</p>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>A neural network model with two layers</li>
                <li>Input features: day of week, day of month, and month</li>
                <li>Adam optimizer for efficient training</li>
                <li>Mean Squared Error loss function</li>
                <li>100 training epochs for each product</li>
              </ul>
              <p className="mt-2">This approach allows for capturing complex patterns in your sales data, considering seasonal trends and providing article-specific predictions.</p>
            </CardContent>
          </Card>
        </div>

        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-4">Frequently Asked Questions</h2>
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold">Why are my predicted sales increasing?</h3>
              <p>Our AI model considers various factors like day of week, month, and historical trends. Sometimes, this can result in an upward trend. If you notice unexpected growth, try adjusting the prediction parameters or consider using a larger dataset for more accurate results.</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold">How far into the future can I predict?</h3>
              <p>You can predict up to 30 days into the future. Keep in mind that predictions become less accurate the further they extend, especially with limited historical data.</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold">Can I compare multiple products?</h3>
              <p>Yes! Our interactive chart allows you to select and compare multiple articles, giving you a comprehensive view of your product performance and predictions.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

