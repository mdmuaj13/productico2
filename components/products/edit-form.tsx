"use client";

import React, { useEffect, useMemo, useState } from "react";
import slugify from "slugify";
import { toast } from "sonner";
import { Loader2, Plus, X, Pencil } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  SheetHeader,
  SheetTitle,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet";

import { useApi } from "@/lib/api";
import { uploadImagesToR2 } from "@/lib/upload";
import { updateProduct } from "@/hooks/products";
import { ImageUploader, PreviewItem } from "../image-uploader";
import { ExistingImagesPicker } from "./existing-images-picker";

interface Variant {
  name: string;
  price: number;
  salePrice?: number;
}

interface Product {
  _id: string;
  title: string;
  slug: string;
  thumbnail?: string;
  images?: string[];
  description?: string;
  shortDetail?: string;
  categoryId: { _id: string; title: string; slug: string };
  price: number;
  salePrice?: number;
  unit: string;
  tags: string[];
  variants: Variant[];
  createdAt: string;
  updatedAt: string;
}

interface Category {
  _id: string;
  title: string;
  slug: string;
}

interface ProductEditFormProps {
  product: Product;
  onSuccess?: () => void;
}

function safeNumber(val: string) {
  const n = Number(val);
  return Number.isFinite(n) ? n : 0;
}

export function ProductEditForm({ product, onSuccess }: ProductEditFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Existing persisted urls
  const [existingThumbnail, setExistingThumbnail] = useState<string>(
    product.thumbnail || ""
  );
  const [existingImages, setExistingImages] = useState<string[]>(
    product.images || []
  );

  // New selected files (previews)
  const [thumbPreview, setThumbPreview] = useState<PreviewItem[]>([]);
  const [imagePreviews, setImagePreviews] = useState<PreviewItem[]>([]);

  const [formData, setFormData] = useState({
    title: product.title,
    slug: product.slug,
    description: product.description || "",
    shortDetail: product.shortDetail || "",
    price: product.price,
    salePrice: product.salePrice,
    unit: product.unit,
    categoryId: product.categoryId._id,
    variants: product.variants || [],
    tags: product.tags || [],
  });

  const [newVariant, setNewVariant] = useState<Variant>({ name: "", price: 0 });
  const [editingVariantIndex, setEditingVariantIndex] = useState<number | null>(
    null
  );

  const { data: categoriesData } = useApi("/api/categories");
  const categories: Category[] = categoriesData?.data || [];

  const isBusy = isLoading || isUploading;

  const canSubmit = useMemo(() => {
    if (isBusy) return false;
    if (!formData.title.trim()) return false;
    if (!formData.slug.trim()) return false;
    if (!formData.categoryId) return false;
    if (formData.price <= 0) return false;
    return true;
  }, [formData, isBusy]);

  // Auto slug from title only if user didn't manually change slug
  useEffect(() => {
    if (!formData.title) return;
    setFormData((prev) => ({
      ...prev,
      slug: prev.slug?.trim()
        ? prev.slug
        : slugify(prev.title, { lower: true, strict: true }),
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.title]);

  const addVariant = () => {
    if (!newVariant.name.trim()) return toast.error("Variant name is required");
    if (newVariant.price <= 0)
      return toast.error("Variant price must be greater than 0");

    if (editingVariantIndex !== null) {
      setFormData((prev) => ({
        ...prev,
        variants: prev.variants.map((v, i) =>
          i === editingVariantIndex ? { ...newVariant } : v
        ),
      }));
      setEditingVariantIndex(null);
    } else {
      setFormData((prev) => ({
        ...prev,
        variants: [...prev.variants, { ...newVariant }],
      }));
    }

    setNewVariant({ name: "", price: 0 });
  };

  const editVariant = (index: number) => {
    setNewVariant({ ...formData.variants[index] });
    setEditingVariantIndex(index);
  };

  const cancelEditVariant = () => {
    setNewVariant({ name: "", price: 0 });
    setEditingVariantIndex(null);
  };

  const removeVariant = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      variants: prev.variants.filter((_, i) => i !== index),
    }));
    if (editingVariantIndex === index) cancelEditVariant();
  };

  const cleanupPreviews = () => {
    for (const p of thumbPreview) URL.revokeObjectURL(p.url);
    for (const p of imagePreviews) URL.revokeObjectURL(p.url);
    setThumbPreview([]);
    setImagePreviews([]);
  };

  async function uploadSelectedImages() {
    setIsUploading(true);
    try {
      let thumbnailKey = "";
      if (thumbPreview.length > 0) {
        const [key] = await uploadImagesToR2({
          files: [thumbPreview[0].file],
          folder: "products",
        });
        thumbnailKey = key || "";
      }

      let imageKeys: string[] = [];
      if (imagePreviews.length > 0) {
        imageKeys = await uploadImagesToR2({
          files: imagePreviews.map((p) => p.file),
          folder: "products",
        });
      }

      // keys -> urls
      const base = process.env.NEXT_PUBLIC_R2_PUBLIC_URL;
      const toR2Url = (key: string) => {
        if (!base) return key;
        return `${base.replace(/\/$/, "")}/${key.replace(/^\//, "")}`;
      };

      const uploadedThumbnailUrl = thumbnailKey ? toR2Url(thumbnailKey) : "";
      const uploadedImageUrls = imageKeys.map(toR2Url);

      return { uploadedThumbnailUrl, uploadedImageUrls };
    } finally {
      setIsUploading(false);
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) {
      if (!formData.title.trim()) return toast.error("Title is required");
      if (!formData.slug.trim()) return toast.error("Slug is required");
      if (!formData.categoryId) return toast.error("Category is required");
      if (formData.price <= 0)
        return toast.error("Price must be greater than 0");
      return;
    }

    setIsLoading(true);
    try {
      // 1) Upload newly selected images (if any)
      const { uploadedThumbnailUrl, uploadedImageUrls } =
        await uploadSelectedImages();

      // 2) Decide final thumbnail:
      // - if user picked new thumbnail -> use it
      // - else keep existing thumbnail
      // - else fallback to first image (existing or uploaded)
      const mergedImages = [...existingImages, ...uploadedImageUrls];
      const finalThumbnail =
        uploadedThumbnailUrl || existingThumbnail || mergedImages[0] || "";

      const payload = {
        ...formData,
        thumbnail: finalThumbnail,
        images: mergedImages,
      };

      await updateProduct(product._id, payload as any);
      toast.success("Product updated successfully");
      cleanupPreviews();
      onSuccess?.();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to update product"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <SheetHeader className="px-4 pb-4">
        <SheetTitle>Edit Product</SheetTitle>
      </SheetHeader>

      <form
        id="product-edit-form"
        onSubmit={handleSubmit}
        className="flex-1 overflow-y-auto px-4 space-y-4 pb-4">
        {/* Add/replace media */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Upload New Images</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <ImageUploader
              variant="thumbnail"
              previews={thumbPreview}
              setPreviews={setThumbPreview}
              existing={existingThumbnail ? [existingThumbnail] : []}
              onExistingChange={(next) => setExistingThumbnail(next[0] || "")}
              disabled={isBusy}
            />

            <div className="space-y-3">
              <ImageUploader
                variant="gallery"
                previews={imagePreviews}
                setPreviews={setImagePreviews}
                existing={existingImages}
                onExistingChange={setExistingImages}
                maxFiles={8}
                disabled={isBusy}
              />

              {isUploading && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Uploading images...
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Basic fields */}
        <div className="space-y-2">
          <Label htmlFor="title">Title *</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) =>
              setFormData((p) => ({ ...p, title: e.target.value }))
            }
            required
            disabled={isBusy}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="slug">Slug *</Label>
          <Input
            id="slug"
            value={formData.slug}
            onChange={(e) =>
              setFormData((p) => ({ ...p, slug: e.target.value }))
            }
            required
            disabled={isBusy}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="categoryId">Category *</Label>
          <Select
            value={formData.categoryId}
            onValueChange={(value) =>
              setFormData((p) => ({ ...p, categoryId: value }))
            }
            disabled={isBusy}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category._id} value={category._id}>
                  {category.title}
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
              setFormData((p) => ({ ...p, shortDetail: e.target.value }))
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
              setFormData((p) => ({ ...p, description: e.target.value }))
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
              onChange={(e) =>
                setFormData((p) => ({
                  ...p,
                  price: safeNumber(e.target.value),
                }))
              }
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
                setFormData((p) => ({
                  ...p,
                  salePrice: e.target.value
                    ? safeNumber(e.target.value)
                    : undefined,
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
            onChange={(e) =>
              setFormData((p) => ({ ...p, unit: e.target.value }))
            }
            disabled={isBusy}
          />
        </div>

        {/* Variants */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Variants</CardTitle>
          </CardHeader>

          <CardContent>
            <div className="space-y-4">
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label>Variant Name</Label>
                  <Input
                    placeholder="e.g., Small, Medium, Large"
                    value={newVariant.name}
                    onChange={(e) =>
                      setNewVariant((p) => ({ ...p, name: e.target.value }))
                    }
                    disabled={isBusy}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Price</Label>
                    <Input
                      type="number"
                      value={newVariant.price}
                      onChange={(e) =>
                        setNewVariant((p) => ({
                          ...p,
                          price: safeNumber(e.target.value),
                        }))
                      }
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
                          salePrice: e.target.value
                            ? safeNumber(e.target.value)
                            : undefined,
                        }))
                      }
                      disabled={isBusy}
                    />
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    type="button"
                    onClick={addVariant}
                    className="flex-1"
                    disabled={isBusy}>
                    <Plus className="h-4 w-4 mr-2" />
                    {editingVariantIndex !== null
                      ? "Update Variant"
                      : "Add Variant"}
                  </Button>

                  {editingVariantIndex !== null && (
                    <Button
                      type="button"
                      onClick={cancelEditVariant}
                      variant="outline"
                      disabled={isBusy}>
                      Cancel
                    </Button>
                  )}
                </div>
              </div>

              {formData.variants.length > 0 && (
                <div className="space-y-2">
                  <Label>Added Variants</Label>
                  <div className="space-y-2">
                    {formData.variants.map((variant, index) => (
                      <div
                        key={index}
                        className={`flex items-center justify-between p-3 border rounded-lg ${
                          editingVariantIndex === index
                            ? "bg-primary/10 border-primary"
                            : "bg-muted/50"
                        }`}>
                        <span className="text-sm">
                          <span className="font-medium">{variant.name}</span> -
                          ${variant.price}
                          {variant.salePrice && (
                            <span className="text-muted-foreground">
                              {" "}
                              (Sale: ${variant.salePrice})
                            </span>
                          )}
                        </span>

                        <div className="flex gap-1">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => editVariant(index)}
                            disabled={
                              isBusy ||
                              (editingVariantIndex !== null &&
                                editingVariantIndex !== index)
                            }>
                            <Pencil className="h-4 w-4" />
                          </Button>

                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeVariant(index)}
                            disabled={isBusy}>
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </form>

      <SheetFooter className="gap-2 px-4 py-4 border-t">
        <SheetClose asChild>
          <Button type="button" variant="outline" disabled={isBusy}>
            Cancel
          </Button>
        </SheetClose>

        <Button type="submit" form="product-edit-form" disabled={!canSubmit}>
          {isBusy ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              {isUploading ? "Uploading..." : "Updating..."}
            </>
          ) : (
            "Update Product"
          )}
        </Button>
      </SheetFooter>
    </div>
  );
}
