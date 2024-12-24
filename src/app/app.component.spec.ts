import { TestBed } from '@angular/core/testing';
import { AppComponent } from './app.component';

describe('AppComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppComponent],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it(`should have the 'angular-ecommerce' title`, () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app.title).toEqual('angular-ecommerce');
  });

  it('should render title', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain('Hello, angular-ecommerce');
  });
});





/*
We import the necessary testing modules from Angular and import the AppComponent that we want to test.

Inside the describe block, we set up the testing environment using TestBed.configureTestingModule().

In the beforeEach block, we create an instance of the AppComponent and detect changes.

The individual it blocks represent individual test cases. We use Jasmine's expect function 
to make assertions about the component's behavior.
*/