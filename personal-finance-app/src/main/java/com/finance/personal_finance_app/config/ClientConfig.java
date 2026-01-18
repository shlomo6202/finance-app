package com.finance.personal_finance_app.config;

import com.finance.personal_finance_app.service.external.AlphaVantageClient;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.support.WebClientAdapter;
import org.springframework.web.service.invoker.HttpServiceProxyFactory;

@Configuration
public class ClientConfig {

    @Bean
    public AlphaVantageClient alphaVantageClient(WebClient.Builder builder) {
        // 1. הגדרת הכתובת הבסיסית של Alpha Vantage
        WebClient webClient = builder
                .baseUrl("https://www.alphavantage.co")
                .build();

        // 2. יצירת המפעל שמייצר את האימפלמנטציה
        HttpServiceProxyFactory factory = HttpServiceProxyFactory
                .builderFor(WebClientAdapter.create(webClient))
                .build();

        // 3. החזרת הקליינט המוכן לשימוש
        return factory.createClient(AlphaVantageClient.class);
    }
}