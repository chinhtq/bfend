import { Directive, Input } from '@angular/core';
import { AbstractControl, NG_VALIDATORS, ValidationErrors, Validator, Validators } from '@angular/forms';

@Directive({
  selector: '[bfMaxNumber]',
  providers: [{provide: NG_VALIDATORS, useExisting: BfMaxNumberValidatorDirective, multi: true}]
})
export class BfMaxNumberValidatorDirective implements Validator {

  @Input() maxNumber: number;

  validate(c: AbstractControl): ValidationErrors | null {
    return Validators.max(this.maxNumber)(c);
  }
}
