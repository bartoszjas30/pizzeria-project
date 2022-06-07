import { settings, select, classNames } from './settings.js';
import Product from './componenst/Product.js';
import Cart from './componenst/Cart.js';
import Booking from './componenst/Booking.js';
import Home from './componenst/Home.js';



const app = {
  ininPages: function () {
    const thisApp = this;
    thisApp.homeOrder = document.querySelector(select.nav.homeOrder);
    thisApp.pages = document.querySelector(select.containerOf.pages).children;
    thisApp.navLinks = document.querySelectorAll(select.nav.links);
    const idFromHash = window.location.hash.replace('#/', '');

    let pageMatchingHash = thisApp.pages[0].id;

    for (let page of thisApp.pages) {
      if (page.id == idFromHash) {
        pageMatchingHash = page.id;
        break;
      }
    }

    thisApp.activatePage(pageMatchingHash);

    for (let link of thisApp.navLinks) {
      link.addEventListener('click', function (event) {
        const clickedElement = this;
        event.preventDefault();

        /*get page id from gher attrivute*/
        const id = clickedElement.getAttribute('href').replace('#', '');

        /* run thisApp.activatePage with tha id*/
        thisApp.activatePage(id);

        /* change URL hash */
        window.location.hash = '#/' + id;
      });
    }

  },
  activatePage: function (pageId) {
    const thisApp = this;

    /* add class 'active' to matching pages, remove from non-matching*/
    for (let page of thisApp.pages) {
      /* if(page.id == pageId){
        page.classList.add(classNames.pages.active);
      }else {
        page.classList.remove(classNames.pages.active);
      } */
      page.classList.toggle(classNames.pages.active, page.id == pageId);
    }

    /* add class 'active' to matching link, remove from non-matching*/
    for (let link of thisApp.navLinks) {
      link.classList.toggle(
        classNames.nav.active,
        link.getAttribute('href') == '#' + pageId
      );

    }
  },
  initMenu: function () {
    const thisApp = this;
    //console.log('thisApp.data:', thisApp.data);

    for (let productData in thisApp.data.products) {
      new Product(thisApp.data.products[productData].id, thisApp.data.products[productData]);
    }
  },
  initData: function () {
    const thisApp = this;
    thisApp.data = {};
    const url = settings.db.url + '/' + settings.db.products;
    //console.log(url);
    fetch(url)
      .then(function (rawResponse) {
        return rawResponse.json();
      })
      .then(function (parsedRespnose) {
        //console.log('parsedResponse', parsedRespnose);

        /* save parsedResponse as thisApp.data.products */
        thisApp.data.products = parsedRespnose;
        /* execute initMenu method */
        thisApp.initMenu();
      });

    //console.log('thisApp.data', JSON.stringify(thisApp.data));
  },
  initCart: function () {
    const thisApp = this;

    const cartElem = document.querySelector(select.containerOf.cart);
    thisApp.cart = new Cart(cartElem);

    thisApp.productList = document.querySelector(select.containerOf.menu);
    thisApp.productList.addEventListener('add-to-cart', function (event) {
      app.cart.add(event.detail.product);
      console.log(event.detail.product);
      //app.cart.add(thisProduct.prepareCartProduct());
    });
  },
  initBooking: function () {
    const thisApp = this;

    thisApp.widgetWraper = document.querySelector(select.containerOf.booking);
    //console.log(thisApp.widgetWraper);
    thisApp.booking = new Booking(thisApp.widgetWraper);
  },
  initHome: function () {
    const thisApp = this;

    thisApp.homeWrapper = document.querySelector(select.containerOf.home);
    //console.log(thisApp.homeWrapper);
    thisApp.booking = new Home(thisApp.homeWrapper);
  },
  init: function () {
    const thisApp = this;
    //console.log('*** App starting ***');
    //console.log('thisApp:', thisApp);
    //console.log('classNames:', classNames);
    //console.log('settings:', settings);
    //console.log('templates:', templates);
    thisApp.ininPages();

    thisApp.initData();

    thisApp.initCart();
    thisApp.initBooking();
    thisApp.initHome();
    //console.log(this.initMenu);
  },


};

app.init();
