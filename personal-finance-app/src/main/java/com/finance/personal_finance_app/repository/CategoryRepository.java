package com.finance.personal_finance_app.repository;

import com.finance.personal_finance_app.model.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;

public interface CategoryRepository extends JpaRepository<Category, Long> {

    // שליפה חכמה: גם הכלליים (NULL) וגם הפרטיים של היוזר
    @Query("SELECT c FROM Category c WHERE c.user.id IS NULL OR c.user.id = :userId")
    List<Category> findAllByUserIdOrGlobal(Long userId);
}