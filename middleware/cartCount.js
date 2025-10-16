function cartNumeration(cartLength, user){

    // console.log(cartLength)

    if(cartLength !== null && user !== 'index' && cartLength !== '[]' ) {
        var jsonCart = JSON.parse(cartLength);
        return jsonCart.length;
    } else {
        return 0
    }
}
        
export default cartNumeration;
