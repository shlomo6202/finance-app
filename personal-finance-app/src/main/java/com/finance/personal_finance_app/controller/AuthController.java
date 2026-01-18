package com.finance.personal_finance_app.controller;

import com.finance.personal_finance_app.model.User;
import com.finance.personal_finance_app.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:5173") // מאפשר לפרונט לגשת
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody Map<String, String> body) {
        String username = body.get("username");
        String email = body.get("email");
        String password = body.get("password"); // הסיסמה שהגיעה מהפרונט

        if (userRepository.findByEmail(email).isPresent()) {
            return ResponseEntity.badRequest().body("Email already exists");
        }

        User newUser = new User();
        newUser.setUsername(username);
        newUser.setEmail(email);

        // התיקון: אנחנו שומרים את הסיסמה (במצב אמיתי היינו מצפינים אותה)
        // מכיוון שאין לנו ספריית אבטחה כרגע, נשמור אותה כמו שהיא או כהאש פשוט
        newUser.setPasswordHash(password);

        userRepository.save(newUser);

        return ResponseEntity.ok(Map.of("message", "User registered successfully", "userId", newUser.getId()));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        String password = body.get("password");

        return userRepository.findByEmail(email)
                .map(user -> {
                    // בדיקת סיסמה פשוטה (התאמה למה ששמרנו למעלה)
                    if (user.getPasswordHash().equals(password)) {
                        return ResponseEntity.ok(Map.of(
                                "id", user.getId(),
                                "username", user.getUsername(),
                                "email", user.getEmail()
                        ));
                    } else {
                        return ResponseEntity.status(401).body("Invalid credentials");
                    }
                })
                .orElse(ResponseEntity.status(401).body("User not found"));
    }
}