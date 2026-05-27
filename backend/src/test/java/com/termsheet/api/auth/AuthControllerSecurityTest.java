package com.termsheet.api.auth;

import com.termsheet.api.config.CookieProperties;
import com.termsheet.api.config.CorsConfig;
import com.termsheet.api.config.CorsProperties;
import com.termsheet.api.config.SecurityConfig;
import jakarta.servlet.http.Cookie;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.test.web.servlet.MockMvc;

import static org.hamcrest.Matchers.containsString;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Verifica o contrato de segurança do {@link AuthController}: o endpoint de
 * logout PRECISA ser acessível sem {@code Authorization: Bearer ...}.
 *
 * <p>Contexto: o frontend mantém {@code /api/auth/logout} em {@code disallowedRoutes}
 * do {@code @auth0/angular-jwt}, ou seja, a chamada nunca leva Bearer.
 * Adicionalmente, o usuário pode tentar deslogar com o accessToken já expirado.
 * Em ambos os cenários, exigir autenticação no servidor cria um deadlock:
 * o cliente nunca consegue revogar o refresh token no servidor e o cookie
 * HttpOnly fica órfão — exatamente o bug que motivou esta cobertura.
 *
 * <p>Estes testes funcionam como guarda contra regressão na configuração do
 * {@link SecurityConfig}: se alguém remover {@code /api/auth/logout} da lista
 * {@code permitAll()}, eles falham.
 *
 * <p>Não subimos {@code DataSource}/Flyway aqui — todos os serviços que tocam
 * banco são mockados para que o teste rode em milissegundos e não dependa de
 * infra externa.
 */
@WebMvcTest(AuthController.class)
@Import({
        SecurityConfig.class,
        CorsConfig.class,
        JwtAuthFilter.class,
        RestAuthEntryPoint.class,
        RestAccessDeniedHandler.class,
})
@EnableConfigurationProperties({CorsProperties.class, CookieProperties.class})
class AuthControllerSecurityTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private AuthService authService;

    @MockBean
    private RefreshTokenService refreshTokenService;

    @MockBean
    private RefreshCookieFactory cookieFactory;

    @MockBean
    private JwtService jwtService;

    @MockBean
    private AppUserDetailsService appUserDetailsService;

    @Test
    void logoutSemBearerComCookieRetorna204EExpiraCookie() throws Exception {
        String rawToken = "raw-refresh-token";
        when(cookieFactory.readFromRequest(any())).thenReturn(rawToken);
        when(cookieFactory.expired()).thenReturn(buildExpiredCookie());

        mockMvc.perform(post("/api/auth/logout").cookie(new Cookie("refresh_token", rawToken)))
                .andExpect(status().isNoContent())
                .andExpect(header().string(HttpHeaders.SET_COOKIE, containsString("Max-Age=0")));

        verify(refreshTokenService).revoke(eq(rawToken));
    }

    @Test
    void logoutSemBearerSemCookieAindaRetorna204() throws Exception {
        // Cenário: cookie já foi limpo em uma tentativa anterior. Logout deve
        // continuar sendo idempotente e best-effort: 204 + Set-Cookie expirado.
        when(cookieFactory.readFromRequest(any())).thenReturn(null);
        when(cookieFactory.expired()).thenReturn(buildExpiredCookie());

        mockMvc.perform(post("/api/auth/logout"))
                .andExpect(status().isNoContent())
                .andExpect(header().string(HttpHeaders.SET_COOKIE, containsString("Max-Age=0")));

        verify(refreshTokenService).revoke(null);
    }

    private static ResponseCookie buildExpiredCookie() {
        return ResponseCookie.from("refresh_token", "")
                .httpOnly(true)
                .secure(false)
                .path("/api/auth")
                .sameSite("Lax")
                .maxAge(0)
                .build();
    }
}
