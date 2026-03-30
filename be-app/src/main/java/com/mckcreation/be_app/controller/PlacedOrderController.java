package com.mckcreation.be_app.controller;

import com.mckcreation.be_app.dto.responses.SalesSummaryDTO;
import com.mckcreation.be_app.model.PlacedOrder;
import com.mckcreation.be_app.model.User;
import com.mckcreation.be_app.service.PlacedOrderService;
import com.mckcreation.be_app.service.ShippingService;
import com.mckcreation.be_app.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/placed-orders")
public class PlacedOrderController {

    PlacedOrderService placedOrderService;
    ShippingService shippingService;
    UserService userService;

    @Autowired
    public PlacedOrderController(PlacedOrderService placedOrderService, ShippingService shippingService,
                                 UserService userService) {
        this.placedOrderService = placedOrderService;
        this.shippingService = shippingService;
        this.userService = userService;
    }

    @GetMapping
    public ResponseEntity<Page<PlacedOrder>> getPlacedOrders(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Page<PlacedOrder> placedOrders = placedOrderService.getPlacedOrders(page, size);
        return ResponseEntity.ok(placedOrders);
    }

    @GetMapping("/sales-summary")
    public ResponseEntity<SalesSummaryDTO> getSalesSummary() {
        SalesSummaryDTO salesSummary = placedOrderService.getSalesSummary();
        return ResponseEntity.ok(salesSummary);
    }

    @GetMapping("/get-user-orders")
    public ResponseEntity<?> getUserPlacedOrders(@AuthenticationPrincipal UserDetails userDetails,
                                                 @RequestParam(defaultValue = "0") int page,
                                                 @RequestParam(defaultValue = "10") int size,
                                                 @RequestParam(defaultValue = "false") boolean retrieveAll) {

        String email = userDetails.getUsername();

        User user = userService.getUserByEmail(email);

        if(retrieveAll) {
            return new ResponseEntity<>(
                    placedOrderService.getAllUserPlacedOrders((int) user.getId()),
                    HttpStatus.OK
            );
        }

        return new ResponseEntity<>(
                placedOrderService.getUserPlacedOrders(user.getId(), page, size),
                HttpStatus.OK);
    }
}
