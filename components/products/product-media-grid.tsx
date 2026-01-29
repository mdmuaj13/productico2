"use client"

import * as React from "react"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"

export function ProductMediaGrid({
  thumbnail,
  images,
}: {
  thumbnail?: string
  images?: string[]
}) {
  const all = React.useMemo(() => {
    const list = [
      ...(thumbnail ? [thumbnail] : []),
      ...(images || []),
    ]
    // de-duplicate
    return Array.from(new Set(list)).filter(Boolean)
  }, [thumbnail, images])

  if (all.length === 0) return null

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium">Images</p>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {all.map((src, idx) => (
          <a
            key={`${src}-${idx}`}
            href={src}
            target="_blank"
            rel="noreferrer"
            className="block"
          >
            <Card className={cn("overflow-hidden border hover:opacity-90 transition")}>
              <img
                src={src}
                alt={`product-image-${idx}`}
                className="h-32 w-full object-cover"
                loading="lazy"
              />
            </Card>
          </a>
        ))}
      </div>

      {thumbnail && (
        <p className="text-xs text-muted-foreground">
          First image is thumbnail.
        </p>
      )}
    </div>
  )
}
