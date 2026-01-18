package com.finance.personal_finance_app.controller;

import com.finance.personal_finance_app.dto.PortfolioDashboardDTO;
import com.finance.personal_finance_app.service.InvestmentService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/investments")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173") // מאפשר לפרונט (Vite) לגשת לשרת
public class InvestmentsController {

    private final InvestmentService investmentService;

    // 1. קבלת תמונת מצב מלאה (המסך הראשי של ההשקעות)
    // דוגמה לקריאה: GET /api/investments/dashboard/1
    @GetMapping("/dashboard/{userId}")
    public ResponseEntity<PortfolioDashboardDTO> getPortfolioDashboard(@PathVariable Long userId) {
        PortfolioDashboardDTO dashboard = investmentService.getPortfolio(userId);
        return ResponseEntity.ok(dashboard);
    }

    // 2. קניית מניה חדשה (סימולציה)
    // דוגמה לקריאה: POST /api/investments/buy
    @PostMapping("/buy")
    public ResponseEntity<String> buyStock(@RequestBody BuyStockRequest request) {
        investmentService.buyStock(
                request.getUserId(),
                request.getTicker(),
                request.getQuantity(),
                request.getPrice()
        );
        return ResponseEntity.ok("Stock purchased successfully");
    }

    // מחלקה פנימית קטנה כדי לקלוט את המידע מה-JSON
    @Data
    public static class BuyStockRequest {
        private Long userId;
        private String ticker;   // למשל "AAPL"
        private Double quantity; // למשל 2.5
        private Double price;    // למשל 150.0
    }
}