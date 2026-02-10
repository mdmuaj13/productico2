"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { X, Image as ImageIcon } from "lucide-react"
import { toast } from "sonner"

export type PreviewItem = { id: string; file: File; url: string }

const ACCEPT = "image/jpeg,image/jpg,image/png,image/webp,image/gif"
const MAX_SIZE = 10 * 1024 * 1024 // 10MB

function validateFile(file: File) {
  if (!ACCEPT.split(",").includes(file.type)) return `Invalid type: ${file.name}`
  if (file.size > MAX_SIZE) return `Too large (max 10MB): ${file.name}`
  return null
}

function uid() {
  return Math.random().toString(36).slice(2)
}

type Props = {
  variant?: "thumbnail" | "gallery"
  label?: string
  description?: string
  maxFiles?: number
  disabled?: boolean

  // New files (local previews)
  previews: PreviewItem[]
  setPreviews: React.Dispatch<React.SetStateAction<PreviewItem[]>>

  // Existing images (already uploaded URLs)
  existing?: string[]
  onExistingChange?: (next: string[]) => void

  // Optional callback when user selects files
  onPick?: (files: File[]) => void
}

export function ImageUploader({
  variant = "gallery",
  label = variant === "thumbnail" ? "Thumbnail" : "Images",
  description =
    variant === "thumbnail"
      ? "Drop an image here or click to upload"
      : "Drop images here or click to upload",
  maxFiles = variant === "thumbnail" ? 1 : 8,
  disabled,
  previews,
  setPreviews,
  existing = [],
  onExistingChange,
  onPick,
}: Props) {
  const multiple = variant !== "thumbnail"

  // cleanup preview object URLs
  React.useEffect(() => {
    return () => {
      for (const p of previews) URL.revokeObjectURL(p.url)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const remaining = Math.max(0, maxFiles - existing.length)

  const addFiles = (fileList: FileList | null) => {
    if (!fileList || disabled) return

    if (remaining <= 0) {
      toast.error(`Max ${maxFiles} file(s) allowed`)
      return
    }

    const incoming = Array.from(fileList)
    const next: PreviewItem[] = []

    for (const f of incoming) {
      const err = validateFile(f)
      if (err) {
        toast.error(err)
        continue
      }
      next.push({ id: uid(), file: f, url: URL.createObjectURL(f) })
    }

    if (next.length === 0) return

    setPreviews((prev) => {
      let merged = multiple ? [...prev, ...next] : next.slice(0, 1)

      // enforce max, considering existing images too
      if (merged.length > remaining) {
        toast.error(`You can add only ${remaining} more file(s)`)
        for (const extra of merged.slice(remaining)) URL.revokeObjectURL(extra.url)
        merged = merged.slice(0, remaining)
      }

      // thumbnail mode: replace old preview URL
      if (!multiple && prev[0]?.url) URL.revokeObjectURL(prev[0].url)

      return merged
    })

    onPick?.(incoming)
  }

  const removePreviewAt = (idx: number) => {
    setPreviews((prev) => {
      const item = prev[idx]
      if (item) URL.revokeObjectURL(item.url)
      return prev.filter((_, i) => i !== idx)
    })
  }

  const removeExistingAt = (idx: number) => {
    if (!onExistingChange) return
    onExistingChange(existing.filter((_, i) => i !== idx))
  }

  const totalCount = existing.length + previews.length
  const hasAny = totalCount > 0

  // For thumbnail: show existing thumbnail if present, else preview
  const thumbUrl =
    variant === "thumbnail" ? (existing[0] || previews[0]?.url || "") : ""

  return (
    <div className="space-y-2">
      <div className="space-y-1">
        <Label>{label}</Label>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>

      {/* Dropzone (click anywhere to upload) */}
      <Card
        className={cn(
          "relative border-dashed p-4 transition",
          disabled ? "opacity-60" : "hover:bg-muted/40"
        )}
        onDragOver={(e) => {
          if (disabled) return
          e.preventDefault()
        }}
        onDrop={(e) => {
          if (disabled) return
          e.preventDefault()
          addFiles(e.dataTransfer.files)
        }}
      >
        {/* Brave-safe input overlay */}
        <input
          type="file"
          accept={ACCEPT}
          multiple={multiple}
          disabled={disabled}
          onChange={(e) => {
            addFiles(e.target.files)
            e.currentTarget.value = "" // allow selecting same file again
          }}
          className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
          style={{ pointerEvents: disabled ? "none" : "auto" }}
        />

        {/* THUMBNAIL */}
        {variant === "thumbnail" ? (
          !hasAny ? (
            <div className="flex flex-col items-center justify-center gap-2 py-8 text-center">
              <div className="h-10 w-10 rounded-full border flex items-center justify-center">
                <ImageIcon className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="text-sm font-medium">Drop image here</div>
              <div className="text-xs text-muted-foreground">
                or click anywhere to upload
              </div>
            </div>
          ) : (
            <div className="relative overflow-hidden rounded-lg border bg-background">
              <img src={thumbUrl} alt="thumbnail" className="h-56 w-full object-cover" />

              {/* stop click bubbling so input doesn't open */}
              <div
                className="absolute top-2 right-2"
                onClick={(e) => e.stopPropagation()}
              >
                <Button
                  type="button"
                  size="icon"
                  variant="secondary"
                  className="h-9 w-9"
                  disabled={disabled}
                  onClick={() => {
                    // if existing thumbnail exists remove it, else remove preview
                    if (existing.length > 0) removeExistingAt(0)
                    else removePreviewAt(0)
                  }}
                  title="Remove thumbnail"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div
                className="absolute bottom-2 left-2 rounded-md bg-black/50 px-2 py-1 text-[11px] text-white"
                onClick={(e) => e.stopPropagation()}
              >
                Thumbnail
              </div>
            </div>
          )
        ) : (
          // GALLERY
          !hasAny ? (
            <div className="flex flex-col items-center justify-center gap-2 py-8 text-center">
              <div className="h-10 w-10 rounded-full border flex items-center justify-center">
                <ImageIcon className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="text-sm font-medium">Drop images here</div>
              <div className="text-xs text-muted-foreground">
                or click anywhere to upload
              </div>
            </div>
          ) : (
            <div
              className="grid grid-cols-2 sm:grid-cols-3 gap-3"
              onClick={(e) => e.stopPropagation()}
            >
              {/* existing urls */}
              {existing.map((src, idx) => (
                <div
                  key={`existing-${src}-${idx}`}
                  className="group relative overflow-hidden rounded-lg border bg-background"
                >
                  <img
                    src={src}
                    alt={`existing-${idx}`}
                    className="h-32 w-full object-cover"
                  />

                  {onExistingChange && (
                    <div className="absolute right-2 top-2">
                      <Button
                        type="button"
                        size="icon"
                        variant="secondary"
                        className="h-8 w-8"
                        disabled={disabled}
                        onClick={() => removeExistingAt(idx)}
                        title="Remove existing"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              ))}

              {/* new previews */}
              {previews.map((p, idx) => (
                <div
                  key={`preview-${p.id}`}
                  className="group relative overflow-hidden rounded-lg border bg-background"
                >
                  <img
                    src={p.url}
                    alt={`preview-${idx}`}
                    className="h-32 w-full object-cover"
                  />

                  <div className="absolute right-2 top-2">
                    <Button
                      type="button"
                      size="icon"
                      variant="secondary"
                      className="h-8 w-8"
                      disabled={disabled}
                      onClick={() => removePreviewAt(idx)}
                      title="Remove new"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )
        )}
      </Card>

      <div className="text-xs text-muted-foreground">
        {existing.length + previews.length}/{maxFiles} selected
        {variant === "gallery" && existing.length > 0 && (
          <span className="ml-2">• {existing.length} existing</span>
        )}
      </div>
    </div>
  )
}
