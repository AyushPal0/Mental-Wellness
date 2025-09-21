"use client"

import { useEffect, useRef, useState } from "react"
import Image from "next/image"
import { cn } from "@/lib/utils"

const getFileExtension = (url: string): string => {
  return url.split(".").pop()?.toLowerCase() || ""
}

const isVideo = (extension: string): boolean => {
  const videoExtensions = ["mp4", "webm", "ogg", "mov", "avi", "m4v"]
  return videoExtensions.includes(extension)
}

const VideoWithPlaceholder = ({
  src,
  className,
  placeholder,
}: {
  src: string
  className?: string
  placeholder?: string
}) => {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [videoLoaded, setVideoLoaded] = useState(false)

  useEffect(() => {
    if (process.env.NODE_ENV === "development" && !placeholder) {
      console.warn("No placeholder provided for video")
    }
  }, [placeholder])

  useEffect(() => {
    const video = videoRef.current

    if (video) {
      const handleLoadedData = () => {
        setVideoLoaded(true)
      }

      const handleCanPlay = () => {
        setVideoLoaded(true)
      }

      video.addEventListener("loadeddata", handleLoadedData)
      video.addEventListener("canplay", handleCanPlay)
      video.load()

      if (video.readyState >= 2) {
        setVideoLoaded(true)
      }

      return () => {
        video.removeEventListener("loadeddata", handleLoadedData)
        video.removeEventListener("canplay", handleCanPlay)
      }
    }
  }, [src])

  useEffect(() => {
    if (videoRef.current && videoLoaded) {
      videoRef.current.play()
    }
  }, [videoLoaded])

  return (
    <>
      {placeholder ? (
        <Image
          src={placeholder || "/placeholder.svg"}
          loading="eager"
          priority
          sizes="100vw"
          alt="Background"
          className={cn(className, { invisible: videoLoaded })}
          quality={100}
          fill
        />
      ) : null}
      <video
        ref={videoRef}
        src={src}
        muted
        playsInline
        loop
        controls={false}
        preload="auto"
        className={cn(className, { invisible: !videoLoaded })}
      />
    </>
  )
}

export const Background = ({
  src,
  placeholder,
}: {
  src: string
  placeholder?: string
}) => {
  const extension = getFileExtension(src)
  const isVideoFile = isVideo(extension)

  const classNames =
    "fixed bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 left-0 top-0 w-screen h-screen object-cover z-0"

  if (isVideoFile) {
    return <VideoWithPlaceholder src={src} className={classNames} placeholder={placeholder} />
  }

  return (
    <Image
      priority
      loading="eager"
      src={src || "/placeholder.svg"}
      alt="Background"
      className={classNames}
      sizes="100vw"
      fill
    />
  )
}
