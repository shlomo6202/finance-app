package com.finance.personal_finance_app.model;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnore;

@Entity
@Table(name = "credit_cards")
public class CreditCard {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    // מיפוי מדויק לעמודה ב-SQL
    @Column(name = "last4digits")
    private String last4Digits;

    private Double balance;

    // מיפוי מדויק לעמודה ב-SQL (עם קו תחתון)
    @Column(name = "limit_amount")
    private Double limitAmount;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnore
    private User user;

    public CreditCard() {}

    public CreditCard(String name, String last4Digits, Double balance, Double limitAmount, User user) {
        this.name = name;
        this.last4Digits = last4Digits;
        this.balance = balance;
        this.limitAmount = limitAmount;
        this.user = user;
    }

    // Getters & Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getLast4Digits() { return last4Digits; }
    public void setLast4Digits(String last4Digits) { this.last4Digits = last4Digits; }

    public Double getBalance() { return balance; }
    public void setBalance(Double balance) { this.balance = balance; }

    public Double getLimitAmount() { return limitAmount; }
    public void setLimitAmount(Double limitAmount) { this.limitAmount = limitAmount; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
}