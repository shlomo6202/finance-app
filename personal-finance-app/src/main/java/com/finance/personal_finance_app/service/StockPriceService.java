package com.finance.personal_finance_app.service;

import com.finance.personal_finance_app.service.external.AlphaVantageClient;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.Map;

@Service
public class StockPriceService {

    private final AlphaVantageClient alphaVantageClient;

    // שליפת מפתח ה-API מקובץ ההגדרות
    @Value("${app.alphavantage.apikey}")
    private String apiKey;

    public StockPriceService(AlphaVantageClient alphaVantageClient) {
        this.alphaVantageClient = alphaVantageClient;
    }

    public BigDecimal getStockPrice(String symbol) {
        // קריאה לשרת של Alpha Vantage
        Map<String, Object> response = alphaVantageClient.getGlobalQuote(
                "GLOBAL_QUOTE",
                symbol,
                apiKey
        );

        // בדיקת תקינות התשובה
        if (response == null || !response.containsKey("Global Quote")) {
            System.out.println("AlphaVantage Response for " + symbol + ": " + response);
            // -----------------------------------------------------
            throw new RuntimeException("Invalid response or symbol not found: " + symbol);
        }

        // חילוץ המידע מתוך ה-JSON המקונן
        @SuppressWarnings("unchecked")
        Map<String, String> quoteData = (Map<String, String>) response.get("Global Quote");

        // המפתח ב-Alpha Vantage הוא "05. price"
        String priceString = quoteData.get("05. price");

        if (priceString == null) {
            throw new RuntimeException("Price data missing for symbol: " + symbol);
        }

        return new BigDecimal(priceString);
    }
}