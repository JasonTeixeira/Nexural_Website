import { createClient } from '@supabase/supabase-js';
import * as speakeasy from 'speakeasy';
import * as QRCode from 'qrcode';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export class TwoFactorAuthService {
  static async setup(memberId: string, memberEmail: string) {
    try {
      const secret = speakeasy.generateSecret({
        name: `Nexural Trading (${memberEmail})`,
        length: 32
      });

      const backupCodes = Array.from({ length: 10 }, () =>
        Math.random().toString(36).substring(2, 10).toUpperCase()
      );

      const { data, error } = await supabase
        .from('two_factor_auth')
        .upsert({
          member_id: memberId,
          secret: secret.base32,
          backup_codes: backupCodes,
          enabled: false
        })
        .select()
        .single();

      if (error) throw error;

      const qrCode = await QRCode.toDataURL(secret.otpauth_url!);

      return {
        secret: secret.base32,
        qrCode,
        backupCodes
      };
    } catch (error) {
      console.error('Error setting up 2FA:', error);
      throw error;
    }
  }

  static async verify(memberId: string, token: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('two_factor_auth')
        .select('secret')
        .eq('member_id', memberId)
        .single();

      if (error || !data) return false;

      return speakeasy.totp.verify({
        secret: data.secret,
        encoding: 'base32',
        token,
        window: 2
      });
    } catch (error) {
      console.error('Error verifying 2FA token:', error);
      return false;
    }
  }

  static async enable(memberId: string, token: string): Promise<boolean> {
    try {
      const isValid = await this.verify(memberId, token);
      if (!isValid) return false;

      const { error } = await supabase
        .from('two_factor_auth')
        .update({ enabled: true, updated_at: new Date().toISOString() })
        .eq('member_id', memberId);

      return !error;
    } catch (error) {
      console.error('Error enabling 2FA:', error);
      return false;
    }
  }

  static async disable(memberId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('two_factor_auth')
        .update({ enabled: false, updated_at: new Date().toISOString() })
        .eq('member_id', memberId);

      if (error) throw error;
    } catch (error) {
      console.error('Error disabling 2FA:', error);
      throw error;
    }
  }

  static async isEnabled(memberId: string): Promise<boolean> {
    try {
      const { data } = await supabase
        .from('two_factor_auth')
        .select('enabled')
        .eq('member_id', memberId)
        .single();

      return data?.enabled || false;
    } catch (error) {
      console.error('Error checking if 2FA is enabled:', error);
      return false;
    }
  }

  static async verifyBackupCode(memberId: string, code: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('two_factor_auth')
        .select('backup_codes')
        .eq('member_id', memberId)
        .single();

      if (error || !data) return false;

      const codeIndex = data.backup_codes?.indexOf(code);
      if (codeIndex === -1) return false;

      const updatedCodes = data.backup_codes.filter((c: string) => c !== code);
      await supabase
        .from('two_factor_auth')
        .update({ backup_codes: updatedCodes })
        .eq('member_id', memberId);

      return true;
    } catch (error) {
      console.error('Error verifying backup code:', error);
      return false;
    }
  }
}
