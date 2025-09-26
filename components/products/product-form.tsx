"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { X, Plus } from "lucide-react"
import { CreateProductData, UpdateProductData } from "@/lib/validations/product"
import { useApi } from "@/lib/api"
import slugify from "slugify"

interface Category {
  _id: string
  name: string
  slug: string
}

interface Variant {
  name: string
  price: number
  salePrice?: number
}

interface ProductFormProps {
  initialData?: Partial<CreateProductData>
  onSubmit: (data: CreateProductData | UpdateProductData) => Promise<void>
  loading?: boolean
  isEdit?: boolean
}

export function ProductForm({ initialData, onSubmit, loading, isEdit }: ProductFormProps) {
  const [formData, setFormData] = useState({
    title: initialData?.title || "",
    slug: initialData?.slug || "",
    thumbnail: initialData?.thumbnail || "",
    images: initialData?.images || [],
    description: initialData?.description || "",
    shortDetail: initialData?.shortDetail || "",
    price: initialData?.price || 0,
    salePrice: initialData?.salePrice || undefined,
    unit: initialData?.unit || "piece",
    tags: initialData?.tags || [],
    categoryId: initialData?.categoryId || "",
    variants: initialData?.variants || [],
  })

  const [newTag, setNewTag] = useState("")
  const [newVariant, setNewVariant] = useState<Variant>({ name: "", price: 0 })
  const [newImage, setNewImage] = useState("")

  const { data: categoriesData } = useApi('/api/categories')
  const categories = categoriesData?.data || []

  useEffect(() => {
    if (formData.title && !isEdit) {
      setFormData(prev => ({
        ...prev,
        slug: slugify(prev.title, { lower: true, strict: true })
      }))
    }
  }, [formData.title, isEdit])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await onSubmit(formData)
  }

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }))
      setNewTag("")
    }
  }

  const removeTag = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag)
    }))
  }

  const addVariant = () => {
    if (newVariant.name.trim() && newVariant.price > 0) {
      setFormData(prev => ({
        ...prev,
        variants: [...prev.variants, { ...newVariant }]
      }))
      setNewVariant({ name: "", price: 0 })
    }
  }

  const removeVariant = (index: number) => {
    setFormData(prev => ({
      ...prev,
      variants: prev.variants.filter((_, i) => i !== index)
    }))
  }

  const addImage = () => {
    if (newImage.trim() && !formData.images.includes(newImage.trim())) {
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, newImage.trim()]
      }))
      setNewImage("")
    }
  }

  const removeImage = (image: string) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter(img => img !== image)
    }))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              required
            />
          </div>

          <div>
            <Label htmlFor="slug">Slug *</Label>
            <Input
              id="slug"
              value={formData.slug}
              onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
              required
            />
          </div>

          <div>
            <Label htmlFor="categoryId">Category *</Label>
            <Select
              value={formData.categoryId}
              onValueChange={(value) => setFormData(prev => ({ ...prev, categoryId: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category: Category) => (
                  <SelectItem key={category._id} value={category._id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="price">Price *</Label>
              <Input
                id="price"
                type="number"
                value={formData.price}
                onChange={(e) => setFormData(prev => ({ ...prev, price: Number(e.target.value) }))}
                required
              />
            </div>
            <div>
              <Label htmlFor="salePrice">Sale Price</Label>
              <Input
                id="salePrice"
                type="number"
                value={formData.salePrice || ""}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  salePrice: e.target.value ? Number(e.target.value) : undefined
                }))}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="unit">Unit</Label>
            <Input
              id="unit"
              value={formData.unit}
              onChange={(e) => setFormData(prev => ({ ...prev, unit: e.target.value }))}
            />
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <Label htmlFor="thumbnail">Thumbnail URL</Label>
            <Input
              id="thumbnail"
              value={formData.thumbnail}
              onChange={(e) => setFormData(prev => ({ ...prev, thumbnail: e.target.value }))}
            />
          </div>

          <div>
            <Label htmlFor="shortDetail">Short Detail</Label>
            <Textarea
              id="shortDetail"
              value={formData.shortDetail}
              onChange={(e) => setFormData(prev => ({ ...prev, shortDetail: e.target.value }))}
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={4}
            />
          </div>
        </div>
      </div>

      {/* Images */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Images</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex gap-2">
              <Input
                placeholder="Image URL"
                value={newImage}
                onChange={(e) => setNewImage(e.target.value)}
              />
              <Button type="button" onClick={addImage} size="sm">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.images.map((image, index) => (
                <Badge key={index} variant="secondary" className="flex items-center gap-1">
                  {image.substring(0, 30)}...
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => removeImage(image)}
                  />
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tags */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Tags</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex gap-2">
              <Input
                placeholder="Add tag"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
              />
              <Button type="button" onClick={addTag} size="sm">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.tags.map((tag, index) => (
                <Badge key={index} variant="secondary" className="flex items-center gap-1">
                  {tag}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => removeTag(tag)}
                  />
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Variants */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Variants</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
              <Input
                placeholder="Variant name"
                value={newVariant.name}
                onChange={(e) => setNewVariant(prev => ({ ...prev, name: e.target.value }))}
              />
              <Input
                placeholder="Price"
                type="number"
                value={newVariant.price}
                onChange={(e) => setNewVariant(prev => ({ ...prev, price: Number(e.target.value) }))}
              />
              <Input
                placeholder="Sale price"
                type="number"
                value={newVariant.salePrice || ""}
                onChange={(e) => setNewVariant(prev => ({
                  ...prev,
                  salePrice: e.target.value ? Number(e.target.value) : undefined
                }))}
              />
              <Button type="button" onClick={addVariant} size="sm">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="space-y-2">
              {formData.variants.map((variant, index) => (
                <div key={index} className="flex items-center justify-between p-2 border rounded">
                  <span>
                    {variant.name} - ${variant.price}
                    {variant.salePrice && ` (Sale: $${variant.salePrice})`}
                  </span>
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() => removeVariant(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-4">
        <Button type="submit" disabled={loading}>
          {loading ? "Saving..." : isEdit ? "Update Product" : "Create Product"}
        </Button>
      </div>
    </form>
  )
}