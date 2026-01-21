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
    public AlphaVantageClient alphaVantageClient() {
        // 1. יצירת WebClient בסיסי עם הכתובת של Alpha Vantage
        WebClient client = WebClient.builder()
                .baseUrl("https://www.alphavantage.co")
                .build();

        // 2. יצירת מתאם (Adapter) בין ה-WebClient לממשק
        WebClientAdapter adapter = WebClientAdapter.create(client);

        // 3. יצירת מפעל (Factory) ליצירת המימוש
        HttpServiceProxyFactory factory = HttpServiceProxyFactory.builderFor(adapter).build();

        // 4. יצירת ה-Client בפועל והחזרתו כ-Bean
        return factory.createClient(AlphaVantageClient.class);
    }
}