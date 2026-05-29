'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, TrendingUp, TrendingDown, DollarSign, Package, Utensils, Scale } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { adminFetch, readAdminJson } from '@/lib/admin/fetch-with-auth';
import { LivestockAnimalType } from '@/types/livestock';

interface FeedAnalyticsSummary {
  totalFeedItems: number;
  activeCategories: number;
  totalInventoryValue: number;
  totalStockKg: number;
  lowStockItems: number;
  expiringItems: number;
  monthlyConsumption: number;
  monthlyExpense: number;
  topConsumedFeeds: Array<{
    feedItemId: string;
    feedItemName: string;
    totalQuantity: number;
    totalCost: number;
  }>;
  consumptionTrend: Array<{
    month: string;
    totalQuantity: number;
    totalCost: number;
  }>;
  inventoryByCategory: Array<{
    categoryId: string;
    categoryName: string;
    categoryNameBn: string | null;
    totalStock: number;
    totalValue: number;
  }>;
}

interface LivestockAnalyticsSummary {
  totalLivestock: number;
  byAnimalType: Record<LivestockAnimalType, number>;
  byStatus: Record<string, number>;
  recentWeightRecords: number;
  averageWeightGain: number | null;
  topGroups: Array<{
    groupId: string;
    groupName: string;
    count: number;
  }>;
}

const animalTypeLabels: Record<LivestockAnimalType, string> = {
  COW: 'Cow',
  GOAT: 'Goat',
  SHEEP: 'Sheep',
  CHICKEN: 'Chicken',
  DUCK: 'Duck',
  PIGEON: 'Pigeon',
  BUFFALO: 'Buffalo',
  HORSE: 'Horse',
};

export function FeedAnalyticsDashboard() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('overview');
  const [timeRange, setTimeRange] = useState('30');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [feedData, setFeedData] = useState<FeedAnalyticsSummary | null>(null);
  const [livestockData, setLivestockData] = useState<LivestockAnalyticsSummary | null>(null);

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const [feedResponse, livestockResponse] = await Promise.all([
        adminFetch(`/api/admin/analytics/feed?days=${timeRange}`),
        adminFetch(`/api/admin/analytics/livestock?days=${timeRange}`),
      ]);

      if (!feedResponse.ok || !livestockResponse.ok) {
        throw new Error('Failed to fetch analytics data');
      }

      const [feedAnalytics, livestockAnalytics] = await Promise.all([
        readAdminJson<FeedAnalyticsSummary>(feedResponse),
        readAdminJson<LivestockAnalyticsSummary>(livestockResponse),
      ]);

      setFeedData(feedAnalytics);
      setLivestockData(livestockAnalytics);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load analytics');
      toast({
        title: 'Error',
        description: 'Failed to load analytics data',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-BD', {
      style: 'currency',
      currency: 'BDT',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatNumber = (value: number, decimals: number = 0) => {
    return new Intl.NumberFormat('en-BD', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(value);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with time range selector */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Analytics Dashboard</h2>
          <p className="text-muted-foreground">
            Feed and livestock ecosystem insights
          </p>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select time range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">Last 7 days</SelectItem>
            <SelectItem value="30">Last 30 days</SelectItem>
            <SelectItem value="90">Last 3 months</SelectItem>
            <SelectItem value="365">Last year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="feed">Feed Analytics</TabsTrigger>
          <TabsTrigger value="livestock">Livestock</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Key Metrics */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Feed Items</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatNumber(feedData?.totalFeedItems ?? 0)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Across {feedData?.activeCategories ?? 0} categories
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Inventory Value</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(feedData?.totalInventoryValue ?? 0)}
                </div>
                <p className="text-xs text-muted-foreground">
                  {formatNumber(feedData?.totalStockKg ?? 0, 1)} kg in stock
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Monthly Consumption</CardTitle>
                <Utensils className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatNumber(feedData?.monthlyConsumption ?? 0, 1)} kg
                </div>
                <p className="text-xs text-muted-foreground">
                  {formatCurrency(feedData?.monthlyExpense ?? 0)} spent
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Livestock</CardTitle>
                <Scale className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatNumber(livestockData?.totalLivestock ?? 0)}
                </div>
                <p className="text-xs text-muted-foreground">
                  {Object.keys(livestockData?.byAnimalType ?? {}).length} animal types
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Alerts */}
          {(feedData?.lowStockItems ?? 0) > 0 || (feedData?.expiringItems ?? 0) > 0 ? (
            <div className="grid gap-4 md:grid-cols-2">
              {(feedData?.lowStockItems ?? 0) > 0 && (
                <Card className="border-amber-500/50 bg-amber-50/50">
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-sm font-medium text-amber-700">
                      <AlertTriangle className="h-4 w-4" />
                      Low Stock Alert
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold text-amber-700">
                      {feedData?.lowStockItems} items
                    </p>
                    <p className="text-xs text-amber-600">
                      Below minimum stock level
                    </p>
                  </CardContent>
                </Card>
              )}

              {(feedData?.expiringItems ?? 0) > 0 && (
                <Card className="border-red-500/50 bg-red-50/50">
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-sm font-medium text-red-700">
                      <AlertTriangle className="h-4 w-4" />
                      Expiring Soon
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold text-red-700">
                      {feedData?.expiringItems} items
                    </p>
                    <p className="text-xs text-red-600">
                      Expires within 30 days
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          ) : null}

          {/* Top Consumed Feeds */}
          <Card>
            <CardHeader>
              <CardTitle>Top Consumed Feeds</CardTitle>
              <CardDescription>Most consumed feeds in the selected period</CardDescription>
            </CardHeader>
            <CardContent>
              {feedData?.topConsumedFeeds && feedData.topConsumedFeeds.length > 0 ? (
                <div className="space-y-4">
                  {feedData.topConsumedFeeds.slice(0, 5).map((feed, index) => (
                    <div key={feed.feedItemId} className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-medium">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium">{feed.feedItemName}</p>
                          <p className="text-sm text-muted-foreground">
                            {formatNumber(feed.totalQuantity, 1)} kg consumed
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{formatCurrency(feed.totalCost)}</p>
                        <p className="text-sm text-muted-foreground">total cost</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  No consumption data available for the selected period
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Feed Analytics Tab */}
        <TabsContent value="feed" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Inventory by Category</CardTitle>
              </CardHeader>
              <CardContent>
                {feedData?.inventoryByCategory && feedData.inventoryByCategory.length > 0 ? (
                  <div className="space-y-4">
                    {feedData.inventoryByCategory.map((category) => (
                      <div key={category.categoryId} className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{category.categoryName}</p>
                          {category.categoryNameBn && (
                            <p className="text-sm text-muted-foreground">{category.categoryNameBn}</p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{formatNumber(category.totalStock, 1)} kg</p>
                          <p className="text-sm text-muted-foreground">
                            {formatCurrency(category.totalValue)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-8">
                    No inventory data available
                  </p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Consumption Trend</CardTitle>
              </CardHeader>
              <CardContent>
                {feedData?.consumptionTrend && feedData.consumptionTrend.length > 0 ? (
                  <div className="space-y-4">
                    {feedData.consumptionTrend.map((trend) => (
                      <div key={trend.month} className="flex items-center justify-between">
                        <p className="font-medium">{trend.month}</p>
                        <div className="text-right">
                          <p className="font-medium">{formatNumber(trend.totalQuantity, 1)} kg</p>
                          <p className="text-sm text-muted-foreground">
                            {formatCurrency(trend.totalCost)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-8">
                    No trend data available
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Livestock Tab */}
        <TabsContent value="livestock" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Livestock by Type</CardTitle>
              </CardHeader>
              <CardContent>
                {livestockData?.byAnimalType && Object.keys(livestockData.byAnimalType).length > 0 ? (
                  <div className="space-y-4">
                    {Object.entries(livestockData.byAnimalType).map(([type, count]) => (
                      <div key={type} className="flex items-center justify-between">
                        <p className="font-medium">
                          {animalTypeLabels[type as LivestockAnimalType] ?? type}
                        </p>
                        <p className="font-bold">{formatNumber(count)}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-8">
                    No livestock data available
                  </p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Livestock by Status</CardTitle>
              </CardHeader>
              <CardContent>
                {livestockData?.byStatus && Object.keys(livestockData.byStatus).length > 0 ? (
                  <div className="space-y-4">
                    {Object.entries(livestockData.byStatus).map(([status, count]) => (
                      <div key={status} className="flex items-center justify-between">
                        <p className="font-medium capitalize">{status.toLowerCase()}</p>
                        <p className="font-bold">{formatNumber(count)}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-8">
                    No status data available
                  </p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Groups</CardTitle>
              </CardHeader>
              <CardContent>
                {livestockData?.topGroups && livestockData.topGroups.length > 0 ? (
                  <div className="space-y-4">
                    {livestockData.topGroups.slice(0, 5).map((group, index) => (
                      <div key={group.groupId} className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-medium">
                            {index + 1}
                          </div>
                          <p className="font-medium">{group.groupName}</p>
                        </div>
                        <p className="font-bold">{formatNumber(group.count)}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-8">
                    No group data available
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
