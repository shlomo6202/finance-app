package com.finance.personal_finance_app.controller;

import com.finance.personal_finance_app.model.Category;
import com.finance.personal_finance_app.model.Transaction;
import com.finance.personal_finance_app.model.User;
import com.finance.personal_finance_app.repository.CategoryRepository;
import com.finance.personal_finance_app.repository.TransactionRepository;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/transactions") // זה תואם בדיוק את מה שה-React שלך שולח
@CrossOrigin(origins = "http://localhost:5173") // פותר את בעיית ה-CORS
public class TransactionController {

    private final TransactionRepository transactionRepository;
    private final CategoryRepository categoryRepository;

    public TransactionController(TransactionRepository transactionRepository, CategoryRepository categoryRepository) {
        this.transactionRepository = transactionRepository;
        this.categoryRepository = categoryRepository;
    }

    // --- הוספת תנועה חדשה ---
    // מקבל אובייקט בקשה מותאם (DTO) במקום Entity ישיר
    @PostMapping("/add")
    public Transaction addTransaction(@RequestBody TransactionRequest request) {
        Transaction t = new Transaction();

        // 1. הגדרת המשתמש
        User user = new User();
        user.setId(request.userId);
        t.setUser(user);

        // 2. הגדרת תיאור
        t.setDescription(request.description);

        // 3. טיפול בסכום (המרת סוג פעולה לפלוס/מינוס)
        BigDecimal amount = request.amount;
        if ("EXPENSE".equalsIgnoreCase(request.type)) {
            // אם זו הוצאה, וודא שהמספר שלילי
            amount = amount.abs().negate();
        } else {
            // אם זו הכנסה, וודא שהמספר חיובי
            amount = amount.abs();
        }
        t.setAmount(amount);

        // 4. טיפול בקטגוריה
        if (request.categoryId != null) {
            Category c = categoryRepository.findById(request.categoryId).orElse(null);
            t.setCategory(c);
        }

        // 5. הגדרת תאריך (ברירת מחדל להיום אם לא נשלח)
        t.setDate(LocalDate.now());

        return transactionRepository.save(t);
    }

    // --- מחיקת תנועה ---
    @DeleteMapping("/{id}")
    public void deleteTransaction(@PathVariable Long id) {
        transactionRepository.deleteById(id);
    }

    // --- קבלת היסטוריה (הכל) ---
    @GetMapping("/history")
    public List<Transaction> getAllTransactions(@RequestParam Long userId) {
        // מיון יורד לפי תאריך (מהחדש לישן) כדי שיראה הגיוני באפליקציה
        return transactionRepository.findAllByUserIdOrderByDateDesc(userId);
    }

    // --- מחלקה פנימית לקליטת הנתונים מה-React (DTO) ---
    // זה פותר את הבעיה ש-React שולח מבנה שונה ממה שה-Entity דורש
    public static class TransactionRequest {
        public Long userId;
        public String description;
        public BigDecimal amount;
        public Long categoryId;
        public String type; // "INCOME" או "EXPENSE"
    }
}