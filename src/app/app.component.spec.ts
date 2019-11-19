import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {async, ComponentFixture, getTestBed, TestBed} from '@angular/core/testing';
import {RouterTestingModule} from '@angular/router/testing';
import {HttpClient} from '@angular/common/http';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {MatMenuModule} from '@angular/material/menu';
import {Router} from '@angular/router';

import {of} from 'rxjs';
import {TranslateLoader, TranslateModule, TranslateService} from '@ngx-translate/core';
import {CookieService} from 'ngx-cookie-service';

import {AppComponent} from './app.component';
import {TranslateHttpLoaderFactory} from './app.module';
import {ACCESS_TOKEN_COOKIE_NAME, AuthenticationService, CURRENT_USER} from './service/authentication.service';
import {TestAccessToken} from './test-access-token';

const CURRENT_LANG = 'ru';

describe('AppComponent', () => {
  let fixture: ComponentFixture<AppComponent>;
  let component: AppComponent;
  let router: Router;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        MatMenuModule,
        RouterTestingModule,
        HttpClientTestingModule,
        TranslateModule.forRoot({
          loader: {
            provide: TranslateLoader,
            useFactory: TranslateHttpLoaderFactory,
            deps: [HttpClient]
          }
        })
      ],
      providers: [
        {
          provide: CURRENT_USER,
          useFactory: AuthenticationService.getCurrentUser,
          deps: [AuthenticationService]
        },
        CookieService
      ],
      declarations: [AppComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;

    const injector = getTestBed();

    const translateService = injector.get(TranslateService);
    translateService.currentLang = CURRENT_LANG;

    const cookieService = injector.get(CookieService);
    cookieService.set(ACCESS_TOKEN_COOKIE_NAME, TestAccessToken.VALID);

    const authenticationService = injector.get(AuthenticationService);
    spyOn(authenticationService, 'signOut').and.returnValue(of(true));

    router = injector.get(Router);
    router.navigate = jasmine.createSpy('navigate').and.callFake(() => Promise.resolve());
  });

  it('should create the app', () => {
    expect(component).toBeTruthy();
  });

  it(`should have a title 'Orchestra'`, () => {
    expect(component.title).toEqual('Orchestra');
  });

  it('should render title in a toolbar', () => {
    fixture.detectChanges();
    const compiled = fixture.debugElement.nativeElement;
    expect(compiled.querySelector('.page > header > mat-toolbar > span').textContent).toContain('Orchestra');
  });

  it('should render current user\'s full name in a toolbar', () => {
    const injector = getTestBed();
    const currentUser = injector.get(CURRENT_USER);

    fixture.detectChanges();

    const compiled = fixture.debugElement.nativeElement;
    const element = compiled.querySelector('.page > header > mat-toolbar > div.profile-info-container > button');
    expect(element.textContent).toEqual(currentUser.fullName);
  });

  it('should render current user\'s avatar in a toolbar', () => {
    const injector = getTestBed();
    const currentUser = injector.get(CURRENT_USER);

    fixture.detectChanges();

    const compiled = fixture.debugElement.nativeElement;
    const element = compiled.querySelector('.page > header > mat-toolbar > div.profile-info-container > img.avatar');
    expect(element.getAttribute('src')).toEqual(currentUser.imageUrl);
  });

  it('should sign out on corresponding menu item select', () => {
    const authenticationService = fixture.debugElement.injector.get(AuthenticationService);
    component.onSignOutButtonClick();
    expect(authenticationService.signOut).toHaveBeenCalled();
  });

  it('should set current user to null on sign out', () => {
    component.onSignOutButtonClick();
    expect(component.user).toBeNull();
  });

  it('should navigate to login page on sign out', () => {
    component.onSignOutButtonClick();
    expect(router.navigate).toHaveBeenCalledWith([CURRENT_LANG, 'login']);
  });
});
