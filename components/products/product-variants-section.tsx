"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, X } from "lucide-react"
import { toast } from "sonner"

export type Variant = { name: string; price: number; salePrice?: number }

export function ProductVariantsSection({
  isBusy,
  variants,
  setVariants,
}: {
  isBusy: boolean
  variants: Variant[]
  setVariants: (next: Variant[]) => void
}) {
  const [newVariant, setNewVariant] = React.useState<Variant>({ name: "", price: 0 })

  const add = () => {
    if (!newVariant.name.trim()) return toast.error("Variant name is required")
    if (newVariant.price <= 0) return toast.error("Variant price must be greater than 0")

    setVariants([...variants, { ...newVariant }])
    setNewVariant({ name: "", price: 0 })
  }

  const remove = (idx: number) => {
    setVariants(variants.filter((_, i) => i !== idx))
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Variants</CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div className="space-y-2">
            <Label>Variant Name</Label>
            <Input
              placeholder="e.g., Small, Medium, Large"
              value={newVariant.name}
              onChange={(e) => setNewVariant((p) => ({ ...p, name: e.target.value }))}
              disabled={isBusy}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Price</Label>
              <Input
                type="number"
                value={newVariant.price}
                onChange={(e) => setNewVariant((p) => ({ ...p, price: Number(e.target.value) }))}
                disabled={isBusy}
              />
            </div>

            <div className="space-y-2">
              <Label>Sale Price</Label>
              <Input
                type="number"
                value={newVariant.salePrice ?? ""}
                onChange={(e) =>
                  setNewVariant((p) => ({
                    ...p,
                    salePrice: e.target.value ? Number(e.target.value) : undefined,
                  }))
                }
                disabled={isBusy}
              />
            </div>
          </div>

          <Button type="button" onClick={add} className="w-full" disabled={isBusy}>
            <Plus className="h-4 w-4 mr-2" />
            Add Variant
          </Button>
        </div>

        {variants.length > 0 && (
          <div className="space-y-2">
            <Label>Added Variants</Label>
            <div className="space-y-2">
              {variants.map((v, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 border rounded-lg bg-muted/50">
                  <span className="text-sm">
                    <span className="font-medium">{v.name}</span> - ${v.price}
                    {v.salePrice && <span className="text-muted-foreground"> (Sale: ${v.salePrice})</span>}
                  </span>

                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => remove(idx)}
                    disabled={isBusy}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
