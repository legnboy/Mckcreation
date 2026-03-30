package com.mckcreation.be_app.service;

import com.mckcreation.be_app.dto.PlacedOrderDTO;
import com.mckcreation.be_app.dto.responses.PlacedOrdersAndCountDTO;
import com.mckcreation.be_app.dto.responses.SalesSummaryDTO;
import com.mckcreation.be_app.model.PlacedOrder;
import org.springframework.data.domain.Page;

import java.util.List;

public interface PlacedOrderService {

    List<PlacedOrder> getPlacedOrders();

    List<PlacedOrder> getAllUserPlacedOrders(int id);

    PlacedOrdersAndCountDTO getUserPlacedOrders(long id, int page, int size);

    PlacedOrder createPlacedOrder(PlacedOrderDTO placedOrderDTO, boolean useDefaultAddress);

    Page<PlacedOrder> getPlacedOrders(int page, int size);
    SalesSummaryDTO getSalesSummary();
}
