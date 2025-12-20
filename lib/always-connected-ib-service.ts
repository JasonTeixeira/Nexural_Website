/**
 * Always Connected IB Service - Stub for build
 * TODO: Implement persistent Interactive Brokers connection service
 */

export class AlwaysConnectedIBService {
  private isRunning = false

  async start() {
    this.isRunning = true
    return { success: true, message: 'Always-connected service pending implementation' }
  }

  async stop() {
    this.isRunning = false
    return { success: true }
  }

  async getStatus() {
    return { 
      running: this.isRunning, 
      connected: false,
      message: 'Not implemented' 
    }
  }

  async healthCheck() {
    return { healthy: false, message: 'Health check pending implementation' }
  }
}

export const alwaysConnectedIBService = new AlwaysConnectedIBService()
