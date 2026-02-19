<?php
$host = "localhost";
$db_name = "farm_bidding_db";

$username = "farm_user"; 
$password = "user@1234"; 

try {
    // 1. Create the connection
    $conn = new PDO("mysql:host=$host;dbname=$db_name", $username, $password);

    // 2. Set Error Mode to Exception (Crucial for debugging SQL errors)
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // 3. Set Default Fetch Mode to Associative Array
    // This means $row['auc_name'] instead of $row[0]
    $conn->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);

    $sqlAutoClose = "UPDATE auctions 
                     SET auc_status = 'Expired' 
                     WHERE end_time <= NOW() 
                     AND auc_status = 'active'";
    $conn->query($sqlAutoClose);

} catch(PDOException $e) {
    // 4. Handle Connection Errors
    // We send a JSON error so your JavaScript .fail() function catches it
    header('Content-Type: application/json');
    echo json_encode(["error" => "Database Connection Failed: " . $e->getMessage()]);
    exit();
}
?>