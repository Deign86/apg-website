import { useCallback } from 'react';
import { useNavigate, type NavigateOptions } from 'react-router-dom';
import { enterpriseFromPath, hostEnterprise, ROOT_DOMAIN } from '../lib/enterpriseHost';

/**
 * navigate() for the apex shell, which Virtual Office also renders inside on its subdomain.
 * There, the router maps clean paths onto the enterprise ('/' → /virtual-office), so an apex
 * target like '/' or '/careers' would stay on the subdomain (or 404); those load the apex instead.
 * Enterprise paths still go through the router, which sends them to their own subdomain.
 */
export function useSiteNavigate() {
  const navigate = useNavigate();
  return useCallback((to: string, options?: NavigateOptions) => {
    if (hostEnterprise() && !enterpriseFromPath(to.split(/[?#]/)[0])) {
      window.location.assign(`https://${ROOT_DOMAIN}${to}`);
    } else {
      navigate(to, options);
    }
  }, [navigate]);
}
