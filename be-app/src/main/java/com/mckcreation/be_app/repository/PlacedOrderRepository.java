package com.mckcreation.be_app.repository;

import com.mckcreation.be_app.model.PlacedOrder;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PlacedOrderRepository extends JpaRepository<PlacedOrder, Long> {
    @Query("SELECT o FROM PlacedOrder o WHERE o.user.id = :userId")
    List<PlacedOrder> findAllUserPlacedOrders(@Param("userId") int userId);

    @Query("SELECT o FROM PlacedOrder o WHERE o.user.id = :userId")
    Page<PlacedOrder> findUserPlacedOrders(@Param("userId") long userId, Pageable pageable);

    @Query("SELECT count(o) FROM PlacedOrder o")
    long countPlacedOrders();
}