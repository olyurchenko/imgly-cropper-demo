import { HttpInterceptorFn } from '@angular/common/http';
import { TOKEN } from '../core/constants';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem('token') || TOKEN;

  const clonedReq = token
    ? req.clone({ setHeaders: { Authorization: token } })
    : req;

  return next(clonedReq);
};
