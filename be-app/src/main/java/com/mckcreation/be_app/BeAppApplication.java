package com.mckcreation.be_app;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;

@SpringBootApplication
@EntityScan(basePackages = {"com.mckcreation.be_app.model"})
public class BeAppApplication {

    public static void main(String[] args) {
        SpringApplication.run(BeAppApplication.class, args);
    }

}