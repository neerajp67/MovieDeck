import { HttpInterceptorFn, HttpParams } from '@angular/common/http';
import { environment } from '../../environments/environment';

export const tmdbAuthInterceptor: HttpInterceptorFn = (req, next) => {

 if (req.url.startsWith(environment.apiUrl)) {
      const modifiedReq = req.clone({
        params: (req.params ? req.params : new HttpParams()).set('api_key', environment.apiKey)
      });
      return next(modifiedReq);
    }
  return next(req);
};
