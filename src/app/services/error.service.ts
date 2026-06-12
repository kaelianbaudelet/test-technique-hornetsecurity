import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ErrorService {
  private readonly _hasError = signal(false);
  public readonly hasError = this._hasError.asReadonly();

  setError(value: boolean): void {
    this._hasError.set(value);
  }
}
