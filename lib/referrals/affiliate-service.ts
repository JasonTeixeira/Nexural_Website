import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export class AffiliateService {
  static async createAffiliate(memberId: string, paymentEmail?: string) {
    try {
      const { data: code } = await supabase.rpc('generate_affiliate_code');
      
      const { data, error } = await supabase
        .from('affiliates')
        .insert({
          member_id: memberId,
          affiliate_code: code,
          payment_email: paymentEmail
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating affiliate:', error);
      throw error;
    }
  }

  static async getAffiliate(memberId: string) {
    try {
      const { data, error } = await supabase
        .from('affiliates')
        .select('*')
        .eq('member_id', memberId)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      return data;
    } catch (error) {
      console.error('Error getting affiliate:', error);
      throw error;
    }
  }

  static async getAffiliateByCode(code: string) {
    try {
      const { data, error } = await supabase
        .from('affiliates')
        .select('*')
        .eq('affiliate_code', code)
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error getting affiliate by code:', error);
      throw error;
    }
  }

  static async trackClick(affiliateId: string, ipAddress?: string, userAgent?: string, referrer?: string) {
    try {
      const { error } = await supabase
        .from('affiliate_clicks')
        .insert({
          affiliate_id: affiliateId,
          ip_address: ipAddress,
          user_agent: userAgent,
          referrer
        });
      
      if (error) throw error;
    } catch (error) {
      console.error('Error tracking click:', error);
      throw error;
    }
  }

  static async createReferral(
    affiliateId: string,
    referredMemberId: string,
    subscriptionId: string,
    subscriptionAmount: number,
    commissionRate: number = 20
  ) {
    try {
      const commissionAmount = (subscriptionAmount * commissionRate) / 100;
      
      const { data, error } = await supabase
        .from('affiliate_referrals')
        .insert({
          affiliate_id: affiliateId,
          referred_member_id: referredMemberId,
          subscription_id: subscriptionId,
          subscription_amount: subscriptionAmount,
          commission_amount: commissionAmount,
          commission_status: 'pending'
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating referral:', error);
      throw error;
    }
  }

  static async approveReferral(referralId: string) {
    try {
      const { data, error } = await supabase
        .from('affiliate_referrals')
        .update({
          commission_status: 'approved',
          approved_at: new Date().toISOString()
        })
        .eq('id', referralId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error approving referral:', error);
      throw error;
    }
  }

  static async getReferrals(affiliateId: string) {
    try {
      const { data, error } = await supabase
        .from('affiliate_referrals')
        .select('*')
        .eq('affiliate_id', affiliateId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting referrals:', error);
      throw error;
    }
  }

  static async getPayouts(affiliateId: string) {
    try {
      const { data, error } = await supabase
        .from('affiliate_payouts')
        .select('*')
        .eq('affiliate_id', affiliateId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting payouts:', error);
      throw error;
    }
  }

  static async requestPayout(affiliateId: string, amount: number, paymentMethod: string, paymentDetails: any) {
    try {
      const { data, error } = await supabase
        .from('affiliate_payouts')
        .insert({
          affiliate_id: affiliateId,
          amount,
          payment_method: paymentMethod,
          payment_details: paymentDetails,
          status: 'pending'
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error requesting payout:', error);
      throw error;
    }
  }

  static async processPayout(payoutId: string, status: 'completed' | 'failed', notes?: string) {
    try {
      const updates: any = {
        status,
        processed_at: new Date().toISOString()
      };

      if (status === 'completed') {
        updates.completed_at = new Date().toISOString();
        
        // Mark referrals as paid
        const { data: payout } = await supabase
          .from('affiliate_payouts')
          .select('affiliate_id')
          .eq('id', payoutId)
          .single();

        if (payout) {
          await supabase
            .from('affiliate_referrals')
            .update({
              commission_status: 'paid',
              paid_at: new Date().toISOString()
            })
            .eq('affiliate_id', payout.affiliate_id)
            .eq('commission_status', 'approved');
        }
      }

      if (notes) updates.notes = notes;

      const { data, error } = await supabase
        .from('affiliate_payouts')
        .update(updates)
        .eq('id', payoutId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error processing payout:', error);
      throw error;
    }
  }

  static async getStats(affiliateId: string) {
    try {
      const affiliate = await this.getAffiliate(affiliateId);
      const referrals = await this.getReferrals(affiliateId);
      
      const { data: clicks } = await supabase
        .from('affiliate_clicks')
        .select('id')
        .eq('affiliate_id', affiliateId);

      return {
        ...affiliate,
        total_clicks: clicks?.length || 0,
        conversion_rate: clicks?.length ? (referrals.length / clicks.length) * 100 : 0,
        recent_referrals: referrals.slice(0, 10)
      };
    } catch (error) {
      console.error('Error getting affiliate stats:', error);
      throw error;
    }
  }
}
