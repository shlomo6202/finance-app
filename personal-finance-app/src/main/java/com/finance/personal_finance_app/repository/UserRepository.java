package com.finance.personal_finance_app.repository;

import com.finance.personal_finance_app.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

    // פונקציה למציאת משתמש לפי אימייל (עבור Login)
    Optional<User> findByEmail(String email);

    // פונקציה לבדיקה האם אימייל כבר קיים במערכת (עבור Register)
    boolean existsByEmail(String email);
}