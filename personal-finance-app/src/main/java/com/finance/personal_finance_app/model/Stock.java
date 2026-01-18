package com.finance.personal_finance_app.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "stocks")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Stock {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // קישור למשתמש - כדי שנדע של מי המניה הזו
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private String ticker; // הסימול של המניה (למשל: AAPL, TSLA)

    @Column(nullable = false)
    private Double quantity; // כמות המניות שיש למשתמש

    @Column(name = "average_buy_price")
    private Double averageBuyPrice; // מחיר קנייה ממוצע (כדי שנוכל לחשב רווח/הפסד)
}