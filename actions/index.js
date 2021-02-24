export const updateLicenses = (data) => {
    return {
        type: 'UPDATE_LICENSES',
        payload: data,
    }
}
export const updateCEs = (data) => {
    return {
        type: 'UPDATE_CES',
        payload: data,
    }
}
export const updateAccountData = (data) => {
    return {
        type: 'UPDATE_ACCOUNT_DATA',
        payload: data,
    }
}