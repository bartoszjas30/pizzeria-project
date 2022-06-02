import{templates, select, settings, classNames} from '../settings.js';
import AmountWidget from './AmountWidget.js';
import DatePicker from './DatePicker.js';
import HourPicker from './HourPicker.js';
import utils from '../utils.js';

class Booking {
  constructor(element){
    const thisBooking = this;
    thisBooking.render(element);
    thisBooking.initWidgets();
    thisBooking.getData();

    thisBooking.tableSelected;


  }


  getData(){
    const thisBooking = this;

    const startDateParam = settings.db.dateStartParamKey + '=' + utils.dateToStr(thisBooking.datePicker.minDate);
    const endDateParam = settings.db.dateEndParamKey + '=' + utils.dateToStr(thisBooking.datePicker.maxDate);

    const params = {
      booking: [
        startDateParam,
        endDateParam,

      ],
      eventsCurrent: [
        settings.db.notRepeatParam,
        startDateParam,
        endDateParam,

      ],
      eventsRepeate: [
        settings.db.repeatParam,
        endDateParam,

      ],

    };

    //console.log('getData params', params);

    const urls = {
      booking:       settings.db.url + '/' + settings.db.booking
                                     + '?' + params.booking.join('&'),
      eventsCurrent: settings.db.url + '/' + settings.db.event
                                     + '?' + params.eventsCurrent.join('&'),
      eventsRepeate: settings.db.url + '/' + settings.db.event
                                     + '?' + params.eventsRepeate.join('&'),
    };
    //console.log(urls);

    Promise.all([
      fetch(urls.booking),
      fetch(urls.eventsCurrent),
      fetch(urls.eventsRepeate),
    ])
      .then(function(allResponses){
        const bookingsResponse = allResponses[0];
        const eventsCurrentResponse = allResponses[1];
        const eventsRepeateResponse = allResponses[2];
        return Promise.all([
          bookingsResponse.json(),
          eventsCurrentResponse.json(),
          eventsRepeateResponse.json(),
        ]);
      }).then(function([bookings, eventsCurrent, eventsRepeate]){
        //console.log(bookings);
        //console.log(eventsCurrent);
        //console.log(eventsRepeate);

        thisBooking.parseData(bookings, eventsCurrent, eventsRepeate);
      });

  }

  parseData(bookings, eventsCurrent, eventsRepeat){
    const thisBooking = this;
    thisBooking.booked = {};

    for(let item of bookings){
      thisBooking.makeBooked(item.date, item.hour, item.duration, item.table);
    }

    for(let item of eventsCurrent){
      thisBooking.makeBooked(item.date, item.hour, item.duration, item.table);
    }

    const minDate = thisBooking.datePicker.minDate;
    const maxDate = thisBooking.datePicker.maxDate;

    for(let item of eventsRepeat){
      if(item.repeat == 'daily'){
        

        for(let loopDate = minDate; loopDate <= maxDate; loopDate = utils.addDays(loopDate, 1)) {
          thisBooking.makeBooked(utils.dateToStr(loopDate), item.hour, item.duration, item.table);
        }
    
      }
    }

    //console.log(thisBooking.booked);

    thisBooking.updateDOM();

  }

  makeBooked(date, hour, duration, table){
    const thisBooking = this;

    if(typeof thisBooking.booked[date] == 'undefined'){
      thisBooking.booked[date] = {};
    }

    const startHour = utils.hourToNumber(hour);

    for(let hourBLock = startHour; hourBLock < startHour + duration; hourBLock += 0.5){
      //console.log('loop',startHour);

      if(typeof thisBooking.booked[date][hourBLock] == 'undefined'){
        thisBooking.booked[date][hourBLock] = [];
      }
  
      thisBooking.booked[date][hourBLock].push(table);
    }
      
  }

  updateDOM(){
    const thisBooking = this;

    thisBooking.date = thisBooking.datePicker.value;
    thisBooking.hour = utils.hourToNumber(thisBooking.hourPicker.value);

    let allAvailable = false;

    if(
      typeof thisBooking.booked[thisBooking.date] == 'undefined' 
      ||
      typeof thisBooking.booked[thisBooking.date][thisBooking.hour] == 'undefined'
    ){
      allAvailable = true;
    }

    for(let table of thisBooking.dom.tables){
      let tableId = table.getAttribute(settings.booking.tableIdAttribute);
      if(!isNaN(tableId)){
        tableId = parseInt(tableId);
      }

      if(
        !allAvailable
        &&
        thisBooking.booked[thisBooking.date][thisBooking.hour].includes(tableId)
      ){
        table.classList.add(classNames.booking.tableBooked);
      }else {
        table.classList.remove(classNames.booking.tableBooked);
      }

      
    }
  }

  initTables(event){
    const thisBooking = this;
    const table = event.target.getAttribute('data-table');

    if(table != null){
      if(event.target.classList.contains('booked')){
        alert('Niestety ten stolik jest już zajęty :(')
      } else if (event.target.classList.contains('selected')){
        event.target.classList.remove('selected');
      } else {
        thisBooking.resetTable();
        event.target.classList.add('selected');
        thisBooking.tableSelected = table;
      }

    }
  }

  resetTable() {
    const thisBooking = this;
    for(let table of thisBooking.dom.tables) {
      if(table.classList.contains('selected')){
        table.classList.remove('selected');
      }
    }
  }

  render(element){
    const thisBooking = this;
    /* generate HTML templates.bookingWidget */
    const generatedHTML = templates.bookingWidget(element);

    /* adding empty object thisBooking.dom */
    thisBooking.dom = {};
    thisBooking.dom.wrapper = element;
    thisBooking.dom.wrapper.innerHTML = generatedHTML;

    thisBooking.dom.peopleAmount = thisBooking.dom.wrapper.querySelector(select.booking.peopleAmount);
    thisBooking.dom.hoursAmount = thisBooking.dom.wrapper.querySelector(select.booking.hoursAmount);

    thisBooking.dom.datePicker = thisBooking.dom.wrapper.querySelector(select.widgets.datePicker.wrapper);
    thisBooking.dom.hourPicker = thisBooking.dom.wrapper.querySelector(select.widgets.hourPicker.wrapper);

    thisBooking.dom.tables = thisBooking.dom.wrapper.querySelectorAll(select.booking.tables);

    thisBooking.dom.floorPlan = thisBooking.dom.wrapper.querySelector(select.booking.floorPlan);
  }



  initWidgets(){
    const thisBooking = this;
    thisBooking.peopleAmount = new AmountWidget(thisBooking.dom.peopleAmount);
    thisBooking.dom.peopleAmount.addEventListener('click', function(){ });
    
    thisBooking.hoursAmount = new AmountWidget(thisBooking.dom.hoursAmount);
    thisBooking.dom.hoursAmount.addEventListener('click', function(){ });

    thisBooking.datePicker = new DatePicker(thisBooking.dom.datePicker);
    thisBooking.dom.datePicker.addEventListener('updated', function (event) {
      event.preventDefault();
      thisBooking.resetTable();
     });

    thisBooking.hourPicker = new HourPicker(thisBooking.dom.hourPicker);
    thisBooking.dom.hourPicker.addEventListener('updated', function (event) {
      event.preventDefault();
      thisBooking.resetTable();
     });

    thisBooking.dom.wrapper.addEventListener('updated', function(){
      thisBooking.updateDOM();
    });

    thisBooking.dom.wrapper.addEventListener('click', function(event){
      thisBooking.initTables(event);
    });

  }



}
export default Booking;