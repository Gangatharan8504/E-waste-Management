// FILE: EwasteApplication.java
package com.ewaste;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;
@SpringBootApplication @EnableAsync
public class EwasteApplication {
    public static void main(String[] args) { SpringApplication.run(EwasteApplication.class, args); }
}
