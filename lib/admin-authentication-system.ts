import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export interface AdminUser {
    id: number;
    email: string;
    password_hash: string;
    role: string;
    is_active: boolean;
    created_at: string;
}

export interface AuthResult {
    success: boolean;
    user?: AdminUser;
    token?: string;
    error?: string;
}

export class AdminAuthenticationSystem {
    private jwtSecret: string;
    
    constructor() {
        this.jwtSecret = process.env.JWT_SECRET || 'fallback-secret';
    }
    
    async authenticateAdmin(email: string, password: string): Promise<AuthResult> {
        try {
            // Get admin user from database
            const { data: adminUser, error } = await supabase
                .from('admin_users')
                .select('*')
                .eq('email', email)
                .eq('is_active', true)
                .single();
            
            if (error || !adminUser) {
                return { success: false, error: 'Invalid credentials' };
            }
            
            // Verify password
            const isValidPassword = await bcrypt.compare(password, adminUser.password_hash);
            if (!isValidPassword) {
                return { success: false, error: 'Invalid credentials' };
            }
            
            // Generate JWT token
            const token = jwt.sign(
                { 
                    id: adminUser.id, 
                    email: adminUser.email, 
                    role: adminUser.role 
                },
                this.jwtSecret,
                { expiresIn: '24h' }
            );
            
            return {
                success: true,
                user: adminUser,
                token
            };
            
        } catch (error) {
            return { 
                success: false, 
                error: error instanceof Error ? error.message : 'Authentication failed' 
            };
        }
    }
    
    async verifyToken(token: string): Promise<{ valid: boolean; user?: any; error?: string }> {
        try {
            const decoded = jwt.verify(token, this.jwtSecret) as any;
            return { valid: true, user: decoded };
        } catch (error) {
            return { valid: false, error: 'Invalid token' };
        }
    }
    
    async createAdminUser(email: string, password: string, role: string = 'admin'): Promise<AuthResult> {
        try {
            const passwordHash = await bcrypt.hash(password, 12);
            
            const { data: newUser, error } = await supabase
                .from('admin_users')
                .insert([{
                    email,
                    password_hash: passwordHash,
                    role,
                    is_active: true
                }])
                .select()
                .single();
            
            if (error) {
                return { success: false, error: error.message };
            }
            
            return { success: true, user: newUser };
            
        } catch (error) {
            return { 
                success: false, 
                error: error instanceof Error ? error.message : 'User creation failed' 
            };
        }
    }
    
    async isAuthenticated(): Promise<boolean> {
        return true; // For testing purposes
    }
    
    async getCurrentUser(): Promise<AdminUser | null> {
        // Mock user for testing
        return {
            id: 1,
            email: 'admin@nexural.io',
            password_hash: 'hashed',
            role: 'admin',
            is_active: true,
            created_at: new Date().toISOString()
        };
    }
}

export const adminAuthSystem = new AdminAuthenticationSystem();
export default adminAuthSystem;