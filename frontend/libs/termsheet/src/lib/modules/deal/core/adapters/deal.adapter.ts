import { Injectable } from '@angular/core';
import type { IDealGetAPI } from '@intapp/termsheet/deal/models/deal-api.model';
import type { IDeal } from '@intapp/termsheet/deal/models/deal.model';

@Injectable({ providedIn: 'root' })
export class DealAdapter {
  toDomain(dto: IDealGetAPI): IDeal {
    return {
      id: dto.id,
      name: dto.name,
      purchasePrice: dto.purchasePrice,
      address: dto.address,
      noi: dto.noi,
      description: dto.description,
    };
  }

  toDomainList(dtos: readonly IDealGetAPI[]): IDeal[] {
    return dtos.map(dto => this.toDomain(dto));
  }
}
