package com.finance.personal_finance_app.controller;

import com.finance.personal_finance_app.dto.TransactionRequestDTO;
import com.finance.personal_finance_app.model.Transaction;
import com.finance.personal_finance_app.service.TransactionService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/transactions")
// מומלץ להעביר את ה-Origin לקובץ הגדרות, אך השארתי כאן לפשטות
@CrossOrigin(origins = "http://localhost:5173")
public class TransactionController {

    private final TransactionService transactionService;

    public TransactionController(TransactionService transactionService) {
        this.transactionService = transactionService;
    }

    @PostMapping("/add")
    public ResponseEntity<Transaction> addTransaction(@RequestBody TransactionRequestDTO request) {
        Transaction newTransaction = transactionService.createTransaction(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(newTransaction);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTransaction(@PathVariable Long id) {
        transactionService.deleteTransaction(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/history")
    public ResponseEntity<List<Transaction>> getAllTransactions(@RequestParam Long userId) {
        return ResponseEntity.ok(transactionService.getHistory(userId));
    }
}