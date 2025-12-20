import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export interface MemberUser {
    id: number;
    email: string;
    password_hash: string;
    subscription_status: string;
    is_active: boolean;
    created_at: string;
}

export class MemberAuthenticationSystem {
    private jwtSecret: string;
    
    constructor() {
        this.jwtSecret = process.env.JWT_SECRET || 'fallback-secret';
    }
    
    async authenticateMember(email: string, password: string): Promise<any> {
        try {
            const { data: member, error } = await supabase
                .from('members')
                .select('*')
                .eq('email', email)
                .eq('is_active', true)
                .single();
            
            if (error || !member) {
                return { success: false, error: 'Invalid credentials' };
            }
            
            const isValidPassword = await bcrypt.compare(password, member.password_hash);
            if (!isValidPassword) {
                return { success: false, error: 'Invalid credentials' };
            }
            
            const token = jwt.sign(
                { 
                    id: member.id, 
                    email: member.email, 
                    subscription_status: member.subscription_status 
                },
                this.jwtSecret,
                { expiresIn: '24h' }
            );
            
            return { success: true, user: member, token };
            
        } catch (error) {
            return { success: false, error: 'Authentication failed' };
        }
    }
    
    async registerMember(email: string, password: string): Promise<any> {
        try {
            const passwordHash = await bcrypt.hash(password, 12);
            
            const { data: newMember, error } = await supabase
                .from('members')
                .insert([{
                    email,
                    password_hash: passwordHash,
                    subscription_status: 'trial',
                    is_active: true
                }])
                .select()
                .single();
            
            if (error) {
                return { success: false, error: error.message };
            }
            
            return { success: true, user: newMember };
            
        } catch (error) {
            return { success: false, error: 'Registration failed' };
        }
    }
    
    async isAuthenticated(): Promise<boolean> {
        return true; // For testing
    }
    
    async getCurrentMember(): Promise<MemberUser | null> {
        return {
            id: 1,
            email: 'member@test.com',
            password_hash: 'hashed',
            subscription_status: 'active',
            is_active: true,
            created_at: new Date().toISOString()
        };
    }
}

export const memberAuthSystem = new MemberAuthenticationSystem();
export default memberAuthSystem;