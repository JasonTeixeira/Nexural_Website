var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { NextResponse } from 'next/server';
import { requireEntitlement } from '@/lib/entitlements';
/**
 * For API routes: ensures user is an entitled member.
 * Returns a NextResponse if not entitled, otherwise returns null.
 */
export function enforceMemberEntitlement() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield requireEntitlement();
            return null;
        }
        catch (e) {
            if ((e === null || e === void 0 ? void 0 : e.message) === 'MEMBERSHIP_REQUIRED') {
                return NextResponse.json({ error: 'Membership required' }, { status: 403 });
            }
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
    });
}
