"use client"

import { useEffect, useMemo, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

import { apiCall } from "@/lib/api"
import { uploadImagesToR2 } from "@/lib/upload"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

import { ImageUploader, type PreviewItem } from "../image-uploader"

const shopInfoSchema = z.object({
  shopName: z.string().min(1, "Shop name is required"),
  tagline: z.string().optional(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),

  // stored URLs (not typed as url because empty string is common)
  metaImage: z.string().optional(),
  heroImage: z.string().optional(),
  logo: z.string().optional(),
})

type ShopInfoFormValues = z.infer<typeof shopInfoSchema>

interface ShopInfoFormProps {
  initialData?: Record<string, unknown>
  onUpdate?: (data: Record<string, unknown>) => void
}

export function ShopInfoForm({ initialData, onUpdate }: ShopInfoFormProps) {
  const [isSaving, setIsSaving] = useState(false)
  const [isUploading, setIsUploading] = useState(false)

  // new picks (local previews)
  const [logoPreview, setLogoPreview] = useState<PreviewItem[]>([])
  const [heroPreview, setHeroPreview] = useState<PreviewItem[]>([])
  const [metaPreview, setMetaPreview] = useState<PreviewItem[]>([])

  // existing (remote URLs already stored)
  const [existingLogo, setExistingLogo] = useState<string[]>([])
  const [existingHero, setExistingHero] = useState<string[]>([])
  const [existingMeta, setExistingMeta] = useState<string[]>([])

  const form = useForm<ShopInfoFormValues>({
    resolver: zodResolver(shopInfoSchema),
    defaultValues: {
      shopName: "",
      tagline: "",
      metaTitle: "",
      metaDescription: "",
      metaImage: "",
      heroImage: "",
      logo: "",
    },
  })

  const isBusy = isSaving || isUploading

  // Convert R2 key to public URL (same as your product logic)
  const toR2Url = (key: string) => {
    const base = process.env.NEXT_PUBLIC_R2_PUBLIC_URL
    if (!base) return key
    return `${base.replace(/\/$/, "")}/${key.replace(/^\//, "")}`
  }

  // Seed form + existing image previews from initialData
  useEffect(() => {
    if (!initialData) return

    const parsed = initialData as Partial<ShopInfoFormValues>

    form.reset({
      shopName: parsed.shopName ?? "",
      tagline: parsed.tagline ?? "",
      metaTitle: parsed.metaTitle ?? "",
      metaDescription: parsed.metaDescription ?? "",
      logo: parsed.logo ?? "",
      heroImage: parsed.heroImage ?? "",
      metaImage: parsed.metaImage ?? "",
    })

    setExistingLogo(parsed.logo ? [parsed.logo] : [])
    setExistingHero(parsed.heroImage ? [parsed.heroImage] : [])
    setExistingMeta(parsed.metaImage ? [parsed.metaImage] : [])

    // clear new previews when loading existing data
    setLogoPreview([])
    setHeroPreview([])
    setMetaPreview([])
  }, [initialData, form])

  async function uploadPickedImages() {
    setIsUploading(true)
    try {
      const out: Partial<Pick<ShopInfoFormValues, "logo" | "heroImage" | "metaImage">> = {}

      if (logoPreview.length > 0) {
        const [key] = await uploadImagesToR2({
          files: [logoPreview[0].file],
          folder: "storefront",
        })
        if (key) out.logo = toR2Url(key)
      }

      if (heroPreview.length > 0) {
        const [key] = await uploadImagesToR2({
          files: [heroPreview[0].file],
          folder: "storefront",
        })
        if (key) out.heroImage = toR2Url(key)
      }

      if (metaPreview.length > 0) {
        const [key] = await uploadImagesToR2({
          files: [metaPreview[0].file],
          folder: "storefront",
        })
        if (key) out.metaImage = toR2Url(key)
      }

      return out
    } finally {
      setIsUploading(false)
    }
  }

  const onSubmit = async (data: ShopInfoFormValues) => {
    setIsSaving(true)
    try {
      const uploaded = await uploadPickedImages()

      // final URLs:
      // - if user uploaded new one, use that
      // - else if existing not removed, keep it
      // - else empty
      const finalLogo = uploaded.logo ?? existingLogo[0] ?? ""
      const finalHero = uploaded.heroImage ?? existingHero[0] ?? ""
      const finalMeta = uploaded.metaImage ?? existingMeta[0] ?? ""

      const finalData: ShopInfoFormValues = {
        ...data,
        logo: finalLogo,
        heroImage: finalHero,
        metaImage: finalMeta,
      }

      const payload = { type: "info", value: finalData }

      const response = await apiCall("/api/storefront", {
        method: "POST",
        body: JSON.stringify(payload),
      })

      if (response.status_code === 200 || response.status_code === 201) {
        toast.success("Shop information saved successfully")
        onUpdate?.(finalData as unknown as Record<string, unknown>)

        // After save: reflect the saved URLs as "existing"
        setExistingLogo(finalLogo ? [finalLogo] : [])
        setExistingHero(finalHero ? [finalHero] : [])
        setExistingMeta(finalMeta ? [finalMeta] : [])

        // Clear local previews (their object URLs will be revoked by ImageUploader unmount cleanup)
        setLogoPreview([])
        setHeroPreview([])
        setMetaPreview([])
      } else {
        toast.error(response.message || "Failed to save shop information")
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save shop information")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Shop Information</CardTitle>
        <CardDescription>Configure your shop&apos;s basic information and branding</CardDescription>
      </CardHeader>

      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="shopName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Shop Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="My Awesome Shop" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="tagline"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tagline</FormLabel>
                    <FormControl>
                      <Input placeholder="Your shop&apos;s tagline" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">SEO & Meta Information</h3>

              <FormField
                control={form.control}
                name="metaTitle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Meta Title</FormLabel>
                    <FormControl>
                      <Input placeholder="SEO title for your shop" {...field} />
                    </FormControl>
                    <FormDescription>Displayed in search engine results</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="metaDescription"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Meta Description</FormLabel>
                    <FormControl>
                      <Input placeholder="Brief description for search engines" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <ImageUploader
                variant="thumbnail"
                label="Meta Image"
                description="Drop image here or click to upload."
                maxFiles={1}
                disabled={isBusy}
                previews={metaPreview}
                setPreviews={setMetaPreview}
                existing={existingMeta}
                onExistingChange={setExistingMeta}
              />
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Branding Assets</h3>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <ImageUploader
                  variant="thumbnail"
                  label="Logo"
                  description="Drop image here or click to upload."
                  maxFiles={1}
                  disabled={isBusy}
                  previews={logoPreview}
                  setPreviews={setLogoPreview}
                  existing={existingLogo}
                  onExistingChange={setExistingLogo}
                />

                <ImageUploader
                  variant="thumbnail"
                  label="Hero Image"
                  description="Drop image here or click to upload."
                  maxFiles={1}
                  disabled={isBusy}
                  previews={heroPreview}
                  setPreviews={setHeroPreview}
                  existing={existingHero}
                  onExistingChange={setExistingHero}
                />
              </div>

              {isUploading && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Uploading images...
                </div>
              )}
            </div>

            <Button type="submit" disabled={isBusy}>
              {isBusy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isUploading ? "Uploading..." : isSaving ? "Saving..." : "Save Shop Information"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}