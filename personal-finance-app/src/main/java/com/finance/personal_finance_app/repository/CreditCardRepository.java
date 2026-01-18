package com.finance.personal_finance_app.repository;

import com.finance.personal_finance_app.model.CreditCard;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface CreditCardRepository extends JpaRepository<CreditCard, Long> {
    // שליפת כרטיסים רק של המשתמש הספציפי
    List<CreditCard> findAllByUserId(Long userId);
}