package com.finance.personal_finance_app.service;

import com.finance.personal_finance_app.dto.PortfolioDashboardDTO;
import com.finance.personal_finance_app.model.PortfolioSnapshot;
import com.finance.personal_finance_app.model.User;
import com.finance.personal_finance_app.repository.PortfolioHistoryRepository;
import com.finance.personal_finance_app.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class SnapshotService {

    private final UserRepository userRepository;
    private final PortfolioHistoryRepository historyRepository;
    private final InvestmentService investmentService;

    /**
     * פונקציה זו רצה באופן אוטומטי כל לילה בחצות (00:00).
     * היא עוברת על כל המשתמשים, מחשבת את שווי התיק הנוכחי,
     * ושומרת "תמונת מצב" (Snapshot) להיסטוריה.
     */
    @Scheduled(cron = "0 0 0 * * ?") // Cron expression for midnight every day
    @Transactional
    public void takeDailySnapshots() {
        System.out.println("Starting daily portfolio snapshot task...");
        List<User> users = userRepository.findAll();

        for (User user : users) {
            try {
                // 1. חישוב המצב הנוכחי באמצעות השירות הקיים
                PortfolioDashboardDTO portfolio = investmentService.getPortfolio(user.getId());

                // אם אין למשתמש שום דבר בתיק, אולי נרצה לדלג (או לשמור 0)
                // כאן בחרתי לשמור גם אם זה 0 כדי שיהיה רצף בגרף

                // 2. יצירת רשומה חדשה בהיסטוריה
                PortfolioSnapshot snapshot = new PortfolioSnapshot();
                snapshot.setUser(user);
                snapshot.setSnapshotDate(LocalDate.now());

                // המרה מ-Double (של ה-DTO) ל-BigDecimal (של ה-Entity)
                snapshot.setTotalValueUsd(BigDecimal.valueOf(portfolio.getTotalValue()));
                snapshot.setTotalInvested(BigDecimal.valueOf(portfolio.getTotalInvested()));

                // חישוב רווח באחוזים לאותו יום (אופציונלי, אם קיים ב-Entity)
                // snapshot.setProfitPercent(portfolio.getTotalGainPercent());

                // 3. שמירה ב-DB
                historyRepository.save(snapshot);

            } catch (Exception e) {
                // תופסים שגיאות כדי שאם משתמש אחד נכשל, השאר לא ייפגעו
                System.err.println("Failed to take snapshot for user ID: " + user.getId());
                e.printStackTrace();
            }
        }
        System.out.println("Daily portfolio snapshot task completed.");
    }

    /**
     * פונקציה ידנית ליצירת סנאפשוט למשתמש ספציפי (למשל לצורך בדיקות או אתחול)
     */
    public void createSnapshotForUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        PortfolioDashboardDTO portfolio = investmentService.getPortfolio(userId);

        PortfolioSnapshot snapshot = new PortfolioSnapshot();
        snapshot.setUser(user);
        snapshot.setSnapshotDate(LocalDate.now());
        snapshot.setTotalValueUsd(BigDecimal.valueOf(portfolio.getTotalValue()));
        snapshot.setTotalInvested(BigDecimal.valueOf(portfolio.getTotalInvested()));

        historyRepository.save(snapshot);
    }
}