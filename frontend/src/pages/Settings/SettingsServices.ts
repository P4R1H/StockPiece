export const getReferralCode = async() => {
    const response = await fetch('/api/v1/coupons/generate-referral', {
        method: 'GET',
        credentials: 'include'
    });
    
    if (!response.ok) {
        throw new Error('Failed to fetch referral code');
    }
    
    const data = await response.json();
    return data.data;
}

export const clearAccountData = async() => {

}