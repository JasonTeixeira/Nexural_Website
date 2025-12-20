'use client'

import { useState, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog'
import { 
  Upload, 
  X, 
  Image as ImageIcon, 
  ZoomIn, 
  Download,
  Trash2,
  FileImage,
  Loader2
} from 'lucide-react'
import { toast } from 'sonner'
import Image from 'next/image'

interface ImageUploadProps {
  positionId: string
  eventId?: string
  onUploadComplete?: (imageUrl: string, caption?: string) => void
  maxFiles?: number
  maxFileSize?: number // in MB
}

interface UploadedImage {
  id: string
  url: string
  caption?: string
  uploadedAt: Date
  fileName: string
  fileSize: number
}

export function ImageUpload({
  positionId,
  eventId,
  onUploadComplete,
  maxFiles = 10,
  maxFileSize = 10, // 10MB default
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [files, setFiles] = useState<File[]>([])
  const [caption, setCaption] = useState('')
  const [previewUrls, setPreviewUrls] = useState<string[]>([])
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || [])
    
    // Validate file types
    const validFiles = selectedFiles.filter(file => {
      const isImage = file.type.startsWith('image/')
      const isUnderSize = file.size <= maxFileSize * 1024 * 1024
      
      if (!isImage) {
        toast.error(`${file.name} is not an image file`)
        return false
      }
      if (!isUnderSize) {
        toast.error(`${file.name} exceeds ${maxFileSize}MB limit`)
        return false
      }
      return true
    })

    if (files.length + validFiles.length > maxFiles) {
      toast.error(`Maximum ${maxFiles} files allowed`)
      return
    }

    // Create preview URLs
    const newPreviewUrls = validFiles.map(file => URL.createObjectURL(file))
    
    setFiles(prev => [...prev, ...validFiles])
    setPreviewUrls(prev => [...prev, ...newPreviewUrls])
  }

  const removeFile = (index: number) => {
    // Revoke preview URL to free memory
    URL.revokeObjectURL(previewUrls[index])
    
    setFiles(prev => prev.filter((_, i) => i !== index))
    setPreviewUrls(prev => prev.filter((_, i) => i !== index))
  }

  const handleUpload = async () => {
    if (files.length === 0) {
      toast.error('Please select at least one image')
      return
    }

    try {
      setUploading(true)

      for (const file of files) {
        const formData = new FormData()
        formData.append('file', file)
        formData.append('positionId', positionId)
        if (eventId) formData.append('eventId', eventId)
        if (caption) formData.append('caption', caption)

        const response = await fetch('/api/positions/images/upload', {
          method: 'POST',
          body: formData,
        })

        if (!response.ok) {
          throw new Error(`Failed to upload ${file.name}`)
        }

        const data = await response.json()
        
        if (onUploadComplete) {
          onUploadComplete(data.url, caption)
        }
      }

      toast.success(`${files.length} image${files.length > 1 ? 's' : ''} uploaded successfully!`)
      
      // Clean up
      previewUrls.forEach(url => URL.revokeObjectURL(url))
      setFiles([])
      setPreviewUrls([])
      setCaption('')
      setUploadDialogOpen(false)
      
    } catch (error) {
      console.error('Upload error:', error)
      toast.error('Failed to upload images')
    } finally {
      setUploading(false)
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
  }

  return (
    <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Upload className="w-4 h-4 mr-2" />
          Upload Images
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Upload Trade Images</DialogTitle>
          <DialogDescription>
            Upload charts, screenshots, or notes. Max {maxFiles} files, {maxFileSize}MB each.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* File Input */}
          <div className="space-y-2">
            <Label>Select Images</Label>
            <div 
              className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-primary transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              <FileImage className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-sm text-muted-foreground mb-2">
                Click to browse or drag and drop
              </p>
              <p className="text-xs text-muted-foreground">
                PNG, JPG, GIF up to {maxFileSize}MB
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>
          </div>

          {/* Preview Grid */}
          {previewUrls.length > 0 && (
            <div className="space-y-2">
              <Label>Selected Files ({files.length})</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {previewUrls.map((url, index) => (
                  <div key={index} className="relative group">
                    <div className="aspect-square rounded-lg overflow-hidden border border-border bg-card">
                      <Image
                        src={url}
                        alt={files[index].name}
                        width={200}
                        height={200}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <Button
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => removeFile(index)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                    <p className="text-xs text-muted-foreground mt-1 truncate">
                      {files[index].name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatFileSize(files[index].size)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Caption */}
          <div className="space-y-2">
            <Label>Caption (Optional)</Label>
            <Textarea
              placeholder="Add a note about these images..."
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setUploadDialogOpen(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleUpload} 
            disabled={uploading || files.length === 0}
          >
            {uploading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" />
                Upload {files.length} Image{files.length !== 1 ? 's' : ''}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// Image Gallery Component
interface ImageGalleryProps {
  images: UploadedImage[]
  onDelete?: (imageId: string) => void
}

export function ImageGallery({ images, onDelete }: ImageGalleryProps) {
  const [lightboxImage, setLightboxImage] = useState<UploadedImage | null>(null)

  if (images.length === 0) {
    return null
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {images.map((image) => (
          <div key={image.id} className="relative group">
            <div 
              className="aspect-square rounded-lg overflow-hidden border border-border bg-card cursor-pointer hover:border-primary transition-colors"
              onClick={() => setLightboxImage(image)}
            >
              <Image
                src={image.url}
                alt={image.caption || 'Trade image'}
                width={300}
                height={300}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  setLightboxImage(image)
                }}
              >
                <ZoomIn className="w-4 h-4" />
              </Button>
              {onDelete && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    onDelete(image.id)
                  }}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </div>
            {image.caption && (
              <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                {image.caption}
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Lightbox */}
      {lightboxImage && (
        <Dialog open={true} onOpenChange={() => setLightboxImage(null)}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>{lightboxImage.fileName}</DialogTitle>
              {lightboxImage.caption && (
                <DialogDescription>{lightboxImage.caption}</DialogDescription>
              )}
            </DialogHeader>
            <div className="relative w-full" style={{ maxHeight: '70vh' }}>
              <Image
                src={lightboxImage.url}
                alt={lightboxImage.caption || 'Trade image'}
                width={1200}
                height={800}
                className="w-full h-auto object-contain rounded-lg"
              />
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  const link = document.createElement('a')
                  link.href = lightboxImage.url
                  link.download = lightboxImage.fileName
                  document.body.appendChild(link)
                  link.click()
                  document.body.removeChild(link)
                }}
              >
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
              <Button onClick={() => setLightboxImage(null)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
