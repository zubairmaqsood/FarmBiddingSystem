<?php 
    require_once 'dbConnection.php';
    header("Content-Type: application/json");
    require_once 'jwt_helper.php';
    
    $input = $_POST; 
    if (empty($input)) {
        // If $_POST is empty, try reading raw JSON input
        $rawInput = file_get_contents('php://input');
        $input = json_decode($rawInput, true);
    }

    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    
    // Check if 'action' exists in the POST data
    if (!isset($_POST['action'])) {
        echo json_encode(["error" => "No action specified"]);
        exit;
    }

    // Router Switch
    switch ($_POST['action']) {
        case 'verify_token':
            handleTokenVerification();
            break;

        case 'place_bid':
            handlePlaceBid($conn);
            break;

        default:
            echo json_encode(["error" => "Invalid action"]);
            break;
    }
    exit; // Stop execution after handling POST
}

     if($_SERVER['REQUEST_METHOD'] === 'GET'){
        try{
            $aucId = isset($_GET['id']) ? $_GET['id'] : null;
            if($aucId){
                $sql = "select auctions.auc_title,
                        auctions.auc_desc,
                        auctions.image_path,
                        auctions.auc_qty,
                        auctions.base_price,
                        auctions.auc_status,
                        auctions.highest_bid,
                        auctions.end_time,
                        auctions.bid_count,
                        auctions.highest_bidder_id,
                        farmers.city,
                        farmers.farm_location,
                        users.user_name as farmer_name,
                        users.ph_no,
                        highest_bidder.user_name as highest_bidder_name
                        from auctions
                        join farmers on auctions.user_id = farmers.user_id
                        join users on auctions.user_id = users.user_id
                        LEFT JOIN users AS highest_bidder ON auctions.highest_bidder_id = highest_bidder.user_id 
                        where auc_id = ?";

                $stmt = $conn->prepare($sql);
                $stmt->execute([$aucId]);
                $result = $stmt->fetch();
                if($result){
                    // Fix Image Path
                    if (strpos($result['image_path'], '../img/') === false) {
                        $result['image_path'] = "../img/" . $result['image_path'];
                    }
                    echo json_encode($result);
                }
                else{
                    echo json_encode(["error" => "Auction not found"]);
                }
            }
            else{
                echo json_encode(["error" => "Auction ID is required"]);;
                exit;
            }
        }catch (Exception $e) {
            http_response_code(500); 
            echo json_encode(["error" => "Server Error: " . $e->getMessage()]);
        }   
    }

    function handleTokenVerification() {
    // 1. Get Token from Header OR POST body
    $headers = apache_request_headers();
    $authHeader = $headers['Authorization'] ?? $_SERVER['HTTP_AUTHORIZATION'] ?? '';
    $token = str_replace('Bearer ', '', $authHeader);

    // Fallback: If header failed, check POST body
    if (!$token && isset($_POST['token'])) {
        $token = $_POST['token'];
    }

    if (!$token) {
        echo json_encode(["success" => false, "error" => "Token missing"]);
        return;
    }

    // 2. Verify Token
    $decoded = validate_jwt($token); // From jwt_helper.php

    if ($decoded && isset($decoded->role)) {
        echo json_encode([
            "success" => true, 
            "role" => $decoded->role,
            "user_id" => $decoded->user_id
        ]);
    } else {
        http_response_code(401);
        echo json_encode(["success" => false, "error" => "Invalid token"]);
    }
}

function handlePlaceBid($conn) {
    // 1. Get Data
    $aucId = $_POST['auc_id'] ?? null;
    $bidAmount = $_POST['bid_amount'] ?? null;
    
    // Ideally, get user_id from the token (secure way), 
    // but for now, we'll accept it from POST or session if that's your setup.
    // $userId = $_POST['user_id']; 

    if (!$aucId || !$bidAmount) {
        echo json_encode(["error" => "Invalid input data"]);
        return;
    }

    $headers = apache_request_headers();
    $authHeader = $headers['Authorization'] ?? $_SERVER['HTTP_AUTHORIZATION'] ?? '';
    $token = str_replace('Bearer ', '', $authHeader);

    // Validate Token
    $decoded = validate_jwt($token); // From jwt_helper.php

    if (!$decoded || !isset($decoded->user_id)) {
        http_response_code(401);
        echo json_encode(["error" => "Unauthorized: Please login to bid."]);
        return;
    }

    $userId = $decoded->user_id;

    try {
        $conn->beginTransaction();

        // 2. Update the 'Auctions' table (The "Cache" for speed)
        $sqlUpdate = "UPDATE auctions 
                      SET highest_bid = ?, 
                          bid_count = bid_count + 1, 
                          highest_bidder_id = ? 
                      WHERE auc_id = ? 
                      AND highest_bid < ? 
                      AND end_time > NOW()";
        
        $stmt = $conn->prepare($sqlUpdate);
        $stmt->execute([$bidAmount, $userId, $aucId, $bidAmount]);

        // 3. Check if the update actually happened (User successfully outbid the previous)
        if ($stmt->rowCount() > 0) {
            
            // 4. Insert into 'Bids' table (The "History" for records)
            // Assuming your table is named 'bids' and has columns: auc_id, user_id, bid_amount
            $sqlInsert = "INSERT INTO bids (auc_id, user_id, bid_price) VALUES (?, ?, ?)";
            $stmtInsert = $conn->prepare($sqlInsert);
            $stmtInsert->execute([$aucId, $userId, $bidAmount]);

            // 5. COMMIT (Save both changes permanently)
            $conn->commit();
            $stmtName = $conn->prepare("SELECT user_name FROM users WHERE user_id = ?");
            $stmtName->execute([$userId]);
            $userRow = $stmtName->fetch();
            $bidderName = $userRow['user_name'] ?? 'Unknown User';
            
            // 6. Return Success AND the Name
            echo json_encode([
                "success" => true, 
                "message" => "Bid Placed",
                "bidder_name" => $bidderName // <--- Send this to JS
            ]);
            
        } else {
            // Update failed (maybe price changed, or auction ended)
            $conn->rollBack(); 
            echo json_encode(["error" => "Bid must be higher than current highest bid"]);
        }
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(["error" => "Server Error: " . $e->getMessage()]);
    }
}
?>