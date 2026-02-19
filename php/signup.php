<?php
// php/signup.php
require_once 'dbConnection.php';
require_once 'jwt_helper.php'; 

header("Content-Type: application/json");

// Check Request Method
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(["error" => "Invalid Request Method"]);
    exit;
}

try {
    // 1. Sanitize & Get Common Data
    $userType = $_POST['userType'] ?? '';
    $fullName = trim($_POST['fullName'] ?? '');
    $cnic = trim($_POST['cnic'] ?? '');
    $email = trim($_POST['email'] ?? '');
    $phone = trim($_POST['phone'] ?? '');
    $password = $_POST['password'] ?? '';

    // Basic Validation
    if (!$fullName || !$email || !$password || !$userType || !$cnic) {
        throw new Exception("Missing required fields.");
    }

    // Check if Email Exists
    $stmt = $conn->prepare("SELECT user_id FROM users WHERE email = ?");
    $stmt->execute([$email]);
    if ($stmt->rowCount() > 0) {
        throw new Exception("Email is already registered.");
    }

    // Check if CNIC Exists (Optional but recommended)
    $stmt = $conn->prepare("SELECT user_id FROM users WHERE cnic = ?");
    $stmt->execute([$cnic]);
    if ($stmt->rowCount() > 0) {
        throw new Exception("CNIC is already registered.");
    }

    // 2. Start Transaction (Safety Net)
    $conn->beginTransaction();

    // 3. Insert into USERS table
    $hashedPass = password_hash($password, PASSWORD_BCRYPT);
    
    $sqlUser = "INSERT INTO users (user_name, cnic, email, ph_no, password, role) VALUES (?, ?, ?, ?, ?, ?)";
    $stmtUser = $conn->prepare($sqlUser);
    $stmtUser->execute([$fullName, $cnic, $email, $phone, $hashedPass, $userType]);
    
    // Get the new ID
    $newUserId = $conn->lastInsertId();

    // 4. Handle Specific Role Data
    if ($userType === 'farmer') {
        $location = $_POST['farmLocation'] ?? '';
        $size = $_POST['farmSize'] ?? '';
        $city = $_POST['city'] ?? '';
        
        // Upload Registry File
        $registryPath = null;
        if (isset($_FILES['registryFile']) && $_FILES['registryFile']['error'] === UPLOAD_ERR_OK) {
            $registryPath = uploadFile($_FILES['registryFile'], 'registries');
        }

        $sqlFarmer = "INSERT INTO farmers (user_id, farm_location, farm_size, city, registry_file_name) VALUES (?, ?, ?, ?, ?)";
        $stmtFarmer = $conn->prepare($sqlFarmer);
        $stmtFarmer->execute([$newUserId, $location, $size, $city, $registryPath]);

    } elseif ($userType === 'buyer') {
        $buyerType = $_POST['buyerType'] ?? '';
        $compName = $_POST['companyName'] ?? '';
        $compAddr = $_POST['companyAddress'] ?? '';
        $compType = !empty($_POST['companyType']) ? $_POST['companyType'] : null;
        
        // Upload Business Doc (Optional)
        $docPath = null;
        if (isset($_FILES['businessDoc']) && $_FILES['businessDoc']['error'] === UPLOAD_ERR_OK) {
            $docPath = uploadFile($_FILES['businessDoc'], 'business_docs');
        }

        $sqlBuyer = "INSERT INTO buyers (user_id, buyer_type, company_name, company_address, company_type, document_path) VALUES (?, ?, ?, ?, ?, ?)";
        $stmtBuyer = $conn->prepare($sqlBuyer);
        $stmtBuyer->execute([$newUserId, $buyerType, $compName, $compAddr, $compType, $docPath]);
    }

    // 5. Commit Transaction (Save All)
    $conn->commit();

    // 6. Generate Token for Auto-Login
    $tokenPayload = [
        "user_id" => $newUserId,
        "role" => $userType,
        "exp" => time() + (86400 * 1) // 1 day
    ];
    $token = generate_jwt($tokenPayload);

    echo json_encode([
        "success" => true,
        "message" => "Account created successfully!",
        "token" => $token,
        "role" => $userType
    ]);

} catch (Exception $e) {
    // If ANY error happens, undo the User Insert
    if ($conn->inTransaction()) {
        $conn->rollBack();
    }
    // Delete uploaded file if it exists (cleanup)
    // (You can add logic here to unlink files if db insert failed)
    
    http_response_code(500); // Server Error
    echo json_encode(["success" => false, "error" => $e->getMessage()]);
}

// --- Helper Function: Secure File Upload ---
function uploadFile($file, $subFolder) {
    // 1. Define Target Directory
    $targetDir = "../uploads/" . $subFolder . "/";
    if (!is_dir($targetDir)) {
        mkdir($targetDir, 0777, true);
    }

    // 2. Validate File Type (Security)
    $allowedTypes = ['jpg', 'jpeg', 'png', 'pdf', 'webp'];
    $fileExt = strtolower(pathinfo($file["name"], PATHINFO_EXTENSION));
    
    if (!in_array($fileExt, $allowedTypes)) {
        throw new Exception("Invalid file type. Only JPG, PNG, PDF allowed.");
    }

    // 3. Validate Size (5MB)
    if ($file["size"] > 5 * 1024 * 1024) {
        throw new Exception("File too large. Max 5MB allowed.");
    }

    // 4. Generate Unique Name (Prevent overwrite)
    $newFileName = uniqid() . "_" . time() . "." . $fileExt;
    $targetFilePath = $targetDir . $newFileName;

    // 5. Move File
    if (move_uploaded_file($file["tmp_name"], $targetFilePath)) {
        // Return relative path for database
        return "uploads/" . $subFolder . "/" . $newFileName;
    } else {
        throw new Exception("Failed to upload file.");
    }
}
?>