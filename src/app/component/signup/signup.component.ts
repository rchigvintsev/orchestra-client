import {Component, ViewChild} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {DomSanitizer} from '@angular/platform-browser';
import {MatIconRegistry} from '@angular/material/icon';
import {NgForm} from '@angular/forms';

import {BaseSignComponent} from '../fragment/base-sign/base-sign.component';
import {I18nService} from '../../service/i18n.service';
import {AuthenticationService} from '../../service/authentication.service';
import {LogService} from '../../service/log.service';
import {ConfigService} from '../../service/config.service';
import {AlertService} from '../../service/alert.service';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['../fragment/base-sign/base-sign.component.styl']
})
export class SignupComponent extends BaseSignComponent {
  fullName: string;
  repeatedPassword: string;

  @ViewChild('signupForm', {read: NgForm})
  signupForm: NgForm;

  constructor(
    i18nService: I18nService,
    authenticationService: AuthenticationService,
    log: LogService,
    config: ConfigService,
    router: Router,
    iconRegistry: MatIconRegistry,
    domSanitizer: DomSanitizer,
    activatedRoute: ActivatedRoute,
    alertService: AlertService,
  ) {
    super(i18nService, authenticationService, log, router, iconRegistry, domSanitizer, alertService, config,
      activatedRoute);
  }

  onSignupFormSubmit() {
    if (this.signupForm.valid) {
      this.authenticationService.signUp(this.email, this.fullName, this.password).subscribe(
        _ => this.onSignUp(),
        response => this.onSignUpError(response)
      );
    }
  }

  protected getDefaultErrorMessage(): string {
    return this.i18nService.translate('sign_up_error');
  }

  private onSignUp() {
    this.alertService.info(this.i18nService.translate('email_confirmation_link_sent', {email: this.email}));
    this.signupForm.resetForm();
  }

  private onSignUpError(response: any) {
    if (response.error.localizedMessage) {
      this.alertService.error(response.error.localizedMessage);
    } else {
      this.onServiceCallError(response);
    }
  }
}
