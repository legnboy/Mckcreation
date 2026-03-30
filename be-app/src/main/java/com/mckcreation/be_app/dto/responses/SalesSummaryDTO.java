package com.mckcreation.be_app.dto.responses;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SalesSummaryDTO {
    private double dailySales;
    private double monthlySales;
    private double yearlySales;
    private double allTimeSales;
}