package com.finance.personal_finance_app.controller;

import com.finance.personal_finance_app.model.Category; // Import Category
import com.finance.personal_finance_app.model.FixedExpense;
import com.finance.personal_finance_app.model.User;
import com.finance.personal_finance_app.repository.CategoryRepository; // Import Repo
import com.finance.personal_finance_app.repository.UserRepository;
import com.finance.personal_finance_app.service.FixedExpenseService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/fixed-expenses")
@CrossOrigin(origins = "http://localhost:5173")
public class FixedExpenseController {

    private final FixedExpenseService fixedExpenseService;
    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository; // 1. הוספת רפוזיטורי לקטגוריות


    public FixedExpenseController(FixedExpenseService fixedExpenseService,
                                  UserRepository userRepository,
                                  CategoryRepository categoryRepository) {
        this.fixedExpenseService = fixedExpenseService;
        this.userRepository = userRepository;
        this.categoryRepository = categoryRepository;
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<FixedExpense>> getUserFixedExpenses(@PathVariable Long userId) {
        return ResponseEntity.ok(fixedExpenseService.getAllFixedExpensesByUserId(userId));
    }

    @PostMapping("/add")
    public ResponseEntity<FixedExpense> addFixedExpense(@RequestBody FixedExpenseRequest request) {
        User user = userRepository.findById(request.userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        FixedExpense expense = new FixedExpense();
        expense.setUser(user);
        expense.setDescription(request.description);

        // המרת סכום
        expense.setAmount(request.amount.doubleValue());
        expense.setDayOfMonth(request.dayOfMonth);


        if (request.categoryId != null) {
            Category category = categoryRepository.findById(request.categoryId)
                    .orElse(null); // או לזרוק שגיאה אם חייב
            expense.setCategory(category);
        }
        // ----------------------------------

        return ResponseEntity.ok(fixedExpenseService.saveFixedExpense(expense));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteFixedExpense(@PathVariable Long id) {
        fixedExpenseService.deleteFixedExpense(id);
        return ResponseEntity.ok().build();
    }

    // עדכון ה-DTO
    public static class FixedExpenseRequest {
        public Long userId;
        public String description;
        public java.math.BigDecimal amount;
        public Integer dayOfMonth;
        public Long categoryId; // 2. שדה חדש
    }
}