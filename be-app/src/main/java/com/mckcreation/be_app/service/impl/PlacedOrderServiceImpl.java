package com.mckcreation.be_app.service.impl;

import com.mckcreation.be_app.dto.PlacedOrderDTO;
import com.mckcreation.be_app.dto.responses.PlacedOrdersAndCountDTO;
import com.mckcreation.be_app.dto.responses.SalesSummaryDTO;
import com.mckcreation.be_app.model.PlacedOrder;
import com.mckcreation.be_app.model.Shipping;
import com.mckcreation.be_app.model.User;
import com.mckcreation.be_app.repository.OrderRepository;
import com.mckcreation.be_app.repository.PlacedOrderRepository;
import com.mckcreation.be_app.repository.ShippingRepository;
import com.mckcreation.be_app.repository.UserRepository;
import com.mckcreation.be_app.service.EmailService;
import com.mckcreation.be_app.service.PlacedOrderService;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.util.Date;
import java.util.List;

@Service
public class PlacedOrderServiceImpl implements PlacedOrderService {

    PlacedOrderRepository placedOrderRepository;
    OrderRepository orderRepository;
    ShippingRepository shippingRepository;
    UserRepository userRepository;

    EmailService emailService;

    @Autowired
    public PlacedOrderServiceImpl(PlacedOrderRepository placedOrderRepository, ShippingRepository shippingRepository,
                                  UserRepository userRepository, OrderRepository orderRepository, EmailService emailService) {
       this.placedOrderRepository = placedOrderRepository;
       this.shippingRepository = shippingRepository;
       this.userRepository = userRepository;
       this.orderRepository = orderRepository;
       this.emailService = emailService;
    }

    public PlacedOrder createPlacedOrder(PlacedOrderDTO placedOrderDTO, boolean useDefaultAddress) {

        User user = userRepository.findById(placedOrderDTO.getUserID())
                .orElseThrow(() -> new EntityNotFoundException("User not found"));

        Shipping shipping = useDefaultAddress
                ? shippingRepository.getUserShipping(placedOrderDTO.getUserID())
                .orElseThrow(() -> new EntityNotFoundException("Shipping address not found"))
                : shippingRepository.save(Shipping.builder()
                .address(placedOrderDTO.getShippingDTO().getAddress())
                .city(placedOrderDTO.getShippingDTO().getCity())
                .state(placedOrderDTO.getShippingDTO().getState())
                .zipCode(placedOrderDTO.getShippingDTO().getZipCode())
                .build());

        Date date = new Date();
        Timestamp timestamp = new Timestamp(date.getTime());

        PlacedOrder placedOrder = PlacedOrder.builder()
                .orderDescription(placedOrderDTO.getDetails())
                .amount(placedOrderDTO.getTotal())
                .status(placedOrderDTO.getStatus())
                .shipping(shipping)
                .user(user)
                .orderDate(LocalDateTime.now()) // Assuming current time as order date
                .build();

        PlacedOrder savedPlacedOrder = placedOrderRepository.save(placedOrder);

        orderRepository.deleteUserOrders(user.getId());

        emailService.sendEmail(
                savedPlacedOrder.getUser().getEmail(),
                "Your Order Confirmation",
                buildOrderConfirmationEmail(placedOrderDTO)
        );

        return savedPlacedOrder;
    }


    @Override
    public List<PlacedOrder> getPlacedOrders() {
        return placedOrderRepository.findAll();
    }

    @Override
    public List<PlacedOrder> getAllUserPlacedOrders(int id) {
        return placedOrderRepository.findAllUserPlacedOrders(id);
    }

    @Override
    public PlacedOrdersAndCountDTO getUserPlacedOrders(long id, int page, int size) {

        return PlacedOrdersAndCountDTO.builder()
                .placedOrderList(placedOrderRepository.findUserPlacedOrders(id, PageRequest.of(page, size)).getContent())
                .count(placedOrderRepository.countPlacedOrders())
                .build();
    }

    private String buildOrderConfirmationEmail(PlacedOrderDTO order) {

        String formattedItems = formatItems(order.getDetails());

        return """
        Thank you for your order!

        Order Details:
        -----------------------
        %s
        Total: $%.2f
        Status: %s

        Shipping Information:
        -----------------------
        Address: %s\n        City: %s\n        State: %s\n        Zip Code: %s

        We appreciate your business.
        McKCreation Team
        """.formatted(
                formattedItems,
                order.getTotal(),
                order.getStatus(),
                order.getShippingDTO().getAddress(),
                order.getShippingDTO().getCity(),
                order.getShippingDTO().getState(),
                order.getShippingDTO().getZipCode()
        );
    }

    private String formatItems(String rawItems) {
        // Remove the surrounding brackets [   ]
        String cleaned = rawItems.substring(1, rawItems.length() - 1);

        // Split by "OrderDTO(" occurrences
        String[] itemBlocks = cleaned.split("OrderDTO\\(");

        StringBuilder sb = new StringBuilder();
        int index = 1;

        for (String block : itemBlocks) {
            if (block.trim().isEmpty()) continue;

            // Remove ending ")" and any trailing commas
            block = block.replace(")", "").trim();
            if (block.endsWith(",")) block = block.substring(0, block.length() - 1);

            // Split fields: itemTitle=..., customization=..., price=...
            String[] fields = block.split(", ");

            String title = "", customization = "", price = "";

            for (String field : fields) {
                if (field.startsWith("itemTitle=")) {
                    title = field.replace("itemTitle=", "");
                } else if (field.startsWith("customization=")) {
                    customization = field.replace("customization=", "");
                } else if (field.startsWith("price=")) {
                    price = field.replace("price=", "");
                }
            }

            sb.append(String.format(
                    "Item %d:\n  - Title: %s\n  - Customization: %s\n  - Price: $%s\n\n",
                    index++, title, customization, price
            ));
        }

        return sb.toString();
    }


    // START of new methods for sales summary and pagination
    @Override
    public Page<PlacedOrder> getPlacedOrders(int page, int size) {
        PageRequest pageRequest = PageRequest.of(page, size);
        return placedOrderRepository.findAll(pageRequest);
    }

    @Override
    public SalesSummaryDTO getSalesSummary() {
        return new SalesSummaryDTO(
                placedOrderRepository.sumDailySales(),
                placedOrderRepository.sumMonthlySales(),
                placedOrderRepository.sumYearlySales(),
                placedOrderRepository.sumAllTimeSales()
        );
    }
    // END of new methods


}
