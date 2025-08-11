'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Calendar, TrendingUp, TrendingDown, DollarSign, Package, Users, AlertTriangle, BarChart3 } from 'lucide-react'
import { useState, useEffect, useCallback } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts'
import axios from 'axios'
import { toast } from 'sonner'
import Image from 'next/image'

interface AnalyticsData {
  salesTrend?: Array<{ date: string; totalSales: number }>
  purchaseTrend?: Array<{ date: string; totalPurchases: number }>
  expensesTrend?: Array<{ date: string; totalOtherExpenses: number }>
  profitLossTrend?: { labels: string[]; netProfits: number[] }
  creditAnalysis?: Array<{ customerName: string; totalOutstanding: number }>
  deadStock?: Array<any>
  forecast?: { forecastedMonth: string; forecastedNetProfit: number; pastMonths: Array<{ month: string; netProfit: number }> }
  pnlStatement?: { summary: { revenue: number; cogs: number; expenses: number; netProfit: number } }
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D']

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData>({})
  const [loading, setLoading] = useState(false)
  const [timeRange, setTimeRange] = useState('7')
  const [view, setView] = useState('daily')

  const fetchAnalytics = useCallback(async () => {
    setLoading(true)
    try {
      const [salesTrend, purchaseTrend, expensesTrend, profitLossTrend, creditAnalysis, deadStock, forecast, pnlStatement] = await Promise.all([
        axios.get(`/api/analytics/sales-trend?days=${timeRange}`),
        axios.get(`/api/analytics/purchases-trend?days=${timeRange}`),
        axios.get(`/api/analytics/expenses-trend?days=${timeRange}`),
        axios.get(`/api/analytics/profit-and-loss-trend?view=${view}`),
        axios.get('/api/analytics/credit-analytics'),
        axios.get('/api/analytics/dead-stock'),
        axios.get('/api/analytics/next-month-netprofit-forecast'),
        axios.get('/api/analytics/profit-and-loss-statement')
      ])

      setData({
        salesTrend: salesTrend.data.totalSales || salesTrend.data.salesTrend,
        purchaseTrend: purchaseTrend.data.purchaseTrend,
        expensesTrend: expensesTrend.data.otherExpensesTrend,
        profitLossTrend: profitLossTrend.data,
        creditAnalysis: creditAnalysis.data.creditAnalysis,
        deadStock: deadStock.data.deadStock,
        forecast: forecast.data.formattedForecast,
        pnlStatement: pnlStatement.data
      })
    } catch (error) {
      toast.error('Failed to fetch analytics data')
    } finally {
      setLoading(false)
    }
  }, [timeRange, view])

  useEffect(() => {
    fetchAnalytics()
  }, [fetchAnalytics])

  const formatCurrency = (value: number) => `₹${value.toLocaleString()}`

  return (
    <div className="px-2 py-4 sm:px-6 lg:px-12 space-y-4 sm:space-y-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div className="flex items-center space-x-1 sm:space-x-2">
                <Image
                    src="/Vigor_Analysis-Data-Analytics-1024.webp"
                    alt="Purchase Management"
                    width={30}
                    height={30}
                    className="object-contain sm:h-[40px] sm:w-[40px]"
                />              
<div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-sm sm:text-base text-gray-600">Comprehensive business insights and trends</p>
        </div>                        </div>
        
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-full sm:w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={fetchAnalytics} disabled={loading} className="w-full sm:w-auto">
            <BarChart3 className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {data.pnlStatement?.summary?.revenue ? formatCurrency(data.pnlStatement.summary.revenue) : '₹0'}
            </div>
            <p className="text-xs text-muted-foreground">+20.1% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {data.pnlStatement?.summary?.netProfit ? formatCurrency(data.pnlStatement.summary.netProfit) : '₹0'}
            </div>
            <p className="text-xs text-muted-foreground">+12.5% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Outstanding Credits</CardTitle>
            <Users className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {data.creditAnalysis ? formatCurrency(data.creditAnalysis.reduce((sum, item) => sum + item.totalOutstanding, 0)) : '₹0'}
            </div>
            <p className="text-xs text-muted-foreground">{data.creditAnalysis?.length || 0} customers</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Dead Stock Items</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {data.deadStock?.length || 0}
            </div>
            <p className="text-xs text-muted-foreground">Items not sold in 60+ days</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <Tabs defaultValue="sales" className="space-y-4 sm:space-y-6">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-1 sm:gap-2">
          <TabsTrigger value="sales" className="text-xs sm:text-sm">Sales</TabsTrigger>
          <TabsTrigger value="purchases" className="text-xs sm:text-sm">Purchases</TabsTrigger>
          <TabsTrigger value="expenses" className="text-xs sm:text-sm">Expenses</TabsTrigger>
          <TabsTrigger value="profit" className="text-xs sm:text-sm">Profit/Loss</TabsTrigger>
          <TabsTrigger value="credits" className="text-xs sm:text-sm">Credits</TabsTrigger>
          <TabsTrigger value="forecast" className="text-xs sm:text-sm">Forecast</TabsTrigger>
        </TabsList>

        <TabsContent value="sales" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl">Sales Trend</CardTitle>
              <CardDescription className="text-sm">Daily sales performance over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-60 sm:h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data.salesTrend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={(value) => new Date(value).toLocaleDateString()}
                      angle={-45}
                      textAnchor="end"
                      height={60}
                      fontSize={12}
                    />
                    <YAxis tickFormatter={formatCurrency} fontSize={12} />
                    <Tooltip 
                      formatter={(value: number) => [formatCurrency(value), 'Sales']}
                      labelFormatter={(label) => new Date(label).toLocaleDateString()}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="totalSales" 
                      stroke="#0088FE" 
                      strokeWidth={2}
                      dot={{ fill: '#0088FE', strokeWidth: 1, r: 3 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="purchases" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl">Purchase Trend</CardTitle>
              <CardDescription className="text-sm">Daily purchase spending over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-60 sm:h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data.purchaseTrend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={(value) => new Date(value).toLocaleDateString()}
                      angle={-45}
                      textAnchor="end"
                      height={60}
                      fontSize={12}
                    />
                    <YAxis tickFormatter={formatCurrency} fontSize={12} />
                    <Tooltip 
                      formatter={(value: number) => [formatCurrency(value), 'Purchases']}
                      labelFormatter={(label) => new Date(label).toLocaleDateString()}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="totalPurchases" 
                      stroke="#00C49F" 
                      strokeWidth={2}
                      dot={{ fill: '#00C49F', strokeWidth: 1, r: 3 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="expenses" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl">Expenses Trend</CardTitle>
              <CardDescription className="text-sm">Other expenses over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-60 sm:h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data.expensesTrend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={(value) => new Date(value).toLocaleDateString()}
                      angle={-45}
                      textAnchor="end"
                      height={60}
                      fontSize={12}
                    />
                    <YAxis tickFormatter={formatCurrency} fontSize={12} />
                    <Tooltip 
                      formatter={(value: number) => [formatCurrency(value), 'Expenses']}
                      labelFormatter={(label) => new Date(label).toLocaleDateString()}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="totalOtherExpenses" 
                      stroke="#FFBB28" 
                      strokeWidth={2}
                      dot={{ fill: '#FFBB28', strokeWidth: 1, r: 3 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="profit" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl">Profit/Loss Trend</CardTitle>
              <CardDescription className="text-sm">Net profit trends over time</CardDescription>
              <div className="flex gap-2">
                <Select value={view} onValueChange={setView}>
                  <SelectTrigger className="w-full sm:w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="yearly">Yearly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-60 sm:h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data.profitLossTrend?.labels?.map((label, index) => ({
                    period: label,
                    netProfit: data.profitLossTrend?.netProfits[index] || 0
                  }))}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="period" angle={-45} textAnchor="end" height={60} fontSize={12} />
                    <YAxis tickFormatter={formatCurrency} fontSize={12} />
                    <Tooltip 
                      formatter={(value: number) => [formatCurrency(value), 'Net Profit']}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="netProfit" 
                      stroke="#8884D8" 
                      strokeWidth={2}
                      dot={{ fill: '#8884D8', strokeWidth: 1, r: 3 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="credits" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg sm:text-xl">Outstanding Credits</CardTitle>
                <CardDescription className="text-sm">Top customers with outstanding payments</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-60 sm:h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data.creditAnalysis?.slice(0, 10)}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="customerName" angle={-45} textAnchor="end" height={80} fontSize={12} />
                      <YAxis tickFormatter={formatCurrency} fontSize={12} />
                      <Tooltip formatter={(value: number) => [formatCurrency(value), 'Outstanding']} />
                      <Bar dataKey="totalOutstanding" fill="#FF8042" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg sm:text-xl">Credit Distribution</CardTitle>
                <CardDescription className="text-sm">Outstanding amounts by customer</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-60 sm:h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={data.creditAnalysis?.slice(0, 6)}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ customerName, percent }) => `${customerName} ${((percent || 0) * 100).toFixed(0)}%`}
                        outerRadius={60}
                        fill="#8884d8"
                        dataKey="totalOutstanding"
                      >
                        {data.creditAnalysis?.slice(0, 6).map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: number) => [formatCurrency(value), 'Outstanding']} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="forecast" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg sm:text-xl">Profit Forecast</CardTitle>
                <CardDescription className="text-sm">Next month&apos;s predicted net profit</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center space-y-4">
                  <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-blue-600">
                    {data.forecast?.forecastedNetProfit ? formatCurrency(data.forecast.forecastedNetProfit) : '₹0'}
                  </div>
                  <p className="text-base sm:text-lg text-gray-600">
                    {data.forecast?.forecastedMonth || 'Next Month'}
                  </p>
                  <div className="text-xs sm:text-sm text-gray-500">
                    Based on historical data analysis
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg sm:text-xl">Historical Performance</CardTitle>
                <CardDescription className="text-sm">Past months&apos; net profit trends</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-60 sm:h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data.forecast?.pastMonths}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" angle={-45} textAnchor="end" height={60} fontSize={12} />
                      <YAxis tickFormatter={formatCurrency} fontSize={12} />
                      <Tooltip formatter={(value: number) => [formatCurrency(value), 'Net Profit']} />
                      <Line 
                        type="monotone" 
                        dataKey="netProfit" 
                        stroke="#82CA9D" 
                        strokeWidth={2}
                        dot={{ fill: '#82CA9D', strokeWidth: 1, r: 3 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}