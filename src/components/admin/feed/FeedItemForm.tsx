'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useFieldArray } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Loader2, Plus, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { adminFetch, readAdminJson } from '@/lib/admin/fetch-with-auth';
import {
  CreateFeedItemSchema,
  UpdateFeedItemSchema,
  FeedCategoryType,
  FeedUnitType,
  LivestockAnimalType,
  FeedCategoryResponse,
  FeedItemResponse,
} from '@/types/feed';

interface FeedItemFormProps {
  feedItem?: FeedItemResponse;
  categories: FeedCategoryResponse[];
}

const animalTypes: { value: LivestockAnimalType; label: string }[] = [
  { value: 'COW', label: 'Cow' },
  { value: 'GOAT', label: 'Goat' },
  { value: 'SHEEP', label: 'Sheep' },
  { value: 'CHICKEN', label: 'Chicken' },
  { value: 'DUCK', label: 'Duck' },
  { value: 'PIGEON', label: 'Pigeon' },
  { value: 'BUFFALO', label: 'Buffalo' },
  { value: 'HORSE', label: 'Horse' },
];

const unitTypes: { value: FeedUnitType; label: string }[] = [
  { value: 'KG', label: 'Kilogram (kg)' },
  { value: 'GRAM', label: 'Gram (g)' },
  { value: 'MON', label: 'Mon (40 kg)' },
  { value: 'SEER', label: 'Seer (0.933 kg)' },
  { value: 'BAG', label: 'Bag' },
  { value: 'BUNDLE', label: 'Bundle' },
  { value: 'LITER', label: 'Liter' },
  { value: 'PIECE', label: 'Piece' },
  { value: 'OTHER', label: 'Other' },
];

export function FeedItemForm({ feedItem, categories }: FeedItemFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');

  const isEditing = !!feedItem;

  const formSchema = isEditing ? UpdateFeedItemSchema : CreateFeedItemSchema;
  type FormData = z.infer<typeof formSchema>;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: feedItem
      ? {
          name: feedItem.name,
          nameBn: feedItem.nameBn ?? undefined,
          localName: feedItem.localName ?? undefined,
          scientificName: feedItem.scientificName ?? undefined,
          suitableFor: feedItem.suitableFor,
          notSuitableFor: feedItem.notSuitableFor,
          defaultUnit: feedItem.defaultUnit,
          packageSize: feedItem.packageSize ?? undefined,
          isSeasonal: feedItem.isSeasonal,
          peakSeasonStart: feedItem.peakSeasonStart ?? undefined,
          peakSeasonEnd: feedItem.peakSeasonEnd ?? undefined,
          isToxic: feedItem.isToxic,
          toxicityNotes: feedItem.toxicityNotes ?? undefined,
          restrictions: feedItem.restrictions ?? undefined,
          description: feedItem.description ?? undefined,
          descriptionBn: feedItem.descriptionBn ?? undefined,
          imageUrl: feedItem.imageUrl ?? undefined,
          sortOrder: feedItem.sortOrder,
          isActive: feedItem.isActive,
        }
      : {
          suitableFor: [],
          notSuitableFor: [],
          defaultUnit: 'KG',
          isSeasonal: false,
          isToxic: false,
          sortOrder: 0,
          isActive: true,
        },
  });

  const suitableFor = watch('suitableFor') ?? [];
  const notSuitableFor = watch('notSuitableFor') ?? [];
  const isSeasonal = watch('isSeasonal');
  const isToxic = watch('isToxic');

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);

    try {
      const url = isEditing
        ? `/api/admin/feed-items/${feedItem.id}`
        : '/api/admin/feed-items';
      const method = isEditing ? 'PATCH' : 'POST';

      const response = await adminFetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save feed item');
      }

      const result = await readAdminJson<FeedItemResponse>(response);

      toast({
        title: 'Success',
        description: isEditing
          ? 'Feed item updated successfully'
          : 'Feed item created successfully',
      });

      router.push('/admin/feed-items');
      router.refresh();
    } catch (error) {
      toast({
        title: 'Error',
        description:
          error instanceof Error ? error.message : 'Failed to save feed item',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleAnimalType = (
    type: LivestockAnimalType,
    field: 'suitableFor' | 'notSuitableFor'
  ) => {
    const current = watch(field) ?? [];
    const updated = current.includes(type)
      ? current.filter((t) => t !== type)
      : [...current, type];
    setValue(field, updated as LivestockAnimalType[], { shouldValidate: true });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="basic">Basic Info</TabsTrigger>
          <TabsTrigger value="classification">Classification</TabsTrigger>
          <TabsTrigger value="seasonal">Seasonal & Safety</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        {/* Basic Info Tab */}
        <TabsContent value="basic" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {!isEditing && (
                <div className="space-y-2">
                  <Label htmlFor="categoryId">Category *</Label>
                  <Select
                    onValueChange={(v) => setValue('categoryId', v)}
                    defaultValue={feedItem?.categoryId}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.categoryId && (
                    <p className="text-sm text-destructive">
                      {errors.categoryId.message}
                    </p>
                  )}
                </div>
              )}

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Name (English) *</Label>
                  <Input
                    id="name"
                    {...register('name')}
                    placeholder="e.g., Wheat Bran"
                  />
                  {errors.name && (
                    <p className="text-sm text-destructive">
                      {errors.name.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="nameBn">Name (Bengali)</Label>
                  <Input
                    id="nameBn"
                    {...register('nameBn')}
                    placeholder="e.g., গমের ভুসি"
                    dir="auto"
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="localName">Local Name</Label>
                  <Input
                    id="localName"
                    {...register('localName')}
                    placeholder="e.g., Bhushi"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="scientificName">Scientific Name</Label>
                  <Input
                    id="scientificName"
                    {...register('scientificName')}
                    placeholder="e.g., Triticum aestivum"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description (English)</Label>
                <Textarea
                  id="description"
                  {...register('description')}
                  placeholder="Detailed description of the feed item..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="descriptionBn">Description (Bengali)</Label>
                <Textarea
                  id="descriptionBn"
                  {...register('descriptionBn')}
                  placeholder="বিস্তারিত বিবরণ..."
                  rows={3}
                  dir="auto"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Classification Tab */}
        <TabsContent value="classification" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Animal Suitability</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <Label>Suitable For</Label>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                  {animalTypes.map((type) => (
                    <div key={type.value} className="flex items-center space-x-2">
                      <Checkbox
                        id={`suitable-${type.value}`}
                        checked={suitableFor.includes(type.value)}
                        onCheckedChange={() =>
                          toggleAnimalType(type.value, 'suitableFor')
                        }
                      />
                      <Label
                        htmlFor={`suitable-${type.value}`}
                        className="text-sm font-normal"
                      >
                        {type.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <Label>Not Suitable For (Restrictions)</Label>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                  {animalTypes.map((type) => (
                    <div key={type.value} className="flex items-center space-x-2">
                      <Checkbox
                        id={`not-suitable-${type.value}`}
                        checked={notSuitableFor.includes(type.value)}
                        onCheckedChange={() =>
                          toggleAnimalType(type.value, 'notSuitableFor')
                        }
                      />
                      <Label
                        htmlFor={`not-suitable-${type.value}`}
                        className="text-sm font-normal"
                      >
                        {type.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="defaultUnit">Default Unit *</Label>
                  <Select
                    onValueChange={(v) =>
                      setValue('defaultUnit', v as FeedUnitType)
                    }
                    defaultValue={feedItem?.defaultUnit ?? 'KG'}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select unit" />
                    </SelectTrigger>
                    <SelectContent>
                      {unitTypes.map((unit) => (
                        <SelectItem key={unit.value} value={unit.value}>
                          {unit.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="packageSize">Package Size</Label>
                  <Input
                    id="packageSize"
                    type="number"
                    step="0.01"
                    {...register('packageSize', { valueAsNumber: true })}
                    placeholder="e.g., 50 for 50kg bag"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Seasonal & Safety Tab */}
        <TabsContent value="seasonal" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Seasonal Availability</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="isSeasonal"
                  checked={isSeasonal}
                  onCheckedChange={(v) => setValue('isSeasonal', v)}
                />
                <Label htmlFor="isSeasonal">This feed is seasonal</Label>
              </div>

              {isSeasonal && (
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="peakSeasonStart">Peak Season Start</Label>
                    <Select
                      onValueChange={(v) =>
                        setValue('peakSeasonStart', parseInt(v))
                      }
                      defaultValue={feedItem?.peakSeasonStart?.toString()}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select month" />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 12 }, (_, i) => (
                          <SelectItem key={i + 1} value={(i + 1).toString()}>
                            {new Date(2024, i).toLocaleString('default', {
                              month: 'long',
                            })}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="peakSeasonEnd">Peak Season End</Label>
                    <Select
                      onValueChange={(v) =>
                        setValue('peakSeasonEnd', parseInt(v))
                      }
                      defaultValue={feedItem?.peakSeasonEnd?.toString()}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select month" />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 12 }, (_, i) => (
                          <SelectItem key={i + 1} value={(i + 1).toString()}>
                            {new Date(2024, i).toLocaleString('default', {
                              month: 'long',
                            })}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Safety Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="isToxic"
                  checked={isToxic}
                  onCheckedChange={(v) => setValue('isToxic', v)}
                />
                <Label htmlFor="isToxic" className="text-destructive">
                  This feed is toxic/harmful
                </Label>
              </div>

              {isToxic && (
                <div className="space-y-2">
                  <Label htmlFor="toxicityNotes">Toxicity Notes</Label>
                  <Textarea
                    id="toxicityNotes"
                    {...register('toxicityNotes')}
                    placeholder="Describe the toxicity and symptoms..."
                    rows={3}
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="restrictions">General Restrictions</Label>
                <Textarea
                  id="restrictions"
                  {...register('restrictions')}
                  placeholder="Any usage restrictions or warnings..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="sortOrder">Sort Order</Label>
                  <Input
                    id="sortOrder"
                    type="number"
                    {...register('sortOrder', { valueAsNumber: true })}
                    placeholder="0"
                  />
                  <p className="text-xs text-muted-foreground">
                    Lower numbers appear first in lists
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="imageUrl">Image URL</Label>
                  <Input
                    id="imageUrl"
                    {...register('imageUrl')}
                    placeholder="https://..."
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="isActive"
                  checked={watch('isActive')}
                  onCheckedChange={(v) => setValue('isActive', v)}
                />
                <Label htmlFor="isActive">Active</Label>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Actions */}
      <div className="flex justify-end gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push('/admin/feed-items')}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isEditing ? 'Update Feed Item' : 'Create Feed Item'}
        </Button>
      </div>
    </form>
  );
}
