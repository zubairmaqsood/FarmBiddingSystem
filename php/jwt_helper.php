<?php
// CHANGE THIS TO MATCH YOUR LOGIN.PHP KEY EXACTLY
define('SECRET_KEY', '12345'); 

// 1. FUNCTION TO CREATE TOKEN (Used in Signup/Login)
function generate_jwt($payload) {
    $header = json_encode(['typ' => 'JWT', 'alg' => 'HS256']);
    
    // Base64Url Encode Header & Payload
    $base64UrlHeader = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($header));
    $base64UrlPayload = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode(json_encode($payload)));
    
    // Create Signature
    $signature = hash_hmac('sha256', $base64UrlHeader . "." . $base64UrlPayload, SECRET_KEY, true);
    $base64UrlSignature = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($signature));
    
    // Join all 3 parts
    return $base64UrlHeader . "." . $base64UrlPayload . "." . $base64UrlSignature;
}

function validate_jwt($token) {
    $parts = explode('.', $token);
    if (count($parts) !== 3) return false;

    $header = $parts[0];
    $payload = $parts[1];
    $signature_provided = $parts[2];

    // Re-create the signature to check if it matches
    $base64UrlHeader = str_replace(['+', '/', '='], ['-', '_', ''], $header);
    $base64UrlPayload = str_replace(['+', '/', '='], ['-', '_', ''], $payload);
    
    // Create Signature using same secret
    $signature_check = hash_hmac('sha256', $header . "." . $payload, SECRET_KEY, true);
    $base64UrlSignatureCheck = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($signature_check));

    if ($base64UrlSignatureCheck === $signature_provided) {
        // Signature matches! Decode payload
        $jsonPayload = base64_decode(str_replace(['-', '_'], ['+', '/'], $payload));
        return json_decode($jsonPayload);
    }
    
    return false; // Signature mismatch
}
?>