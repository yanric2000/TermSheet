package com.termsheet.api.deal;

import com.termsheet.api.common.ResourceNotFoundException;
import com.termsheet.api.deal.dto.DealRequest;
import com.termsheet.api.deal.dto.DealResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.UUID;

@Service
public class DealService {

    private final DealRepository repository;

    public DealService(DealRepository repository) {
        this.repository = repository;
    }

    @Transactional(readOnly = true)
    public Page<DealResponse> search(String name, BigDecimal minPrice, BigDecimal maxPrice, Pageable pageable) {
        Specification<Deal> spec = Specification.where(DealSpecifications.nameContains(name))
                .and(DealSpecifications.priceGreaterThanOrEqual(minPrice))
                .and(DealSpecifications.priceLessThanOrEqual(maxPrice));
        return repository.findAll(spec, pageable).map(DealResponse::from);
    }

    @Transactional(readOnly = true)
    public DealResponse findById(UUID id) {
        return repository.findById(id)
                .map(DealResponse::from)
                .orElseThrow(() -> new ResourceNotFoundException("Deal", id));
    }

    @Transactional
    public DealResponse create(DealRequest request, UUID ownerId) {
        Deal deal = new Deal(
                UUID.randomUUID(),
                request.name(),
                request.purchasePrice(),
                request.address(),
                request.noi(),
                request.description(),
                ownerId
        );
        return DealResponse.from(repository.save(deal));
    }

    @Transactional
    public DealResponse update(UUID id, DealRequest request) {
        Deal deal = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Deal", id));
        deal.setName(request.name());
        deal.setPurchasePrice(request.purchasePrice());
        deal.setAddress(request.address());
        deal.setNoi(request.noi());
        deal.setDescription(request.description());
        deal.recalculateCapRate();
        return DealResponse.from(repository.save(deal));
    }

    @Transactional
    public void delete(UUID id) {
        if (!repository.existsById(id)) {
            throw new ResourceNotFoundException("Deal", id);
        }
        repository.deleteById(id);
    }
}
