import {Component, DoCheck, OnInit, ViewChild} from '@angular/core';
import {NavigationEnd, PRIMARY_OUTLET, Router, RouterEvent, UrlSegment} from '@angular/router';
import {MediaMatcher} from '@angular/cdk/layout';
import {MatSidenav} from '@angular/material/sidenav';

import {LangChangeEvent} from '@ngx-translate/core';

import * as moment from 'moment';

import {I18nService, Language} from './service/i18n.service';
import {AuthenticationService} from './service/authentication.service';
import {TaskGroupService} from './service/task-group.service';
import {AuthenticatedPrincipal} from './security/authenticated-principal';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.styl'],
  providers: [TaskGroupService]
})
export class AppComponent implements OnInit, DoCheck {
  @ViewChild('sidenav')
  sidenav: MatSidenav;

  title = 'Orchestra';
  principal: AuthenticatedPrincipal;
  mobileQuery: MediaQueryList;
  showSidenav = false;
  availableLanguages: Language[];

  constructor(private router: Router,
              private i18nService: I18nService,
              private authenticationService: AuthenticationService,
              media: MediaMatcher) {
    this.mobileQuery = media.matchMedia('(max-width: 600px)');
  }

  private static isErrorPage(url: string): boolean {
    return /^(\/[a-z]{2})?\/error(\/.*)?$/.test(url);
  }

  getCurrentLanguage(): Language {
    return this.i18nService.currentLanguage;
  }

  ngOnInit() {
    this.availableLanguages = this.i18nService.availableLanguages;
    moment.locale(this.i18nService.currentLanguage.code);
    this.i18nService.onLanguageChange.subscribe((event: LangChangeEvent) => {
      moment.locale(event.lang);
    });
    this.router.events.subscribe((event: RouterEvent) => this.onRouterEvent(event));
  }

  ngDoCheck(): void {
    if (!this.principal) {
      this.principal = this.authenticationService.getPrincipal();
    }
  }

  onSignOutButtonClick() {
    this.authenticationService.signOut().subscribe(() => {
      this.principal = null;
      this.router.navigate([this.i18nService.currentLanguage.code, 'signin']).then();
    });
  }

  onSidenavToggleButtonClick() {
    this.sidenav.toggle().then();
  }

  onLanguageButtonClick(language: Language) {
    this.switchLanguage(language);
  }

  onRouterEvent(event: RouterEvent) {
    if (event instanceof NavigationEnd && event.url) {
      this.showSidenav = this.principal && !AppComponent.isErrorPage(event.url);
    }
  }

  private switchLanguage(language: Language) {
    let languageChanged = false;
    let urlTree = this.router.parseUrl(this.router.url);
    if (urlTree.root.numberOfChildren === 0) {
      urlTree = this.router.createUrlTree([language.code], {
        fragment: urlTree.fragment,
        queryParams: urlTree.queryParams
      });
      languageChanged = true;
    } else {
      const segmentGroup = urlTree.root.children[PRIMARY_OUTLET];
      const currentLangCode = segmentGroup.segments[0].path;
      if (!this.i18nService.languageForCode(currentLangCode)) {
        segmentGroup.segments.unshift(new UrlSegment(language.code, {}));
        languageChanged = true;
      } else if (currentLangCode !== language.code) {
        segmentGroup.segments[0] = new UrlSegment(language.code, {});
        languageChanged = true;
      }
    }

    if (languageChanged) {
      this.router.navigateByUrl(urlTree).then();
    }
  }
}

