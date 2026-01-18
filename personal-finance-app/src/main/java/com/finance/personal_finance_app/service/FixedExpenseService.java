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

    /**
     * בודק עבור משתמש מסוים האם הגיע הזמן לייצר עסקאות מהוראות קבע.
     * אם כן - מייצר אותן, שומר ב-DB ומעדכן את תאריך היצירה האחרון.
     */
    @Transactional // מבטיח שאם משהו נכשל באמצע, הכל מתבטל (Rollback)
    public void generateFixedExpensesForUser(Long userId) {
        List<FixedExpense> fixedExpenses = fixedExpenseRepository.findAllByUserId(userId);
        LocalDate today = LocalDate.now();

        for (FixedExpense expense : fixedExpenses) {
            if (shouldGenerateTransaction(expense, today)) {
                createTransactionFromExpense(expense, today);
            }
        }
    }

    // לוגיקה פרטית לבדיקה האם צריך לייצר עסקה
    private boolean shouldGenerateTransaction(FixedExpense expense, LocalDate today) {
        // אם היום בחודש טרם הגיע - אין מה לעשות
        if (today.getDayOfMonth() < expense.getDayOfMonth()) {
            return false;
        }

        // אם מעולם לא נוצר - צריך לייצר (כי היום בחודש כבר עבר/הגיע)
        if (expense.getLastGenerated() == null) {
            return true;
        }

        LocalDate last = expense.getLastGenerated();

        // בדיקה: האם אנחנו בחודש חדש (או שנה חדשה) ביחס לפעם האחרונה?
        // הלוגיקה שלך:
        boolean isNewMonthOrYear = today.getYear() > last.getYear() ||
                (today.getYear() == last.getYear() && today.getMonthValue() > last.getMonthValue());

        return isNewMonthOrYear;
    }

    // יצירת העסקה בפועל
    private void createTransactionFromExpense(FixedExpense expense, LocalDate date) {
        Transaction t = new Transaction();
        t.setDescription(expense.getDescription() + " (הוראת קבע)");

        // המרה ל-BigDecimal שלילי (כי זו הוצאה)
        // הערה: הנחתי ש-FixedExpense.amount הוא Double כפי ששלחת בקוד המקורי
        BigDecimal amountVal = BigDecimal.valueOf(expense.getAmount()).abs().negate();
        t.setAmount(amountVal);

        t.setDate(date);

        // קישור למשתמש
        User user = new User();
        user.setId(expense.getUser().getId());
        t.setUser(user);

        // שמירת העסקה
        transactionRepository.save(t);

        // עדכון ההוצאה הקבועה (כדי שלא תיווצר שוב החודש)
        expense.setLastGenerated(date);
        fixedExpenseRepository.save(expense);
    }
}