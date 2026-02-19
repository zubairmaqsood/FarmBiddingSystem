<?php
require_once 'dbConnection.php';
require_once 'jwt_helper.php'; 

header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(["error" => "Invalid Request Method"]);
    exit;
}

// 1. Get Inputs
$email = trim($_POST['email'] ?? '');
$password = $_POST['password'] ?? '';

if (empty($email) || empty($password)) {
    echo json_encode(["error" => "Email and Password are required."]);
    exit;
}

try {
    // 2. Fetch User from DB
    $stmt = $conn->prepare("SELECT user_id, user_name, password, role FROM users WHERE email = ?");
    $stmt->execute([$email]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    // 3. Verify User Exists & Password is Correct
    // Note: We use password_verify() because we hashed it with password_hash() in signup
    if ($user && password_verify($password, $user['password'])) {
        
        // 4. Generate Token
        $payload = [    
            "user_id" => $user['user_id'],
            "role" => $user['role'],
        ];
        
        $token = generate_jwt($payload);

        // 5. Send Success Response
        echo json_encode([
            "success" => true,
            "token" => $token,
            "role" => $user['role'],
            "user_name" => $user['user_name']
        ]);

    } else {
        // Generic error message for security (don't say "User not found")
        echo json_encode(["error" => "Invalid email or password."]);
    }

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["error" => "Server Error: " . $e->getMessage()]);
}
?>