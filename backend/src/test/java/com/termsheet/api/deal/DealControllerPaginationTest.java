package com.termsheet.api.deal;

import com.termsheet.api.auth.AppUserDetailsService;
import com.termsheet.api.auth.JwtService;
import com.termsheet.api.deal.dto.DealResponse;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.isNull;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Garante que {@code page=1} na query string representa a primeira página quando
 * {@code spring.data.web.pageable.one-indexed-parameters=true}.
 */
@WebMvcTest(DealController.class)
@AutoConfigureMockMvc(addFilters = false)
@TestPropertySource(properties = "spring.data.web.pageable.one-indexed-parameters=true")
class DealControllerPaginationTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private DealService dealService;

    @MockBean
    private JwtService jwtService;

    @MockBean
    private AppUserDetailsService appUserDetailsService;

    @Test
    void page1ConsultaPrimeiraPaginaInterna() throws Exception {
        UUID dealId = UUID.fromString("00000000-0000-0000-0000-000000000001");
        DealResponse deal = new DealResponse(
                dealId,
                "Tower A",
                new BigDecimal("10000000"),
                "123 Main St",
                new BigDecimal("500000"),
                new BigDecimal("5.0"),
                "desc",
                UUID.randomUUID(),
                Instant.parse("2024-01-01T00:00:00Z"),
                Instant.parse("2024-01-01T00:00:00Z")
        );
        Page<DealResponse> page = new PageImpl<>(List.of(deal), PageRequest.of(0, 10), 1);

        ArgumentCaptor<Pageable> pageableCaptor = ArgumentCaptor.forClass(Pageable.class);
        when(dealService.search(isNull(), isNull(), isNull(), pageableCaptor.capture())).thenReturn(page);

        mockMvc.perform(get("/api/deals").param("page", "1").param("size", "10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content.length()").value(1))
                .andExpect(jsonPath("$.content[0].id").value(dealId.toString()));

        verify(dealService).search(isNull(), isNull(), isNull(), any(Pageable.class));
        assertThat(pageableCaptor.getValue().getPageNumber()).isZero();
        assertThat(pageableCaptor.getValue().getPageSize()).isEqualTo(10);
    }
}
