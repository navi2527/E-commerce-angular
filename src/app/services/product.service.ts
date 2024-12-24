import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { Product } from '../common/product';
import { ProductCategory } from '../common/product-category';
import { environment } from 'environments/environment';


@Injectable({     //depedency injection
  providedIn: 'root'
})


export class ProductService {
 
  private baseUrl =environment.luv2shopApiUrl+ '/products';  // Base URL for the Spring boot data Rest API //for getProductList()
  //private baseUrl ='http://localhost:8080/api/products?size=100';  // Base URL for the Spring boot data Rest API -> display 100 products

  private categoryUrl =environment.luv2shopApiUrl+ '/product-category'; //for getProductCategories()
  constructor(private httpClient : HttpClient) {}

  getProduct(theProductId: number): Observable<Product> {

    //need to build URL based on product id
    const productUrl = `${this.baseUrl}/${theProductId}`;

    return this.httpClient.get<Product>(productUrl);
  }

  //pagination
  getProductListPaginate(thePage:number,
                         thePageSize: number,
                         theCategoryId:number):Observable<GetResponseProducts>{

    //need to build URL based on the page, pagesize & category id
      const searchUrl = `${this.baseUrl}/search/findByCategoryId?id=${theCategoryId}`
                       + `&page=${thePage}&size=${thePageSize}`;

                       console.log(`Getting products from - ${searchUrl}`);

      return this.httpClient.get<GetResponseProducts>(searchUrl);
  }

  //@TODO: need to build URL based on category id,,
  getProductList(theCategoryId : number): Observable<Product[]> {

    //need to build URL based on category id
    const searchUrl = `${this.baseUrl}/search/findByCategoryId?id=${theCategoryId}`;
    

      // return this.httpClient.get<GetResponseProducts>(searchUrl).pipe(
      //   map(response =>response._embedded.products)
      // );
      return this.getProducts(searchUrl);  //Refacoring

   }

   searchProducts(theKeyword: string):Observable<Product[]> {

    //need to build URL based on category id
    const searchUrl = `${this.baseUrl}/search/findByNameContaining?name=${theKeyword}`;

    // return this.httpClient.get<GetResponseProducts>(searchUrl).pipe(
    //     map(response => response._embedded.products)
    // );
     return this.getProducts(searchUrl);  //Refacoring

  }

    searchProductsPaginate(thePage:number,
                           thePageSize:number,
                           theKeyword:string) : Observable<GetResponseProducts> {

      //need to build URL based on keyword, page & size
      const searchUrl = `${this.baseUrl}/search/findByNameContaining?name=${theKeyword}`
                      + `&page=${thePage}&size=${thePageSize}`;

      return this.httpClient.get<GetResponseProducts>(searchUrl);

      }

  private getProducts(searchUrl: string): Observable<Product[]> {
    return this.httpClient.get<GetResponseProducts>(searchUrl).pipe(
      map(response => response._embedded.products)
    );
  }

   getProductCategories() {
    
    return this.httpClient.get<GetResposeProductCategory>(this.categoryUrl).pipe(
      map(response =>response._embedded.productCategory));
  }
}


interface GetResponseProducts{
  _embedded:{
    products: Product[];
  },
  page:{
    size:number,
    totalElements:number,
    totalPages:number,
    number:number
  }
}

interface GetResposeProductCategory{
  _embedded:{
    productCategory:ProductCategory[];
  }
}