package com.finance.personal_finance_app.service;

import com.finance.personal_finance_app.service.external.AlphaVantageClient;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j // בשביל לוגים, כדי שנראה מה קורה מאחורי הקלעים
public class StockPriceService {

    private final AlphaVantageClient alphaVantageClient;

    @Value("${app.alphavantage.apikey}")
    private String apiKey;

    public Double getPrice(String ticker) {
        try {
            // 1. שליחת הבקשה
            Map<String, Object> response = alphaVantageClient.getGlobalQuote(
                    "GLOBAL_QUOTE",
                    ticker,
                    apiKey
            );

            // 2. בדיקה אם קיבלנו תשובה תקינה
            if (response == null || !response.containsKey("Global Quote")) {
                log.error("Invalid response for ticker: {}", ticker);
                return null;
            }

            // 3. חילוץ המידע הפנימי
            Map<String, String> quoteData = (Map<String, String>) response.get("Global Quote");

            // Alpha Vantage מחזירים מפתחות מוזרים כמו "05. price"
            if (quoteData == null || quoteData.isEmpty()) {
                log.warn("API limit reached or symbol not found: {}", ticker);
                return null; // או לזרוק שגיאה מותאמת אישית
            }

            String priceString = quoteData.get("05. price");
            return Double.parseDouble(priceString);

        } catch (Exception e) {
            log.error("Failed to fetch price for {}: {}", ticker, e.getMessage());
            return null; // במקרה חירום נחזיר null והקוד הקורא יחליט מה לעשות
        }
    }
}