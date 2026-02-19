<?php
require_once 'dbConnection.php';
require_once 'jwt_helper.php';

header("Content-Type: application/json");

try {
    // 1. Authenticate
   $authHeader = null;
    
    if (isset($_SERVER['HTTP_AUTHORIZATION'])) {
        $authHeader = $_SERVER['HTTP_AUTHORIZATION'];
    } elseif (isset($_SERVER['REDIRECT_HTTP_AUTHORIZATION'])) {
        $authHeader = $_SERVER['REDIRECT_HTTP_AUTHORIZATION'];
    } elseif (function_exists('apache_request_headers')) {
        $headers = apache_request_headers();
        // Handle case-sensitivity issues in headers
        $headers = array_change_key_case($headers, CASE_LOWER);
        if (isset($headers['authorization'])) {
            $authHeader = $headers['authorization'];
        }
    }
    
    if (!preg_match('/Bearer\s(\S+)/', $authHeader, $matches)) {
        throw new Exception("No token provided");
    }
    
    $decoded = validate_jwt($matches[1]);
    if (!$decoded) throw new Exception("Invalid token");

    $userId = $decoded->user_id;
    $role = $decoded->role;
    $results = []; // Default empty array

    // 2. Query Based on Role
    if ($role === 'buyer') {
        // --- SCENARIO A: BUYER ---
        $sql = "SELECT 
                    a.auc_id, 
                    a.auc_title, 
                    a.auc_status, 
                    a.highest_bid, 
                    a.highest_bidder_id,
                    MAX(b.bid_price) as my_bid,
                    u.user_name as farmer_name
                FROM bids b
                JOIN auctions a ON b.auc_id = a.auc_id
                JOIN users u ON a.user_id = u.user_id
                WHERE b.user_id = ?
                GROUP BY a.auc_id
                ORDER BY b.bid_time DESC";
                
        $stmt = $conn->prepare($sql);
        $stmt->execute([$userId]);
        $results = $stmt->fetchAll(PDO::FETCH_ASSOC);

    } else {
        // --- SCENARIO B: FARMER ---
        $sql = "SELECT 
                    auc_id, 
                    auc_title, 
                    auc_status, 
                    highest_bid, 
                    start_time, 
                    end_time 
                FROM auctions 
                WHERE user_id = ? 
                ORDER BY start_time DESC";

        $stmt = $conn->prepare($sql);
        $stmt->execute([$userId]);
        $results = $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    // 3. SEND SUCCESS RESPONSE
    // We wrap the results so the frontend always sees "success: true"
    // even if 'data' is an empty array [].
    echo json_encode([
        "success" => true,
        "data" => $results
    ]);

} catch (Exception $e) {
    // 4. SEND ERROR RESPONSE
    http_response_code(401); // Or 500 depending on error type
    echo json_encode([
        "success" => false, 
        "error" => $e->getMessage()
    ]);
}
?>