package com.finance.personal_finance_app.service;

import com.finance.personal_finance_app.model.FixedExpense;
import com.finance.personal_finance_app.model.Transaction;
import com.finance.personal_finance_app.model.User;
import com.finance.personal_finance_app.repository.FixedExpenseRepository;
import com.finance.personal_finance_app.repository.TransactionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Service
public class FixedExpenseService {

    private final FixedExpenseRepository fixedExpenseRepository;
    private final TransactionRepository transactionRepository;

    public FixedExpenseService(FixedExpenseRepository fixedExpenseRepository,
                               TransactionRepository transactionRepository) {
        this.fixedExpenseRepository = fixedExpenseRepository;
        this.transactionRepository = transactionRepository;
    }

    // --- חדש: פונקציות שהקונטרולר חייב כדי להציג ולנהל נתונים ---

    public List<FixedExpense> getAllFixedExpensesByUserId(Long userId) {
        return fixedExpenseRepository.findAllByUserId(userId);
    }

    public FixedExpense saveFixedExpense(FixedExpense expense) {
        return fixedExpenseRepository.save(expense);
    }

    public void deleteFixedExpense(Long id) {
        fixedExpenseRepository.deleteById(id);
    }

    // --- הלוגיקה המקורית שלך (ללא שינוי) ---

    @Transactional
    public void generateFixedExpensesForUser(Long userId) {
        List<FixedExpense> fixedExpenses = fixedExpenseRepository.findAllByUserId(userId);
        LocalDate today = LocalDate.now();

        for (FixedExpense expense : fixedExpenses) {
            if (shouldGenerateTransaction(expense, today)) {
                createTransactionFromExpense(expense, today);
            }
        }
    }

    private boolean shouldGenerateTransaction(FixedExpense expense, LocalDate today) {
        if (today.getDayOfMonth() < expense.getDayOfMonth()) {
            return false;
        }
        if (expense.getLastGenerated() == null) {
            return true;
        }
        LocalDate last = expense.getLastGenerated();
        return today.getYear() > last.getYear() ||
                (today.getYear() == last.getYear() && today.getMonthValue() > last.getMonthValue());
    }

    private void createTransactionFromExpense(FixedExpense expense, LocalDate date) {
        Transaction t = new Transaction();
        t.setDescription(expense.getDescription() + " (הוראת קבע)");

        // המרה בטוחה: הנחתי ש-FixedExpense מחזיק Double, והטרנזקציה צריכה BigDecimal
        BigDecimal amountVal = BigDecimal.valueOf(expense.getAmount()).abs().negate();
        t.setAmount(amountVal);

        t.setDate(date);

        User user = new User();
        user.setId(expense.getUser().getId());
        t.setUser(user);

        transactionRepository.save(t);

        expense.setLastGenerated(date);
        fixedExpenseRepository.save(expense);
    }
}