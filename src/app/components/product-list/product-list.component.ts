import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CartItem } from 'src/app/common/cart-item';
import { Product } from 'src/app/common/product';
import { CartService } from 'src/app/services/cart.service';
import { ProductService } from 'src/app/services/product.service';

@Component({
  selector: 'app-product-list',
  //templateUrl: './product-list.component.html',
  //templateUrl: './product-list-table.component.html',
  templateUrl: './product-list-grid.component.html',
  styleUrls: ['./product-list.component.css']
})
export class ProductListComponent implements OnInit {

  products: Product[] = [];
  currentCategoryId: number = 1;
  previousCategoryId: number= 1;
  searchMode: boolean=false;
  theKeyword:string=" ";


  //new properties for pagination
  thePageNumber:number = 1;
  thePageSize:number=5;
  theTotalElement:number=0;

  previousKeyword:string=" "; //search product with pagination

  constructor(private productService: ProductService,
              private route: ActivatedRoute,
              private cartService:CartService) { }


  ngOnInit(): void {                 //similar to PostConstarct
    this.route.paramMap.subscribe(() => {
      this.listProducts();
    });
  }

  listProducts() {

    this.searchMode = this.route.snapshot.paramMap.has('keyword');

    if(this.searchMode){
      this.handleSearchProducts();
    }
    else{
      this.handleListProducts(); //Refactoring
    }
  }


  handleSearchProducts() {
    const theKeyword:string|null = this.route.snapshot.paramMap.get('keyword');

    //if we have a different keyword than previous
    //then set thePageNumber to 1
    if(this.previousKeyword!=theKeyword){
      this.thePageNumber=1;
    }

    this.previousKeyword = theKeyword!;
    console.log(`keyword=${theKeyword}, thePageNumber=${this.thePageNumber}`);

    //now search for the products using keyword
    // this.productService.searchProducts(theKeyword).subscribe(
    //   data => {
    //     this.products = data;
    //   }
    // );
    this.productService.searchProductsPaginate(this.thePageNumber -1,
                                               this.thePageSize,
                                               theKeyword!).subscribe(this.processResult());
  }

  handleListProducts() {
    //check if "id" parameter is available
    const hasCategoryId: boolean = this.route.snapshot.paramMap.has('id');
    if (hasCategoryId) {
      //get the "id" param string, convert string to number using "+" symbol
      this.currentCategoryId = +this.route.snapshot.paramMap.getAll('id');
    } else {
      //not category id available, defualt to category id 1
      this.currentCategoryId = 1;
    }

    //
    //Check if we have different category id than previous
    //Note: Angular will reuse a component if it is currently being viewd


    //Check if we have different category id than previous
    //then set the thePageNumber back to 1
    if(this.previousCategoryId!=this.currentCategoryId){
      this.thePageNumber = 1;
    }
    
    //Check if we have Same category id than previous
    this.previousCategoryId = this.currentCategoryId;
    console.log(`currentCategoryId=${this.currentCategoryId}, thePageNumber=${this.thePageNumber}`);


    // now get the peoducts for the category id
  //   this.productService.getProductList(this.currentCategoryId).subscribe(
  //     data => {
  //       this.products = data;
  //     }
  //   )
  this.productService.getProductListPaginate(this.thePageNumber-1,
                                             this.thePageSize,
                                             this.currentCategoryId).subscribe(
                                              // data => {
                                              //   this.products = data._embedded.products;
                                              //   this.thePageNumber = data.page.number+1;
                                              //   this.thePageSize = data.page.size;
                                              //   this.theTotalElement = data.page.totalElements;
                                              // }
                                              this.processResult()
                                             );

  }

  // updatePageSize(pageSize:string){

  // if(!pageSize) return;

  //   this.thePageSize = +pageSize;
  //   this.thePageNumber = 1;
  //   this.listProducts();

  // }

  processResult(){
    return(data:any) =>{
      this.products = data._embedded.products;
      this.thePageNumber = data.page.number+1;
      this.thePageSize = data.page.size;
      this.theTotalElement = data.page.totalElements;
    };
  }

  updatePageSize(pageSize:number){

    //if(!pageSize) return;
  
      this.thePageSize = pageSize;
      this.thePageNumber = 1;
      this.listProducts();
  
    }

    addToCart(theProduct: Product) {
      console.log(`Adding to cart: ${theProduct.name}, ${theProduct.unitPrice}`);
    
      // TODO ... do the real work
      const theCartItem = new CartItem(theProduct);
      
      this.cartService.addToCart(theCartItem);
    }
}

