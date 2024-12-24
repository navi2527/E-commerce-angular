
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { environment } from 'environments/environment';
import { CartItem } from 'src/app/common/cart-item';
import { Country } from 'src/app/common/country';
import { Order } from 'src/app/common/order';
import { OrderItem } from 'src/app/common/order-item';
import { PaymentInfo } from 'src/app/common/payment-info';
import { Purchase } from 'src/app/common/purchase';
import { State } from 'src/app/common/state';
import { CartService } from 'src/app/services/cart.service';
import { CheckoutService } from 'src/app/services/checkout.service';
import { Luv2ShopFormService } from 'src/app/services/luv2-shop-form.service';
import { Luv2ShopValidators } from 'src/app/validators/luv2-shop-validators';


@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.css']
})
export class CheckoutComponent implements OnInit {

  checkoutFormGroup: FormGroup;

  totalPrice: number=0;
  totalQuantity: number=0;
  
  //retrive the year & month for credit card
  creditCardYears: number[] = [];
  creditCardMonths: number[] = [];

  //retrive the countries and states for credit card
  countries: Country[] = []; //counties
  shippingAddressStates: State[] = [];
  billingAddressStates: State[] = [];

  //populate the email address in Form
  storage : Storage = sessionStorage;

  //Initialize Stripe API
  stripe = Stripe(environment.stripePublishableKey);

  paymentInfo:PaymentInfo = new PaymentInfo();
  cardElement:any;
  displayError:any = "";

  isDisabled: boolean = false; //for purchase button disappear

  constructor(private formBuilder: FormBuilder,
              private luv2ShopFormService: Luv2ShopFormService,
              private cartService: CartService,
              private checkoutService: CheckoutService,
              private router: Router) { }

  ngOnInit(): void {

    //Set up Stripe payment form 
    this.setupStripePaymentForm();

    //review your order // subscribe the total price % total quantity
    this.reviewCartDetails();

    //read the user's email address from the browser storage
    const theEmail = JSON.parse(this.storage.getItem('userEmail'));

    this.checkoutFormGroup = this.formBuilder.group({
      //customer details
      customer: this.formBuilder.group({
                   //step1 - Specify validation rules for form controls
        firstName: new FormControl('', [Validators.required, Validators.minLength(2), Luv2ShopValidators.notOnlyWhitespace]),
        lastName:  new FormControl('', [Validators.required, Validators.minLength(2), Luv2ShopValidators.notOnlyWhitespace]),
        email:     new FormControl(theEmail, [Validators.required, Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$')]) // works for anuva@gmail.com                                
      }),

      //Shipping address
      shippingAddress: this.formBuilder.group({
        street: new FormControl('', [Validators.required, Validators.minLength(2), Luv2ShopValidators.notOnlyWhitespace]),
        city:   new FormControl('', [Validators.required, Validators.minLength(2), Luv2ShopValidators.notOnlyWhitespace]),
        state:  new FormControl('', [Validators.required]),
        country:new FormControl('', [Validators.required]),
        zipCode:new FormControl('', [Validators.required, Validators.minLength(2), Luv2ShopValidators.notOnlyWhitespace])
      }),

      //Billing address
      billingAddress: this.formBuilder.group({
        street: new FormControl('', [Validators.required, Validators.minLength(2), Luv2ShopValidators.notOnlyWhitespace]),
        city:   new FormControl('', [Validators.required, Validators.minLength(2), Luv2ShopValidators.notOnlyWhitespace]),
        state:  new FormControl('', [Validators.required]),
        country:new FormControl('', [Validators.required]),
        zipCode:new FormControl('', [Validators.required, Validators.minLength(2), Luv2ShopValidators.notOnlyWhitespace])
      }),
      //Credit card
      //comment here for get Card elements by Stripe
      /* 
      creditCard: this.formBuilder.group({
        cardType:         new FormControl('', [Validators.required]),
        nameOnCard:       new FormControl('', [Validators.required, Validators.minLength(2), Luv2ShopValidators.notOnlyWhitespace]),
        cardNumber:       new FormControl('', [Validators.required, Validators.pattern('[0-9]{16}')]),
        securityCode:     new FormControl('', [Validators.required, Validators.pattern('[0-9]{3}')]),
        expirationMonth:[''],
        expirationYear:['']
      })
        */
      //Review your Order

     
    });


    //populate the credit card months
    /*
    const startMonth : number = new Date().getMonth()+1;
    console.log("startMonth: " +startMonth);
    
    this.luv2ShopFormService.getCreditCardMonth(startMonth).subscribe(
      data=>{
        console.log("Retrived the credit card month: " + JSON.stringify(data));
        this.creditCardMonths = data;
      }
    );

    //populate the credit card years
    this.luv2ShopFormService.getCreditCardYears().subscribe(
      data => {
        console.log("Retrived credit card years: " + JSON.stringify(data));
        this.creditCardYears = data;
      }
    );
    */
      // populate / subsribe countries
      this.luv2ShopFormService.getCountries().subscribe(
        data => {
          console.log("Retrived countries: " +JSON.stringify(data));
          this.countries = data;
        }
      );

  }
  setupStripePaymentForm() {
    //get a handle to stripe elements
    var elements = this.stripe.elements();

    //create a card elements .. & hide the zip-code field
    this.cardElement = elements.create('card', {hidePostalCode: true});

    //add an Instance of card UI component into the 'card-element' div
    this.cardElement.mount('#card-element');

    //add event binding for the 'change' event on the card element
    this.cardElement.on('change', (event : any) =>{

          //get a handle to card-errors element
          this.displayError = document.getElementById('card-errors');

          if(event.complete){
            this.displayError.textContent = "";
          }else if(event.error){
            //show validation error to customer
            this.displayError.textContent = event.error.message;
          }

    });

    
  }

  reviewCartDetails() {

    //subsribe to cartservice.totalquantity
    this.cartService.totalQuantity.subscribe(
      totalQuantity => this.totalQuantity = totalQuantity
    );

    //subscribe to cartservice.totalprice
    this.cartService.totalPrice.subscribe(
      totalPrice => this.totalPrice = totalPrice
    );
  }

  //step 2- Define Getter methods to access form controls
  //Customer details
  get firstName() { return this.checkoutFormGroup.get('customer.firstName'); }
  get lastName() { return this.checkoutFormGroup.get('customer.lastName'); }
  get email() { return this.checkoutFormGroup.get('customer.email'); }
  //Shipping address
  get shippingAddressStreet(){  return this.checkoutFormGroup.get('shippingAddress.street');  }
  get shippingAddressCity(){  return this.checkoutFormGroup.get('shippingAddress.city');  }
  get shippingAddressState(){  return this.checkoutFormGroup.get('shippingAddress.state');  }
  get shippingAddressCountry(){  return this.checkoutFormGroup.get('shippingAddress.country');  }
  get shippingAddressZipCode(){  return this.checkoutFormGroup.get('shippingAddress.zipCode');  }
  //Billing address
  get billingAddressStreet(){  return this.checkoutFormGroup.get('billingAddress.street');  }
  get billingAddressCity(){  return this.checkoutFormGroup.get('billingAddress.city');  }
  get billingAddressState(){  return this.checkoutFormGroup.get('billingAddress.state');  }
  get billingAddressCountry(){  return this.checkoutFormGroup.get('billingAddress.country');  }
  get billingAddressZipCode(){  return this.checkoutFormGroup.get('billingAddress.zipCode');  }
  //Debit card
  get creditCardCardType(){ return this.checkoutFormGroup.get('creditCard.cardType'); }
  get creditCardNameOnCard(){ return this.checkoutFormGroup.get('creditCard.nameOnCard'); }
  get creditCardCardNumber(){ return this.checkoutFormGroup.get('creditCard.cardNumber'); }
  get creditCardSecurityCode(){ return this.checkoutFormGroup.get('creditCard.securityCode'); }la


  // accroding to course code but getting errors
  // copyShippingAdressToBillingAdress($event: Event) {
  //   if(Event.AT_TARGET){
  //     this.checkoutFormGroup.controls.billingAddress
  //         .setValue(this.checkoutFormGroup.controls.shippingAddress.value);
  //   }
  //   else{
  //     this.checkoutFormGroup.controls.billingAddress.reset();
  //   }
  //   }

  //accroding to re-correct by compiler
  copyShippingAdressToBillingAdress($event: Event) {
    if(Event.AT_TARGET){
      this.checkoutFormGroup.controls['billingAddress']
          .setValue(this.checkoutFormGroup.controls['shippingAddress'].value);

          //bug fix for state for click on checkbox
          this.billingAddressStates = this.shippingAddressStates;
    }
    else{
      this.checkoutFormGroup.controls['billingAddress'].reset();

          //bug fix for state for click on checkbox
          this.billingAddressStates = [];
    }
    }


onSubmit() {
  console.log("Handling the submit button");

  if (this.checkoutFormGroup.invalid) {
    this.checkoutFormGroup.markAllAsTouched();
    return;
  }

  // set up order
  let order = new Order();
  order.totalPrice = this.totalPrice;
  order.totalQuantity = this.totalQuantity;

  // get cart items
  const cartItems = this.cartService.cartItems;

  // create orderItems from cartItems
  // - long way
  /*
  let orderItems: OrderItem[] = [];
  for (let i=0; i < cartItems.length; i++) {
    orderItems[i] = new OrderItem(cartItems[i]);
  }
  */

  // - short way of doing the same thingy
  let orderItems: OrderItem[] = cartItems.map(tempCartItem => new OrderItem(tempCartItem));

  // set up purchase
  let purchase = new Purchase();
  
  // populate purchase - customer
  purchase.customer = this.checkoutFormGroup.controls['customer'].value;
  
  // populate purchase - shipping address
  purchase.shippingAddress = this.checkoutFormGroup.controls['shippingAddress'].value;
  const shippingState: State = JSON.parse(JSON.stringify(purchase.shippingAddress.state));
  const shippingCountry: Country = JSON.parse(JSON.stringify(purchase.shippingAddress.country));
  purchase.shippingAddress.state = shippingState.name;
  purchase.shippingAddress.country = shippingCountry.name;

  // populate purchase - billing address
  purchase.billingAddress = this.checkoutFormGroup.controls['billingAddress'].value;
  const billingState: State = JSON.parse(JSON.stringify(purchase.billingAddress.state));
  const billingCountry: Country = JSON.parse(JSON.stringify(purchase.billingAddress.country));
  purchase.billingAddress.state = billingState.name;
  purchase.billingAddress.country = billingCountry.name;

  // populate purchase - order and orderItems
  purchase.order = order;
  purchase.orderItems = orderItems;

  //Compute PaymentInfo in the Stripe
  this.paymentInfo.amount = Math.round(this.totalPrice * 100);
  this.paymentInfo.currency = "USD";
  this.paymentInfo.receiptEmail = purchase.customer.email;

  console.log("this.paymentInfo Amount: "+this.paymentInfo.amount);

  // call REST API via the CheckoutService
/*
  this.checkoutService.placeOrder(purchase).subscribe({
      next: response => {
        alert(`Your order has been received.\nOrder tracking number: ${response.orderTrackingNumber}`);

        // reset cart
        this.resetCart();

      },
      error: err => {
        alert(`There was an error: ${err.message}`);
      }
    }
  );
*/

//if Valid form then,
// -- create payment intent
// -- confirm card payment
// -- place order

      //check valid form
      if(!this.checkoutFormGroup.invalid && this.displayError.textContent===""){
        this.isDisabled = true;//purchase enable, before REST API call
        //create payment intent
        //Spring boot REST API
        this.checkoutService.createPaymentIntent(this.paymentInfo).subscribe(
          (paymentIntentResponse)=>{
            //Confirm Card Payment, in Stripe
            //Here send Credit card data send directly to Stripe servers
            this.stripe.confirmCardPayment(paymentIntentResponse.client_secret,
              {
              payment_method: {
              card: this.cardElement,
              billing_details:{
                                email: purchase.customer.email,
                                name: `${purchase.customer.firstName} ${purchase.customer.lastName}`,
                      address:{
                                line1: purchase.billingAddress.street,
                                city: purchase.billingAddress.city,
                                state: purchase.billingAddress.state,
                                postal_code: purchase.billingAddress.zipcode,
                                country:this.billingAddressCountry.value.code
                               }
                              }
              }
              },
              {
                handleActions: false
              }
            )

            //once get result/ confirmed payment card payment
            //we need to check error msg or paymentCardpayment Successful
            .then((result: any)=>{

              if(result.error){
                //inform the customer there was an error
                alert(`There was an error: ${result.error.message}`);  
                this.isDisabled = false; // disable purchase button, once REST API call done              
              }else{
                //if successful, call REST API via Checkout service
                //place 
                this.checkoutService.placeOrder(purchase).subscribe({
                  //Place order ... store in MySQL DB Spring Boot REST API
                  next: response => {
                  alert(`Your order has been received.\nOrder tracking number: ${response.orderTrackingNumber}`);
                  // reset cart
                  this.resetCart();
                  this.isDisabled = false;
                  },
                  error: err => {
                  alert(`There was an error: ${err.message}`);
                  this.isDisabled = false;
                  }
                  })
              }
            });

          }
        );

      } else {
        this.checkoutFormGroup.markAllAsTouched();
        return;
      }


}

resetCart() {
  // reset cart data
  this.cartService.cartItems = [];
  this.cartService.totalPrice.next(0);
  this.cartService.totalQuantity.next(0);

  //updates storage with latest state of the card
  //like once purchase done, cart items comes to zero/initial
  this.cartService.persistCartItems();
  
  // reset the form
  this.checkoutFormGroup.reset();

  // navigate back to the products page
  this.router.navigateByUrl("/products");
}

  //add event handler for month & it depend on  year  
  handleMonthsAndYears(){
    const creditCardFormGroup = this.checkoutFormGroup.get('creditCard');

    const currentYear: number = new Date().getFullYear();
    const selectedYear: number = Number(creditCardFormGroup?.value.expirationYear);

    //if the current year equal to selected year, then start with current month
    let stratMonth : number;

    if(currentYear === selectedYear){
      stratMonth = new Date().getMonth() +1;
    }
    else{
      stratMonth = 1;
    }

    this.luv2ShopFormService.getCreditCardMonth(stratMonth).subscribe(
      data => {
        console.log("Retrived credit card month : " +JSON.stringify(data));
        this.creditCardMonths = data;
      }
    );
  }

  getStates(formGroupName: string) {

    const formGroup = this.checkoutFormGroup.get(formGroupName);

    const countryCode = formGroup.value.country.code;
    const countryName = formGroup.value.country.name;

    console.log(`${formGroupName} country code: ${countryCode}`);
    console.log(`${formGroupName} country name: ${countryName}`);

    this.luv2ShopFormService.getStates(countryCode).subscribe(
      data => {

        if (formGroupName === 'shippingAddress') {
          this.shippingAddressStates = data; 
        }
        else {
          this.billingAddressStates = data;
        }

        // select first item by default
        formGroup?.get('state')?.setValue(data[0]);
      }
    );
  }
}
