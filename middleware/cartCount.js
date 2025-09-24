function cartNumeration(cartLength, user){

    if(cartLength !== null && user !== 'index') {
        var jsonCart = JSON.parse(cartLength);
        return jsonCart.length;
    } else {
        return 0
    }
}
        
export default cartNumeration;
