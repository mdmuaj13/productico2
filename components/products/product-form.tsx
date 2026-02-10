"use client"

import React, { useEffect, useMemo, useState } from "react"
import slugify from "slugify"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { SheetHeader, SheetTitle, SheetDescription, SheetFooter, SheetClose } from "@/components/ui/sheet"

import { CreateProductData } from "@/lib/validations/product"
import { useApi } from "@/lib/api"
import { uploadImagesToR2 } from "@/lib/upload"
import { createProduct } from "@/hooks/products"
import type { PreviewItem } from "../image-uploader"
import { ProductVariantsSection, Variant } from "./product-variants-section"
import { ProductImagesSection } from "./product-images-section"
import { ProductBasicFields } from "./product-basic-fields"

interface Category {
  _id: string
  title: string
  slug: string
}

interface ProductFormProps {
  initialData?: Partial<CreateProductData>
  onSuccess?: () => void
}

export function ProductForm({ onSuccess, initialData }: ProductFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isUploading, setIsUploading] = useState(false)

  const [formData, setFormData] = useState({
    title: initialData?.title ?? "",
    slug: initialData?.slug ?? "",
    description: initialData?.description ?? "",
    shortDetail: initialData?.shortDetail ?? "",
    price: initialData?.price ?? 0,
    salePrice: initialData?.salePrice,
    unit: initialData?.unit ?? "piece",
    categoryId: (initialData as any)?.categoryId ?? "",
    variants: (initialData?.variants as Variant[]) ?? [],
    thumbnail: (initialData?.thumbnail as string) ?? "",
    images: (initialData?.images as string[]) ?? [],
    tags: (initialData?.tags as string[]) ?? [],
  })

  const [thumbPreview, setThumbPreview] = useState<PreviewItem[]>([])
  const [imagePreviews, setImagePreviews] = useState<PreviewItem[]>([])

  const { data: categoriesData } = useApi("/api/categories")
  const categories: Category[] = categoriesData?.data || []

  const isBusy = isLoading || isUploading

  const canSubmit = useMemo(() => {
    if (isBusy) return false
    if (!formData.title.trim()) return false
    if (!formData.slug.trim()) return false
    if (!formData.categoryId) return false
    if (formData.price <= 0) return false
    return true
  }, [formData, isBusy])

  useEffect(() => {
    if (!formData.title) return
    setFormData((prev) => ({
      ...prev,
      slug: prev.slug?.trim()
        ? prev.slug
        : slugify(prev.title, { lower: true, strict: true }),
    }))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.title])

  const cleanupPreviews = () => {
    for (const p of thumbPreview) URL.revokeObjectURL(p.url)
    for (const p of imagePreviews) URL.revokeObjectURL(p.url)
    setThumbPreview([])
    setImagePreviews([])
  }

  const resetForm = () => {
    setFormData({
      title: "",
      slug: "",
      description: "",
      shortDetail: "",
      price: 0,
      salePrice: undefined,
      unit: "piece",
      categoryId: "",
      variants: [],
      thumbnail: "",
      images: [],
      tags: [],
    })
    cleanupPreviews()
  }

  async function uploadSelectedImages() {
    setIsUploading(true)
    try {
      let thumbnailKey = ""
      if (thumbPreview.length > 0) {
        const [key] = await uploadImagesToR2({
          files: [thumbPreview[0].file],
          folder: "products",
        })
        thumbnailKey = key || ""
      }

      let imageKeys: string[] = []
      if (imagePreviews.length > 0) {
        imageKeys = await uploadImagesToR2({
          files: imagePreviews.map((p) => p.file),
          folder: "products",
        })
      }

      return { thumbnailKey, imageKeys }
    } finally {
      setIsUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!canSubmit) {
      if (!formData.title.trim()) return toast.error("Title is required")
      if (!formData.slug.trim()) return toast.error("Slug is required")
      if (!formData.categoryId) return toast.error("Category is required")
      if (formData.price <= 0) return toast.error("Price must be greater than 0")
      return
    }

    setIsLoading(true)
    try {
      const { thumbnailKey, imageKeys } = await uploadSelectedImages()

      const base = process.env.NEXT_PUBLIC_R2_PUBLIC_URL
      const toR2Url = (key: string) => {
        if (!base) return key
        return `${base.replace(/\/$/, "")}/${key.replace(/^\//, "")}`
      }

      const finalImages = imageKeys.map(toR2Url)
      const finalThumbnail = thumbnailKey ? toR2Url(thumbnailKey) : finalImages[0] || ""

      const payload: CreateProductData = {
        ...(formData as unknown as CreateProductData),
        thumbnail: finalThumbnail,
        images: finalImages,
      }

      await createProduct(payload)
      toast.success("Product created successfully")
      resetForm()
      onSuccess?.()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create product")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-full">
      <SheetHeader className="px-4 pb-4">
        <SheetTitle>Create Product</SheetTitle>
        <SheetDescription>Add a new product to your inventory system.</SheetDescription>
      </SheetHeader>

      <form
        id="product-form"
        onSubmit={handleSubmit}
        className="flex-1 overflow-y-auto px-4 space-y-4 pb-4"
      >
        <ProductImagesSection
          isBusy={isBusy}
          isUploading={isUploading}
          thumbPreview={thumbPreview}
          setThumbPreview={setThumbPreview}
          imagePreviews={imagePreviews}
          setImagePreviews={setImagePreviews}
        />

        <ProductBasicFields
          isBusy={isBusy}
          formData={formData}
          setFormData={setFormData}
          categories={categories}
        />

        <ProductVariantsSection
          isBusy={isBusy}
          variants={formData.variants}
          setVariants={(next) => setFormData((p) => ({ ...p, variants: next }))}
        />
      </form>

      <SheetFooter className="gap-2 px-4 py-4 border-t">
        <SheetClose asChild>
          <Button type="button" variant="outline" disabled={isBusy}>
            Cancel
          </Button>
        </SheetClose>

        <Button type="submit" form="product-form" disabled={!canSubmit}>
          {isBusy ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              {isUploading ? "Uploading..." : "Creating..."}
            </>
          ) : (
            "Create Product"
          )}
        </Button>
      </SheetFooter>
    </div>
  )
}
