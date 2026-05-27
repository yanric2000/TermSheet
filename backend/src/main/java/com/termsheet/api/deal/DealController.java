package com.termsheet.api.deal;

import com.termsheet.api.auth.AppUserPrincipal;
import com.termsheet.api.deal.dto.DealRequest;
import com.termsheet.api.deal.dto.DealResponse;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.math.BigDecimal;
import java.net.URI;
import java.util.UUID;

@RestController
@RequestMapping("/api/deals")
public class DealController {

    private final DealService dealService;

    public DealController(DealService dealService) {
        this.dealService = dealService;
    }

    @GetMapping
    public ResponseEntity<Page<DealResponse>> list(
            @RequestParam(required = false) String name,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice,
            @PageableDefault(size = 20, sort = "createdAt") Pageable pageable) {
        return ResponseEntity.ok(dealService.search(name, minPrice, maxPrice, pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<DealResponse> get(@PathVariable UUID id) {
        return ResponseEntity.ok(dealService.findById(id));
    }

    @PostMapping
    public ResponseEntity<DealResponse> create(@Valid @RequestBody DealRequest request,
                                               @AuthenticationPrincipal AppUserPrincipal principal) {
        DealResponse created = dealService.create(request, principal.getId());
        URI location = ServletUriComponentsBuilder.fromCurrentRequest()
                .path("/{id}")
                .buildAndExpand(created.id())
                .toUri();
        return ResponseEntity.created(location).body(created);
    }

    @PutMapping("/{id}")
    public ResponseEntity<DealResponse> update(@PathVariable UUID id,
                                               @Valid @RequestBody DealRequest request) {
        return ResponseEntity.ok(dealService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        dealService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
