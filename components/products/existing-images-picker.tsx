"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { X } from "lucide-react"

export function ExistingImagesPicker({
  label,
  images,
  onRemove,
}: {
  label: string
  images: string[]
  onRemove: (idx: number) => void
}) {
  if (!images?.length) return null

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium">{label}</p>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {images.map((src, idx) => (
          <Card key={`${src}-${idx}`} className="relative overflow-hidden border">
            <img src={src} alt={`${label}-${idx}`} className="h-32 w-full object-cover" />
            <Button
              type="button"
              size="icon"
              variant="secondary"
              className="absolute right-2 top-2 h-8 w-8"
              onClick={() => onRemove(idx)}
              title="Remove"
            >
              <X className="h-4 w-4" />
            </Button>
          </Card>
        ))}
      </div>
    </div>
  )
}
