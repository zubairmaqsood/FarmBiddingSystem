<?php
// php/homepage.php

// 1. Set Header to tell the browser "I am sending JSON, not HTML"
header('Content-Type: application/json');

// 2. Include database connection
require_once 'dbConnection.php';

//it runs for on every page load to update expired auctions
$expireSql = "UPDATE auctions 
              SET auc_status = 'expired' 
              WHERE end_time < NOW() AND auc_status = 'Live'";
$conn->exec($expireSql);

if($_SERVER['REQUEST_METHOD'] === 'GET'){

    try {    
        $sql = "SELECT 
                    auc_id,
                    auc_title, 
                    auc_qty,
                    base_price, 
                    highest_bid,
                    bid_count, 
                    end_time,    
                    image_path       
                FROM auctions 
                where auc_status = 'Live'
                AND end_time > NOW()
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
}          
?>