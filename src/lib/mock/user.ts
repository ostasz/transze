
export const MOCK_USER_CONTEXT = {
    role: 'PROSPECT', // Change to 'CLIENT' or 'ADMIN' to test visibility
    plan: 'FREE_TRIAL',
    features: {
        realTimeData: false,
        alerts: false,
        export: false,
        trading: false
    }
};

export const hasFeature = (feature: keyof typeof MOCK_USER_CONTEXT.features) => {
    return MOCK_USER_CONTEXT.features[feature];
};

export const isProspect = () => {
    return MOCK_USER_CONTEXT.role === 'PROSPECT' || MOCK_USER_CONTEXT.plan === 'FREE_TRIAL';
};
