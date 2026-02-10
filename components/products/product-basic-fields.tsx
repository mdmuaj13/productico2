"use client"

import * as React from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

type Category = { _id: string; title: string; slug: string }

export function ProductBasicFields({
  isBusy,
  formData,
  setFormData,
  categories,
}: {
  isBusy: boolean
  formData: {
    title: string
    slug: string
    categoryId: string
    shortDetail: string
    description: string
    price: number
    salePrice?: number
    unit: string
  }
  setFormData: React.Dispatch<React.SetStateAction<any>>
  categories: Category[]
}) {
  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="title">Title *</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => setFormData((p: any) => ({ ...p, title: e.target.value }))}
          required
          disabled={isBusy}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="slug">Slug *</Label>
        <Input
          id="slug"
          value={formData.slug}
          onChange={(e) => setFormData((p: any) => ({ ...p, slug: e.target.value }))}
          required
          disabled={isBusy}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="categoryId">Category *</Label>
        <Select
          value={formData.categoryId}
          onValueChange={(value) => setFormData((p: any) => ({ ...p, categoryId: value }))}
          disabled={isBusy}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((c) => (
              <SelectItem key={c._id} value={c._id}>
                {c.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="shortDetail">Short Detail</Label>
        <Textarea
          id="shortDetail"
          value={formData.shortDetail}
          onChange={(e) =>
            setFormData((p: any) => ({ ...p, shortDetail: e.target.value }))
          }
          rows={3}
          disabled={isBusy}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) =>
            setFormData((p: any) => ({ ...p, description: e.target.value }))
          }
          rows={4}
          disabled={isBusy}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="price">Price *</Label>
          <Input
            id="price"
            type="number"
            value={formData.price}
            onChange={(e) => setFormData((p: any) => ({ ...p, price: Number(e.target.value) }))}
            required
            disabled={isBusy}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="salePrice">Sale Price</Label>
          <Input
            id="salePrice"
            type="number"
            value={formData.salePrice ?? ""}
            onChange={(e) =>
              setFormData((p: any) => ({
                ...p,
                salePrice: e.target.value ? Number(e.target.value) : undefined,
              }))
            }
            disabled={isBusy}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="unit">Unit</Label>
        <Input
          id="unit"
          value={formData.unit}
          onChange={(e) => setFormData((p: any) => ({ ...p, unit: e.target.value }))}
          disabled={isBusy}
        />
      </div>
    </>
  )
}
