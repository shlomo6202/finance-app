package com.finance.personal_finance_app.controller;

import com.finance.personal_finance_app.model.User;
import com.finance.personal_finance_app.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:5173")
public class AuthController {

    private final UserRepository userRepository;

    public AuthController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    // הרשמה - בודק אם המייל קיים
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody User user) {
        if (userRepository.existsByEmail(user.getEmail())) {
            return ResponseEntity.badRequest().body("האימייל הזה כבר רשום במערכת");
        }

        // יצירת חותמת זמן אם חסרה
        if (user.getCreatedAt() == null) {
            user.setCreatedAt(java.time.LocalDateTime.now());
        }

        userRepository.save(user);
        return ResponseEntity.ok(user);
    }

    // התחברות - בודק מייל וסיסמה (מול password_hash)
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> loginData) {
        String email = loginData.get("email");
        String password = loginData.get("password");

        Optional<User> userOpt = userRepository.findByEmail(email);

        if (userOpt.isPresent()) {
            User user = userOpt.get();
            // כאן מתבצעת ההשוואה. הערה: במערכת אמיתית משווים HASH, כאן נשווה סטרינגים כרגע
            if (user.getPassword().equals(password)) {
                return ResponseEntity.ok(user);
            }
        }
        return ResponseEntity.status(401).body("שגיאה: שם משתמש או סיסמה לא נכונים");
    }
}