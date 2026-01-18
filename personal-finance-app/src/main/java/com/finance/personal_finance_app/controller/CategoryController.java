package com.finance.personal_finance_app.controller;

import com.finance.personal_finance_app.model.Category;
import com.finance.personal_finance_app.model.User;
import com.finance.personal_finance_app.repository.CategoryRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/categories")
@CrossOrigin(origins = "http://localhost:5173")
public class CategoryController {

    private final CategoryRepository categoryRepository;

    // שימוש ב-Constructor Injection (עדיף על @Autowired מעל שדות)
    public CategoryController(CategoryRepository categoryRepository) {
        this.categoryRepository = categoryRepository;
    }

    // --- שליפת קטגוריות (הועבר מ-StatisticsController) ---
    @GetMapping("/list")
    public List<Category> getCategories(@RequestParam Long userId) {
        // מחזיר את הקטגוריות של המשתמש (ואם יש לך לוגיקה של 'גלובלי', זה המקום ברפוזיטורי)
        return categoryRepository.findAllByUserId(userId);
    }

    // --- הוספת קטגוריה חדשה ---
    @PostMapping("/add")
    public Category addCategory(@RequestBody CategoryRequest request) {
        // בדיקה בסיסית (אופציונלי: אפשר להוסיף ולידציה שאין כפילות)

        User user = new User();
        user.setId(request.userId);

        Category category = new Category();
        category.setName(request.name);
        category.setColor(request.color != null ? request.color : "#cccccc"); // דיפולט אם אין צבע
        category.setUser(user);

        return categoryRepository.save(category);
    }

    // --- DTO לקליטת הנתונים ---
    public static class CategoryRequest {
        public String name;
        public String color;
        public Long userId;
    }
}