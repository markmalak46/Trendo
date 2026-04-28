import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AddressResponse } from '../models/address.interface';

@Injectable({
  providedIn: 'root'
})
export class AddressesService {
  private readonly httpClient = inject(HttpClient);

  getLoggedUserAddresses(): Observable<AddressResponse> {
    return this.httpClient.get<AddressResponse>(`${environment.baseUrl}/api/v1/addresses`);
  }

  addAddress(address: { name: string; details: string; phone: string; city: string }): Observable<AddressResponse> {
    return this.httpClient.post<AddressResponse>(`${environment.baseUrl}/api/v1/addresses`, address);
  }

  removeAddress(addressId: string): Observable<AddressResponse> {
    return this.httpClient.delete<AddressResponse>(`${environment.baseUrl}/api/v1/addresses/${addressId}`);
  }
}
