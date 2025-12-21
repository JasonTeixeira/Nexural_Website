/**
 * BACKBLAZE B2 CLOUD STORAGE INTEGRATION
 * Handles automatic backup uploads to Backblaze B2
 */

import crypto from 'crypto'

interface BackblazeConfig {
  keyId: string
  applicationKey: string
  bucketName: string
  bucketId: string
}

interface BackblazeAuthResponse {
  authorizationToken: string
  apiUrl: string
  downloadUrl: string
}

interface UploadUrlResponse {
  uploadUrl: string
  authorizationToken: string
}

export class BackblazeStorage {
  private config: BackblazeConfig
  private authToken: string | null = null
  private apiUrl: string | null = null
  private downloadUrl: string | null = null

  constructor() {
    this.config = {
      keyId: process.env.BACKBLAZE_KEY_ID || '28b512718117',
      applicationKey: process.env.BACKBLAZE_APPLICATION_KEY || '005f41ad7abcd8e652e1f98695fee6169f86e0f6c5',
      bucketName: process.env.BACKBLAZE_BUCKET_NAME || 'NexTradeBackups',
      bucketId: process.env.BACKBLAZE_BUCKET_ID || '6238cbc5b132a70198910117'
    }
  }

  /**
   * Authenticate with Backblaze B2
   */
  async authenticate(): Promise<boolean> {
    try {
      const authString = Buffer.from(`${this.config.keyId}:${this.config.applicationKey}`).toString('base64')
      
      const response = await fetch('https://api.backblazeb2.com/b2api/v2/b2_authorize_account', {
        method: 'GET',
        headers: {
          'Authorization': `Basic ${authString}`
        }
      })

      if (!response.ok) {
        throw new Error(`Backblaze auth failed: ${response.status}`)
      }

      const data = await response.json() as BackblazeAuthResponse
      
      this.authToken = data.authorizationToken
      this.apiUrl = data.apiUrl
      this.downloadUrl = data.downloadUrl

      console.log('✅ Backblaze B2 authenticated successfully')
      return true

    } catch (error) {
      console.error('❌ Backblaze authentication failed:', error)
      return false
    }
  }

  /**
   * Upload file to Backblaze B2
   */
  async uploadFile(
    fileName: string,
    fileData: Buffer,
    contentType: string = 'application/gzip'
  ): Promise<{ success: boolean; fileId?: string; url?: string }> {
    try {
      // Ensure we're authenticated
      if (!this.authToken || !this.apiUrl) {
        const authenticated = await this.authenticate()
        if (!authenticated) {
          throw new Error('Failed to authenticate with Backblaze')
        }
      }

      // Get upload URL
      const uploadUrlResponse = await fetch(`${this.apiUrl}/b2api/v2/b2_get_upload_url`, {
        method: 'POST',
        headers: {
          'Authorization': this.authToken!,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          bucketId: this.config.bucketId
        })
      })

      if (!uploadUrlResponse.ok) {
        throw new Error(`Failed to get upload URL: ${uploadUrlResponse.status}`)
      }

      const uploadUrlData = await uploadUrlResponse.json() as UploadUrlResponse

      // Calculate SHA1 hash
      const sha1 = crypto.createHash('sha1').update(fileData).digest('hex')

      // Upload file
      const uploadResponse = await fetch(uploadUrlData.uploadUrl, {
        method: 'POST',
        headers: {
          'Authorization': uploadUrlData.authorizationToken,
          'X-Bz-File-Name': encodeURIComponent(fileName),
          'Content-Type': contentType,
          'Content-Length': fileData.length.toString(),
          'X-Bz-Content-Sha1': sha1
        },
        body: fileData as any
      })

      if (!uploadResponse.ok) {
        throw new Error(`Upload failed: ${uploadResponse.status}`)
      }

      const uploadData = await uploadResponse.json() as any

      console.log(`✅ Uploaded to Backblaze: ${fileName} (${(fileData.length / 1024 / 1024).toFixed(2)} MB)`)

      return {
        success: true,
        fileId: uploadData.fileId,
        url: `${this.downloadUrl}/file/${this.config.bucketName}/${fileName}`
      }

    } catch (error) {
      console.error(`❌ Failed to upload ${fileName}:`, error)
      return { success: false }
    }
  }

  /**
   * List files in bucket
   */
  async listFiles(prefix?: string): Promise<any[]> {
    try {
      if (!this.authToken || !this.apiUrl) {
        await this.authenticate()
      }

      const response = await fetch(`${this.apiUrl}/b2api/v2/b2_list_file_names`, {
        method: 'POST',
        headers: {
          'Authorization': this.authToken!,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          bucketId: this.config.bucketId,
          prefix: prefix || '',
          maxFileCount: 1000
        })
      })

      if (!response.ok) {
        throw new Error(`Failed to list files: ${response.status}`)
      }

      const data = await response.json() as any
      return data.files || []

    } catch (error) {
      console.error('❌ Failed to list files:', error)
      return []
    }
  }

  /**
   * Download file from Backblaze
   */
  async downloadFile(fileName: string): Promise<Buffer | null> {
    try {
      if (!this.authToken || !this.downloadUrl) {
        await this.authenticate()
      }

      const response = await fetch(`${this.downloadUrl}/file/${this.config.bucketName}/${fileName}`, {
        headers: {
          'Authorization': this.authToken!
        }
      })

      if (!response.ok) {
        throw new Error(`Download failed: ${response.status}`)
      }

      const arrayBuffer = await response.arrayBuffer()
      return Buffer.from(arrayBuffer)

    } catch (error) {
      console.error(`❌ Failed to download ${fileName}:`, error)
      return null
    }
  }

  /**
   * Delete file from Backblaze
   */
  async deleteFile(fileName: string, fileId: string): Promise<boolean> {
    try {
      if (!this.authToken || !this.apiUrl) {
        await this.authenticate()
      }

      const response = await fetch(`${this.apiUrl}/b2api/v2/b2_delete_file_version`, {
        method: 'POST',
        headers: {
          'Authorization': this.authToken!,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          fileName,
          fileId
        })
      })

      if (!response.ok) {
        throw new Error(`Delete failed: ${response.status}`)
      }

      console.log(`✅ Deleted from Backblaze: ${fileName}`)
      return true

    } catch (error) {
      console.error(`❌ Failed to delete ${fileName}:`, error)
      return false
    }
  }

  /**
   * Get bucket storage usage
   */
  async getStorageUsage(): Promise<{ fileCount: number; totalSize: number }> {
    try {
      const files = await this.listFiles()
      
      const totalSize = files.reduce((sum, file) => sum + (file.contentLength || 0), 0)
      
      return {
        fileCount: files.length,
        totalSize
      }

    } catch (error) {
      console.error('❌ Failed to get storage usage:', error)
      return { fileCount: 0, totalSize: 0 }
    }
  }
}

// Global instance
let globalBackblazeStorage: BackblazeStorage | null = null

export function getBackblazeStorage(): BackblazeStorage {
  if (!globalBackblazeStorage) {
    globalBackblazeStorage = new BackblazeStorage()
  }
  return globalBackblazeStorage
}
