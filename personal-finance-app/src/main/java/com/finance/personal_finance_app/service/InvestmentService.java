package com.finance.personal_finance_app.service;

import com.finance.personal_finance_app.dto.PortfolioDashboardDTO;
import com.finance.personal_finance_app.model.Stock;
import com.finance.personal_finance_app.model.User;
import com.finance.personal_finance_app.repository.StockRepository;
import com.finance.personal_finance_app.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class InvestmentService {

    private final StockRepository stockRepository;
    private final StockPriceService priceService;
    private final UserRepository userRepository;

    public PortfolioDashboardDTO getPortfolio(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<Stock> myStocks = stockRepository.findByUser(user);

        double totalValue = 0;
        double totalInvested = 0;
        List<PortfolioDashboardDTO.StockPositionDTO> stockDTOs = new ArrayList<>();

        for (Stock stock : myStocks) {
            BigDecimal currentPrice;

            // --- התיקון: עטיפה ב-try-catch למניעת קריסה ---
            try {
                // מנסים להביא מחיר עדכני מה-API
                currentPrice = priceService.getStockPrice(stock.getTicker());
            } catch (Exception e) {
                // אם נכשל (למשל: נגמרה המכסה), מדפיסים לוג וממשיכים
                System.err.println("Could not fetch price for " + stock.getTicker() + ". Reason: " + e.getMessage());
                currentPrice = null;
            }
            // --------------------------------------------------

            // מנגנון הגיבוי: אם ה-API נכשל, משתמשים במחיר הקנייה הממוצע
            if (currentPrice == null) {
                currentPrice = BigDecimal.valueOf(stock.getAverageBuyPrice());
            }

            // חישוב שווי שוק בצורה בטוחה עם BigDecimal
            BigDecimal quantityBD = BigDecimal.valueOf(stock.getQuantity());
            double marketValue = currentPrice.multiply(quantityBD).doubleValue();

            double invested = stock.getAverageBuyPrice() * stock.getQuantity();
            double gain = marketValue - invested;
            double gainPercent = (invested > 0) ? (gain / invested) * 100 : 0;

            totalValue += marketValue;
            totalInvested += invested;

            stockDTOs.add(PortfolioDashboardDTO.StockPositionDTO.builder()
                    .ticker(stock.getTicker())
                    .quantity(stock.getQuantity())
                    .averagePrice(stock.getAverageBuyPrice())
                    .currentPrice(currentPrice)
                    .marketValue(marketValue)
                    .gain(gain)
                    .gainPercent(gainPercent)
                    .build());
        }

        double totalGain = totalValue - totalInvested;
        double totalGainPercent = (totalInvested > 0) ? (totalGain / totalInvested) * 100 : 0;

        return PortfolioDashboardDTO.builder()
                .totalValue(totalValue)
                .totalInvested(totalInvested)
                .totalGain(totalGain)
                .totalGainPercent(totalGainPercent)
                .stocks(stockDTOs)
                .build();
    }

    // פונקציה להוספת מניה (סימולציה של קנייה)
    public void buyStock(Long userId, String ticker, Double quantity, Double price) {
        User user = userRepository.findById(userId).orElseThrow();

        // בדיקה אם המניה כבר קיימת כדי לעשות ממוצע
        Stock stock = stockRepository.findByUserAndTicker(user, ticker)
                .orElse(new Stock(null, user, ticker, 0.0, 0.0));

        double newQuantity = stock.getQuantity() + quantity;
        double totalCostOld = stock.getQuantity() * stock.getAverageBuyPrice();
        double totalCostNew = quantity * price;

        // חישוב ממוצע משוקלל חדש
        double newAveragePrice = (totalCostOld + totalCostNew) / newQuantity;

        stock.setQuantity(newQuantity);
        stock.setAverageBuyPrice(newAveragePrice);

        stockRepository.save(stock);
    }
}