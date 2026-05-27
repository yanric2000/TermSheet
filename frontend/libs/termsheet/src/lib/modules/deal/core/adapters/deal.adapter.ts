import { Injectable } from '@angular/core';
import type { IApiDeal } from '@intapp/termsheet/deal/models/deal-api.model';
import type { IDeal } from '@intapp/termsheet/deal/models/deal.model';

@Injectable({ providedIn: 'root' })
export class DealAdapter {
  toDomain(dto: IApiDeal): IDeal {
    return {
      id: dto.id,
      name: dto.name,
      purchasePrice: dto.purchasePrice,
      address: dto.address,
      noi: dto.noi,
      description: dto.description,
    };
  }

  toDomainList(dtos: readonly IApiDeal[]): IDeal[] {
    return dtos.map(dto => this.toDomain(dto));
  }
}
