package com.finance.personal_finance_app.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.math.BigDecimal;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor // חשוב שיהיה Constructor ריק עבור Jackson (המערכת שהופכת אובייקט ל-JSON)
public class CategorySumDTO {

    private String categoryName;
    private BigDecimal totalAmount;
    private String color;
}
