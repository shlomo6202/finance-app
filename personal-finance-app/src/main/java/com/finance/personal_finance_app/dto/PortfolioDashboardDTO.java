package com.finance.personal_finance_app.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
public class PortfolioDashboardDTO {
    private Double totalValue;       // שווי התיק הנוכחי
    private Double totalInvested;    // כמה כסף השקעתי במקור
    private Double totalGain;        // רווח/הפסד דולרי
    private Double totalGainPercent; // רווח/הפסד באחוזים
    private List<StockPositionDTO> stocks; // רשימת המניות

    @Data
    @Builder
    public static class StockPositionDTO {
        private String ticker;
        private Double quantity;
        private Double averagePrice;
        private BigDecimal currentPrice;
        private Double marketValue;  // שווי נוכחי של הפוזיציה
        private Double gain;         // רווח על המניה הזו
        private Double gainPercent;
    }
}