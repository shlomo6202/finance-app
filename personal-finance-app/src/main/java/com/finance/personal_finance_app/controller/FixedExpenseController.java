package com.finance.personal_finance_app.controller;

import com.finance.personal_finance_app.model.FixedExpense;
import com.finance.personal_finance_app.model.User;
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

    public FixedExpenseController(FixedExpenseService fixedExpenseService, UserRepository userRepository) {
        this.fixedExpenseService = fixedExpenseService;
        this.userRepository = userRepository;
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

        // המרה: אם ה-Entity שלך משתמש ב-Double, אנחנו ממירים את ה-BigDecimal שמגיע מהבקשה
        expense.setAmount(request.amount.doubleValue());

        expense.setDayOfMonth(request.dayOfMonth);

        return ResponseEntity.ok(fixedExpenseService.saveFixedExpense(expense));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteFixedExpense(@PathVariable Long id) {
        fixedExpenseService.deleteFixedExpense(id);
        return ResponseEntity.ok().build();
    }

    // DTO לקליטת הנתונים מה-Frontend
    public static class FixedExpenseRequest {
        public Long userId;
        public String description;
        public java.math.BigDecimal amount; // React שולח מספרים, BigDecimal עדיף לקליטה ראשונית
        public Integer dayOfMonth;
    }
}