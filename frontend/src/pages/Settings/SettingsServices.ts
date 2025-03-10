interface ReferralCodeResponse {
    code: string;
    usedCount: number;
}

export const getReferralCode = async(): Promise<ReferralCodeResponse> => {
        const response = await fetch('https://backend.stockpiece.fun/api/v1/coupon/coupons/referral', {
                method: 'POST',
                credentials: 'include'
        });
        
        if (!response.ok) {
                throw new Error('Failed to fetch referral code');
        }
        
        const data = await response.json();
        return {
            code: data.data.code,
            usedCount: data.data.usedCount
        };
}

export const clearAccountData = async() => {

}


