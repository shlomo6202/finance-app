package com.finance.personal_finance_app.model;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnore;
import java.time.LocalDate;

@Entity
@Table(name = "fixed_expenses")
public class FixedExpense {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String description;
    private Double amount;

    @Column(name = "day_of_month")
    private int dayOfMonth; // 1-31

    @Column(name = "last_generated")
    private LocalDate lastGenerated;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnore
    private User user;

    @ManyToOne
    @JoinColumn(name = "category_id")
    private Category category;

    public FixedExpense() {}

    public FixedExpense(String description, Double amount, int dayOfMonth, User user) {
        this.description = description;
        this.amount = amount;
        this.dayOfMonth = dayOfMonth;
        this.user = user;
        this.lastGenerated = null; // בהתחלה עוד לא נוצר כלום
    }

    // Getters & Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public Double getAmount() { return amount; }
    public void setAmount(Double amount) { this.amount = amount; }
    public int getDayOfMonth() { return dayOfMonth; }
    public void setDayOfMonth(int dayOfMonth) { this.dayOfMonth = dayOfMonth; }
    public LocalDate getLastGenerated() { return lastGenerated; }
    public void setLastGenerated(LocalDate lastGenerated) { this.lastGenerated = lastGenerated; }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    public Category getCategory() {return category;}
    public void setCategory(Category category) {this.category = category;}
}