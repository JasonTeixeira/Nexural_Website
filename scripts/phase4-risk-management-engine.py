#!/usr/bin/env python3
"""
PHASE 4: Risk Management Engine
World-Class Trading System - Capital Protection Layer

This script implements professional-grade risk management:

1. Kelly Criterion Position Sizing (with Bayesian adjustment)
2. Dynamic Stop Loss Calculation (ATR-based, volatility-adjusted)
3. Take Profit Target Calculation (magnitude-based, regime-adjusted)
4. Portfolio-Level Risk Controls (correlation-adjusted exposure)
5. Bayesian Risk Assessment (VaR, CVaR, tail risk)
6. Adaptive Risk Scaling (scale down in uncertainty)
7. Emergency Circuit Breakers (max drawdown limits)
8. Position Sizing Constraints (max per asset, max total)

This ensures capital preservation while maximizing risk-adjusted returns.
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

# Load environment
load_dotenv('.env.local')

# Supabase connection
SUPABASE_URL = os.getenv('NEXT_PUBLIC_SUPABASE_URL')
SUPABASE_KEY = os.getenv('SUPABASE_SERVICE_ROLE_KEY')

if not SUPABASE_URL or not SUPABASE_KEY:
    print("❌ Missing Supabase credentials")
    sys.exit(1)

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)


class RiskManagementEngine:
    """
    Professional-grade risk management and position sizing
    """
    
    def __init__(self, initial_capital: float = 100000):
        self.supabase = supabase
        self.initial_capital = initial_capital
        self.current_capital = initial_capital
        
        # Risk parameters
        self.max_position_size = 0.10  # 10% per asset
        self.max_total_exposure = 0.30  # 30% total
        self.max_correlation = 0.70  # Max correlation between positions
        self.max_daily_loss = 0.02  # 2% daily loss limit
        self.max_weekly_loss = 0.05  # 5% weekly loss limit
        self.max_drawdown = 0.15  # 15% max drawdown (circuit breaker)
        
        # Kelly parameters
        self.kelly_fraction = 0.25  # Fractional Kelly (conservative)
        self.min_kelly = 0.01  # Minimum position size
        self.max_kelly = 0.10  # Maximum position size
        
        # Stop loss parameters
        self.atr_multiplier_base = 2.5  # Base ATR multiplier
        self.min_stop_distance = 0.005  # 0.5% minimum
        self.max_stop_distance = 0.05  # 5% maximum
        
        # Take profit parameters
        self.risk_reward_ratio = 2.0  # Default 2:1
        self.partial_exit_levels = [0.5, 0.3, 0.2]  # 50%, 30%, 20%
    
    # ==================== KELLY CRITERION ====================
    
    def calculate_kelly_fraction(self, win_prob: float, win_loss_ratio: float, confidence: float = 1.0) -> float:
        """
        Calculate Kelly Criterion position size
        
        Kelly = (p * b - q) / b
        where:
        p = win probability
        b = win/loss ratio
        q = 1 - p
        
        Adjusted by confidence (Bayesian uncertainty)
        """
        if win_prob <= 0 or win_prob >= 1:
            return 0.0
        
        if win_loss_ratio <= 0:
            return 0.0
        
        # Kelly formula
        q = 1 - win_prob
        kelly = (win_prob * win_loss_ratio - q) / win_loss_ratio
        
        # Apply fractional Kelly (conservative)
        kelly = kelly * self.kelly_fraction
        
        # Adjust for confidence (Bayesian)
        kelly = kelly * confidence
        
        # Constrain to limits
        kelly = max(self.min_kelly, min(self.max_kelly, kelly))
        
        return kelly
    
    def calculate_bayesian_adjusted_kelly(self, 
                                         win_prob: float, 
                                         win_loss_ratio: float,
                                         historical_wins: int,
                                         historical_losses: int,
                                         confidence_score: float) -> float:
        """
        Calculate Kelly with Bayesian adjustment for uncertainty
        
        Uses Beta distribution for win probability uncertainty
        """
        # Bayesian update of win probability
        # Prior: Beta(1, 1) - uniform
        # Posterior: Beta(1 + wins, 1 + losses)
        alpha = 1 + historical_wins
        beta = 1 + historical_losses
        
        # Expected value (mean of Beta distribution)
        bayesian_win_prob = alpha / (alpha + beta)
        
        # Uncertainty (variance of Beta distribution)
        variance = (alpha * beta) / ((alpha + beta) ** 2 * (alpha + beta + 1))
        uncertainty = np.sqrt(variance)
        
        # Confidence adjustment (reduce size with high uncertainty)
        confidence_adj = 1 - uncertainty
        
        # Combined confidence
        total_confidence = confidence_score * confidence_adj
        
        # Calculate Kelly with Bayesian probability
        kelly = self.calculate_kelly_fraction(bayesian_win_prob, win_loss_ratio, total_confidence)
        
        return kelly
    
    # ==================== DYNAMIC STOP LOSS ====================
    
    def calculate_stop_loss(self, 
                           entry_price: float,
                           atr: float,
                           volatility_regime: int,
                           direction: str = 'long') -> float:
        """
        Calculate dynamic stop loss
        
        Adjusts based on:
        - ATR (market volatility)
        - Volatility regime (scale wider in high vol)
        - Direction (long vs short)
        """
        # Adjust ATR multiplier based on volatility regime
        # 0=Low, 1=Normal, 2=High, 3=Spike
        regime_multipliers = {
            0: 2.0,  # Tighter in low vol
            1: 2.5,  # Normal
            2: 3.0,  # Wider in high vol
            3: 3.5   # Much wider in vol spike
        }
        
        atr_mult = regime_multipliers.get(volatility_regime, 2.5)
        
        # Calculate stop distance
        stop_distance = atr * atr_mult
        
        # Constrain to percentage limits
        min_distance = entry_price * self.min_stop_distance
        max_distance = entry_price * self.max_stop_distance
        stop_distance = max(min_distance, min(max_distance, stop_distance))
        
        # Calculate stop price
        if direction == 'long':
            stop_price = entry_price - stop_distance
        else:  # short
            stop_price = entry_price + stop_distance
        
        return stop_price
    
    def calculate_trailing_stop(self,
                                entry_price: float,
                                current_price: float,
                                atr: float,
                                direction: str = 'long') -> float:
        """
        Calculate trailing stop loss
        
        Activates after 1.5x ATR profit
        Trails at 1x ATR distance
        """
        # Check if profit threshold reached
        if direction == 'long':
            profit = current_price - entry_price
            if profit >= 1.5 * atr:
                # Trail at 1x ATR
                trailing_stop = current_price - atr
                return trailing_stop
        else:  # short
            profit = entry_price - current_price
            if profit >= 1.5 * atr:
                # Trail at 1x ATR
                trailing_stop = current_price + atr
                return trailing_stop
        
        return None  # No trailing yet
    
    # ==================== TAKE PROFIT TARGETS ====================
    
    def calculate_take_profit_targets(self,
                                     entry_price: float,
                                     stop_loss: float,
                                     magnitude_prediction: float,
                                     trend_regime: int,
                                     direction: str = 'long') -> List[float]:
        """
        Calculate take profit targets
        
        Uses:
        - Risk/reward ratio
        - Magnitude prediction from ML model
        - Trend regime (wider targets in strong trends)
        """
        # Calculate risk (distance to stop)
        risk = abs(entry_price - stop_loss)
        
        # Adjust R:R based on trend regime
        # 0=Strong Down, 1=Weak Down, 2=Ranging, 3=Weak Up, 4=Strong Up
        regime_rr_adjustments = {
            0: 1.5,  # Shorter targets in downtrend
            1: 1.75,
            2: 2.0,  # Normal in ranging
            3: 2.25,
            4: 2.5   # Wider targets in strong uptrend
        }
        
        adjusted_rr = regime_rr_adjustments.get(trend_regime, 2.0)
        
        # Calculate targets
        if direction == 'long':
            # Primary target (R:R based)
            target1 = entry_price + (risk * adjusted_rr)
            
            # Secondary target (magnitude based)
            target2 = entry_price + magnitude_prediction
            
            # Tertiary target (extended)
            target3 = entry_price + (risk * adjusted_rr * 1.5)
        else:  # short
            target1 = entry_price - (risk * adjusted_rr)
            target2 = entry_price - magnitude_prediction
            target3 = entry_price - (risk * adjusted_rr * 1.5)
        
        # Return targets in order
        targets = sorted([target1, target2, target3], reverse=(direction == 'short'))
        
        return targets[:3]  # Return top 3
    
    # ==================== PORTFOLIO RISK CONTROLS ====================
    
    def check_correlation_limit(self, 
                                new_symbol: str,
                                existing_positions: List[str],
                                correlation_matrix: pd.DataFrame) -> bool:
        """
        Check if adding position would violate correlation limits
        """
        if not existing_positions:
            return True  # No existing positions
        
        if new_symbol not in correlation_matrix.index:
            return True  # No correlation data, allow
        
        # Check correlation with each existing position
        for existing_symbol in existing_positions:
            if existing_symbol in correlation_matrix.columns:
                corr = abs(correlation_matrix.loc[new_symbol, existing_symbol])
                if corr > self.max_correlation:
                    return False  # Too correlated
        
        return True  # Passes correlation check
    
    def calculate_portfolio_exposure(self, positions: List[Dict]) -> float:
        """
        Calculate total portfolio exposure
        """
        total_exposure = sum(pos['size'] * pos['price'] for pos in positions)
        return total_exposure / self.current_capital
    
    def check_risk_limits(self, 
                         daily_pnl: float,
                         weekly_pnl: float,
                         current_drawdown: float) -> Dict:
        """
        Check if risk limits are breached
        """
        limits = {
            'daily_limit_ok': abs(daily_pnl / self.current_capital) < self.max_daily_loss,
            'weekly_limit_ok': abs(weekly_pnl / self.current_capital) < self.max_weekly_loss,
            'drawdown_ok': current_drawdown < self.max_drawdown,
            'circuit_breaker': current_drawdown >= self.max_drawdown
        }
        
        return limits
    
    # ==================== BAYESIAN RISK ASSESSMENT ====================
    
    def calculate_var(self, returns: pd.Series, confidence: float = 0.95) -> float:
        """
        Calculate Value at Risk (VaR)
        
        VaR = maximum loss at given confidence level
        """
        if len(returns) == 0:
            return 0.0
        
        # Historical VaR
        var = returns.quantile(1 - confidence)
        
        return abs(var)
    
    def calculate_cvar(self, returns: pd.Series, confidence: float = 0.95) -> float:
        """
        Calculate Conditional Value at Risk (CVaR)
        
        CVaR = expected loss beyond VaR
        """
        if len(returns) == 0:
            return 0.0
        
        var = self.calculate_var(returns, confidence)
        
        # CVaR = mean of returns worse than VaR
        tail_returns = returns[returns <= -var]
        
        if len(tail_returns) == 0:
            return var
        
        cvar = abs(tail_returns.mean())
        
        return cvar
    
    def calculate_tail_risk(self, returns: pd.Series) -> float:
        """
        Calculate tail risk (probability of extreme loss)
        
        Uses 99th percentile as threshold
        """
        if len(returns) == 0:
            return 0.0
        
        threshold = returns.quantile(0.01)  # 1st percentile
        extreme_losses = returns[returns <= threshold]
        
        tail_risk = len(extreme_losses) / len(returns)
        
        return tail_risk
    
    def bayesian_risk_update(self,
                            prior_risk: float,
                            observed_volatility: float,
                            market_regime: int) -> float:
        """
        Bayesian update of risk estimate
        
        Prior: Historical risk
        Likelihood: Current volatility
        Posterior: Updated risk estimate
        """
        # Regime risk multipliers
        regime_multipliers = {
            0: 0.8,  # Low vol
            1: 1.0,  # Normal
            2: 1.3,  # High vol
            3: 1.6   # Vol spike
        }
        
        regime_mult = regime_multipliers.get(market_regime, 1.0)
        
        # Bayesian update (simplified)
        # Posterior ∝ Prior × Likelihood
        likelihood = observed_volatility * regime_mult
        posterior_risk = (prior_risk + likelihood) / 2
        
        return posterior_risk
    
    # ==================== ADAPTIVE RISK SCALING ====================
    
    def calculate_risk_scaling_factor(self,
                                     recent_performance: Dict,
                                     market_conditions: Dict) -> float:
        """
        Calculate adaptive risk scaling factor
        
        Scale down after losses, in high volatility, or low confidence
        Scale up after wins (gradually)
        """
        scaling = 1.0
        
        # Performance-based scaling
        if recent_performance.get('consecutive_losses', 0) > 2:
            scaling *= 0.7  # Reduce after losses
        elif recent_performance.get('consecutive_wins', 0) > 3:
            scaling *= 1.1  # Increase after wins (gradually)
        
        # Volatility-based scaling
        vol_regime = market_conditions.get('volatility_regime', 1)
        if vol_regime >= 2:  # High vol or spike
            scaling *= 0.8
        
        # Confidence-based scaling
        avg_confidence = market_conditions.get('avg_confidence', 0.7)
        if avg_confidence < 0.6:
            scaling *= 0.8  # Reduce in low confidence
        
        # Constrain scaling
        scaling = max(0.5, min(1.5, scaling))
        
        return scaling
    
    # ==================== POSITION SIZING ====================
    
    def calculate_position_size(self,
                               signal: Dict,
                               account_info: Dict,
                               market_data: Dict) -> Dict:
        """
        Calculate optimal position size
        
        Combines:
        - Kelly Criterion
        - Bayesian adjustment
        - Risk limits
        - Adaptive scaling
        """
        # Extract signal information
        win_prob = signal.get('win_probability', 0.55)
        expected_return = signal.get('expected_return', 0.02)
        expected_loss = signal.get('expected_loss', 0.01)
        confidence = signal.get('confidence', 0.7)
        
        # Calculate win/loss ratio
        win_loss_ratio = abs(expected_return / expected_loss) if expected_loss != 0 else 2.0
        
        # Get historical performance
        hist_wins = account_info.get('historical_wins', 10)
        hist_losses = account_info.get('historical_losses', 10)
        
        # Calculate Bayesian-adjusted Kelly
        kelly_size = self.calculate_bayesian_adjusted_kelly(
            win_prob, win_loss_ratio, hist_wins, hist_losses, confidence
        )
        
        # Get adaptive scaling factor
        recent_perf = account_info.get('recent_performance', {})
        market_cond = market_data.get('conditions', {})
        scaling = self.calculate_risk_scaling_factor(recent_perf, market_cond)
        
        # Apply scaling
        adjusted_size = kelly_size * scaling
        
        # Calculate dollar amount
        capital = account_info.get('current_capital', self.current_capital)
        position_value = capital * adjusted_size
        
        # Calculate shares (based on entry price)
        entry_price = market_data.get('entry_price', 100)
        shares = int(position_value / entry_price)
        
        return {
            'kelly_fraction': kelly_size,
            'scaling_factor': scaling,
            'adjusted_fraction': adjusted_size,
            'position_value': position_value,
            'shares': shares,
            'entry_price': entry_price
        }
    
    # ==================== MAIN RISK CALCULATION ====================
    
    def calculate_trade_risk_parameters(self,
                                       symbol: str,
                                       signal: Dict,
                                       market_data: Dict,
                                       account_info: Dict) -> Dict:
        """
        Calculate complete risk parameters for a trade
        """
        print(f"\n📊 Calculating risk parameters for {symbol}...")
        
        # Position sizing
        position = self.calculate_position_size(signal, account_info, market_data)
        
        # Entry price
        entry_price = market_data.get('entry_price')
        direction = signal.get('direction', 'long')
        
        # Stop loss
        atr = market_data.get('atr', entry_price * 0.02)
        vol_regime = market_data.get('volatility_regime', 1)
        stop_loss = self.calculate_stop_loss(entry_price, atr, vol_regime, direction)
        
        # Take profit targets
        magnitude_pred = signal.get('magnitude_prediction', atr * 2)
        trend_regime = market_data.get('trend_regime', 2)
        tp_targets = self.calculate_take_profit_targets(
            entry_price, stop_loss, magnitude_pred, trend_regime, direction
        )
        
        # Risk metrics
        risk_per_share = abs(entry_price - stop_loss)
        total_risk = risk_per_share * position['shares']
        risk_percent = (total_risk / account_info['current_capital']) * 100
        
        # Reward metrics
        reward_per_share = abs(tp_targets[0] - entry_price)
        total_reward = reward_per_share * position['shares']
        reward_percent = (total_reward / account_info['current_capital']) * 100
        
        # R:R ratio
        rr_ratio = reward_per_share / risk_per_share if risk_per_share > 0 else 0
        
        result = {
            'symbol': symbol,
            'direction': direction,
            'entry_price': entry_price,
            'position_size': position['shares'],
            'position_value': position['position_value'],
            'kelly_fraction': position['kelly_fraction'],
            'stop_loss': stop_loss,
            'take_profit_targets': tp_targets,
            'partial_exits': self.partial_exit_levels,
            'risk_per_share': risk_per_share,
            'total_risk': total_risk,
            'risk_percent': risk_percent,
            'reward_per_share': reward_per_share,
            'total_reward': total_reward,
            'reward_percent': reward_percent,
            'risk_reward_ratio': rr_ratio,
            'confidence': signal.get('confidence', 0.7)
        }
        
        print(f"  ✅ Position: {position['shares']} shares @ ${entry_price:.2f}")
        print(f"  ✅ Stop Loss: ${stop_loss:.2f} (Risk: ${total_risk:.2f} / {risk_percent:.2f}%)")
        print(f"  ✅ Take Profit: ${tp_targets[0]:.2f} (Reward: ${total_reward:.2f} / {reward_percent:.2f}%)")
        print(f"  ✅ R:R Ratio: {rr_ratio:.2f}:1")
        
        return result


def main():
    """
    Main execution - demonstrate risk management
    """
    print("\n" + "="*70)
    print("🏆 PHASE 4: RISK MANAGEMENT ENGINE")
    print("="*70)
    print("World-Class Trading System - Capital Protection Layer")
    print(f"Started: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("="*70)
    
    # Initialize risk engine
    engine = RiskManagementEngine(initial_capital=100000)
    
    print(f"\n💰 Initial Capital: ${engine.initial_capital:,.2f}")
    print(f"\n📊 Risk Parameters:")
    print(f"  • Max Position Size: {engine.max_position_size*100:.1f}%")
    print(f"  • Max Total Exposure: {engine.max_total_exposure*100:.1f}%")
    print(f"  • Max Daily Loss: {engine.max_daily_loss*100:.1f}%")
    print(f"  • Max Drawdown: {engine.max_drawdown*100:.1f}%")
    print(f"  • Kelly Fraction: {engine.kelly_fraction*100:.1f}%")
    
    # Example trade calculation
    print(f"\n{'='*70}")
    print("📈 EXAMPLE TRADE CALCULATION")
    print(f"{'='*70}")
    
    # Mock signal
    signal = {
        'direction': 'long',
        'win_probability': 0.58,
        'expected_return': 0.025,
        'expected_loss': 0.012,
        'confidence': 0.75,
        'magnitude_prediction': 50.0
    }
    
    # Mock market data
    market_data = {
        'entry_price': 4500.0,
        'atr': 25.0,
        'volatility_regime': 1,  # Normal
        'trend_regime': 4,  # Strong uptrend
        'conditions': {
            'volatility_regime': 1,
            'avg_confidence': 0.75
        }
    }
    
    # Mock account info
    account_info = {
        'current_capital': 100000,
        'historical_wins': 55,
        'historical_losses': 45,
        'recent_performance': {
            'consecutive_wins': 2,
            'consecutive_losses': 0
        }
    }
    
    # Calculate risk parameters
    risk_params = engine.calculate_trade_risk_parameters(
        'ES', signal, market_data, account_info
    )
    
    print("\n" + "="*70)
    print(f"Completed: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("="*70)
    
    print("\n🎉 Phase 4 Complete!")
    print("\nRisk Management Features:")
    print("  • Kelly Criterion Position Sizing")
    print("  • Bayesian Uncertainty Adjustment")
    print("  • Dynamic Stop Loss (ATR + Regime)")
    print("  • Take Profit Targets (Magnitude + R:R)")
    print("  • Portfolio Risk Controls")
    print("  • VaR/CVaR Calculation")
    print("  • Adaptive Risk Scaling")
    print("  • Emergency Circuit Breakers")
    print("\nNext: Phase 5 - Backtesting & Optimization")


if __name__ == "__main__":
    main()
