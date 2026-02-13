'use client';

import { Badge } from '@/components/ui/badge';
import { deleteDiscount, Discount } from '@/hooks/discounts';
import { EntityView } from '@/components/ui/entity-view';
import { ViewField, formatDate } from '@/components/ui/view-field';

interface DiscountViewProps {
  discount: Discount;
  onEdit?: () => void;
  onDelete?: () => void;
  onSuccess?: () => void;
}

const formatValue = (discount: Discount) =>
  discount.type === 'percentage'
    ? `${Number(discount.value || 0).toFixed(2)}%`
    : `$${Number(discount.value || 0).toFixed(2)}`;

const formatMoney = (value?: number | null) => `$${Number(value || 0).toFixed(2)}`;

const formatUsage = (used: number, max?: number | null) => `${used} / ${max == null ? '∞' : max}`;

const formatRange = (start?: string | null, end?: string | null) => {
  if (!start && !end) return 'No date limits';
  const startLabel = start ? formatDate(start) : 'No start date';
  const endLabel = end ? formatDate(end) : 'No end date';
  return `${startLabel} → ${endLabel}`;
};

export function DiscountView({ discount, onEdit, onDelete, onSuccess }: DiscountViewProps) {
  return (
    <EntityView
      title="Discount Details"
      entity={discount}
      entityName="Discount"
      getEntityDisplayName={(entity) => entity.code}
      onEdit={onEdit}
      onDelete={onDelete}
      onSuccess={onSuccess}
      deleteFunction={deleteDiscount}
    >
      <ViewField label="Code" value={<p className="text-sm font-mono">{discount.code}</p>} />

      <div className="grid grid-cols-2 gap-4">
        <ViewField label="Type" value={<Badge variant="secondary">{discount.type}</Badge>} />
        <ViewField label="Status" value={
          <Badge variant={discount.isActive ? 'default' : 'secondary'}>
            {discount.isActive ? 'Active' : 'Inactive'}
          </Badge>
        } />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <ViewField label="Value" value={<p className="text-sm font-semibold tabular-nums">{formatValue(discount)}</p>} />
        <ViewField label="Minimum Order" value={<p className="text-sm tabular-nums">{formatMoney(discount.minOrderAmount)}</p>} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <ViewField label="Usage" value={<p className="text-sm tabular-nums">{formatUsage(discount.usedCount, discount.maxUses)}</p>} />
        <ViewField label="Max Uses" value={<p className="text-sm tabular-nums">{discount.maxUses == null ? 'Unlimited' : discount.maxUses}</p>} />
      </div>

      <ViewField
        label="Validity"
        value={<p className="text-sm text-muted-foreground">{formatRange(discount.startDate, discount.endDate)}</p>}
      />

      <div className="grid grid-cols-2 gap-4">
        <ViewField label="Created" value={<p className="text-sm">{formatDate(discount.createdAt)}</p>} />
        <ViewField label="Last Updated" value={<p className="text-sm">{formatDate(discount.updatedAt)}</p>} />
      </div>
    </EntityView>
  );
}
