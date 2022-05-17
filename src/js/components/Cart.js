import {select, classNames, templates, settings} from '../settings.js';
import CartProduct from './CartProduct.js';
import utils from '../utils.js';


class Cart {
  constructor(element) {
    const thisCart = this;
    thisCart.products = [];
    thisCart.getElements(element);
    thisCart.initActions();
    //console.log('new Cart', thisCart);
  }
  getElements(element) {
    const thisCart = this;
    thisCart.dom = {};

    thisCart.dom.wrapper = element;
    thisCart.dom.toggleTrigger = thisCart.dom.wrapper.querySelector(select.cart.toggleTrigger);
    thisCart.dom.productList = thisCart.dom.wrapper.querySelector(select.cart.productList);
    thisCart.dom.deliveryFee = thisCart.dom.wrapper.querySelector(select.cart.deliveryFee);
    thisCart.dom.subtotalPrice = thisCart.dom.wrapper.querySelector(select.cart.subtotalPrice);
    thisCart.dom.totalPrice = thisCart.dom.wrapper.querySelectorAll(select.cart.totalPrice);
    thisCart.dom.totalNumber = thisCart.dom.wrapper.querySelector(select.cart.totalNumber);
    thisCart.dom.form = thisCart.dom.wrapper.querySelector(select.cart.form);
    thisCart.dom.phone = thisCart.dom.wrapper.querySelector(select.cart.phone);
    thisCart.dom.address = thisCart.dom.wrapper.querySelector(select.cart.address);


  }
  initActions() {
    const thisCart = this;
    thisCart.dom.toggleTrigger.addEventListener('click', function (event) {
      event.preventDefault();

      thisCart.dom.wrapper.classList.toggle(classNames.cart.wrapperActive);


    });

    thisCart.dom.productList.addEventListener('updated', function () {
      thisCart.update();
    });

    thisCart.dom.productList.addEventListener('remove', function (event) {
      thisCart.remove(event.detail.cartProduct);
    });

    thisCart.dom.form.addEventListener('submit', function (event) {
      event.preventDefault();
      thisCart.sendOrder();
    });

  }


  add(menuProduct) {
    const thisCart = this;



    /* generate HTML based on template */

    const generatedHTML = templates.cartProduct(menuProduct);
    /* create element using utils.createElementFromHTML */

    const generatedDOM = utils.createDOMFromHTML(generatedHTML);



    /* add element to menu */

    thisCart.dom.productList.appendChild(generatedDOM);

    thisCart.products.push(new CartProduct(menuProduct, generatedDOM)); //wykorzystanie tablicy products do zapisywanie danych z koszyka
    //console.log('thisCart.products', thisCart.products);
    thisCart.update();

  }

  update() {
    const thisCart = this;
    thisCart.deliveryFee = settings.cart.defaultDeliveryFee;
    thisCart.totalNumber = 0;
    thisCart.subtotalPrice = 0;


    for (let cartProduct of thisCart.products) {
      thisCart.totalNumber = cartProduct.amount + thisCart.totalNumber;


      thisCart.subtotalPrice = cartProduct.price + thisCart.subtotalPrice;


    }

    thisCart.totalPrice = thisCart.subtotalPrice + thisCart.deliveryFee;
    thisCart.dom.totalPrice.innerHTML = thisCart.totalPrice;


    if (thisCart.subtotalPrice > 0) {

      thisCart.totalPrice = thisCart.subtotalPrice + thisCart.deliveryFee;

    } else {
      thisCart.totalPrice = 0;
      thisCart.deliveryFee = 0;
    }


    thisCart.dom.deliveryFee.innerHTML = thisCart.deliveryFee;
    thisCart.dom.totalNumber.innerHTML = thisCart.totalNumber;
    thisCart.dom.subtotalPrice.innerHTML = thisCart.subtotalPrice;
    for (let total of thisCart.dom.totalPrice) {
      total.innerHTML = thisCart.totalPrice; //istotne dodanie pętli w celu wyświetlania total price
    }

  }

  remove(element) {
    const thisCart = this;
    element.dom.wrapper.remove();
    // usuwamy element / produkt z HTML

    const indexOfProduct = thisCart.products.indexOf(element);
    thisCart.products.splice(indexOfProduct, 1);
    // usuwamy danym produkt z tablicy

    thisCart.update();
    // wywołujemy metodę update do przeliczenia sum po usunięciu produktu
  }

  sendOrder() {
    const thisCart = this;
    const url = settings.db.url + '/' + settings.db.orders;

    const playload = {
      address: thisCart.dom.address.value,
      phone: thisCart.dom.phone.value,
      totalPrice: thisCart.totalPrice,
      subtotalPrice: thisCart.subtotalPrice,
      totalNumber: thisCart.totalNumber,
      deliveryFee: thisCart.deliveryFee,
      products: [],

    };

    for (let prod of thisCart.products) {
      playload.products.push(prod.getData());
    }

    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(playload)
    };


    fetch(url, options)
      .then(function (response) {
        return response.json();
      }).then(function (parsedResponse) {
        console.log('parasedResponse', parsedResponse);
      });
  }
}
export default Cart;