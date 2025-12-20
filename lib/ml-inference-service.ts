/**
 * ML Inference Service
 * Loads trained models and makes predictions on live data
 */

import { createClient } from '@supabase/supabase-js'
import { spawn } from 'child_process'
import path from 'path'

export class MLInferenceService {
  private supabase: any
  private activeModels: Map<string, any> = new Map()
  
  constructor() {
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
  }
  
  /**
   * Get active model for a symbol
   */
  async getActiveModel(symbol: string): Promise<any> {
    try {
      const { data, error } = await this.supabase
        .from('ml_model_versions')
        .select('*')
        .eq('symbol', symbol)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()
      
      if (error) throw error
      
      return data
    } catch (error: any) {
      console.error(`Error fetching active model for ${symbol}:`, error.message)
      return null
    }
  }
  
  /**
   * Get latest features for a symbol
   */
  async getLatestFeatures(symbol: string): Promise<any> {
    try {
      const { data, error } = await this.supabase
        .from('ml_training_features')
        .select('*')
        .eq('symbol', symbol)
        .order('timestamp', { ascending: false })
        .limit(1)
        .single()
      
      if (error) throw error
      
      return data
    } catch (error: any) {
      console.error(`Error fetching features for ${symbol}:`, error.message)
      return null
    }
  }
  
  /**
   * Make prediction using Python model
   */
  async predict(symbol: string): Promise<{
    prediction: number
    probability: number
    confidence: number
    features: any
    model_id: string
  } | null> {
    try {
      // Get active model
      const model = await this.getActiveModel(symbol)
      if (!model) {
        console.log(`No active model found for ${symbol}`)
        return null
      }
      
      // Get latest features
      const features = await this.getLatestFeatures(symbol)
      if (!features) {
        console.log(`No features found for ${symbol}`)
        return null
      }
      
      // Call Python inference script
      const result = await this.runPythonInference(model.model_id, features)
      
      return {
        prediction: result.prediction,
        probability: result.probability,
        confidence: result.confidence,
        features: features,
        model_id: model.model_id
      }
      
    } catch (error: any) {
      console.error(`Error making prediction for ${symbol}:`, error.message)
      return null
    }
  }
  
  /**
   * Run Python inference script
   */
  private async runPythonInference(modelId: string, features: any): Promise<any> {
    return new Promise((resolve, reject) => {
      const scriptPath = path.join(process.cwd(), 'ml_training', 'inference.py')
      
      // Prepare feature data
      const featureData = JSON.stringify(features)
      
      const python = spawn('python3', [
        scriptPath,
        '--model-id', modelId,
        '--features', featureData
      ])
      
      let output = ''
      let errorOutput = ''
      
      python.stdout.on('data', (data) => {
        output += data.toString()
      })
      
      python.stderr.on('data', (data) => {
        errorOutput += data.toString()
      })
      
      python.on('close', (code) => {
        if (code !== 0) {
          reject(new Error(`Python script failed: ${errorOutput}`))
          return
        }
        
        try {
          const result = JSON.parse(output)
          resolve(result)
        } catch (error) {
          reject(new Error(`Failed to parse Python output: ${output}`))
        }
      })
    })
  }
  
  /**
   * Predict for all symbols
   */
  async predictAll(symbols: string[]): Promise<Map<string, any>> {
    const predictions = new Map()
    
    for (const symbol of symbols) {
      const prediction = await this.predict(symbol)
      if (prediction) {
        predictions.set(symbol, prediction)
      }
    }
    
    return predictions
  }
  
  /**
   * Get model statistics
   */
  async getModelStats(symbol: string): Promise<any> {
    try {
      const model = await this.getActiveModel(symbol)
      if (!model) return null
      
      return {
        model_id: model.model_id,
        model_type: model.model_type,
        accuracy: model.accuracy,
        precision: model.precision,
        recall: model.recall,
        f1_score: model.f1_score,
        roc_auc: model.roc_auc,
        created_at: model.created_at
      }
    } catch (error: any) {
      console.error(`Error fetching model stats:`, error.message)
      return null
    }
  }
}

// Singleton instance
let inferenceService: MLInferenceService | null = null

export function getMLInferenceService(): MLInferenceService {
  if (!inferenceService) {
    inferenceService = new MLInferenceService()
  }
  return inferenceService
}
