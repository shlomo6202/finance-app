package com.finance.personal_finance_app.model;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnore;
import java.util.List;

@Entity
@Table(name = "categories")
public class Category {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    // שדות חדשים לפי התמונה שלך ב-SQL
    private String color; // Hex code (e.g., #FF5733)

    @Column(name = "icon_name")
    private String iconName;

    // קטגוריה יכולה להיות גלובלית (user_id = null) או אישית
    @ManyToOne
    @JoinColumn(name = "user_id")
    @JsonIgnore // שלא יחזיר את כל פרטי היוזר עם הקטגוריה
    private User user;

    @OneToMany(mappedBy = "category")
    @JsonIgnore
    private List<Transaction> transactions;

    // בנאים
    public Category() {}

    public Category(String name, String color, User user) {
        this.name = name;
        this.color = color;
        this.user = user;
    }

    // Getters & Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getColor() { return color; }
    public void setColor(String color) { this.color = color; }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
}