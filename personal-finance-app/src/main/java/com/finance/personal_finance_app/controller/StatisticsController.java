package com.finance.personal_finance_app.controller;

import com.finance.personal_finance_app.model.*;
import com.finance.personal_finance_app.repository.*;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.*;

@RestController
@RequestMapping("/api/stats")
@CrossOrigin(origins = "http://localhost:5173")
public class StatisticsController {

    private final TransactionRepository transactionRepository;
    private final CategoryRepository categoryRepository;
    private final CreditCardRepository creditCardRepository;
    private final FixedExpenseRepository fixedExpenseRepository;

    public StatisticsController(TransactionRepository transactionRepository,
                                CategoryRepository categoryRepository,
                                CreditCardRepository creditCardRepository,
                                FixedExpenseRepository fixedExpenseRepository) {
        this.transactionRepository = transactionRepository;
        this.categoryRepository = categoryRepository;
        this.creditCardRepository = creditCardRepository;
        this.fixedExpenseRepository = fixedExpenseRepository;
    }

    // --- דשבורד ---
    @GetMapping("/dashboard")
    public Map<String, Object> getDashboardData(@RequestParam Long userId) {
        // 1. בדיקה ויצירה אוטומטית של הוצאות קבועות
        checkAndGenerateFixedExpenses(userId);

        Map<String, Object> response = new HashMap<>();

        // 2. שליפת נתונים עדכניים
        List<Transaction> userTransactions = transactionRepository.findAllByUserId(userId);

        // חישוב יתרה (תיקון המרת BigDecimal)
        double totalBalance = userTransactions.stream()
                .mapToDouble(t -> t.getAmount().doubleValue())
                .sum();

        // חישוב הוצאות החודש הנוכחי
        String currentMonth = LocalDate.now().toString().substring(0, 7);
        double monthlyExpenses = userTransactions.stream()
                .filter(t -> t.getDate().toString().startsWith(currentMonth))
                .filter(t -> t.getAmount().doubleValue() < 0)
                .mapToDouble(t -> t.getAmount().doubleValue())
                .sum();

        response.put("totalBalance", totalBalance);
        response.put("monthlyExpenses", monthlyExpenses);
        response.put("recentTransactions", transactionRepository.findTop4ByUserIdOrderByDateDesc(userId));

        return response;
    }

    // --- לוגיקה חכמה ליצירת הוצאות קבועות ---
    private void checkAndGenerateFixedExpenses(Long userId) {
        List<FixedExpense> fixedExpenses = fixedExpenseRepository.findAllByUserId(userId);
        LocalDate today = LocalDate.now();

        for (FixedExpense expense : fixedExpenses) {
            boolean needToGenerate = false;

            // אם זו פעם ראשונה
            if (expense.getLastGenerated() == null) {
                // אם היום בחודש כבר עבר או הגיע
                if (today.getDayOfMonth() >= expense.getDayOfMonth()) {
                    needToGenerate = true;
                }
            } else {
                LocalDate last = expense.getLastGenerated();
                // אם עברנו לחודש חדש (או שנה חדשה) והגיע התאריך
                if ((today.getYear() > last.getYear() || today.getMonthValue() > last.getMonthValue())
                        && today.getDayOfMonth() >= expense.getDayOfMonth()) {
                    needToGenerate = true;
                }
            }

            if (needToGenerate) {
                // יצירת העסקה בפועל
                Transaction t = new Transaction();
                t.setDescription(expense.getDescription() + " (הוראת קבע)");
                // המרה ל-BigDecimal שלילי
                t.setAmount(BigDecimal.valueOf(-Math.abs(expense.getAmount())));
                t.setDate(today);

                User user = new User();
                user.setId(userId);
                t.setUser(user);

                // שמירה בטבלת העסקאות
                transactionRepository.save(t);

                // עדכון תאריך יצירה אחרון כדי שלא יווצר שוב החודש
                expense.setLastGenerated(today);
                fixedExpenseRepository.save(expense);
            }
        }
    }

    // --- ניהול הוצאות קבועות (Endpoints) ---
    @GetMapping("/fixed-expenses")
    public List<FixedExpense> getFixedExpenses(@RequestParam Long userId) {
        return fixedExpenseRepository.findAllByUserId(userId);
    }

    @PostMapping("/fixed-expenses/add")
    public FixedExpense addFixedExpense(@RequestBody Map<String, Object> payload, @RequestParam Long userId) {
        String desc = (String) payload.get("description");
        // המרה בטוחה מסוגים שונים
        Double amount = Double.valueOf(payload.get("amount").toString());
        int day = Integer.parseInt(payload.get("dayOfMonth").toString());

        User user = new User();
        user.setId(userId);

        FixedExpense fe = new FixedExpense(desc, amount, day, user);
        return fixedExpenseRepository.save(fe);
    }

    @DeleteMapping("/fixed-expenses/{id}")
    public void deleteFixedExpense(@PathVariable Long id) {
        fixedExpenseRepository.deleteById(id);
    }

    // --- גרפים ודוחות ---
    @GetMapping("/monthly")
    public List<Map<String, Object>> getMonthlyStats(@RequestParam Long userId) {
        List<Transaction> allTransactions = transactionRepository.findAllByUserId(userId);
        Map<Integer, Double> sumByMonth = new HashMap<>();

        for (Transaction t : allTransactions) {
            LocalDate date = LocalDate.parse(t.getDate().toString());
            int month = date.getMonthValue();
            double amountVal = t.getAmount().doubleValue();

            if (amountVal < 0) {
                sumByMonth.put(month, sumByMonth.getOrDefault(month, 0.0) + Math.abs(amountVal));
            }
        }

        List<Map<String, Object>> result = new ArrayList<>();
        String[] hebrewMonths = {"", "ינו", "פבר", "מרץ", "אפר", "מאי", "יוני", "יולי", "אוג", "ספט", "אוק", "נוב", "דצמ"};

        for (int i = 1; i <= 12; i++) {
            Map<String, Object> monthData = new HashMap<>();
            monthData.put("name", hebrewMonths[i]);
            monthData.put("amount", sumByMonth.getOrDefault(i, 0.0));
            result.add(monthData);
        }
        return result;
    }

    // --- כרטיסי אשראי ---
    @GetMapping("/cards")
    public List<CreditCard> getCards(@RequestParam Long userId) {
        return creditCardRepository.findAllByUserId(userId);
    }

    @PostMapping("/cards/add")
    public CreditCard addCard(@RequestBody CreditCard card, @RequestParam Long userId) {
        User user = new User();
        user.setId(userId);
        card.setUser(user);
        return creditCardRepository.save(card);
    }

    // --- קטגוריות ---
    @GetMapping("/categories-list")
    public List<Map<String, Object>> getCategoriesList(@RequestParam Long userId) {
        // מניח שיש findAllByUserIdOrGlobal, אחרת findAll()
        List<Category> categories = categoryRepository.findAllByUserIdOrGlobal(userId);
        return categories.stream().map(c -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", c.getId());
            map.put("name", c.getName());
            map.put("color", c.getColor());
            return map;
        }).toList();
    }

    @PostMapping("/categories/add")
    public Category addCategory(@RequestBody Map<String, String> payload, @RequestParam Long userId) {
        String name = payload.get("name");
        String color = payload.getOrDefault("color", "#" + Integer.toHexString((int)(Math.random() * 0xFFFFFF)));
        User user = new User();
        user.setId(userId);
        Category newCategory = new Category(name, color, user);
        return categoryRepository.save(newCategory);
    }


    // --- עסקאות ---
    @PostMapping("/add")
    public Transaction addTransaction(@RequestBody Transaction transaction, @RequestParam Long userId) {
        User user = new User();
        user.setId(userId);
        transaction.setUser(user);
        return transactionRepository.save(transaction);
    }

    @DeleteMapping("/transaction/{id}")
    public void deleteTransaction(@PathVariable Long id) {
        transactionRepository.deleteById(id);
    }



    @GetMapping("/history")
    public List<Transaction> getAllTransactions(@RequestParam Long userId) {
        return transactionRepository.findAllByUserId(userId);
    }



    @GetMapping("/category-breakdown")
    public List<Map<String, Object>> getCategoryBreakdown(@RequestParam Long userId, @RequestParam String month) {
        // month format: "2026-01"
        List<Transaction> allTransactions = transactionRepository.findAllByUserId(userId);

        // מפה לשמירת הסכום לכל קטגוריה
        Map<String, Double> categorySum = new HashMap<>();

        for (Transaction t : allTransactions) {
            // סינון לפי החודש המבוקש ולפי הוצאות בלבד
            if (t.getDate().toString().startsWith(month) && t.getAmount().doubleValue() < 0) {
                String catName = t.getCategory() != null ? t.getCategory().getName() : "אחר";
                // המרה לחיובי וסכימה
                double amount = Math.abs(t.getAmount().doubleValue());
                categorySum.put(catName, categorySum.getOrDefault(catName, 0.0) + amount);
            }
        }

        // המרה לרשימה שהגרף ב-React יודע לקרוא
        List<Map<String, Object>> result = new ArrayList<>();
        // צבעים קבועים לגרף (אפשר גם לשלוף את צבע הקטגוריה מה-DB אם רוצים לדייק)
        String[] colors = {"#6366f1", "#ec4899", "#8b5cf6", "#f59e0b", "#10b981", "#3b82f6"};
        int colorIndex = 0;

        for (Map.Entry<String, Double> entry : categorySum.entrySet()) {
            Map<String, Object> item = new HashMap<>();
            item.put("name", entry.getKey());
            item.put("value", entry.getValue());
            item.put("color", colors[colorIndex % colors.length]); // מחזוריות צבעים
            result.add(item);
            colorIndex++;
        }

        return result;
    }

    // --- שליפת עסקאות לפי חודש ספציפי (לרשימה למטה) ---
    @GetMapping("/monthly-transactions")
    public List<Transaction> getMonthlyTransactions(@RequestParam Long userId, @RequestParam String month) {
        List<Transaction> all = transactionRepository.findAllByUserId(userId);
        List<Transaction> filtered = new ArrayList<>();
        for (Transaction t : all) {
            if (t.getDate().toString().startsWith(month)) {
                filtered.add(t);
            }
        }
        // מיון לפי תאריך (מהחדש לישן)
        filtered.sort((t1, t2) -> t2.getDate().compareTo(t1.getDate()));
        return filtered;
    }
}