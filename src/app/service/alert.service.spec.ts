import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {FormsModule} from '@angular/forms';
import {getTestBed, TestBed} from '@angular/core/testing';
import {NavigationStart, Router} from '@angular/router';
import {RouterTestingModule} from '@angular/router/testing';

import {Subject} from 'rxjs';

import {TranslateLoader, TranslateModule} from '@ngx-translate/core';

import {AlertService} from './alert.service';
import {DashboardComponent} from '../dashboard/dashboard.component';
import {TaskDetailComponent} from '../task-detail/task-detail.component';
import {SigninComponent} from '../signin/signin.component';
import {DummyComponent} from '../dummy/dummy.component';
import {NotFoundComponent} from '../error/not-found/not-found.component';
import {TranslateHttpLoaderFactory} from '../app.module';
import {routes} from '../app-routing.module';

describe('AlertService', () => {
  let injector: TestBed;
  let service: AlertService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule.withRoutes(routes),
        FormsModule,
        TranslateModule.forRoot({
          loader: {
            provide: TranslateLoader,
            useFactory: TranslateHttpLoaderFactory,
            deps: [HttpClient]
          }
        })
      ],
      declarations: [
        DashboardComponent,
        TaskDetailComponent,
        SigninComponent,
        DummyComponent,
        NotFoundComponent
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: [
        {
          provide: Router,
          useValue: {
            events: new Subject()
          }
        }
      ]
    });
    injector = getTestBed();
    service = injector.get(AlertService);
  });


  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should clear message on navigation start', () => {
    service.info('Test message');

    const router = injector.get(Router);
    router.events.next(new NavigationStart(1, '/'));

    return service.getMessage().subscribe(message => expect(message).toBeNull());
  });
});