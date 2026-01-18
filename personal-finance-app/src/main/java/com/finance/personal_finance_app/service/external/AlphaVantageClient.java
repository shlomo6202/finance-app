package com.finance.personal_finance_app.service.external;

import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.service.annotation.GetExchange;
import org.springframework.web.service.annotation.HttpExchange;
import java.util.Map;

// Spring ייצור מימוש אוטומטי לממשק הזה בזמן ריצה
@HttpExchange(url = "/query")
public interface AlphaVantageClient {

    @GetExchange
    Map<String, Object> getGlobalQuote(
            @RequestParam("function") String function, // לדוגמה: GLOBAL_QUOTE
            @RequestParam("symbol") String symbol,     // לדוגמה: IBM
            @RequestParam("apikey") String apiKey      // המפתח שלך
    );
}