
CREATE DATABASE IF NOT EXISTS farm_bidding_db;
USE farm_bidding_db;

-- 1. USERS TABLE (Supertype)
-- Holds data common to everyone. 'ph_no' is here for easier access.
CREATE TABLE users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    user_name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    ph_no VARCHAR(20),  -- Nullable (Admins can leave it empty)
    role ENUM('admin', 'farmer', 'buyer') NOT NULL,
    cnic varchar(15),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. FARMERS TABLE (Subtype)
-- 'user_id' is both PK and FK.
CREATE TABLE farmers (
    user_id INT PRIMARY KEY, 
    registry_file_name VARCHAR(100),
    city varchar(50) not null
    farm_location VARCHAR(100) not null,
    farm_size decimal(10,2) not null,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);  

-- 3. BUYERS TABLE (Subtype)
-- 'user_id' is both PK and FK.
CREATE TABLE buyers (
    user_id INT PRIMARY KEY,
    document_path VARCHAR(255),
    buyer_type enum('Individual', 'Wholesaler','Retailer','Exporter') NOT NULL,
    company_name VARCHAR(100),
    company_address VARCHAR(255),
    company_type enum("Private Limited","Public Limited","Partnership","Sole Proprietorship"),
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- 4. AUCTIONS TABLE
-- Links to a farmer (user_id)
CREATE TABLE auctions (
    auc_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL, -- This is the Farmer's ID
    auc_title VARCHAR(255) NOT NULL,
    auc_desc TEXT NOT NULL,
    image_path VARCHAR(255),
    auc_qty DECIMAL(10,2) NOT NULL,
    base_price DECIMAL(10,2) NOT NULL,
    auc_status ENUM('Live', 'Expired') DEFAULT 'Live',
    highest_bid DECIMAL(10,2) DEFAULT 0.00,
    highest_bidder_id INT,
    start_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    end_time DATETIME NOT NULL,
    bid_count int not null default 0
    
    FOREIGN KEY (user_id) REFERENCES farmers(user_id) ON DELETE CASCADE
    FOREIGN KEY (highest_bidder_id) REFERENCES buyers(user_id)
);

-- 5. BIDS TABLE
-- Relationship between an Auction and a Buyer
CREATE TABLE bids (
    bid_id INT AUTO_INCREMENT PRIMARY KEY,
    auc_id INT NOT NULL,
    user_id INT NOT NULL, -- This is the Buyer's ID
    bid_price DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (auc_id) REFERENCES auctions(auc_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES buyers(user_id) ON DELETE CASCADE
);