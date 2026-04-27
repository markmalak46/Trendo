import './polyfills.server.mjs';
import{a as o}from"./chunk-HILLLCYV.mjs";import{G as e,L as r,wc as n}from"./chunk-O3SCDWTF.mjs";var a=class t{httpClient=r(n);getAllBrands(){return this.httpClient.get(`${o.baseUrl}/api/v1/brands`)}static \u0275fac=function(i){return new(i||t)};static \u0275prov=e({token:t,factory:t.\u0275fac,providedIn:"root"})};export{a};
