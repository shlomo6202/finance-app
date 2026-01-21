package com.finance.personal_finance_app.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "portfolio_history")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PortfolioSnapshot {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnore
    private User user;

    @Column(nullable = false)
    private LocalDate snapshotDate; // התאריך של ה"צילום"

    @Column(nullable = false)
    private BigDecimal totalValueUsd;// כמה התיק היה שווה באותו רגע (בדולרים)

    @Column(name = "total_invested")
    private BigDecimal totalInvested;
}