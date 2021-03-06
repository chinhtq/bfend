import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { BfHttpService } from 'bfend';

@Injectable({
  providedIn: 'root'
})
export class MeApi {

  constructor(private client: HttpClient, private http: BfHttpService) {}

  changePassword(oldPassword, newPassword): Observable<boolean> {
    return this.client.post<boolean>(this.http.url('/me/change-password'), {
      old_password: oldPassword,
      new_password: newPassword
    });
  }
}
