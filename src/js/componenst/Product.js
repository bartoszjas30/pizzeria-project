import { select, templates, classNames } from './../settings.js';
import  utils  from './../utils.js';
import AmountWidget from './AmountWidget.js';
class Product {
  constructor(id, data) {
    const thisProduct = this;
    //thisProduct.dom = {};
    thisProduct.id = id;
    thisProduct.data = data;
    thisProduct.renderInMenu();
    thisProduct.getElements();
    //console.log('new Product:', thisProduct);
    thisProduct.initAccordion();
    thisProduct.initOrderForm();
    thisProduct.initAmountWidget();
    thisProduct.processOrder();
    thisProduct.prepareCartProductParams();
  }
  renderInMenu() {
    const thisProduct = this;

    /* generate HTML based on temlate */
    const generatedHTML = templates.menuProduct(thisProduct.data);

    /* create element using utils.createElementFromHTML */
    thisProduct.element = utils.createDOMFromHTML(generatedHTML);

    /* find menu container */
    const menuContainer = document.querySelector(select.containerOf.menu);

    /* add element to menu */
    menuContainer.appendChild(thisProduct.element);

  }
  getElements() {
    const thisProduct = this;

    thisProduct.imageWrapper = thisProduct.element.querySelector(select.menuProduct.imageWrapper);
    //console.log(thisProduct.imageWrapper);
    thisProduct.amountWidgetElem = thisProduct.element.querySelector(select.menuProduct.amountWidget);
    thisProduct.accordionTrigger = thisProduct.element.querySelector(select.menuProduct.clickable);
    thisProduct.form = thisProduct.element.querySelector(select.menuProduct.form);
    thisProduct.formInputs = thisProduct.form.querySelectorAll(select.all.formInputs);
    thisProduct.cartButton = thisProduct.element.querySelector(select.menuProduct.cartButton);
    thisProduct.priceElem = thisProduct.element.querySelector(select.menuProduct.priceElem);
  }
  initAccordion() {
    const thisProduct = this;

    /* find the clickable trigger (the element that should react to clicking) */

    //const clickableTrigger = thisProduct.element.querySelector(select.menuProduct.clickable);
    //console.log(select.menuProduct.clickable);
    /* START: add event listener to clickable trigger on event click */
    thisProduct.accordionTrigger.addEventListener('click', function (event) {
      /* prevent default action for event */
      event.preventDefault();

      /* find active product (product that has active class) */


      const activeProduct = document.querySelector(select.all.menuProductsActive);
      //console.log(activeProduct);
      /* if there is active product and it's not thisProduct.element, remove class active from it */

      if (activeProduct != null && thisProduct.activeProduct != null) {
        activeProduct.classList.remove(classNames.menuProduct.wrapperActive);
      }
      /* toggle active class on thisProduct.element */
      thisProduct.element.classList.toggle(classNames.menuProduct.wrapperActive);
    });

  }
  initOrderForm() {
    const thisProduct = this;
    //console.log('method-name:initOrderForm');

    thisProduct.form.addEventListener('submit', function (event) {
      event.preventDefault();
      thisProduct.processOrder();
    });

    for (let input of thisProduct.formInputs) {
      input.addEventListener('change', function () {
        thisProduct.processOrder();
      });
    }

    thisProduct.cartButton.addEventListener('click', function (event) {
      event.preventDefault();
      thisProduct.processOrder();
      thisProduct.addToCart();
    });
  }
  processOrder() {
    const thisProduct = this;

    //console.log('method-name:processOrder');

    // covert form to object structure e.g. { sauce: ['tomato'], toppings: ['olives', 'redPeppers']}
    const formData = utils.serializeFormToObject(thisProduct.form);
    //console.log('formData', formData);

    // set price to default price
    let price = thisProduct.data.price;

    // for every category (param)...
    for (let paramId in thisProduct.data.params) {
      // determine param value, e.g. paramId = 'toppings', param = { label: 'Toppings', type: 'checkboxes'... }
      const param = thisProduct.data.params[paramId];
      //console.log(paramId, param);

      // for every option in this category
      for (let optionId in param.options) {

        // determine option value, e.g. optionId = 'olives', option = { label: 'Olives', price: 2, default: true }
        const option = param.options[optionId];
        //console.log(optionId, option);
        //create varible to check default price
        const checkDefault = optionId.hasOwnProperty('default');


        // check if there is param with a name of paramId in formData and if it includes optionId
        const optionSelected = formData[paramId] && formData[paramId].includes(optionId);
        if (optionSelected) {
          // check if the option is not default
          if (checkDefault == false) {
            //console.log(checkDefault);
            // add option price to price variable
            price += option.price;
            //thisProduct.imageWrapper.classList.add(classNames.menuProduct.imageVisible);

            //console.log(thisProduct.imageWrapper);
          }
        } else {
          // check if the option is default

          if (checkDefault == true) {
            // reduce price variable
            price -= option.price;
            thisProduct.imageWrapper.classList.remove(classNames.menuProduct.imageVisible);
          }
        }
        const optionImage = thisProduct.imageWrapper.querySelector('.' + paramId + '-' + optionId);
        //console.log(optionImage);

        if (optionImage) {
          if (optionSelected) {

            optionImage.classList.add(classNames.menuProduct.imageVisible);
          } else {
            optionImage.classList.remove(classNames.menuProduct.imageVisible);
          }

        }

      }
    }
    /* multiply price by amount */

    thisProduct.priceSingle = price;
    thisProduct.priceSum = price *= thisProduct.amountWidget.value;
    //const priceSingle =  price * thisProduct.amountWidget.value ; 
    price *= thisProduct.amountWidget.value;
    //console.log('price single:', thisProduct.priceSingle);
    //console.log('price:', price);
    //console.log(thisProduct.amountWidget.value);
    // update calculated price in the HTML

    thisProduct.priceElem.innerHTML = thisProduct.priceSum;
    //console.log(price);
    //console.log('price:', thisProduct.priceSum);
  }
  initAmountWidget() {
    const thisProduct = this;
    thisProduct.amountWidget = new AmountWidget(thisProduct.amountWidgetElem);
    thisProduct.amountWidgetElem.addEventListener('updated', function () {
      thisProduct.processOrder();
    });
  }
  addToCart() {
    const thisProduct = this;
    thisProduct.prepareCartProduct();
    
    const productCart = thisProduct.prepareCartProduct();
    console.log(productCart);
    //app.cart.add(thisProduct.prepareCartProduct());

    const event = new CustomEvent('add-to-cart', {
      bubbles: true,
      detail:{
        product: productCart, 
      }
      
    });

    thisProduct.element.dispatchEvent(event);
  }
  prepareCartProduct() {
    const thisProduct = this;

    const productSummary = {
      id: thisProduct.id,
      name: thisProduct.data.name,
      amount: thisProduct.amountWidget.value,
      priceSingle: thisProduct.priceSingle,
      price: thisProduct.priceSum,
      params: {}
    };
    productSummary.params = thisProduct.prepareCartProductParams();
    console.log('product Summary:', productSummary);
    return productSummary;
  }
  prepareCartProductParams() {
    const thisProduct = this;
    //console.log('method-name:prepareCartProductParams');
    const formData = utils.serializeFormToObject(thisProduct.form);
    //console.log('formData', formData);

    const params = {};

    // for very category (param)
    for (let paramId in thisProduct.data.params) {
      //console.log('paramId:',paramId);
      //console.log('data:', thisProduct.data);
      const param = thisProduct.data.params[paramId];

      //console.log('param:',param);
      //console.log('params:',params);
      params[paramId] = {
        label: param.label,
        options: {}
      };
      // for every option in this category
      for (let optionId in param.options) {
        const option = param.options[optionId];
        const optionSelected = formData[paramId] && formData[paramId].includes(optionId);
        if (optionSelected) {
          params[paramId].options[optionId] = option.label;
          //console.log(option.label);
          //console.log(params[paramId].options);
        }
      }

    }

    return params;

  }

}
export default Product;