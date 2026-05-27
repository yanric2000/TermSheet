import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { DealAdapter } from '@intapp/termsheet/deal/adapters';

import { DealsApiService } from './deals-api.service';

describe('DealsApiService', () => {
  let service: DealsApiService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [DealsApiService, DealAdapter],
    });
    service = TestBed.inject(DealsApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should POST /api/deals on create and map response to domain', () => {
    const payload = {
      name: 'Office Tower',
      purchasePrice: 1_000_000,
      address: '100 Main St',
      noi: 50_000,
      description: 'Prime location',
    };

    let createdName = '';
    service.create(payload).subscribe(deal => {
      createdName = deal.name;
    });

    const req = httpMock.expectOne('/api/deals');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(payload);
    req.flush({
      id: 'deal-1',
      name: payload.name,
      purchasePrice: payload.purchasePrice,
      address: payload.address,
      noi: payload.noi,
      description: payload.description,
    });

    expect(createdName).toBe('Office Tower');
  });
});
