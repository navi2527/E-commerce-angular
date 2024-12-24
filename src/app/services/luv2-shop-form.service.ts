import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map, of } from 'rxjs';
import { Country } from '../common/country';
import { State } from '../common/state';
import { environment } from 'environments/environment';

@Injectable({
  providedIn: 'root'
})
export class Luv2ShopFormService {

  private countriesUrl = environment.luv2shopApiUrl+'/countries';
  private statesUrl = environment.luv2shopApiUrl+'/states';

  constructor(private httpClient : HttpClient) { }

  //Call Rest API for the country & State
  getCountries() : Observable<Country[]>{

    return this.httpClient.get<GetResponseCountries>(this.countriesUrl).pipe(
      map(response => response._embedded.countries)
    );
  }

  getStates(theCountryCode: string): Observable<State[]> {
    // search url
    const searchStatesUrl = `${this.statesUrl}/search/findByCountryCode?code=${theCountryCode}`;

    //call rest api for states
    return this.httpClient.get<GetResponseStates>(searchStatesUrl).pipe(
    map(response => response._embedded.states)
    );
    }

  //Add methods to form service for months
  getCreditCardMonth(stratMonth: number):Observable<number[]>{
      
    let data: number[]=[];

    //Build an array for "month" dropdown list
    //- start at current month and loop until..
    for(let theMonth=stratMonth; theMonth<=12; theMonth++){
      data.push(theMonth);
    }
    return of(data);
  }

  //Add methods to form service for years
  getCreditCardYears():Observable<number[]>{

      let data:number[]=[];

    //Build an array for "Year" dropdown list
    //- start at current year and loop next 10 years..
    const startYear: number = new Date().getFullYear();
    const endYear: number = startYear+10; 
    
    for(let theYear=startYear; theYear<=endYear; theYear++){
      data.push(theYear);
    }
    return of(data);
  }
}



interface GetResponseCountries{
  _embedded :{
    countries: Country[];
  }
}

interface GetResponseStates{
  _embedded :{
    states: State[];
  }
}