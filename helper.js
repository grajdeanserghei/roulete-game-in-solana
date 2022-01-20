


export const getReturnAmount = (ratio, stake) => { 
    return ratio * stake;
}

export const totalAmtToBePaid = (stake) => { 
    return stake;
}

export const randomNumber = (min, max) => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
 }