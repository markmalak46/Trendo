import './polyfills.server.mjs';
import{a as i}from"./chunk-HILLLCYV.mjs";import{G as t,L as r,wc as o}from"./chunk-O3SCDWTF.mjs";var a=class e{httpClient=r(o);getAllCategories(){return this.httpClient.get(`${i.baseUrl}/api/v1/categories`)}static \u0275fac=function(n){return new(n||e)};static \u0275prov=t({token:e,factory:e.\u0275fac,providedIn:"root"})};export{a};
