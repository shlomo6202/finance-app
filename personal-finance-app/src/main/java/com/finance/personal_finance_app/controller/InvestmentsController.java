package com.finance.personal_finance_app.controller;

import com.finance.personal_finance_app.dto.PortfolioDashboardDTO;
import com.finance.personal_finance_app.model.PortfolioSnapshot;
import com.finance.personal_finance_app.repository.PortfolioHistoryRepository;
import com.finance.personal_finance_app.service.InvestmentService;
import com.finance.personal_finance_app.service.StockPriceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/investments")
@CrossOrigin(origins = "http://localhost:5173")
@RequiredArgsConstructor // חוסך את כתיבת הבנאי ידנית
public class InvestmentsController {

    private final StockPriceService stockPriceService;
    private final InvestmentService investmentService;
    private final PortfolioHistoryRepository historyRepository;
    private final com.finance.personal_finance_app.service.SnapshotService snapshotService;

    // 1. קבלת המצב הנוכחי של התיק (שווי כולל + רשימת מניות)
    @GetMapping("/{userId}")
    public ResponseEntity<PortfolioDashboardDTO> getPortfolio(@PathVariable Long userId) {
        return ResponseEntity.ok(investmentService.getPortfolio(userId));
    }

    // 2. קבלת היסטוריית הגרף
    @GetMapping("/history/{userId}")
    public ResponseEntity<List<PortfolioSnapshot>> getPortfolioHistory(@PathVariable Long userId) {
        return ResponseEntity.ok(historyRepository.findAllByUserIdOrderBySnapshotDateAsc(userId));
    }

    // 3. בדיקת מחיר מניה בודדת (לחיפוש)
    @GetMapping("/price")
    public ResponseEntity<?> getStockPrice(@RequestParam String symbol) {
        try {
            BigDecimal price = stockPriceService.getStockPrice(symbol);
            return ResponseEntity.ok(Map.of("symbol", symbol.toUpperCase(), "price", price));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // 4. ביצוע קנייה
    @PostMapping("/buy")
    public ResponseEntity<?> buyStock(@RequestBody BuyRequest request) {
        try {
            investmentService.buyStock(request.userId, request.ticker, request.quantity, request.price);
            return ResponseEntity.ok(Map.of("message", "Stock purchased successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // DTO פנימי
    public static class BuyRequest {
        public Long userId;
        public String ticker;
        public Double quantity;
        public Double price;
    }


    //snapshot רענון מיידי של
    @PostMapping("/snapshot/force")
    public ResponseEntity<?> forceSnapshot() {
        snapshotService.takeDailySnapshots(); // מפעיל את הפונקציה של הלילה עכשיו
        return ResponseEntity.ok(Map.of("message", "Snapshot taken successfully!"));
    }
}