<?php
// 1. Include Database & JWT Helper
require_once 'dbConnection.php';
require_once 'jwt_helper.php'; // Ensure this file has validate_jwt() function

// 2. Set Headers
header("Content-Type: application/json");

// 3. Verify Request Method
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405); // Method Not Allowed
    echo json_encode(["success" => false, "error" => "Invalid Request Method"]);
    exit;
}

// 4. AUTHENTICATION (Check JWT Token)
try {
    $headers = apache_request_headers();
    $authHeader = $headers['Authorization'] ?? $_SERVER['HTTP_AUTHORIZATION'] ?? '';
    
    // Extract token (remove "Bearer " prefix)
    if (!preg_match('/Bearer\s(\S+)/', $authHeader, $matches)) {
        throw new Exception("No token provided");
    }
    
    $token = $matches[1];
    $decoded = validate_jwt($token); // This function should return user object or false

    if (!$decoded || $decoded->role !== 'farmer') {
        http_response_code(403); // Forbidden
        throw new Exception("Unauthorized access. Only Farmers can create auctions.");
    }

    $userId = $decoded->user_id; // Get ID from token

} catch (Exception $e) {
    http_response_code(401);
    echo json_encode(["success" => false, "error" => $e->getMessage()]);
    exit;
}

// 5. PROCESS FORM DATA
try {
    // A. Sanitize Inputs
    $title = trim($_POST['auc_title'] ?? '');
    $price = floatval($_POST['base_price'] ?? 0);
    $qty = floatval($_POST['auc_qty'] ?? 0);
    $desc = trim($_POST['auc_desc'] ?? '');
    $endTimeInput = $_POST['end_time'] ?? '';

    // B. Validate Inputs
    if (empty($title) || strlen($title) < 3) throw new Exception("Item Name is too short.");
    if ($price <= 0) throw new Exception("Price must be greater than 0.");
    if ($qty <= 0) throw new Exception("Quantity must be greater than 0.");
    if (empty($desc) || strlen($desc) < 10) throw new Exception("Description is too short.");
    if (empty($endTimeInput)) throw new Exception("End Date is required.");

    // C. Validate Date (Strict 15-Day Logic)
   $timestamp = strtotime($endTimeInput);
    if ($timestamp === false) throw new Exception("Invalid date format.");

    // Get the timestamp for Midnight (00:00:00) 15 days from now
    $minAllowedTime = strtotime(date('Y-m-d 00:00:00', strtotime('+15 days')));
    
    // Check if the user's date is before that midnight cutoff
    if ($timestamp < $minAllowedTime) { 
        throw new Exception("Auction end date must be at least 15 days from today.");
    }
    
    // Format for MySQL
    $formattedEndTime = date('Y-m-d H:i:s', $timestamp);

    // D. Handle Image Upload
    if (!isset($_FILES['item_image']) || $_FILES['item_image']['error'] !== UPLOAD_ERR_OK) {
        throw new Exception("Image upload failed or no image selected.");
    }

    $file = $_FILES['item_image'];
    $allowedTypes = ['jpg', 'jpeg', 'png', 'webp'];
    $fileExt = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));

    if (!in_array($fileExt, $allowedTypes)) {
        throw new Exception("Invalid file type. Only JPG, PNG, WEBP allowed.");
    }

    if ($file['size'] > 5 * 1024 * 1024) { // 5MB
        throw new Exception("File is too large (Max 5MB).");
    }

    // Ensure upload directory exists
    $uploadDir = "../uploads/";
    if (!is_dir($uploadDir)) {
        mkdir($uploadDir, 0777, true);
    }

    // Generate unique name to prevent overwriting
    $newFileName = uniqid("auc_", true) . "." . $fileExt;
    $destination = $uploadDir . $newFileName;

    if (!move_uploaded_file($file['tmp_name'], $destination)) {
        throw new Exception("Failed to move uploaded file.");
    }

    // E. Insert into Database
    // Note: 'start_time' is NOW(), 'auc_status' is 'Live'
    $sql = "INSERT INTO auctions (user_id, auc_title, auc_desc, image_path, auc_qty, base_price, end_time, auc_status) VALUES (?, ?, ?, ?, ?, ?, ?, 'Live')";

    $stmt = $conn->prepare($sql);
    $stmt->execute([
        $userId, 
        $title, 
        $desc, 
        $destination, // Save path like "../uploads/auctions/auc_123.jpg"
        $qty, 
        $price, 
        $formattedEndTime
    ]);

    // 6. Success Response
    echo json_encode([
        "success" => true,
        "message" => "Auction created successfully!",
        "auction_id" => $conn->lastInsertId()
    ]);

} catch (Exception $e) {
    // Delete uploaded image if DB insert failed (cleanup)
    if (isset($destination) && file_exists($destination)) {
        unlink($destination);
    }
    
    http_response_code(500);
    echo json_encode(["success" => false, "error" => $e->getMessage()]);
}
?>