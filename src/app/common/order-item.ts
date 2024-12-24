import { CartItem } from "./cart-item";

export class OrderItem {
    productId:string;
    imageUrl:string;
    unitPrice:number;
    quantity:number;

    constructor(cartItem : CartItem){
        this.productId = cartItem.id;
        this.imageUrl = cartItem.imageUrl;
        this.unitPrice = cartItem.unitPrice;
        this.quantity = cartItem.quantity;
    }
}
