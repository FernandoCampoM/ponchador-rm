"use client"

import { useEffect, useRef } from "react"

export function useCamera() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach(track => track.stop())
    }
  }, [])

  const startCamera = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        width: { ideal: 320 },
        height: { ideal: 240 },
        facingMode: { ideal: "user" },
      },
      audio: false,
    })

    streamRef.current = stream

    if (videoRef.current) {
      videoRef.current.srcObject = stream
      videoRef.current.muted = true
      videoRef.current.playsInline = true
      try {
        await videoRef.current.play();
      } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') {
          console.log('Reproducción interrumpida (esperado durante cambios rápidos)');
        } else {
          console.error('Error al reproducir:', error);
        }
      }
    }
  }

  const captureFromCamera = (): string => {
    if (!videoRef.current || !canvasRef.current) {
      throw new Error("Camera not initialized")
    }

    const video = videoRef.current
    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")!

    canvas.width = video.videoWidth
    canvas.height = video.videoHeight

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

    return canvas.toDataURL("image/jpeg", 0.4)
  }

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach(track => track.stop())
    streamRef.current = null
  }

  return {
    videoRef,
    canvasRef,
    startCamera,
    captureFromCamera,
    stopCamera,
  }
}
