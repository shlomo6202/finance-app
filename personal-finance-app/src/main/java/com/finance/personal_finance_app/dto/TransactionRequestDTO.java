package com.finance.personal_finance_app.dto;

import com.finance.personal_finance_app.model.TransactionType;
import java.math.BigDecimal;

// שימוש ב-Record (Java 17+) ליצירת אובייקט נתונים נקי וקריא
public record TransactionRequestDTO(
        Long userId,
        String description,
        BigDecimal amount,
        Long categoryId,
        TransactionType type // שימוש ב-Enum שיצרנו
) {}