function cartNumeration(cartLength, user){

    if(cartLength !== null && user !== 'index' && cartLength !== undefined) {
        var jsonCart = JSON.parse(cartLength.cart);
        return jsonCart.length;
    } else {
        return 0
    }
}
        
export default cartNumeration;
