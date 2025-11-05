function isMobile(req) {
    return /Mobile|Android|iP(hone|od)|IEMobile|Blackberry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(req.headers['user-agent']);
}

export default isMobile;