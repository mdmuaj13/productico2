"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2 } from "lucide-react"
import { ImageUploader, PreviewItem } from "../image-uploader"

export function ProductImagesSection({
  isBusy,
  isUploading,
  thumbPreview,
  setThumbPreview,
  imagePreviews,
  setImagePreviews,
}: {
  isBusy: boolean
  isUploading: boolean
  thumbPreview: PreviewItem[]
  setThumbPreview: React.Dispatch<React.SetStateAction<PreviewItem[]>>
  imagePreviews: PreviewItem[]
  setImagePreviews: React.Dispatch<React.SetStateAction<PreviewItem[]>>
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Product Images</CardTitle>
      </CardHeader>

      <CardContent className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ImageUploader
          variant="thumbnail"
          label="Thumbnail"
          description="Drop image here or click to upload."
          maxFiles={1}
          disabled={isBusy}
          previews={thumbPreview}
          setPreviews={setThumbPreview}
        />

        <div className="space-y-3">
          <ImageUploader
            variant="gallery"
            label="Gallery Images"
            description="Drop images here or click to upload (max 8)."
            maxFiles={8}
            disabled={isBusy}
            previews={imagePreviews}
            setPreviews={setImagePreviews}
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
  )
}
