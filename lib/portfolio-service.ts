/**
 * Portfolio Service
 * Handles all portfolio and trade operations
 */

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export interface Portfolio {
  id: string;
  member_id: string;
  name: string;
  description?: string;
  initial_balance: number;
  current_balance: number;
  total_pnl: number;
  total_pnl_percentage: number;
  total_trades: number;
  winning_trades: number;
  losing_trades: number;
  win_rate: number;
  best_trade: number;
  worst_trade: number;
  average_win: number;
  average_loss: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Trade {
  id: string;
  portfolio_id: string;
  member_id: string;
  signal_id?: string;
  symbol: string;
  action: 'BUY' | 'SELL' | 'LONG' | 'SHORT';
  quantity: number;
  entry_price: number;
  exit_price?: number;
  stop_loss?: number;
  take_profit?: number;
  risk_amount?: number;
  risk_percentage?: number;
  pnl: number;
  pnl_percentage: number;
  commission: number;
  net_pnl: number;
  status: 'open' | 'closed' | 'cancelled';
  entry_date: string;
  exit_date?: string;
  duration_hours?: number;
  notes?: string;
  tags?: string[];
  strategy?: string;
  created_at: string;
  updated_at: string;
}

export class PortfolioService {
  /**
   * Create a new portfolio for a member
   */
  static async createPortfolio(
    memberId: string,
    data: {
      name: string;
      description?: string;
      initial_balance?: number;
    }
  ): Promise<Portfolio> {
    try {
      const { data: portfolio, error } = await supabase
        .from('member_portfolios')
        .insert({
          member_id: memberId,
          name: data.name,
          description: data.description,
          initial_balance: data.initial_balance || 10000,
          current_balance: data.initial_balance || 10000
        })
        .select()
        .single();

      if (error) throw error;
      return portfolio;
    } catch (error) {
      console.error('Error creating portfolio:', error);
      throw error;
    }
  }

  /**
   * Get all portfolios for a member
   */
  static async getPortfolios(memberId: string): Promise<Portfolio[]> {
    try {
      const { data, error } = await supabase
        .from('member_portfolios')
        .select('*')
        .eq('member_id', memberId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting portfolios:', error);
      throw error;
    }
  }

  /**
   * Get a specific portfolio
   */
  static async getPortfolio(portfolioId: string): Promise<Portfolio> {
    try {
      const { data, error } = await supabase
        .from('member_portfolios')
        .select('*')
        .eq('id', portfolioId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error getting portfolio:', error);
      throw error;
    }
  }

  /**
   * Update portfolio
   */
  static async updatePortfolio(
    portfolioId: string,
    updates: Partial<Portfolio>
  ): Promise<Portfolio> {
    try {
      const { data, error } = await supabase
        .from('member_portfolios')
        .update(updates)
        .eq('id', portfolioId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating portfolio:', error);
      throw error;
    }
  }

  /**
   * Delete portfolio
   */
  static async deletePortfolio(portfolioId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('member_portfolios')
        .delete()
        .eq('id', portfolioId);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting portfolio:', error);
      throw error;
    }
  }

  /**
   * Add a new trade
   */
  static async addTrade(
    portfolioId: string,
    memberId: string,
    trade: {
      symbol: string;
      action: 'BUY' | 'SELL' | 'LONG' | 'SHORT';
      quantity: number;
      entry_price: number;
      stop_loss?: number;
      take_profit?: number;
      notes?: string;
      tags?: string[];
      strategy?: string;
      signal_id?: string;
    }
  ): Promise<Trade> {
    try {
      // Calculate risk if stop loss provided
      let risk_amount = 0;
      let risk_percentage = 0;
      
      if (trade.stop_loss) {
        const riskPerShare = Math.abs(trade.entry_price - trade.stop_loss);
        risk_amount = riskPerShare * trade.quantity;
        
        const portfolio = await this.getPortfolio(portfolioId);
        risk_percentage = (risk_amount / portfolio.current_balance) * 100;
      }

      const { data, error } = await supabase
        .from('portfolio_trades')
        .insert({
          portfolio_id: portfolioId,
          member_id: memberId,
          ...trade,
          risk_amount,
          risk_percentage,
          status: 'open'
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error adding trade:', error);
      throw error;
    }
  }

  /**
   * Close a trade
   */
  static async closeTrade(
    tradeId: string,
    exitPrice: number,
    commission: number = 0
  ): Promise<Trade> {
    try {
      // Get the trade
      const { data: trade, error: fetchError } = await supabase
        .from('portfolio_trades')
        .select('*')
        .eq('id', tradeId)
        .single();

      if (fetchError) throw fetchError;

      // Calculate P&L
      const priceDiff = trade.action === 'BUY' || trade.action === 'LONG'
        ? exitPrice - trade.entry_price
        : trade.entry_price - exitPrice;
      
      const pnl = priceDiff * trade.quantity;
      const pnl_percentage = (priceDiff / trade.entry_price) * 100;
      const net_pnl = pnl - commission;

      // Calculate duration
      const entryDate = new Date(trade.entry_date);
      const exitDate = new Date();
      const duration_hours = Math.round((exitDate.getTime() - entryDate.getTime()) / (1000 * 60 * 60));

      // Update trade
      const { data: updatedTrade, error: updateError } = await supabase
        .from('portfolio_trades')
        .update({
          exit_price: exitPrice,
          pnl,
          pnl_percentage,
          commission,
          net_pnl,
          status: 'closed',
          exit_date: exitDate.toISOString(),
          duration_hours,
          updated_at: new Date().toISOString()
        })
        .eq('id', tradeId)
        .select()
        .single();

      if (updateError) throw updateError;
      return updatedTrade;
    } catch (error) {
      console.error('Error closing trade:', error);
      throw error;
    }
  }

  /**
   * Get all trades for a portfolio
   */
  static async getTrades(
    portfolioId: string,
    filters?: {
      status?: 'open' | 'closed' | 'cancelled';
      symbol?: string;
      limit?: number;
    }
  ): Promise<Trade[]> {
    try {
      let query = supabase
        .from('portfolio_trades')
        .select('*')
        .eq('portfolio_id', portfolioId)
        .order('entry_date', { ascending: false });

      if (filters?.status) {
        query = query.eq('status', filters.status);
      }

      if (filters?.symbol) {
        query = query.eq('symbol', filters.symbol);
      }

      if (filters?.limit) {
        query = query.limit(filters.limit);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting trades:', error);
      throw error;
    }
  }

  /**
   * Get portfolio performance snapshots
   */
  static async getSnapshots(
    portfolioId: string,
    days: number = 30
  ): Promise<any[]> {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const { data, error } = await supabase
        .from('portfolio_snapshots')
        .select('*')
        .eq('portfolio_id', portfolioId)
        .gte('snapshot_date', startDate.toISOString().split('T')[0])
        .order('snapshot_date', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting snapshots:', error);
      throw error;
    }
  }

  /**
   * Create daily snapshot
   */
  static async createSnapshot(portfolioId: string): Promise<void> {
    try {
      const { error } = await supabase.rpc('create_portfolio_snapshot', {
        p_portfolio_id: portfolioId
      });

      if (error) throw error;
    } catch (error) {
      console.error('Error creating snapshot:', error);
      throw error;
    }
  }

  /**
   * Get portfolio statistics
   */
  static async getStatistics(portfolioId: string): Promise<any> {
    try {
      const portfolio = await this.getPortfolio(portfolioId);
      const trades = await this.getTrades(portfolioId, { status: 'closed' });

      // Calculate additional statistics
      const profitFactor = portfolio.average_loss !== 0
        ? Math.abs(portfolio.average_win / portfolio.average_loss)
        : 0;

      const expectancy = trades.length > 0
        ? trades.reduce((sum, t) => sum + t.net_pnl, 0) / trades.length
        : 0;

      // Calculate consecutive wins/losses
      let maxConsecutiveWins = 0;
      let maxConsecutiveLosses = 0;
      let currentWinStreak = 0;
      let currentLossStreak = 0;

      trades.forEach(trade => {
        if (trade.net_pnl > 0) {
          currentWinStreak++;
          currentLossStreak = 0;
          maxConsecutiveWins = Math.max(maxConsecutiveWins, currentWinStreak);
        } else if (trade.net_pnl < 0) {
          currentLossStreak++;
          currentWinStreak = 0;
          maxConsecutiveLosses = Math.max(maxConsecutiveLosses, currentLossStreak);
        }
      });

      return {
        ...portfolio,
        profit_factor: profitFactor,
        expectancy,
        max_consecutive_wins: maxConsecutiveWins,
        max_consecutive_losses: maxConsecutiveLosses,
        total_commission: trades.reduce((sum, t) => sum + (t.commission || 0), 0),
        average_trade_duration: trades.length > 0
          ? trades.reduce((sum, t) => sum + (t.duration_hours || 0), 0) / trades.length
          : 0
      };
    } catch (error) {
      console.error('Error getting statistics:', error);
      throw error;
    }
  }

  /**
   * Get trade history with pagination
   */
  static async getTradeHistory(
    portfolioId: string,
    page: number = 1,
    pageSize: number = 20
  ): Promise<{ trades: Trade[]; total: number }> {
    try {
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;

      const { data: trades, error, count } = await supabase
        .from('portfolio_trades')
        .select('*', { count: 'exact' })
        .eq('portfolio_id', portfolioId)
        .order('entry_date', { ascending: false })
        .range(from, to);

      if (error) throw error;

      return {
        trades: trades || [],
        total: count || 0
      };
    } catch (error) {
      console.error('Error getting trade history:', error);
      throw error;
    }
  }
}
