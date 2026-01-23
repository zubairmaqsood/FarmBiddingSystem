<?php
// php/homepage.php

// 1. Set Header to tell the browser "I am sending JSON, not HTML"
header('Content-Type: application/json');

// 2. Include database connection
require_once 'db_connection.php';

try {
    
    $sql = "SELECT 
                auc_id,
                auc_title, 
                base_price, 
                highest_bid,
                bid_count, 
                end_time,    
                image_path       
            FROM auctions 
            ORDER BY end_time ASC";

    $stmt = $conn->prepare($sql);
    $stmt->execute();
    
    // 4. Fetch all results
    $products = $stmt->fetchAll();

    // 5. Optional: Fix Image Paths if DB only stores 'tomato.webp'
    // If your DB has 'tomato.webp', but JS needs '../img/tomato.webp'
    foreach ($products as &$item) {
        // Only add prefix if it's not already there
        if (strpos($item['image_path'], '../img/') === false) {
            $item['image_path'] = "../img/" . $item['image_path'];
        }
    }

    // 6. Return JSON
    echo json_encode($products);

} catch (Exception $e) {
    // Handle SQL Errors
    http_response_code(500);
    echo json_encode(["error" => $e->getMessage()]);
}
?>