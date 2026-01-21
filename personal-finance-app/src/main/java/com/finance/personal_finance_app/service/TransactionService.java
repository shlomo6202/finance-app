package com.finance.personal_finance_app.service;

import com.finance.personal_finance_app.dto.TransactionRequestDTO;
import com.finance.personal_finance_app.model.Transaction;
import com.finance.personal_finance_app.model.TransactionType;
import com.finance.personal_finance_app.model.User;
import com.finance.personal_finance_app.repository.CategoryRepository;
import com.finance.personal_finance_app.repository.TransactionRepository;
import com.finance.personal_finance_app.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class TransactionService {

    private final TransactionRepository transactionRepository;
    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;

    public TransactionService(TransactionRepository transactionRepository,
                              CategoryRepository categoryRepository,
                              UserRepository userRepository) {
        this.transactionRepository = transactionRepository;
        this.categoryRepository = categoryRepository;
        this.userRepository = userRepository;
    }

    public Transaction createTransaction(TransactionRequestDTO request) {
        Transaction t = new Transaction();

        // שימוש ב-getReferenceById יעיל יותר ליצירת קשר ללא שליפה מלאה מהדאטהבייס
        User user = userRepository.getReferenceById(request.userId());
        t.setUser(user);

        t.setDescription(request.description());
        t.setDate(LocalDate.now());

        // לוגיקת הטיפול בסכום (פלוס/מינוס) עברה לכאן
        if (request.type() == TransactionType.EXPENSE) {
            t.setAmount(request.amount().abs().negate());
        } else {
            t.setAmount(request.amount().abs());
        }

        // קישור קטגוריה אם קיימת
        if (request.categoryId() != null) {
            categoryRepository.findById(request.categoryId())
                    .ifPresent(t::setCategory);
        }

        return transactionRepository.save(t);
    }

    public List<Transaction> getHistory(Long userId) {
        return transactionRepository.findAllByUserIdOrderByDateDesc(userId);
    }

    public void deleteTransaction(Long id) {
        transactionRepository.deleteById(id);
    }
}