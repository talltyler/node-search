JSpec.describe('Search', function(){
  before_each(function{
		//TODO
    //search = new Search
  })

  describe('addProducts', function(){
    it ('should add several products', function(){
      cart.addProducts('cookie')
      cart.addProducts('icecream')
      expect(cart).to(have, 2, 'products')
    })
  })

  describe('checkout', function(){
    it ('should throw an error when checking out with no products', function(){
      expect(function(){ cart.clear().checkout() }).to(throw_error, EmptyCart)
    })
  })
})


