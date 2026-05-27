package com.termsheet.api.common;

import com.termsheet.api.deal.Deal;
import com.termsheet.api.deal.DealRepository;
import com.termsheet.api.user.Role;
import com.termsheet.api.user.User;
import com.termsheet.api.user.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Component
public class DataSeeder implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataSeeder.class);

    private static final String ADMIN_USERNAME = "admin";
    private static final String ADMIN_PASSWORD = "admin123";

    private final UserRepository userRepository;
    private final DealRepository dealRepository;
    private final PasswordEncoder passwordEncoder;

    public DataSeeder(UserRepository userRepository,
                      DealRepository dealRepository,
                      PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.dealRepository = dealRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(String... args) {
        User admin = userRepository.findByUsername(ADMIN_USERNAME)
                .orElseGet(this::createAdmin);

        if (dealRepository.count() == 0) {
            seedDeals(admin.getId());
            log.info("Seeded initial deals for owner '{}'", admin.getUsername());
        }
    }

    private User createAdmin() {
        User admin = new User(
                UUID.randomUUID(),
                ADMIN_USERNAME,
                passwordEncoder.encode(ADMIN_PASSWORD),
                "TermSheet Admin",
                Role.ADMIN
        );
        User saved = userRepository.save(admin);
        log.info("Created default admin user '{}' (password: '{}')", ADMIN_USERNAME, ADMIN_PASSWORD);
        return saved;
    }

    private void seedDeals(UUID ownerId) {
        List<Deal> deals = List.of(
                new Deal(
                        UUID.randomUUID(),
                        "Downtown Office Tower",
                        new BigDecimal("12500000.00"),
                        "1500 Market St, Philadelphia, PA",
                        new BigDecimal("875000.00"),
                        "Class A office in CBD with stable long-term tenants.",
                        ownerId
                ),
                new Deal(
                        UUID.randomUUID(),
                        "Riverside Multifamily",
                        new BigDecimal("8400000.00"),
                        "220 River Rd, Austin, TX",
                        new BigDecimal("588000.00"),
                        "120-unit garden-style apartment complex with value-add upside.",
                        ownerId
                ),
                new Deal(
                        UUID.randomUUID(),
                        "Sunbelt Industrial Park",
                        new BigDecimal("21750000.00"),
                        "9001 Logistics Way, Atlanta, GA",
                        new BigDecimal("1740000.00"),
                        "Last-mile distribution park leased to credit tenants.",
                        ownerId
                ),
                new Deal(
                        UUID.randomUUID(),
                        "Lakeside Retail Plaza",
                        new BigDecimal("5600000.00"),
                        "47 Lakeside Blvd, Orlando, FL",
                        new BigDecimal("392000.00"),
                        "Grocery-anchored neighborhood retail with 95% occupancy.",
                        ownerId
                ),
                new Deal(
                        UUID.randomUUID(),
                        "Tech Campus Phase II",
                        new BigDecimal("32000000.00"),
                        "500 Innovation Dr, San Jose, CA",
                        new BigDecimal("1920000.00"),
                        "Recently renovated R&D campus leased to a Fortune 500 tenant.",
                        ownerId
                ),
                new Deal(
                        UUID.randomUUID(),
                        "Mountain View Hotel",
                        new BigDecimal("9750000.00"),
                        "88 Summit Ave, Denver, CO",
                        new BigDecimal("780000.00"),
                        "Boutique hotel with 110 keys and strong RevPAR growth.",
                        ownerId
                ),
                new Deal(
                        UUID.randomUUID(),
                        "Harbor Self-Storage",
                        new BigDecimal("4200000.00"),
                        "12 Harbor View Ln, Seattle, WA",
                        new BigDecimal("336000.00"),
                        "Climate-controlled storage facility with 92% occupancy.",
                        ownerId
                )
        );
        dealRepository.saveAll(deals);
    }
}
