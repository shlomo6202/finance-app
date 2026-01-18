package com.finance.personal_finance_app.repository;

import com.finance.personal_finance_app.model.FixedExpense;
import com.finance.personal_finance_app.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface FixedExpenseRepository extends JpaRepository<FixedExpense, Long> {
    List<FixedExpense> findAllByUserId(Long userId);
}