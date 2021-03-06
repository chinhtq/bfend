import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Observable, Subject, throwError, empty } from 'rxjs';
import { debounceTime, catchError } from 'rxjs/operators';
import { NzMessageService } from 'ng-zorro-antd';
import { BfAppService } from '../app.service';

/**
 * 授权状态拦截器
 */
@Injectable()
export class BfAuthInterceptor implements HttpInterceptor {
  private showUnauthenticatedSubject = new Subject();

  constructor(private router: Router, private nzMessage: NzMessageService, private app: BfAppService) {
    this.showUnauthenticatedSubject.pipe(debounceTime(500))
      .subscribe(() => {
        this.nzMessage.error('登录信息失效，请重新登录');
        this.app.logout();
        this.redirectToLogin();
      });
  }

  private redirectToLogin() {
    this.router.navigate(['/login']);
  }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(catchError(err => {
      if (err instanceof HttpErrorResponse) {
        if (err.status === 401) {
          // 未登录状态码
          this.showUnauthenticatedSubject.next(true);
          return empty(); // 终止本次请求
        } else if (err.status === 403) {
          // 权限不足
          this.nzMessage.error('权限不足');
          return empty(); // 终止本次请求
        }
      }

      // 以错误的形式结束本次请求
      return throwError(err);
    }));
  }
}
