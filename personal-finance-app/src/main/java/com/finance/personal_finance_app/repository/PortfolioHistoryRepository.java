package com.finance.personal_finance_app.repository;

import com.finance.personal_finance_app.model.PortfolioSnapshot;
import com.finance.personal_finance_app.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface PortfolioHistoryRepository extends JpaRepository<PortfolioSnapshot, Long> {
    // שליפת ההיסטוריה של המשתמש (בשביל הגרף)
    List<PortfolioSnapshot> findByUserOrderBySnapshotDateAsc(User user);
}