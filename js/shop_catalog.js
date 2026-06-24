(function() {
  var products = [
    {
      id: 'sticker-question-3pack',
      category: 'stickers',
      pack: 'three',
      label: 'question 3pack , $7',
      imageSrc: '../images/lexiconic.shop_pics/question 3pack.jpg',
      stripeUrl: 'https://buy.stripe.com/3cIcN56qKdgY7tU25n5Ne0B'
    },
    {
      id: 'sticker-cultivate-3pack',
      category: 'stickers',
      pack: 'three',
      label: 'cultivate 3pack , $7',
      imageSrc: '../images/lexiconic.shop_pics/cultivate 3pack.jpg',
      stripeUrl: 'https://buy.stripe.com/aFabJ102m2CkeWmcK15Ne0y'
    },
    {
      id: 'sticker-peace-3pack',
      category: 'stickers',
      pack: 'three',
      label: 'peace 3pack , $7',
      imageSrc: '../images/lexiconic.shop_pics/peace 3pack.jpg',
      stripeUrl: 'https://buy.stripe.com/28EeVd4iCccU4hIh0h5Ne0D'
    },
    {
      id: 'sticker-resistance-3pack',
      category: 'stickers',
      pack: 'three',
      label: 'resistance 3pack , $7',
      imageSrc: '../images/lexiconic.shop_pics/resistance 3pack.jpg',
      stripeUrl: 'https://buy.stripe.com/eVq28r4iC90IaG625n5Ne0w'
    },
    {
      id: 'sticker-smile-3pack',
      category: 'stickers',
      pack: 'three',
      label: 'smile 3pack , $7',
      imageSrc: '../images/lexiconic.shop_pics/smile 3pack.jpg',
      stripeUrl: 'https://buy.stripe.com/8x23cv2auccU8xYdO55Ne0F'
    },
    {
      id: 'sticker-torus-3pack',
      category: 'stickers',
      pack: 'three',
      label: 'torus 3pack , $7',
      imageSrc: '../images/lexiconic.shop_pics/torus 3pack.jpg',
      stripeUrl: 'https://buy.stripe.com/14AaEX6qK90I9C26lD5Ne0u'
    },
    {
      id: 'sticker-assorted-a-3pack',
      category: 'stickers',
      pack: 'three',
      label: 'assorted 3pack "a", $7',
      imageSrc: '../images/lexiconic.shop_pics/assorted 3pack a.jpg',
      stripeUrl: 'https://buy.stripe.com/00w14naH0a4Mg0qcK15Ne0t'
    },
    {
      id: 'sticker-assorted-b-3pack',
      category: 'stickers',
      pack: 'three',
      label: 'assorted 3pack "b", $7',
      imageSrc: '../images/lexiconic.shop_pics/assorted 3pack b.jpg',
      stripeUrl: 'https://buy.stripe.com/dRmcN52au0ucg0qfWd5Ne0s'
    },
    {
      id: 'sticker-question-5pack',
      category: 'stickers',
      pack: 'five',
      label: 'question 5pack , $11',
      imageSrc: '../images/lexiconic.shop_pics/question 5pack.jpg',
      stripeUrl: 'https://buy.stripe.com/6oU14n02mccU6pQdO55Ne0A'
    },
    {
      id: 'sticker-cultivate-5pack',
      category: 'stickers',
      pack: 'five',
      label: 'cultivate 5pack , $11',
      imageSrc: '../images/lexiconic.shop_pics/cultivate 5pack.jpg',
      stripeUrl: 'https://buy.stripe.com/bJefZh3ey6SAdSih0h5Ne0z'
    },
    {
      id: 'sticker-peace-5pack',
      category: 'stickers',
      pack: 'five',
      label: 'peace 5pack , $11',
      imageSrc: '../images/lexiconic.shop_pics/peace 5pack.jpg',
      stripeUrl: 'https://buy.stripe.com/9B614ncP81ygaG66lD5Ne0C'
    },
    {
      id: 'sticker-resistance-5pack',
      category: 'stickers',
      pack: 'five',
      label: 'resistance 5pack , $11',
      imageSrc: '../images/lexiconic.shop_pics/resistance 5pack.jpg',
      stripeUrl: 'https://buy.stripe.com/6oU8wP3eyfp68xY7pH5Ne0x'
    },
    {
      id: 'sticker-smile-5pack',
      category: 'stickers',
      pack: 'five',
      label: 'smile 5pack , $11',
      imageSrc: '../images/lexiconic.shop_pics/smile 5pack.jpg',
      stripeUrl: 'https://buy.stripe.com/aFa14neXg6SAeWm7pH5Ne0E'
    },
    {
      id: 'sticker-torus-5pack',
      category: 'stickers',
      pack: 'five',
      label: 'torus 5pack , $11',
      imageSrc: '../images/lexiconic.shop_pics/torus 5pack.jpg',
      stripeUrl: 'https://buy.stripe.com/6oU7sL02m6SA3dEfWd5Ne0v'
    },
    {
      id: 'sticker-assorted-5pack',
      category: 'stickers',
      pack: 'five',
      label: 'assorted 5pack , $11',
      imageSrc: '../images/lexiconic.shop_pics/assorted 5pack.jpg',
      stripeUrl: 'https://buy.stripe.com/4gM00j16q6SA3dE5hz5Ne0r'
    },
    {
      id: 'sticker-assorted-a-10pack',
      category: 'stickers',
      pack: 'ten',
      label: 'assorted 10pack "a" , $18',
      imageSrc: '../images/lexiconic.shop_pics/assorted 10pack a.jpg',
      stripeUrl: 'https://buy.stripe.com/bJe14n02m6SAeWmbFX5Ne0q'
    },
    {
      id: 'sticker-assorted-b-10pack',
      category: 'stickers',
      pack: 'ten',
      label: 'assorted 10pack "b" , $18',
      imageSrc: '../images/lexiconic.shop_pics/assorted 10pack b.jpg',
      stripeUrl: 'https://buy.stripe.com/5kQ28r7uO90I5lMdO55Ne0p'
    },
    {
      id: 'apparel-wandering-shirt',
      category: 'apparel',
      pack: null,
      label: 'embroidered "wandering." shirt , $30',
      imageSrc: '../images/lexiconic.shop_pics/wandering_shirt.jpg',
      stripeUrl: 'https://buy.stripe.com/3cIdR902mccUbKah0h5Ne02'
    },
    {
      id: 'apparel-question-shirt',
      category: 'apparel',
      pack: null,
      label: 'embroidered "question." shirt , $30',
      imageSrc: '../images/lexiconic.shop_pics/question_shirt.jpg',
      stripeUrl: 'https://buy.stripe.com/3cIbJ1eXg6SA7tU6lD5Ne0I'
    },
    {
      id: 'apparel-torus-shirt',
      category: 'apparel',
      pack: null,
      label: 'embroidered torus shirt , $30',
      imageSrc: '../images/lexiconic.shop_pics/torus_shirt.jpg',
      stripeUrl: 'https://buy.stripe.com/8x25kDbL4el2eWm8tL5Ne0G'
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
