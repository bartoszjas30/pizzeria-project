import { settings, select, templates, classNames } from './../settings.js';
import  utils  from './../utils.js';
import CartProduct from './CartProduct.js';
class Cart {
  constructor(element) {
    const thisCart = this;
    thisCart.products = [];
    //console.log(thisCart.products);
    thisCart.getElements(element);
    thisCart.initActions();

    //thisCart.update();

    //console.log('new Cart', thisCart);
  }
  getElements(element) {
    const thisCart = this;
    thisCart.dom = {};
    thisCart.dom.productList = document.querySelector(select.cart.productList);
    thisCart.dom.wrapper = element;
    //console.log(thisCart.dom);
    //console.log(thisCart.dom.wrapper);
    thisCart.dom.toggleTrigger = document.querySelector(select.cart.toggleTrigger);
    //console.log(thisCart.dom.toggleTrigger);
    thisCart.dom.deliveryFee = document.querySelector(select.cart.deliveryFee);
    thisCart.dom.subtotalPrice = document.querySelector(select.cart.subtotalPrice);
    thisCart.dom.totalPrice = document.querySelectorAll(select.cart.totalPrice);
    thisCart.dom.totalNumber = document.querySelector(select.cart.totalNumber);
    thisCart.dom.form = document.querySelector(select.cart.form);
    thisCart.dom.phone = document.querySelector(select.cart.phone);
    thisCart.dom.address = document.querySelector(select.cart.address);
  }
  initActions() {
    const thisCart = this;

    thisCart.dom.form.addEventListener('submit', function(event){
      event.preventDefault();
      thisCart.sendOrder();
    });

    thisCart.dom.toggleTrigger.addEventListener('click', function (event) {

      event.preventDefault();
      thisCart.dom.wrapper.classList.toggle(classNames.cart.wrapperActive);

    });
    thisCart.dom.productList.addEventListener('updated', function () {
      thisCart.update();
    });
    thisCart.dom.productList.addEventListener('remove', function (event) {
      console.log('remove');
      thisCart.remove(event.detail.cartProduct);
    });

  }
  add(menuProduct) {
    const thisCart = this;
    /* generate HTML based on temlate */
    const generatedHTML = templates.cartProduct(menuProduct);
    //console.log(generatedHTML);

    /* create element using utils.createElementFromHTML */
    const generatedDOM = utils.createDOMFromHTML(generatedHTML);
    //console.log(generatedDOM);

    /* add element to cart */
    thisCart.dom.productList.appendChild(generatedDOM);

    thisCart.products.push(new CartProduct(menuProduct, generatedDOM));
    console.log('thisCart.products', thisCart.products);
    thisCart.update();
  }
  update() {
    const thisCart = this;

    thisCart.deliveryFee = 0;
    thisCart.totalNumber = 0;
    thisCart.subtotalPrice = 0;

    for (let product of thisCart.products) {
      thisCart.totalNumber += product.amount;
      thisCart.subtotalPrice += product.price;

    }
    if (thisCart.totalNumber != 0) {
      thisCart.deliveryFee = 20;

    }

    for (let totalPrice of thisCart.dom.totalPrice) {
      totalPrice.innerHTML = thisCart.subtotalPrice + thisCart.deliveryFee;
    }

    //thisCart.totalPrice =  thisCart.subtotalPrice + thisCart.deliveryFee;



    thisCart.dom.deliveryFee.innerHTML = thisCart.deliveryFee;
    thisCart.dom.totalNumber.innerHTML = thisCart.totalNumber;
    thisCart.dom.subtotalPrice.innerHTML = thisCart.subtotalPrice;
    thisCart.dom.amount = 
    thisCart.totalPrice = thisCart.subtotalPrice + thisCart.deliveryFee;
    
    

    //console.log('delivety:', thisCart.deliveryFee);
    //console.log('amount:', thisCart.totalNumber);
    //console.log('subtotal price', thisCart.subtotalPrice);
    //console.log('total price', thisCart.totalPrice);
    
  }
  remove(cartProduct) {
    const thisCart = this;
    thisCart.products = thisCart.products.filter(product => product !== cartProduct);
    cartProduct.dom.wrapper.remove();


    thisCart.update();
  }
  sendOrder(){
    const thisCart = this;
    
    const url = settings.db.url + '/' + settings.db.orders;

    const payload = {
      address: thisCart.dom.address.value,
      phone: thisCart.dom.phone.value,
      totalPrice: thisCart.totalPrice,
      subtotalPrice: thisCart.subtotalPrice,
      totalNumber: thisCart.totalNumber,
      deliveryFee: thisCart.deliveryFee,
      products: []
    };
    for(let prod of thisCart.products) {
      payload.products.push(prod.getData());
      console.log(prod);
    }
    console.log(payload);
    console.log(url);
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    };
    
    fetch(url, options);
  }

}
export default Cart; 