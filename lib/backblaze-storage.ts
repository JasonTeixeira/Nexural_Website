// Placeholder shim for optional Backblaze integration.
// TODO: replace with real implementation or remove if deprecated by SSOT.

export type BackblazeStorage = {
  uploadFile: (
    fileName: string,
    fileData: Buffer,
    contentType?: string
  ) => Promise<{ success: boolean; url?: string }>
}

export function getBackblazeStorage(): BackblazeStorage {
  return {
    uploadFile: async () => {
      // best-effort stub
      return { success: false }
    },
  }
}
