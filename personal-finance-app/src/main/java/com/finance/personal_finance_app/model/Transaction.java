package com.finance.personal_finance_app.model;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "transactions")
public class Transaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String description;

    private BigDecimal amount; // שימוש ב-BigDecimal לדיוק כספי

    private LocalDate date;

    // --- קשר לקטגוריה ---
    @ManyToOne
    @JoinColumn(name = "category_id")
    @JsonIgnoreProperties("transactions") // מונע לולאה אינסופית ב-JSON
    private Category category;

    // --- קשר למשתמש (החלק החדש והחשוב!) ---
    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false) // עמודת המקשר ב-SQL
    @JsonIgnoreProperties("transactions") // מונע מהעסקה להדפיס את כל פרטי המשתמש שוב ושוב
    private User user;

    // --- בנאים (Constructors) ---

    public Transaction() {
    }

    public Transaction(String description, BigDecimal amount, LocalDate date, Category category, User user) {
        this.description = description;
        this.amount = amount;
        this.date = date;
        this.category = category;
        this.user = user;
    }

    // --- Getters & Setters ---

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

    public LocalDate getDate() {
        return date;
    }

    public void setDate(LocalDate date) {
        this.date = date;
    }

    public Category getCategory() {
        return category;
    }

    public void setCategory(Category category) {
        this.category = category;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }
}