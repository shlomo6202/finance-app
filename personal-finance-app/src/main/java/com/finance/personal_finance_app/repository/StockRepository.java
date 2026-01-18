package com.finance.personal_finance_app.repository;

import com.finance.personal_finance_app.model.Stock;
import com.finance.personal_finance_app.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface StockRepository extends JpaRepository<Stock, Long> {
    // שליפת כל המניות של משתמש ספציפי
    List<Stock> findByUser(User user);

    // בדיקה אם למשתמש כבר יש מניה מסוג מסוים (למשל כדי לעדכן כמות במקום ליצור חדש)
    Optional<Stock> findByUserAndTicker(User user, String ticker);
}