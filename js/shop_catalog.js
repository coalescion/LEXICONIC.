(function() {
  var products = [
    {
      id: 'sticker-question-3pack',
      category: 'stickers',
      pack: 'three',
      label: 'question 3pack , $9',
      imageSrc: '../images/lexiconic.shop_pics/question 3pack.jpg',
      stripeUrl: 'https://buy.stripe.com/bJe3cv4iCfp68xYfWd5Ne08'
    },
    {
      id: 'sticker-cultivate-3pack',
      category: 'stickers',
      pack: 'three',
      label: 'cultivate 3pack , $9',
      imageSrc: '../images/lexiconic.shop_pics/cultivate 3pack.jpg',
      stripeUrl: 'https://buy.stripe.com/cNi4gzg1k1yg3dE4dv5Ne0b'
    },
    {
      id: 'sticker-peace-3pack',
      category: 'stickers',
      pack: 'three',
      label: 'peace 3pack , $9',
      imageSrc: '../images/lexiconic.shop_pics/peace 3pack.jpg',
      stripeUrl: 'https://buy.stripe.com/8x27sL4iCdgY29AeS95Ne06'
    },
    {
      id: 'sticker-resistance-3pack',
      category: 'stickers',
      pack: 'three',
      label: 'resistance 3pack , $9',
      imageSrc: '../images/lexiconic.shop_pics/resistance 3pack.jpg',
      stripeUrl: 'https://buy.stripe.com/7sY14n5mG3Go01s5hz5Ne0d'
    },
    {
      id: 'sticker-smile-3pack',
      category: 'stickers',
      pack: 'three',
      label: 'smile 3pack , $9',
      imageSrc: '../images/lexiconic.shop_pics/smile 3pack.jpg',
      stripeUrl: 'https://buy.stripe.com/3cI5kDeXg4Ks7tU6lD5Ne04'
    },
    {
      id: 'sticker-torus-3pack',
      category: 'stickers',
      pack: 'three',
      label: 'torus 3pack , $9',
      imageSrc: '../images/lexiconic.shop_pics/torus 3pack.jpg',
      stripeUrl: 'https://buy.stripe.com/dRm8wPaH04Ksg0qdO55Ne0f'
    },
    {
      id: 'sticker-assorted-a-3pack',
      category: 'stickers',
      pack: 'three',
      label: 'assorted 3pack "a", $9',
      imageSrc: '../images/lexiconic.shop_pics/assorted 3pack a.jpg',
      stripeUrl: 'https://buy.stripe.com/aFadR96qKdgY9C2aBT5Ne0g'
    },
    {
      id: 'sticker-assorted-b-3pack',
      category: 'stickers',
      pack: 'three',
      label: 'assorted 3pack "b", $9',
      imageSrc: '../images/lexiconic.shop_pics/assorted 3pack b.jpg',
      stripeUrl: 'https://buy.stripe.com/14A7sLcP82Ck01s4dv5Ne0h'
    },
    {
      id: 'sticker-question-5pack',
      category: 'stickers',
      pack: 'five',
      label: 'question 5pack , $14',
      imageSrc: '../images/lexiconic.shop_pics/question 5pack.jpg',
      stripeUrl: 'https://buy.stripe.com/4gMeVddTc5OwdSi6lD5Ne09'
    },
    {
      id: 'sticker-cultivate-5pack',
      category: 'stickers',
      pack: 'five',
      label: 'cultivate 5pack , $14',
      imageSrc: '../images/lexiconic.shop_pics/cultivate 5pack.jpg',
      stripeUrl: 'https://buy.stripe.com/9B68wP9CWgta15w39r5Ne0a'
    },
    {
      id: 'sticker-peace-5pack',
      category: 'stickers',
      pack: 'five',
      label: 'peace 5pack , $14',
      imageSrc: '../images/lexiconic.shop_pics/peace 5pack.jpg',
      stripeUrl: 'https://buy.stripe.com/3cI5kD7uO0uc6pQ11j5Ne07'
    },
    {
      id: 'sticker-resistance-5pack',
      category: 'stickers',
      pack: 'five',
      label: 'resistance 5pack , $14',
      imageSrc: '../images/lexiconic.shop_pics/resistance 5pack.jpg',
      stripeUrl: 'https://buy.stripe.com/9B63cv5mGgta7tU4dv5Ne0c'
    },
    {
      id: 'sticker-smile-5pack',
      category: 'stickers',
      pack: 'five',
      label: 'smile 5pack , $14',
      imageSrc: '../images/lexiconic.shop_pics/smile 5pack.jpg',
      stripeUrl: 'https://buy.stripe.com/7sYfZh02mfp629AbFX5Ne05'
    },
    {
      id: 'sticker-torus-5pack',
      category: 'stickers',
      pack: 'five',
      label: 'torus 5pack , $14',
      imageSrc: '../images/lexiconic.shop_pics/torus 5pack.jpg',
      stripeUrl: 'https://buy.stripe.com/cNifZh8ySgta7tUfWd5Ne0e'
    },
    {
      id: 'sticker-assorted-5pack',
      category: 'stickers',
      pack: 'five',
      label: 'assorted 5pack , $14',
      imageSrc: '../images/lexiconic.shop_pics/assorted 5pack.jpg',
      stripeUrl: 'https://buy.stripe.com/00w14nbL41yg3dE11j5Ne0i'
    },
    {
      id: 'sticker-assorted-a-10pack',
      category: 'stickers',
      pack: 'ten',
      label: 'assorted 10pack "a" , $25',
      imageSrc: '../images/lexiconic.shop_pics/assorted 10pack a.jpg',
      stripeUrl: 'https://buy.stripe.com/14A14n5mGa4M6pQaBT5Ne0j'
    },
    {
      id: 'sticker-assorted-b-10pack',
      category: 'stickers',
      pack: 'ten',
      label: 'assorted 10pack "b" , $25',
      imageSrc: '../images/lexiconic.shop_pics/assorted 10pack b.jpg',
      stripeUrl: 'https://buy.stripe.com/00w14n9CW0uccOebFX5Ne0k'
    },
    {
      id: 'apparel-wandering-shirt',
      category: 'apparel',
      pack: null,
      label: 'embroidered "wandering." shirt , $35',
      imageSrc: '../images/lexiconic.shop_pics/wandering_shirt.jpg',
      stripeUrl: 'https://buy.stripe.com/3cIdR902mccUbKah0h5Ne02'
    },
    {
      id: 'apparel-question-shirt',
      category: 'apparel',
      pack: null,
      label: 'embroidered "question." shirt , $35',
      imageSrc: '../images/lexiconic.shop_pics/question_shirt.jpg',
      stripeUrl: 'https://buy.stripe.com/aFacN59CWgtag0qaBT5Ne01'
    },
    {
      id: 'apparel-torus-shirt',
      category: 'apparel',
      pack: null,
      label: 'embroidered torus shirt , $35',
      imageSrc: '../images/lexiconic.shop_pics/torus_shirt.jpg',
      stripeUrl: 'https://buy.stripe.com/5kQeVdaH0el2dSi6lD5Ne03'
    }
  ];
  var productsById = {};

  products.forEach(function(product) {
    productsById[product.id] = product;
  });

  window.LEXICONIC_SHOP_CATALOG = {
    products: products.slice(),
    getProductById: function(id) {
      return productsById[id] || null;
    },
    getProductsByCategory: function(category) {
      return products.filter(function(product) {
        return product.category === category;
      });
    },
    getStickerProductsByPack: function(pack) {
      return products.filter(function(product) {
        return product.category === 'stickers' && product.pack === pack;
      });
    }
  };
})();
