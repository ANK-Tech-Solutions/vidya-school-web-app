package com.schoolbus;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableCaching
@EnableAsync
@EnableScheduling
@ConfigurationPropertiesScan
public class SchoolBusApplication {

    public static void main(String[] args) {
        SpringApplication.run(SchoolBusApplication.class, args);
    }
}
