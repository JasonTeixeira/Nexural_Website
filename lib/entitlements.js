var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { createClient } from '@/lib/supabase/server';
export function isEntitled(ent) {
    if (!ent)
        return false;
    if (ent.status !== 'active' && ent.status !== 'trialing')
        return false;
    if (!ent.currentPeriodEnd)
        return true;
    return new Date(ent.currentPeriodEnd).getTime() > Date.now();
}
/**
 * Loads the caller's entitlement based on the current Supabase session.
 * Returns null if unauthenticated or not found.
 */
export function getMyEntitlement() {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        const supabase = yield createClient();
        const { data: auth } = yield supabase.auth.getUser();
        const userId = (_a = auth === null || auth === void 0 ? void 0 : auth.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId)
            return null;
        const { data, error } = yield supabase
            .from('member_entitlements')
            .select('user_id,status,tier,current_period_end,cancel_at_period_end')
            .eq('user_id', userId)
            .maybeSingle();
        if (error || !data)
            return null;
        return {
            userId: data.user_id,
            status: data.status,
            tier: data.tier,
            currentPeriodEnd: data.current_period_end,
            cancelAtPeriodEnd: !!data.cancel_at_period_end,
        };
    });
}
/** Throws if the current user is not entitled (members-only gating). */
export function requireEntitlement() {
    return __awaiter(this, void 0, void 0, function* () {
        const ent = yield getMyEntitlement();
        if (!isEntitled(ent)) {
            throw new Error('MEMBERSHIP_REQUIRED');
        }
        return ent;
    });
}
