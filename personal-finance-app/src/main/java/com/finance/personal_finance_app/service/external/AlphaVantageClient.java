package com.finance.personal_finance_app.service.external;

import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.service.annotation.GetExchange;
import java.util.Map;

// הממשק שמגדיר את הקריאה ל-API החיצוני
public interface AlphaVantageClient {

    @GetExchange("/query")
    Map<String, Object> getGlobalQuote(
            @RequestParam("function") String function, // לדוגמה: GLOBAL_QUOTE
            @RequestParam("symbol") String symbol,     // לדוגמה: IBM
            @RequestParam("apikey") String apiKey      // המפתח שלך
    );
}