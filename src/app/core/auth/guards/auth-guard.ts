import { isPlatformBrowser } from '@angular/common';
import { inject, PLATFORM_ID } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const authGuard: CanActivateFn = (route, state) => {

  const router = inject(Router);
  const pLATFORM_ID = inject(PLATFORM_ID);

  if (isPlatformBrowser(pLATFORM_ID)) {
    if (localStorage.getItem('TrendoToken')) {
      return true;
    } else {
      return router.parseUrl('/login');
    }
  }else{
    return true;
  }


};
