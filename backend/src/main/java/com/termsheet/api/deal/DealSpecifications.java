package com.termsheet.api.deal;

import org.springframework.data.jpa.domain.Specification;

import java.math.BigDecimal;

public final class DealSpecifications {

    private DealSpecifications() {
    }

    public static Specification<Deal> nameContains(String name) {
        if (name == null || name.isBlank()) {
            return null;
        }
        String pattern = "%" + name.trim().toLowerCase() + "%";
        return (root, query, cb) -> cb.like(cb.lower(root.get("name")), pattern);
    }

    public static Specification<Deal> priceGreaterThanOrEqual(BigDecimal minPrice) {
        if (minPrice == null) {
            return null;
        }
        return (root, query, cb) -> cb.greaterThanOrEqualTo(root.get("purchasePrice"), minPrice);
    }

    public static Specification<Deal> priceLessThanOrEqual(BigDecimal maxPrice) {
        if (maxPrice == null) {
            return null;
        }
        return (root, query, cb) -> cb.lessThanOrEqualTo(root.get("purchasePrice"), maxPrice);
    }
}
