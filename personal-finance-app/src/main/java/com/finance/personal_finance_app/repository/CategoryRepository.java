package com.finance.personal_finance_app.repository;

import com.finance.personal_finance_app.model.Category;
import com.finance.personal_finance_app.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface CategoryRepository extends JpaRepository<Category, Long> {

    // 1. השליפה החכמה שלך (להצגת הרשימה המשולבת בדאשבורד)
    @Query("SELECT c FROM Category c WHERE c.user.id IS NULL OR c.user.id = :userId")
    List<Category> findAllByUserIdOrGlobal(@Param("userId") Long userId);

    List<Category> findAllByUserId(Long userId);

    Optional<Category> findByNameAndUser(String name, User user);
}