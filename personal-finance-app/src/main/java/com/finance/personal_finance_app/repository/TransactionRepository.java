package com.finance.personal_finance_app.repository;

import com.finance.personal_finance_app.model.Transaction;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface TransactionRepository extends JpaRepository<Transaction, Long> {

    // --- התיקון לשגיאה האדומה: הוספת הפונקציה החסרה ---
    List<Transaction> findAllByUserId(Long userId);

    // פונקציה לשליפת 4 עסקאות אחרונות לפי יוזר (עבור הדשבורד)
    List<Transaction> findTop4ByUserIdOrderByDateDesc(Long userId);
}