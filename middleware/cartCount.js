function cartNumeration(cartLength, user){

    if(cartLength !== null && user !== '' && cartLength !== '[]' ) {
        try {
            var jsonCart = JSON.parse(cartLength);

            return jsonCart.length;
        } catch (error) {
            return 0
        }
    } else {
        return 0
    }
}
        
export default cartNumeration;
