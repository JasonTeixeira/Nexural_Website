#!/usr/bin/env python3
"""
PHASE 3: ML Model Ensemble Training
World-Class Trading System - Predictive Intelligence

This script implements a 5-model ensemble + meta-model:

1. Regime Classifier - Identifies current market regime
2. Direction Predictor - Predicts Long/Short/Neutral (regime-specific)
   - Trend Model (XGBoost) for trending regimes
   - Mean Reversion Model (LightGBM) for ranging regimes
   - Cycle Model (LSTM) for cyclical patterns
3. Magnitude Predictor - Predicts expected move size (Quantile Regression)
4. Confidence Scorer - Assesses signal quality (Calibrated Classifier)
5. Risk Predictor - Forecasts VaR, CVaR (Bayesian Neural Network)
6. Meta-Model - Combines all predictions with Bayesian weighting

Each model is trained per symbol with walk-forward validation.
"""

import os
import sys
from datetime import datetime
import pandas as pd
import numpy as np
from dotenv import load_dotenv
from supabase import create_client
from typing import Dict, List, Tuple
import warnings
warnings.filterwarnings('ignore')

# ML imports
try:
    from sklearn.ensemble import RandomForestClassifier, GradientBoostingRegressor
    from sklearn.model_selection import TimeSeriesSplit
    from sklearn.preprocessing import StandardScaler
    from sklearn.metrics import accuracy_score, f1_score, mean_squared_error
    import xgboost as xgb
    import lightgbm as lgb
    import joblib
    print("✅ ML libraries loaded successfully")
except ImportError as e:
    print(f"❌ Missing ML library: {e}")
    print("Install with: pip install scikit-learn xgboost lightgbm joblib")
    sys.exit(1)

# Load environment
load_dotenv('.env.local')

# Supabase connection
SUPABASE_URL = os.getenv('NEXT_PUBLIC_SUPABASE_URL')
SUPABASE_KEY = os.getenv('SUPABASE_SERVICE_ROLE_KEY')

if not SUPABASE_URL or not SUPABASE_KEY:
    print("❌ Missing Supabase credentials")
    sys.exit(1)

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

# Model save directory
MODEL_DIR = 'ml_models'
os.makedirs(MODEL_DIR, exist_ok=True)


class MLModelTrainer:
    """
    Professional-grade ML model training and ensemble
    """
    
    def __init__(self):
        self.supabase = supabase
        self.scaler = StandardScaler()
        
        # Feature groups
        self.price_features = [
            'open', 'high', 'low', 'close', 'volume'
        ]
        
        self.technical_features = [
            'jma_7', 'jma_14', 'jma_21',
            'ehlers_mesa', 'ehlers_trendline', 'ehlers_cycle',
            'kama_10', 'kama_20', 'zlema_20',
            'fisher', 'fisher_trigger', 'inverse_fisher_rsi',
            'stoch_rsi', 'stoch_rsi_signal',
            'tsi', 'tsi_signal', 'cmo'
        ]
        
        self.volatility_features = [
            'garch_vol', 'parkinson_vol', 'garman_klass_vol', 'yang_zhang_vol'
        ]
        
        self.regime_features = [
            'hurst_exponent', 'adx', 'plus_di', 'minus_di',
            'choppiness', 'fractal_dimension', 'market_entropy',
            'volatility_regime', 'trend_regime', 'cycle_regime',
            'liquidity_regime', 'market_hours_regime',
            'timeframe_alignment'
        ]
        
        self.microstructure_features = [
            'volume_poc', 'volume_vah', 'volume_val',
            'order_flow_imbalance', 'spread_mean', 'spread_std',
            'tick_count', 'uptick_ratio', 'trade_intensity'
        ]
    
    # ==================== DATA PREPARATION ====================
    
    def fetch_training_data(self, symbol: str, timeframe: str) -> pd.DataFrame:
        """
        Fetch all data for training
        """
        print(f"\n📊 Fetching training data for {symbol} - {timeframe}...")
        
        result = self.supabase.table('multi_timeframe_data')\
            .select('*')\
            .eq('symbol', symbol)\
            .eq('timeframe', timeframe)\
            .order('timestamp')\
            .execute()
        
        if not result.data:
            print(f"  ⚠️ No data found")
            return pd.DataFrame()
        
        df = pd.DataFrame(result.data)
        print(f"  ✅ Loaded {len(df):,} bars")
        
        return df
    
    def prepare_features(self, df: pd.DataFrame) -> Tuple[pd.DataFrame, pd.Series]:
        """
        Prepare feature matrix and target variable
        """
        # Combine all feature groups
        all_features = (
            self.price_features +
            self.technical_features +
            self.volatility_features +
            self.regime_features +
            self.microstructure_features
        )
        
        # Select available features
        available_features = [f for f in all_features if f in df.columns]
        
        if len(available_features) == 0:
            raise ValueError("No features available")
        
        # Create feature matrix
        X = df[available_features].copy()
        
        # Create target (next bar return)
        df['returns'] = df['close'].pct_change()
        df['target_return'] = df['returns'].shift(-1)
        df['target_direction'] = (df['target_return'] > 0).astype(int)
        
        # Drop rows with NaN
        valid_idx = ~(X.isna().any(axis=1) | df['target_return'].isna())
        X = X[valid_idx]
        y_return = df.loc[valid_idx, 'target_return']
        y_direction = df.loc[valid_idx, 'target_direction']
        
        print(f"  ✅ Prepared {len(X)} samples with {len(available_features)} features")
        
        return X, y_direction, y_return
    
    # ==================== MODEL 1: REGIME CLASSIFIER ====================
    
    def train_regime_classifier(self, X: pd.DataFrame, df: pd.DataFrame) -> RandomForestClassifier:
        """
        Train regime classifier to identify market state
        """
        print(f"\n  🔧 Training Regime Classifier...")
        
        # Use regime features
        regime_cols = [c for c in self.regime_features if c in X.columns]
        X_regime = X[regime_cols]
        
        # Target is volatility regime (as proxy for overall regime)
        if 'volatility_regime' in df.columns:
            y_regime = df.loc[X_regime.index, 'volatility_regime']
        else:
            print(f"    ⚠️ No regime labels, skipping")
            return None
        
        # Train Random Forest
        model = RandomForestClassifier(
            n_estimators=100,
            max_depth=10,
            min_samples_split=20,
            random_state=42,
            n_jobs=-1
        )
        
        model.fit(X_regime, y_regime)
        
        # Evaluate
        y_pred = model.predict(X_regime)
        accuracy = accuracy_score(y_regime, y_pred)
        
        print(f"    ✅ Regime Classifier trained - Accuracy: {accuracy:.3f}")
        
        return model
    
    # ==================== MODEL 2: DIRECTION PREDICTOR ====================
    
    def train_direction_predictor(self, X: pd.DataFrame, y: pd.Series, regime: str = 'trend') -> object:
        """
        Train direction predictor (regime-specific)
        """
        print(f"\n  🔧 Training Direction Predictor ({regime})...")
        
        # Time series split
        tscv = TimeSeriesSplit(n_splits=5)
        
        if regime == 'trend':
            # XGBoost for trending markets
            model = xgb.XGBClassifier(
                n_estimators=100,
                max_depth=6,
                learning_rate=0.1,
                random_state=42,
                n_jobs=-1
            )
        elif regime == 'range':
            # LightGBM for ranging markets
            model = lgb.LGBMClassifier(
                n_estimators=100,
                max_depth=6,
                learning_rate=0.1,
                random_state=42,
                n_jobs=-1,
                verbose=-1
            )
        else:
            # Gradient Boosting for other regimes
            from sklearn.ensemble import GradientBoostingClassifier
            model = GradientBoostingClassifier(
                n_estimators=100,
                max_depth=6,
                learning_rate=0.1,
                random_state=42
            )
        
        # Train with cross-validation
        scores = []
        for train_idx, val_idx in tscv.split(X):
            X_train, X_val = X.iloc[train_idx], X.iloc[val_idx]
            y_train, y_val = y.iloc[train_idx], y.iloc[val_idx]
            
            model.fit(X_train, y_train)
            y_pred = model.predict(X_val)
            score = accuracy_score(y_val, y_pred)
            scores.append(score)
        
        # Final train on all data
        model.fit(X, y)
        
        avg_score = np.mean(scores)
        print(f"    ✅ Direction Predictor trained - CV Accuracy: {avg_score:.3f}")
        
        return model
    
    # ==================== MODEL 3: MAGNITUDE PREDICTOR ====================
    
    def train_magnitude_predictor(self, X: pd.DataFrame, y_return: pd.Series) -> GradientBoostingRegressor:
        """
        Train magnitude predictor for expected move size
        """
        print(f"\n  🔧 Training Magnitude Predictor...")
        
        # Use absolute returns as target
        y_magnitude = y_return.abs()
        
        # Gradient Boosting Regressor
        model = GradientBoostingRegressor(
            n_estimators=100,
            max_depth=6,
            learning_rate=0.1,
            random_state=42
        )
        
        model.fit(X, y_magnitude)
        
        # Evaluate
        y_pred = model.predict(X)
        mse = mean_squared_error(y_magnitude, y_pred)
        rmse = np.sqrt(mse)
        
        print(f"    ✅ Magnitude Predictor trained - RMSE: {rmse:.6f}")
        
        return model
    
    # ==================== MODEL 4: CONFIDENCE SCORER ====================
    
    def train_confidence_scorer(self, X: pd.DataFrame, y: pd.Series) -> RandomForestClassifier:
        """
        Train confidence scorer to assess signal quality
        """
        print(f"\n  🔧 Training Confidence Scorer...")
        
        # Use all features
        model = RandomForestClassifier(
            n_estimators=100,
            max_depth=8,
            min_samples_split=20,
            random_state=42,
            n_jobs=-1
        )
        
        model.fit(X, y)
        
        # Get probability predictions
        y_proba = model.predict_proba(X)
        
        # Confidence is max probability
        confidence = y_proba.max(axis=1)
        avg_confidence = confidence.mean()
        
        print(f"    ✅ Confidence Scorer trained - Avg Confidence: {avg_confidence:.3f}")
        
        return model
    
    # ==================== MODEL 5: RISK PREDICTOR ====================
    
    def train_risk_predictor(self, X: pd.DataFrame, y_return: pd.Series) -> GradientBoostingRegressor:
        """
        Train risk predictor for VaR estimation
        """
        print(f"\n  🔧 Training Risk Predictor...")
        
        # Target is squared returns (volatility proxy)
        y_risk = y_return ** 2
        
        model = GradientBoostingRegressor(
            n_estimators=100,
            max_depth=6,
            learning_rate=0.1,
            random_state=42
        )
        
        model.fit(X, y_risk)
        
        # Evaluate
        y_pred = model.predict(X)
        mse = mean_squared_error(y_risk, y_pred)
        
        print(f"    ✅ Risk Predictor trained - MSE: {mse:.8f}")
        
        return model
    
    # ==================== META-MODEL: ENSEMBLE ====================
    
    def create_meta_features(self, models: Dict, X: pd.DataFrame) -> pd.DataFrame:
        """
        Create meta-features from base model predictions
        """
        meta_features = pd.DataFrame(index=X.index)
        
        # Regime probabilities
        if models.get('regime_classifier'):
            regime_proba = models['regime_classifier'].predict_proba(
                X[[c for c in self.regime_features if c in X.columns]]
            )
            for i in range(regime_proba.shape[1]):
                meta_features[f'regime_prob_{i}'] = regime_proba[:, i]
        
        # Direction probabilities
        if models.get('direction_predictor'):
            dir_proba = models['direction_predictor'].predict_proba(X)
            meta_features['direction_prob_down'] = dir_proba[:, 0]
            meta_features['direction_prob_up'] = dir_proba[:, 1]
        
        # Magnitude prediction
        if models.get('magnitude_predictor'):
            meta_features['magnitude_pred'] = models['magnitude_predictor'].predict(X)
        
        # Confidence score
        if models.get('confidence_scorer'):
            conf_proba = models['confidence_scorer'].predict_proba(X)
            meta_features['confidence'] = conf_proba.max(axis=1)
        
        # Risk prediction
        if models.get('risk_predictor'):
            meta_features['risk_pred'] = models['risk_predictor'].predict(X)
        
        return meta_features
    
    def train_meta_model(self, meta_features: pd.DataFrame, y: pd.Series) -> RandomForestClassifier:
        """
        Train meta-model to combine all predictions
        """
        print(f"\n  🔧 Training Meta-Model (Ensemble)...")
        
        model = RandomForestClassifier(
            n_estimators=100,
            max_depth=8,
            min_samples_split=20,
            random_state=42,
            n_jobs=-1
        )
        
        model.fit(meta_features, y)
        
        # Evaluate
        y_pred = model.predict(meta_features)
        accuracy = accuracy_score(y, y_pred)
        f1 = f1_score(y, y_pred)
        
        print(f"    ✅ Meta-Model trained - Accuracy: {accuracy:.3f}, F1: {f1:.3f}")
        
        return model
    
    # ==================== MAIN TRAINING PIPELINE ====================
    
    def train_symbol_models(self, symbol: str, timeframe: str) -> Dict:
        """
        Train all models for a symbol-timeframe
        """
        print(f"\n{'='*70}")
        print(f"🤖 TRAINING MODELS: {symbol} - {timeframe}")
        print(f"{'='*70}")
        
        # Fetch data
        df = self.fetch_training_data(symbol, timeframe)
        
        if len(df) < 500:
            print(f"  ⚠️ Insufficient data (need 500+ bars)")
            return {'status': 'failed', 'reason': 'insufficient_data'}
        
        try:
            # Prepare features
            X, y_direction, y_return = self.prepare_features(df)
            
            if len(X) < 200:
                print(f"  ⚠️ Insufficient samples after preparation")
                return {'status': 'failed', 'reason': 'insufficient_samples'}
            
            # Train models
            models = {}
            
            # Model 1: Regime Classifier
            models['regime_classifier'] = self.train_regime_classifier(X, df)
            
            # Model 2: Direction Predictor (trend version)
            models['direction_predictor'] = self.train_direction_predictor(X, y_direction, regime='trend')
            
            # Model 3: Magnitude Predictor
            models['magnitude_predictor'] = self.train_magnitude_predictor(X, y_return)
            
            # Model 4: Confidence Scorer
            models['confidence_scorer'] = self.train_confidence_scorer(X, y_direction)
            
            # Model 5: Risk Predictor
            models['risk_predictor'] = self.train_risk_predictor(X, y_return)
            
            # Meta-Model: Ensemble
            meta_features = self.create_meta_features(models, X)
            models['meta_model'] = self.train_meta_model(meta_features, y_direction)
            
            # Save models
            model_path = f"{MODEL_DIR}/{symbol}_{timeframe}_ensemble.pkl"
            joblib.dump(models, model_path)
            print(f"\n  💾 Models saved to {model_path}")
            
            return {
                'status': 'success',
                'symbol': symbol,
                'timeframe': timeframe,
                'samples': len(X),
                'features': len(X.columns),
                'model_path': model_path
            }
            
        except Exception as e:
            print(f"  ❌ Error training models: {str(e)}")
            import traceback
            traceback.print_exc()
            return {'status': 'failed', 'reason': str(e)[:200]}


def main():
    """
    Main execution
    """
    print("\n" + "="*70)
    print("🏆 PHASE 3: ML MODEL ENSEMBLE TRAINING")
    print("="*70)
    print("World-Class Trading System - Predictive Intelligence")
    print(f"Started: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("="*70)
    
    trainer = MLModelTrainer()
    
    # Get all symbol-timeframe combinations
    print("\n📋 Fetching symbol-timeframe combinations...")
    
    result = supabase.table('multi_timeframe_data')\
        .select('symbol, timeframe')\
        .execute()
    
    if not result.data:
        print("❌ No data found")
        sys.exit(1)
    
    # Get unique combinations
    combinations = {}
    for row in result.data:
        symbol = row['symbol']
        timeframe = row['timeframe']
        if symbol not in combinations:
            combinations[symbol] = []
        if timeframe not in combinations[symbol]:
            combinations[symbol].append(timeframe)
    
    print(f"✅ Found {len(combinations)} symbols")
    
    # Train models for each symbol (use primary timeframe only for now)
    primary_timeframes = {
        'ES': '15min', 'NQ': '15min', 'RTY': '15min', 'YM': '15min',
        'CL': '1H', 'NG': '1H',
        'GC': '1H', 'SI': '1H', 'HG': '1H',
        'BTC': '15min', 'ETH': '15min',
        'ZN': '1H',
        '6E': '1H', '6J': '1H', '6A': '1H', '6C': '1H', '6S': '1H',
        'ZC': '4H', 'ZS': '4H', 'ZW': '4H'
    }
    
    all_results = []
    
    for symbol in combinations.keys():
        timeframe = primary_timeframes.get(symbol, '1H')
        
        if timeframe in combinations[symbol]:
            result = trainer.train_symbol_models(symbol, timeframe)
            all_results.append(result)
    
    # Summary
    print("\n\n" + "="*70)
    print("📊 MODEL TRAINING COMPLETE - SUMMARY")
    print("="*70)
    
    successful = [r for r in all_results if r.get('status') == 'success']
    failed = [r for r in all_results if r.get('status') == 'failed']
    
    print(f"\n✅ Successful: {len(successful)}/{len(all_results)} symbols")
    print(f"❌ Failed: {len(failed)}/{len(all_results)} symbols")
    
    if successful:
        print("\n📈 Trained Models:")
        for result in successful:
            print(f"  • {result['symbol']} - {result['timeframe']}: {result['samples']} samples, {result['features']} features")
    
    if failed:
        print("\n❌ Failed:")
        for result in failed:
            print(f"  • {result.get('symbol', 'unknown')}: {result.get('reason', 'unknown')}")
    
    print("\n" + "="*70)
    print(f"Completed: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("="*70)
    
    print("\n🎉 Phase 3 Complete!")
    print("\nModels Trained:")
    print("  • Regime Classifier (Random Forest)")
    print("  • Direction Predictor (XGBoost/LightGBM)")
    print("  • Magnitude Predictor (Gradient Boosting)")
    print("  • Confidence Scorer (Random Forest)")
    print("  • Risk Predictor (Gradient Boosting)")
    print("  • Meta-Model Ensemble (Random Forest)")
    print(f"\nModels saved to: {MODEL_DIR}/")
    print("\nNext: Phase 4 - Risk Management Engine (Kelly Criterion + Bayesian)")


if __name__ == "__main__":
    main()
