var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { createClient as createServerClient } from '@/lib/supabase/server';
/**
 * Server-side admin guard.
 *
 * - Requires a valid Supabase session
 * - Requires profiles.is_admin = true
 */
export function requireAdmin() {
    return __awaiter(this, arguments, void 0, function* (requiredRoles = ['owner', 'support']) {
        const supabase = yield createServerClient();
        const { data: { user }, error: authError, } = yield supabase.auth.getUser();
        if (authError || !user) {
            return { ok: false, status: 401, error: 'Unauthorized' };
        }
        const { data: profile, error: profileError } = yield supabase
            .from('profiles')
            .select('id,is_admin,role')
            .eq('id', user.id)
            .single();
        if (profileError) {
            return { ok: false, status: 500, error: 'Failed to load profile' };
        }
        const role = profile === null || profile === void 0 ? void 0 : profile.role;
        // Backward compatibility: treat is_admin=true as owner if role isn't set yet.
        const resolvedRole = role || ((profile === null || profile === void 0 ? void 0 : profile.is_admin) ? 'owner' : 'member');
        if (!(profile === null || profile === void 0 ? void 0 : profile.is_admin) || !resolvedRole || !requiredRoles.includes(resolvedRole)) {
            return { ok: false, status: 403, error: 'Forbidden' };
        }
        return {
            ok: true,
            supabase,
            user,
            profile: Object.assign(Object.assign({}, profile), { role: resolvedRole }),
        };
    });
}
export function requireOwner() {
    return __awaiter(this, void 0, void 0, function* () {
        return requireAdmin(['owner']);
    });
}
