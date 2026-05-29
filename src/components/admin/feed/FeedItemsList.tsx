'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, Plus, Edit, Trash2, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { FeedCategoryType, FeedItemResponse, PaginatedResponse } from '@/types/feed';
import { adminFetch, readAdminJson } from '@/lib/admin/fetch-with-auth';

interface FeedItemsListProps {
  initialData?: PaginatedResponse<FeedItemResponse>;
}

const categoryTypeLabels: Record<FeedCategoryType, string> = {
  ROUGHAGE: 'Roughage',
  GREEN_FODDER: 'Green Fodder',
  CONCENTRATE: 'Concentrate',
  SUPPLEMENT: 'Supplement',
  MINERAL: 'Mineral',
  VITAMIN: 'Vitamin',
  SILAGE: 'Silage',
  HAY: 'Hay',
  STRAW: 'Straw',
  CUSTOM: 'Custom',
};

export function FeedItemsList({ initialData }: FeedItemsListProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const [items, setItems] = useState<FeedItemResponse[]>(initialData?.data ?? []);
  const [pagination, setPagination] = useState(initialData?.pagination ?? {
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
    hasMore: false,
  });
  const [isLoading, setIsLoading] = useState(!initialData);
  const [error, setError] = useState<string | null>(null);

  // Filter states
  const [search, setSearch] = useState(searchParams.get('search') ?? '');
  const [categoryType, setCategoryType] = useState<FeedCategoryType | ''>(
    (searchParams.get('categoryType') as FeedCategoryType) ?? ''
  );
  const [isActive, setIsActive] = useState<string>(searchParams.get('isActive') ?? 'true');

  const fetchItems = useCallback(async (page: number = 1) => {
    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (categoryType) params.set('categoryType', categoryType);
      if (isActive) params.set('isActive', isActive);
      params.set('page', page.toString());
      params.set('limit', '20');

      const response = await adminFetch(`/api/admin/feed-items?${params.toString()}`);
      const data = await readAdminJson<PaginatedResponse<FeedItemResponse>>(response);

      setItems(data.data);
      setPagination(data.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load feed items');
      toast({
        title: 'Error',
        description: 'Failed to load feed items',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [search, categoryType, isActive, toast]);

  useEffect(() => {
    if (!initialData) {
      fetchItems(1);
    }
  }, [fetchItems, initialData]);

  const handleSearch = () => {
    fetchItems(1);
  };

  const handlePageChange = (page: number) => {
    fetchItems(page);
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) {
      return;
    }

    try {
      const response = await adminFetch(`/api/admin/feed-items/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete feed item');
      }

      toast({
        title: 'Success',
        description: 'Feed item deleted successfully',
      });

      // Refresh the list
      fetchItems(pagination.page);
    } catch (err) {
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to delete feed item',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 gap-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search feed items..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="pl-8"
            />
          </div>
          <Select value={categoryType} onValueChange={(v) => setCategoryType(v as FeedCategoryType)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Categories</SelectItem>
              {Object.entries(categoryTypeLabels).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={isActive} onValueChange={setIsActive}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Status</SelectItem>
              <SelectItem value="true">Active</SelectItem>
              <SelectItem value="false">Inactive</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleSearch} disabled={isLoading}>
            Search
          </Button>
        </div>
        <Link href="/admin/feed-items/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Feed Item
          </Button>
        </Link>
      </div>

      {/* Error State */}
      {error && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-destructive">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            <p>{error}</p>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Suitable For</TableHead>
              <TableHead>Unit</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              // Loading skeleton
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-4 w-[150px]" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-[120px]" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-[60px]" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-[80px]" /></TableCell>
                  <TableCell><Skeleton className="h-8 w-[100px] ml-auto" /></TableCell>
                </TableRow>
              ))
            ) : items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                  No feed items found
                </TableCell>
              </TableRow>
            ) : (
              items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{item.name}</div>
                      {item.nameBn && (
                        <div className="text-sm text-muted-foreground">{item.nameBn}</div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{categoryTypeLabels[item.categoryType as FeedCategoryType] ?? item.categoryType}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {item.suitableFor.slice(0, 3).map((type) => (
                        <Badge key={type} variant="secondary" className="text-xs">
                          {type}
                        </Badge>
                      ))}
                      {item.suitableFor.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{item.suitableFor.length - 3}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="uppercase">{item.defaultUnit}</TableCell>
                  <TableCell>
                    <Badge variant={item.isActive ? 'default' : 'secondary'}>
                      {item.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Link href={`/admin/feed-items/${item.id}/edit`}>
                        <Button variant="ghost" size="icon">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(item.id, item.name)}
                        disabled={!item.isActive}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
            {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
            {pagination.total} items
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page <= 1 || isLoading}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={!pagination.hasMore || isLoading}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
