package com.termsheet.api.deal;

import com.termsheet.api.common.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.UUID;

@Entity
@Table(name = "deals")
public class Deal extends BaseEntity {

    @Column(name = "name", nullable = false, length = 200)
    private String name;

    @Column(name = "purchase_price", nullable = false, precision = 19, scale = 2)
    private BigDecimal purchasePrice;

    @Column(name = "address", nullable = false, length = 500)
    private String address;

    @Column(name = "noi", nullable = false, precision = 19, scale = 2)
    private BigDecimal noi;

    @Column(name = "cap_rate", nullable = false, precision = 7, scale = 4)
    private BigDecimal capRate;

    @Column(name = "description", length = 2000)
    private String description;

    @Column(name = "owner_id", nullable = false)
    private UUID ownerId;

    public Deal() {
    }

    public Deal(UUID id,
                String name,
                BigDecimal purchasePrice,
                String address,
                BigDecimal noi,
                String description,
                UUID ownerId) {
        super(id);
        this.name = name;
        this.purchasePrice = purchasePrice;
        this.address = address;
        this.noi = noi;
        this.description = description;
        this.ownerId = ownerId;
        this.capRate = computeCapRate(noi, purchasePrice);
    }

    public static BigDecimal computeCapRate(BigDecimal noi, BigDecimal purchasePrice) {
        if (noi == null || purchasePrice == null
                || purchasePrice.compareTo(BigDecimal.ZERO) == 0) {
            return BigDecimal.ZERO;
        }
        return noi.multiply(BigDecimal.valueOf(100))
                .divide(purchasePrice, 4, RoundingMode.HALF_UP);
    }

    public void recalculateCapRate() {
        this.capRate = computeCapRate(this.noi, this.purchasePrice);
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public BigDecimal getPurchasePrice() {
        return purchasePrice;
    }

    public void setPurchasePrice(BigDecimal purchasePrice) {
        this.purchasePrice = purchasePrice;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public BigDecimal getNoi() {
        return noi;
    }

    public void setNoi(BigDecimal noi) {
        this.noi = noi;
    }

    public BigDecimal getCapRate() {
        return capRate;
    }

    public void setCapRate(BigDecimal capRate) {
        this.capRate = capRate;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public UUID getOwnerId() {
        return ownerId;
    }

    public void setOwnerId(UUID ownerId) {
        this.ownerId = ownerId;
    }
}
