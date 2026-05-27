package com.termsheet.api;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@ConfigurationPropertiesScan
@EnableScheduling
public class TermSheetApiApplication {

    public static void main(String[] args) {
        SpringApplication.run(TermSheetApiApplication.class, args);
    }
}
