import { ImageOff } from "lucide-react"
import { useState } from "react"

interface EvidenceImageProps {
  src: string | null
  alt: string
}

export function EvidenceImage({ src, alt }: EvidenceImageProps) {
  const [error, setError] = useState(false)

  if (!src || error) {
    return (
      <div className="flex flex-col items-center justify-center h-48 border rounded-md bg-muted text-muted-foreground">
        <ImageOff className="h-8 w-8 mb-2" />
        <p className="text-sm text-center">
          Evidencia no disponible
        </p>
      </div>
    )
  }

  return (
    <img
      src={src}
      alt={alt}
      className="rounded-md border object-cover w-full max-h-96"
      onError={() => setError(true)}
    />
  )
}
