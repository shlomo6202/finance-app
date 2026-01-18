package com.finance.personal_finance_app.service;

import com.finance.personal_finance_app.dto.PortfolioDashboardDTO;
import com.finance.personal_finance_app.model.Stock;
import com.finance.personal_finance_app.model.User;
import com.finance.personal_finance_app.repository.StockRepository;
import com.finance.personal_finance_app.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

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
            // כאן הקסם: "מציצים" לבורסה להביא מחיר עדכני
            Double currentPrice = priceService.getPrice(stock.getTicker());

            // אם ה-API נכשל (נגמרה המכסה), נשתמש במחיר הקנייה כגיבוי (או מחיר אחרון ידוע)
            if (currentPrice == null) {
                currentPrice = stock.getAverageBuyPrice();
            }

            double marketValue = currentPrice * stock.getQuantity();
            double invested = stock.getAverageBuyPrice() * stock.getQuantity();
            double gain = marketValue - invested;
            double gainPercent = (gain / invested) * 100;

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