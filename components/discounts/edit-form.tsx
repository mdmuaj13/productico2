'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
  SheetClose,
} from '@/components/ui/sheet';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { updateDiscount, Discount } from '@/hooks/discounts';

interface DiscountEditFormProps {
  discount: Discount;
  onSuccess?: () => void;
}

const toDateInputValue = (date?: string | null) => {
  if (!date) return '';
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return '';
  return d.toISOString().slice(0, 10);
};

export function DiscountEditForm({ discount, onSuccess }: DiscountEditFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const initial = useMemo(
    () => ({
      code: discount.code || '',
      type: discount.type || 'percentage',
      value: Number(discount.value || 0),
      minOrderAmount: Number(discount.minOrderAmount || 0),
      maxUses: discount.maxUses == null ? '' : String(discount.maxUses),
      startDate: toDateInputValue(discount.startDate ?? null),
      endDate: toDateInputValue(discount.endDate ?? null),
      isActive: discount.isActive ?? true,
    }),
    [discount]
  );

  const [formData, setFormData] = useState(initial);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const payload = {
        code: formData.code.trim(),
        type: formData.type,
        value: Number(formData.value),
        minOrderAmount: Number(formData.minOrderAmount || 0),
        isActive: formData.isActive,
        maxUses: formData.maxUses === '' ? null : Number(formData.maxUses),
        startDate: formData.startDate ? formData.startDate : null,
        endDate: formData.endDate ? formData.endDate : null,
      };

      await updateDiscount(discount._id, payload as any);
      toast.success('Discount updated successfully');
      onSuccess?.();
      router.refresh();
    } catch (error) {
      console.error('Error updating discount:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update discount');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full space-y-6 p-4 py-8">
      <SheetHeader className="px-0">
        <SheetTitle>Edit Discount</SheetTitle>
        <SheetDescription>Update discount details and validity.</SheetDescription>
      </SheetHeader>

      <form onSubmit={handleSubmit} className="flex-1 space-y-5 py-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="code">Discount Code *</Label>
            <Input
              id="code"
              name="code"
              placeholder="SUMMER25"
              value={formData.code}
              onChange={handleChange}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Type *</Label>
            <Select
              value={formData.type}
              onValueChange={(value) => setFormData((prev) => ({ ...prev, type: value as typeof formData.type }))}
            >
              <SelectTrigger id="type">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="percentage">Percentage</SelectItem>
                <SelectItem value="fixed">Fixed amount</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="value">Value *</Label>
            <Input
              id="value"
              name="value"
              type="number"
              min={0}
              step="0.01"
              placeholder={formData.type === 'percentage' ? '10' : '25.00'}
              value={formData.value}
              onChange={handleChange}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="minOrderAmount">Minimum Order Amount</Label>
            <Input
              id="minOrderAmount"
              name="minOrderAmount"
              type="number"
              min={0}
              step="0.01"
              placeholder="0"
              value={formData.minOrderAmount}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="maxUses">Max Uses</Label>
            <Input
              id="maxUses"
              name="maxUses"
              type="number"
              min={1}
              step="1"
              placeholder="Leave empty for unlimited"
              value={formData.maxUses}
              onChange={(e) => setFormData((prev) => ({ ...prev, maxUses: e.target.value }))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="startDate">Start Date</Label>
            <Input
              id="startDate"
              name="startDate"
              type="date"
              value={formData.startDate}
              onChange={(e) => setFormData((prev) => ({ ...prev, startDate: e.target.value }))}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="endDate">End Date</Label>
            <Input
              id="endDate"
              name="endDate"
              type="date"
              value={formData.endDate}
              onChange={(e) => setFormData((prev) => ({ ...prev, endDate: e.target.value }))}
            />
          </div>

          <div className="flex items-center gap-2 pt-7">
            <Checkbox
              id="isActive"
              checked={formData.isActive}
              onCheckedChange={(checked) =>
                setFormData((prev) => ({ ...prev, isActive: Boolean(checked) }))
              }
            />
            <Label htmlFor="isActive">Active</Label>
          </div>
        </div>
      </form>

      <SheetFooter className="gap-2 px-0 mt-auto">
        <Button type="submit" disabled={isLoading} onClick={handleSubmit}>
          {isLoading ? 'Saving...' : 'Save Changes'}
        </Button>
        <SheetClose asChild>
          <Button type="button" variant="outline" disabled={isLoading}>
            Cancel
          </Button>
        </SheetClose>
      </SheetFooter>
    </div>
  );
}
