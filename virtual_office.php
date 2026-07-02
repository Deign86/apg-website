<?php
// 1. Database Connection
$conn = new mysqli("localhost", "u501100418_alphapremierco", "ApG2025!", "u501100418_apg_database");
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// Create tables if they don't exist
$conn->query("CREATE TABLE IF NOT EXISTS property_reactions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    property_id INT NOT NULL,
    user_ip VARCHAR(45) NOT NULL,
    reaction_type VARCHAR(20) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_reaction (property_id, user_ip, reaction_type)
)");

$conn->query("CREATE TABLE IF NOT EXISTS property_comments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    property_id INT NOT NULL,
    user_name VARCHAR(100) NOT NULL,
    comment_text TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX (property_id)
)");

$conn->query("CREATE TABLE IF NOT EXISTS property_ratings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    property_id INT NOT NULL,
    user_ip VARCHAR(45) NOT NULL,
    rating INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_rating (property_id, user_ip)
)");

// 2. Fetch Virtual Office properties
$sql = "SELECT * FROM offerings_cards
        WHERE LOWER(TRIM(property_type)) IN ('virtual office', 'virtual_office')
        ORDER BY created_at DESC";
$result = $conn->query($sql);
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
    <link rel="icon" type="image/x-icon" href="assets/images/main/logo/logo-transparent.png" />
    <title>Virtual Offices | Alpha Premier</title>
    <link rel="stylesheet" href="https://unpkg.com/aos@2.3.1/dist/aos.css" />
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600;700&display=swap" />
    <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&display=swap" rel="stylesheet" />
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" />
    <meta name="color-scheme" content="dark">
    
    <style>
        :root { 
            --primary: #c5a059; 
            --accent: #c5a059; 
            --light: #ffffff; 
            --dark: #000000; 
            --card-bg: #0a0a0a;
            --fb-blue: #1877f2;
            --fb-gray: #f0f2f5;
            --fb-dark: #1c1e21;
            --fb-light: #ffffff;
        }
        
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body { 
            font-family: "Poppins", sans-serif; 
            background-color: var(--dark); 
            color: #e0e0e0; 
            overflow-x: hidden; 
        }
       
        header { 
            position: fixed; 
            top: 0; 
            left: 0; 
            width: 100%; 
            display: flex; 
            justify-content: space-between; 
            align-items: center; 
            padding: 10px 4%; 
            z-index: 1000; 
            background: rgba(0, 0, 0, 0.95); 
            backdrop-filter: blur(10px); 
            -webkit-backdrop-filter: blur(10px); 
            border-bottom: 1px solid rgba(197, 160, 89, 0.3); 
        }
        
        .logo img.header-logo { 
            height: 45px; 
            width: auto; 
            object-fit: contain; 
        }
        
        .mobile-menu-icon { 
            display: none; 
            color: var(--accent); 
            font-size: 1.8rem; 
            cursor: pointer; 
        }
        
        nav ul { 
            display: flex; 
            gap: 25px; 
            list-style: none; 
        }
        
        nav ul li a { 
            color: white; 
            text-decoration: none; 
            font-weight: 500; 
            font-size: 0.9rem; 
            transition: 0.3s; 
        }
        
        nav ul li a:hover, 
        nav ul li a.active { 
            color: var(--accent); 
        }
        
        nav ul li a.active { 
            border-bottom: 2px solid var(--accent); 
            padding-bottom: 5px; 
        }
       
        .property-hero { 
            min-height: 60vh; 
            display: flex; 
            flex-direction: column; 
            justify-content: center; 
            align-items: center; 
            background: linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.9)), url('assets/images/wow123.png') center/cover fixed; 
            text-align: center; 
            padding: 120px 5% 60px; 
        }
        
        .property-hero h1 { 
            font-family: 'Orbitron', sans-serif; 
            color: var(--accent); 
            font-size: clamp(1.5rem, 6vw, 3rem); 
            letter-spacing: 3px; 
            text-transform: uppercase; 
            margin-bottom: 20px; 
            text-shadow: 0 0 20px rgba(197, 160, 89, 0.3);
        }
       
        .hero-search-container { 
            position: relative; 
            width: 100%; 
            max-width: 600px; 
            margin-bottom: 40px;
        }
        
        .hero-search-container input { 
            width: 100%; 
            padding: 15px 20px 15px 50px; 
            border-radius: 50px; 
            background: rgba(20, 20, 20, 0.9); 
            border: 2px solid rgba(197, 160, 89, 0.3); 
            color: #fff; 
            outline: none; 
            font-size: 1rem; 
            transition: 0.3s; 
            backdrop-filter: blur(5px);
        }
        
        .hero-search-container input:focus {
            border-color: var(--accent);
            box-shadow: 0 0 20px rgba(197, 160, 89, 0.3);
        }
        
        .hero-search-container i { 
            position: absolute; 
            left: 20px; 
            top: 50%; 
            transform: translateY(-50%); 
            color: var(--accent); 
            font-size: 1.2rem;
        }

        /* Hero Description - BAGONG SECTION */
        .hero-description {
            max-width: 800px;
            margin: 0 auto;
            text-align: center;
            color: #fff;
        }

        .hero-description p {
            font-size: 1.2rem;
            line-height: 1.8;
            margin-bottom: 20px;
            color: #e0e0e0;
            font-weight: 300;
        }

        .hero-description p:first-of-type {
            font-size: 1.4rem;
            color: var(--accent);
            font-weight: 500;
            margin-bottom: 15px;
        }

        .hero-description p:last-of-type {
            font-size: 1.1rem;
            color: #c0c0c0;
            font-style: italic;
            border-top: 1px solid rgba(197, 160, 89, 0.3);
            padding-top: 25px;
            margin-top: 25px;
        }

        .hero-features {
            display: flex;
            justify-content: center;
            gap: 40px;
            margin-top: 30px;
            flex-wrap: wrap;
        }

        .hero-feature {
            display: flex;
            align-items: center;
            gap: 10px;
            color: #fff;
            background: rgba(197, 160, 89, 0.1);
            padding: 10px 20px;
            border-radius: 50px;
            border: 1px solid rgba(197, 160, 89, 0.3);
            backdrop-filter: blur(5px);
        }

        .hero-feature i {
            color: var(--accent);
            font-size: 1.2rem;
        }

        .hero-feature span {
            font-size: 0.95rem;
            font-weight: 500;
        }
       
        /* Main Feed Layout */
        .property-feed {
            max-width: 700px;
            margin: 0 auto;
            padding: 30px 20px;
            background: #000;
            min-height: 100vh;
        }

        /* Facebook Style Card */
        .fb-card {
            background: var(--card-bg);
            border-radius: 12px;
            overflow: hidden;
            border: 1px solid rgba(197, 160, 89, 0.2);
            transition: all 0.3s ease;
            margin-bottom: 30px;
            width: 100%;
        }

        .fb-card:last-child {
            margin-bottom: 0;
        }

        .fb-card:hover {
            border-color: var(--accent);
            box-shadow: 0 10px 30px rgba(197, 160, 89, 0.2);
        }

        .fb-card-header {
            display: flex;
            align-items: center;
            padding: 15px 20px;
            border-bottom: 1px solid rgba(197, 160, 89, 0.1);
        }

        .fb-avatar {
            width: 48px;
            height: 48px;
            border-radius: 50%;
            background: linear-gradient(135deg, var(--accent), #8b6b3c);
            display: flex;
            align-items: center;
            justify-content: center;
            margin-right: 12px;
            flex-shrink: 0;
        }

        .fb-avatar i {
            color: #000;
            font-size: 1.5rem;
        }

        .fb-header-info {
            flex: 1;
            min-width: 0;
        }

        .fb-header-info h4 {
            margin: 0;
            font-size: 1.1rem;
            color: #fff;
            font-weight: 600;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }

        .fb-header-info p {
            margin: 4px 0 0 0;
            font-size: 0.8rem;
            color: #888;
        }

        .fb-header-info p i {
            margin-right: 4px;
            color: var(--accent);
        }

        .fb-status-badge {
            background: var(--accent);
            color: #000;
            padding: 6px 12px;
            border-radius: 20px;
            font-size: 0.7rem;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            flex-shrink: 0;
        }

        /* Image Gallery */
        .fb-image-gallery {
            position: relative;
            width: 100%;
            background: #000;
            cursor: pointer;
        }

        .gallery-main {
            position: relative;
            width: 100%;
            height: 400px;
            overflow: hidden;
        }

        .gallery-main img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            transition: transform 0.5s ease;
        }

        .fb-card:hover .gallery-main img {
            transform: scale(1.05);
        }

        .gallery-badge {
            position: absolute;
            bottom: 15px;
            right: 15px;
            background: rgba(0,0,0,0.9);
            color: #fff;
            padding: 8px 15px;
            border-radius: 30px;
            font-size: 0.85rem;
            border: 1px solid var(--accent);
            z-index: 2;
            backdrop-filter: blur(5px);
            pointer-events: none;
        }

        .gallery-badge i {
            color: var(--accent);
            margin-right: 8px;
        }

        .gallery-thumbnails {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 2px;
            height: 100px;
            margin-top: 2px;
        }

        .thumb-item {
            position: relative;
            cursor: pointer;
            overflow: hidden;
            height: 100px;
        }

        .thumb-item img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            transition: transform 0.3s ease;
        }

        .thumb-item:hover img {
            transform: scale(1.1);
        }

        .thumb-overlay {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.7);
            display: flex;
            align-items: center;
            justify-content: center;
            color: #fff;
            font-size: 1.2rem;
            font-weight: 700;
            backdrop-filter: blur(2px);
            border: 2px solid var(--accent);
        }

        /* Card Body */
        .fb-card-body {
            padding: 20px;
        }

        .fb-price {
            color: var(--accent);
            font-weight: 700;
            font-size: 1.5rem;
            font-family: 'Orbitron', sans-serif;
            margin-bottom: 10px;
        }

        .fb-title {
            font-size: 1.3rem;
            font-weight: 600;
            color: #fff;
            margin-bottom: 10px;
            line-height: 1.4;
        }

        .fb-location {
            font-size: 1rem;
            color: #888;
            margin-bottom: 15px;
            display: flex;
            align-items: center;
            gap: 8px;
        }

        .fb-location i {
            color: var(--accent);
            font-size: 1.1rem;
        }

        /* Rating Section */
        .fb-rating {
            display: flex;
            align-items: center;
            gap: 15px;
            margin: 15px 0;
            padding: 10px 0;
            border-top: 1px solid rgba(197, 160, 89, 0.1);
            border-bottom: 1px solid rgba(197, 160, 89, 0.1);
        }

        .fb-stars {
            display: flex;
            gap: 5px;
        }

        .fb-stars i {
            color: #333;
            cursor: pointer;
            font-size: 1.2rem;
            transition: 0.2s;
        }

        .fb-stars i.active {
            color: #ffca08;
        }

        .rating-text {
            color: var(--accent);
            font-size: 1rem;
            font-weight: 600;
        }

        /* Specifications */
        .fb-specs {
            display: flex;
            gap: 30px;
            margin: 15px 0;
            font-size: 1rem;
            color: #888;
            flex-wrap: wrap;
        }

        .fb-specs span {
            display: flex;
            align-items: center;
            gap: 8px;
        }

        .fb-specs i {
            color: var(--accent);
            font-size: 1.1rem;
        }

        /* Description */
        .fb-description {
            margin: 15px 0;
            font-size: 0.95rem;
            line-height: 1.6;
            color: #bbb;
        }

        .fb-description.collapsed {
            max-height: 80px;
            overflow: hidden;
            position: relative;
        }

        .fb-description.collapsed::after {
            content: '';
            position: absolute;
            bottom: 0;
            left: 0;
            width: 100%;
            height: 40px;
            background: linear-gradient(transparent, var(--card-bg));
        }

        .see-more-btn {
            background: none;
            border: none;
            color: var(--accent);
            cursor: pointer;
            font-size: 0.9rem;
            padding: 5px 0;
            margin-top: 5px;
            font-weight: 600;
        }

        /* Reaction Bar */
        .fb-reaction-bar {
            display: flex;
            gap: 10px;
            margin: 15px 0;
            padding: 10px 0;
            border-top: 1px solid rgba(197, 160, 89, 0.1);
        }

        .reaction-btn {
            flex: 1;
            background: transparent;
            border: 1px solid rgba(197, 160, 89, 0.3);
            color: #888;
            padding: 10px;
            border-radius: 8px;
            font-size: 0.9rem;
            cursor: pointer;
            transition: 0.3s;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
        }

        .reaction-btn i {
            font-size: 1.1rem;
        }

        .reaction-btn.liked {
            background: rgba(197, 160, 89, 0.2);
            color: var(--accent);
            border-color: var(--accent);
        }

        .reaction-btn.liked i {
            color: var(--accent);
        }

        .reaction-count {
            margin-left: 5px;
            font-size: 0.85rem;
            color: #888;
        }

        /* Comments Section */
        .fb-comments {
            margin-top: 20px;
            padding-top: 20px;
            border-top: 1px solid rgba(197, 160, 89, 0.1);
        }

        .comment-input-area {
            display: flex;
            gap: 10px;
            margin-bottom: 20px;
        }

        .comment-input-area input {
            flex: 1;
            padding: 12px 15px;
            border-radius: 25px;
            background: rgba(255,255,255,0.05);
            border: 1px solid rgba(197, 160, 89, 0.3);
            color: #fff;
            outline: none;
            font-size: 0.95rem;
        }

        .comment-input-area input:focus {
            border-color: var(--accent);
        }

        .comment-input-area button {
            background: var(--accent);
            border: none;
            color: #000;
            padding: 12px 25px;
            border-radius: 25px;
            cursor: pointer;
            font-weight: 600;
            font-size: 0.95rem;
            transition: 0.3s;
        }

        .comment-input-area button:hover {
            background: #d4af37;
            transform: scale(1.02);
        }

        .comment-list {
            max-height: 300px;
            overflow-y: auto;
        }

        .comment-item {
            display: flex;
            gap: 12px;
            margin-bottom: 20px;
        }

        .comment-avatar {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            background: #333;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
        }

        .comment-avatar i {
            color: var(--accent);
            font-size: 1.2rem;
        }

        .comment-content {
            flex: 1;
            background: rgba(255,255,255,0.03);
            padding: 12px 15px;
            border-radius: 18px;
            border: 1px solid rgba(197, 160, 89, 0.1);
        }

        .comment-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 5px;
        }

        .comment-header strong {
            color: #fff;
            font-size: 0.95rem;
        }

        .comment-date {
            color: #888;
            font-size: 0.7rem;
        }

        .comment-content p {
            margin: 0;
            font-size: 0.9rem;
            color: #bbb;
            line-height: 1.4;
        }

        /* Lightbox Gallery */
        .gallery-lightbox {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.98);
            z-index: 3000;
            display: none;
            justify-content: center;
            align-items: center;
        }

        .lightbox-content {
            width: 100%;
            height: 100%;
            display: flex;
            flex-direction: column;
            position: relative;
        }

        .lightbox-header {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            padding: 20px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            z-index: 3001;
            background: linear-gradient(to bottom, rgba(0,0,0,0.5), transparent);
        }

        .lightbox-close {
            color: #fff;
            font-size: 2.5rem;
            cursor: pointer;
            transition: 0.3s;
        }

        .lightbox-close:hover {
            color: var(--accent);
        }

        .lightbox-counter {
            color: #fff;
            font-size: 1rem;
            background: rgba(0,0,0,0.5);
            padding: 8px 15px;
            border-radius: 30px;
            border: 1px solid var(--accent);
        }

        .lightbox-main {
            flex: 1;
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 80px 20px 20px;
        }

        .lightbox-main img {
            max-width: 100%;
            max-height: 80vh;
            object-fit: contain;
        }

        .lightbox-nav {
            position: absolute;
            top: 50%;
            transform: translateY(-50%);
            width: 100%;
            display: flex;
            justify-content: space-between;
            padding: 0 20px;
            z-index: 3001;
        }

        .lightbox-nav-btn {
            background: rgba(197, 160, 89, 0.8);
            color: #000;
            width: 50px;
            height: 50px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            font-size: 1.5rem;
            transition: 0.3s;
            border: none;
        }

        .lightbox-nav-btn:hover {
            background: var(--accent);
            transform: scale(1.1);
        }

        .lightbox-thumbnails {
            position: absolute;
            bottom: 20px;
            left: 50%;
            transform: translateX(-50%);
            display: flex;
            gap: 10px;
            padding: 10px;
            background: rgba(0,0,0,0.8);
            border-radius: 50px;
            border: 1px solid var(--accent);
            max-width: 90%;
            overflow-x: auto;
        }

        .lightbox-thumb {
            width: 60px;
            height: 60px;
            border-radius: 8px;
            cursor: pointer;
            border: 2px solid transparent;
            transition: 0.3s;
            flex-shrink: 0;
        }

        .lightbox-thumb img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            border-radius: 6px;
        }

        .lightbox-thumb.active {
            border-color: var(--accent);
            transform: scale(1.05);
        }

        /* Modal */
        .modal-overlay { 
            position: fixed; 
            top: 0; 
            left: 0; 
            width: 100%; 
            height: 100%; 
            background: rgba(0,0,0,0.95); 
            display: none; 
            z-index: 2000; 
            justify-content: center; 
            align-items: center; 
            padding: 20px; 
        }
        
        .modal-content { 
            background: #0a0a0a; 
            width: 100%; 
            max-width: 1000px; 
            max-height: 90vh; 
            border: 1px solid var(--accent); 
            border-radius: 12px; 
            position: relative; 
            display: grid; 
            grid-template-columns: 1.2fr 0.8fr; 
            overflow: hidden; 
        }
        
        .close-modal { 
            position: absolute; 
            top: 15px; 
            right: 20px; 
            color: white; 
            font-size: 2rem; 
            cursor: pointer; 
            z-index: 101; 
            line-height: 1; 
            text-shadow: 0 0 10px #000; 
        }
        
        .modal-carousel { 
            width: 100%; 
            height: 100%; 
            min-height: 450px; 
            position: relative; 
            background: #000; 
            display: flex; 
            align-items: center; 
            justify-content: center; 
            overflow: hidden; 
        }
        
        .carousel-img { 
            width: 100%; 
            height: 100%; 
            object-fit: contain; 
            display: none; 
            cursor: pointer; 
            background: #000; 
        }
        
        .carousel-img.active { 
            display: block; 
        }
        
        .carousel-nav { 
            position: absolute; 
            top: 50%; 
            width: 100%; 
            display: flex; 
            justify-content: space-between; 
            transform: translateY(-50%); 
            padding: 0 15px; 
            pointer-events: none; 
        }
        
        .nav-btn { 
            background: rgba(197, 160, 89, 0.7); 
            border: none; 
            color: white; 
            width: 40px; 
            height: 40px; 
            border-radius: 50%; 
            cursor: pointer; 
            font-size: 1.2rem; 
            pointer-events: auto; 
            transition: 0.3s; 
        }
        
        .nav-btn:hover { 
            background: var(--accent); 
            color: #000; 
        }
        
        .modal-info { 
            padding: 30px; 
            overflow-y: auto; 
            display: flex; 
            flex-direction: column; 
            background: #0a0a0a; 
            border-left: 1px solid #222; 
        }
        
        .modal-info h2 { 
            font-family: 'Orbitron'; 
            color: var(--accent); 
            margin-bottom: 5px; 
            font-size: 1.4rem; 
        }
        
        .modal-desc { 
            margin: 20px 0; 
            font-size: 0.95rem; 
            line-height: 1.6; 
            color: #ccc; 
            white-space: pre-wrap; 
        }
        
        .inquire-now-btn { 
            display: block; 
            width: 100%; 
            background: var(--accent); 
            color: #000; 
            text-align: center; 
            padding: 14px; 
            font-weight: 800; 
            font-family: 'Orbitron'; 
            text-decoration: none; 
            border-radius: 5px; 
            margin-top: auto; 
            transition: 0.3s; 
            font-size: 1rem; 
        }
        
        .inquire-now-btn:hover { 
            background: #d4af37; 
            transform: translateY(-2px); 
        }

        /* Loading Spinner */
        .loading-spinner {
            display: inline-block;
            width: 20px;
            height: 20px;
            border: 2px solid rgba(197, 160, 89, 0.3);
            border-radius: 50%;
            border-top-color: var(--accent);
            animation: spin 1s ease-in-out infinite;
        }

        @keyframes spin {
            to { transform: rotate(360deg); }
        }

        /* Mobile Responsiveness */
        @media (max-width: 768px) {
            .mobile-menu-icon { 
                display: block; 
            }
            
            nav { 
                position: absolute; 
                top: 65px; 
                left: 0; 
                width: 100%; 
                background: rgba(10, 10, 10, 0.98); 
                height: 0; 
                overflow: hidden; 
                transition: 0.4s ease-in-out; 
                border-bottom: 0px solid var(--accent); 
            }
            
            nav.open { 
                height: 250px; 
                border-bottom: 2px solid var(--accent); 
            }
            
            nav ul { 
                flex-direction: column; 
                align-items: center; 
                padding: 20px 0; 
                gap: 20px; 
            }
            
            nav ul li a { 
                font-size: 1.1rem; 
            }
            
            .property-hero { 
                min-height: 50vh;
                padding: 100px 5% 40px; 
            }

            .hero-description p {
                font-size: 1rem;
                line-height: 1.6;
            }

            .hero-description p:first-of-type {
                font-size: 1.2rem;
            }

            .hero-description p:last-of-type {
                font-size: 0.95rem;
            }

            .hero-features {
                gap: 15px;
            }

            .hero-feature {
                padding: 8px 15px;
            }

            .hero-feature span {
                font-size: 0.85rem;
            }
            
            .property-feed { 
                padding: 20px 15px; 
            }

            .gallery-main {
                height: 250px;
            }

            .gallery-thumbnails {
                height: 70px;
            }

            .thumb-item {
                height: 70px;
            }

            .fb-price {
                font-size: 1.3rem;
            }

            .fb-title {
                font-size: 1.1rem;
            }

            .fb-specs {
                gap: 15px;
            }

            .reaction-btn span {
                display: none;
            }

            .reaction-count {
                display: inline !important;
            }

            .comment-input-area {
                flex-direction: column;
            }

            .comment-input-area button {
                width: 100%;
            }

            .lightbox-thumb {
                width: 50px;
                height: 50px;
            }

            .modal-content { 
                grid-template-columns: 1fr; 
                width: 95%; 
                max-height: 90vh; 
                overflow-y: auto; 
            }
            
            .modal-carousel { 
                min-height: 250px; 
                height: 250px; 
            }
            
            .modal-info { 
                border-left: none; 
                border-top: 1px solid #222; 
            }
        }
       
        #no-results { 
            display: none; 
            text-align: center; 
            padding: 100px 20px; 
            color: #444; 
        }

        #no-results i {
            font-size: 4rem;
            opacity: 0.2;
            margin-bottom: 20px;
        }

        #no-results p {
            font-family: 'Orbitron';
            letter-spacing: 1px;
            font-size: 1.2rem;
        }
       
        /* Footer */
        footer { 
            padding: 60px 8% 30px; 
            background: linear-gradient(rgba(0,0,0,0.9), rgba(0,0,0,0.95)), url('assets/images/golden.png'); 
            background-size: cover; 
            background-position: center; 
            border-top: 1px solid rgba(197,160,89,0.2); 
            color: #fff; 
        }
        
        .footer-main-content { 
            display: flex; 
            justify-content: space-between; 
            align-items: flex-start; 
            flex-wrap: wrap; 
            gap: 40px; 
            margin-bottom: 50px; 
            max-width: 1200px;
            margin-left: auto;
            margin-right: auto;
        }
        
        .footer-left-section { 
            flex: 1; 
            min-width: 250px; 
        }
        
        .footer-logo img { 
            height: 50px; 
            width: auto; 
            margin-bottom: 25px; 
        }
        
        .inquire-btn { 
            display: inline-block; 
            padding: 12px 28px; 
            background-color: var(--accent); 
            color: #000; 
            text-decoration: none; 
            font-family: 'Orbitron', sans-serif; 
            font-weight: 700; 
            border-radius: 4px; 
            transition: 0.3s ease; 
            text-transform: uppercase; 
            font-size: 0.85rem; 
            letter-spacing: 1px; 
        }
        
        .inquire-btn:hover { 
            background-color: #fff; 
            transform: translateY(-2px); 
        }
        
        .footer-right-section { 
            flex: 1; 
            min-width: 200px; 
            text-align: right; 
        }
        
        .footer-right-section h2 { 
            color: var(--accent); 
            font-family: 'Orbitron', sans-serif; 
            font-size: 1.2rem; 
            margin-bottom: 20px; 
            letter-spacing: 2px; 
            text-transform: uppercase; 
        }
        
        .footer-nav-links { 
            list-style: none; 
            padding: 0; 
        }
        
        .footer-nav-links li { 
            margin-bottom: 12px; 
        }
        
        .footer-nav-links li a { 
            color: #bbb; 
            text-decoration: none; 
            transition: 0.3s ease; 
            font-size: 0.9rem; 
        }
        
        .footer-nav-links li a:hover { 
            color: var(--accent); 
        }
        
        .footer-bottom-bar { 
            border-top: 1px solid rgba(255,255,255,0.08); 
            padding-top: 30px; 
            display: flex; 
            justify-content: space-between; 
            align-items: center; 
            flex-wrap: wrap; 
            gap: 20px; 
            max-width: 1200px;
            margin-left: auto;
            margin-right: auto;
        }
        
        .footer-bottom-bar p { 
            font-size: 0.8rem; 
            color: #777; 
            margin: 0; 
        }
        
        .social-icons-list { 
            display: flex; 
            gap: 15px; 
            list-style: none; 
        }
        
        .social-icons-list a { 
            color: #fff; 
            font-size: 1.1rem; 
            transition: 0.3s ease; 
            width: 35px; 
            height: 35px; 
            border: 1px solid rgba(255,255,255,0.2); 
            border-radius: 50%; 
            display: flex; 
            justify-content: center; 
            align-items: center; 
        }
        
        .social-icons-list a:hover { 
            color: var(--accent); 
            border-color: var(--accent); 
            transform: scale(1.1); 
        }
    </style>
</head>
<body>
<header>
    <div class="logo">
        <a href="index.html"><img src="assets/images/viber1.png" alt="Logo" class="header-logo" /></a>
    </div>
    <div class="mobile-menu-icon" id="menuToggle"><i class="fa-solid fa-bars"></i></div>
    <nav id="mainNav">
        <ul>
            <li><a href="index.html">Home</a></li>
            <li><a href="property.php">Properties</a></li>
            <li><a href="virtual_office.php" class="active">Virtual Office</a></li>
            <li><a href="careers.html">Careers</a></li>
            <li><a href="blogs.html">Blogs</a></li>
        </ul>
    </nav>
</header>

<section class="property-hero">
    <h1 data-aos="fade-down">Virtual Office</h1>
    
    <!-- Search Bar -->
    <div class="hero-search-container" data-aos="zoom-in" data-aos-delay="200">
        <i class="fa-solid fa-magnifying-glass"></i>
        <input type="text" id="propertySearch" placeholder="Search name or location...">
    </div>

    <!-- Hero Description - Center after search bar -->
    <div class="hero-description" data-aos="fade-up" data-aos-delay="400">
        <p>Give your business the presence it deserves — without the overhead.</p>
        
        <p>Alpha Premier Realty's Virtual Office Solutions provide a prestigious business address, professional administrative support, and on-demand workspace access. Perfect for entrepreneurs and growing teams, our services help you build credibility, stay agile, and grow seamlessly.</p>
        
        <!-- Feature Icons -->
        
    </div>
</section>

<main class="property-feed" id="property-list">
    <?php
    if ($result->num_rows > 0) {
        while($row = $result->fetch_assoc()) {
            $property_id = $row['id'];
            $price_display = ($row['price'] > 0) ? $row['price_unit'] . " " . number_format($row['price'], 2) : "Contact for Price";
            $images_raw = $row['images'];
            $images_array = explode(',', $images_raw);
            $first_img = !empty($images_array[0]) ? trim($images_array[0]) : 'assets/images/placeholder.jpg';
            
            // Get user IP for reactions
            $user_ip = $_SERVER['REMOTE_ADDR'];
            
            // Check if user liked this property
            $like_check = $conn->query("SELECT id FROM property_reactions WHERE property_id = $property_id AND user_ip = '$user_ip' AND reaction_type = 'like'");
            $user_liked = $like_check->num_rows > 0;
            
            // Get total likes
            $likes_count = $conn->query("SELECT COUNT(*) as count FROM property_reactions WHERE property_id = $property_id AND reaction_type = 'like'")->fetch_assoc()['count'];
            
            // Get comments
            $comments = $conn->query("SELECT * FROM property_comments WHERE property_id = $property_id ORDER BY created_at DESC LIMIT 5");
            
            // Get average rating
            $rating_result = $conn->query("SELECT AVG(rating) as avg_rating FROM property_ratings WHERE property_id = $property_id");
            $avg_rating = round($rating_result->fetch_assoc()['avg_rating'] ?? 0, 1);
            
            // Check if user rated
            $user_rating = $conn->query("SELECT rating FROM property_ratings WHERE property_id = $property_id AND user_ip = '$user_ip'")->fetch_assoc();
            $user_rating_value = $user_rating['rating'] ?? 0;
            
            $thumb_images = array_slice($images_array, 0, 4);
            $remaining_count = count($images_array) - 4;
    ?>
        <div class="fb-card" data-aos="fade-up" data-property-id="<?php echo $property_id; ?>">
            
            <!-- Card Header -->
            <div class="fb-card-header">
                <div class="fb-avatar">
                    <i class="fa-solid fa-building"></i>
                </div>
                <div class="fb-header-info">
                    <h4>Alpha Premier Virtual Offices</h4>
                    <p><i class="fa-regular fa-clock"></i> <?php echo date('F j, Y', strtotime($row['created_at'])); ?></p>
                </div>
                <div class="fb-status-badge"><?php echo $row['status']; ?></div>
            </div>

            <!-- Image Gallery -->
            <div class="fb-image-gallery" onclick="openLightbox(<?php echo $property_id; ?>, 0)">
                <div class="gallery-main">
                    <img src="<?php echo $first_img; ?>" alt="Virtual Office">
                    <?php if(count($images_array) > 1): ?>
                    <div class="gallery-badge">
                        <i class="fa-regular fa-images"></i> <?php echo count($images_array); ?> photos
                    </div>
                    <?php endif; ?>
                </div>
                
                <?php if(count($thumb_images) > 1): ?>
                <div class="gallery-thumbnails">
                    <?php 
                    foreach($thumb_images as $index => $img): 
                        if($index == 0) continue;
                        if($index < 4):
                    ?>
                    <div class="thumb-item" onclick="event.stopPropagation(); openLightbox(<?php echo $property_id; ?>, <?php echo $index; ?>)">
                        <img src="<?php echo trim($img); ?>" alt="Thumbnail">
                        <?php if($index == 3 && $remaining_count > 0): ?>
                        <div class="thumb-overlay">+<?php echo $remaining_count; ?></div>
                        <?php endif; ?>
                    </div>
                    <?php 
                        endif;
                    endforeach; 
                    ?>
                </div>
                <?php endif; ?>
            </div>

            <!-- Card Body -->
            <div class="fb-card-body">
                <div class="fb-price"><?php echo $price_display; ?></div>
                <div class="fb-title"><?php echo $row['title']; ?></div>
                <div class="fb-location">
                    <i class="fa-solid fa-location-dot"></i> <?php echo $row['location']; ?>
                </div>

                <!-- Rating Section -->
                <div class="fb-rating">
                    <div class="fb-stars" data-property-id="<?php echo $property_id; ?>">
                        <?php for($i = 5; $i >= 1; $i--): ?>
                        <i class="fa-solid fa-star <?php echo $i <= $user_rating_value ? 'active' : ''; ?>" data-val="<?php echo $i; ?>" onclick="rateProperty(<?php echo $property_id; ?>, <?php echo $i; ?>, this)"></i>
                        <?php endfor; ?>
                    </div>
                    <span class="rating-text" id="rating-<?php echo $property_id; ?>"><?php echo $avg_rating; ?></span>
                </div>

                <!-- Specifications -->
                <div class="fb-specs">
                    <span><i class="fa-solid fa-ruler-combined"></i> Floor: <?php echo $row['floor_area'] ?: '—'; ?> sqm</span>
                    <span><i class="fa-solid fa-maximize"></i> Lot: <?php echo $row['lot_area'] ?: '—'; ?> sqm</span>
                </div>

                <!-- Description -->
                <div class="fb-description <?php echo strlen($row['description']) > 150 ? 'collapsed' : ''; ?>" id="desc-<?php echo $property_id; ?>">
                    <?php echo nl2br(htmlspecialchars($row['description'])); ?>
                </div>
                <?php if(strlen($row['description']) > 150): ?>
                <button class="see-more-btn" onclick="toggleDescription(<?php echo $property_id; ?>)">See More</button>
                <?php endif; ?>

                <!-- Reaction Bar -->
                <div class="fb-reaction-bar">
                    <button class="reaction-btn <?php echo $user_liked ? 'liked' : ''; ?>" onclick="toggleLike(<?php echo $property_id; ?>, this)">
                        <i class="fa-<?php echo $user_liked ? 'solid' : 'regular'; ?> fa-heart"></i>
                        Like <span class="reaction-count" id="likes-<?php echo $property_id; ?>"><?php echo $likes_count; ?></span>
                    </button>
                    <button class="reaction-btn" onclick="focusComment(<?php echo $property_id; ?>)">
                        <i class="fa-regular fa-comment"></i> Comment
                    </button>
                </div>

                <!-- Comments Section -->
                <div class="fb-comments" id="comments-<?php echo $property_id; ?>">
                    <div class="comment-input-area">
                        <input type="text" id="comment-input-<?php echo $property_id; ?>" placeholder="Write a comment..." maxlength="500">
                        <button onclick="postComment(<?php echo $property_id; ?>)">Post</button>
                    </div>
                    <div class="comment-list" id="comment-list-<?php echo $property_id; ?>">
                        <?php while($comment = $comments->fetch_assoc()): ?>
                        <div class="comment-item">
                            <div class="comment-avatar">
                                <i class="fa-solid fa-user"></i>
                            </div>
                            <div class="comment-content">
                                <div class="comment-header">
                                    <strong><?php echo htmlspecialchars($comment['user_name']); ?></strong>
                                    <span class="comment-date"><?php echo date('M d, Y', strtotime($comment['created_at'])); ?></span>
                                </div>
                                <p><?php echo htmlspecialchars($comment['comment_text']); ?></p>
                            </div>
                        </div>
                        <?php endwhile; ?>
                    </div>
                </div>

                <!-- View Details Button -->
                <button type="button" class="fb-action-btn view-btn open-modal-btn" style="width:100%; margin-top:15px; padding:12px; background:var(--accent); color:#000; border:none; border-radius:8px; font-weight:600; cursor:pointer;"
                    data-title="<?php echo htmlspecialchars($row['title']); ?>"
                    data-price="<?php echo $price_display; ?>"
                    data-loc="<?php echo htmlspecialchars($row['location']); ?>"
                    data-status="<?php echo $row['status']; ?>"
                    data-floor="<?php echo $row['floor_area'] ?: '—'; ?>"
                    data-lot="<?php echo $row['lot_area'] ?: '—'; ?>"
                    data-desc="<?php echo htmlspecialchars($row['description']); ?>"
                    data-imgs="<?php echo $images_raw; ?>">
                    <i class="fa-regular fa-eye"></i> View Full Details
                </button>
            </div>
        </div>

        <!-- Hidden image list for lightbox -->
        <div id="images-<?php echo $property_id; ?>" style="display:none;"><?php echo $images_raw; ?></div>
    <?php
        }
    } else {
        echo '<div id="no-results" style="display:block;">
                <i class="fa-solid fa-building-circle-exclamation"></i>
                <p>No Virtual Offices found at the moment.</p>
              </div>';
    }
    ?>
    
    <div id="no-results" style="display:none;">
        <i class="fa-solid fa-building-circle-exclamation"></i>
        <p>No virtual offices matched your search.</p>
    </div>
</main>

<!-- Modal -->
<div class="modal-overlay" id="propModal">
    <div class="modal-content">
        <span class="close-modal">×</span>
        <div class="modal-carousel" id="carouselWrapper"></div>
        <div class="modal-info">
            <span id="mStatus" class="status-badge" style="position:static; margin-bottom:15px; display:inline-block;"></span>
            <h2 id="mTitle"></h2>
            <p id="mLoc" style="color:#aaa; margin-bottom:10px; font-size:0.85rem;"></p>
            <div id="mPrice" class="price-text" style="font-size:1.3rem; margin-bottom:20px;"></div>
            <div style="display:flex; gap:15px; border-top:1px solid #222; padding-top:15px; font-size:0.8rem;">
                <span><strong>Floor:</strong> <span id="mFloor"></span> sqm</span>
                <span><strong>Lot:</strong> <span id="mLot"></span> sqm</span>
            </div>
            <div class="modal-desc" id="mDesc"></div>
            <a href="https://alphapremiergroup.com/pages/contactform.html" class="inquire-now-btn">INQUIRE NOW</a>
        </div>
    </div>
</div>

<!-- Gallery Lightbox -->
<div class="gallery-lightbox" id="galleryLightbox">
    <div class="lightbox-content">
        <div class="lightbox-header">
            <span class="lightbox-close" onclick="closeLightbox()">×</span>
            <span class="lightbox-counter" id="lightboxCounter">1 / 1</span>
        </div>
        <div class="lightbox-main">
            <img src="" id="lightboxMainImage" alt="Gallery Image">
        </div>
        <div class="lightbox-nav">
            <button class="lightbox-nav-btn" onclick="changeLightboxImage(-1)">❮</button>
            <button class="lightbox-nav-btn" onclick="changeLightboxImage(1)">❯</button>
        </div>
        <div class="lightbox-thumbnails" id="lightboxThumbnails"></div>
    </div>
</div>

<script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
<script src="https://unpkg.com/aos@2.3.1/dist/aos.js"></script>
<script>
    // Global variables
    let currentPropertyImages = [];
    let currentImageIndex = 0;
    let currentSlide = 0, totalSlides = 0, imgList = [];

    $(document).ready(function() {
        AOS.init({ duration: 800, once: true });
        
        // Mobile Menu Toggle
        $('#menuToggle').on('click', function() {
            $('#mainNav').toggleClass('open');
            const icon = $(this).find('i');
            icon.hasClass('fa-bars') ? icon.removeClass('fa-bars').addClass('fa-xmark') : icon.removeClass('fa-xmark').addClass('fa-bars');
        });
        
        // Search Functionality
        $('#propertySearch').on('keyup', function() {
            const search = $(this).val().toLowerCase();
            let count = 0;
            
            $('.fb-card').each(function() {
                const title = $(this).find('.fb-title').text().toLowerCase();
                const location = $(this).find('.fb-location').text().toLowerCase();
                
                if(title.includes(search) || location.includes(search)) {
                    $(this).show();
                    count++;
                } else {
                    $(this).hide();
                }
            });
            
            count === 0 ? $('#no-results').show() : $('#no-results').hide();
        });
    });

    // Toggle Description
    function toggleDescription(id) {
        const desc = document.getElementById(`desc-${id}`);
        const btn = event.target;
        
        if(desc.classList.contains('collapsed')) {
            desc.classList.remove('collapsed');
            btn.textContent = 'See Less';
        } else {
            desc.classList.add('collapsed');
            btn.textContent = 'See More';
        }
    }

    // Rate Property
    function rateProperty(propertyId, rating, element) {
        const stars = $(element).parent().find('i');
        const ratingSpan = document.getElementById(`rating-${propertyId}`);
        
        // Show loading
        ratingSpan.innerHTML = '<span class="loading-spinner"></span>';
        
        $.ajax({
            url: 'rate_property.php',
            method: 'POST',
            data: {
                property_id: propertyId,
                rating: rating
            },
            success: function(response) {
                const data = JSON.parse(response);
                if(data.success) {
                    // Update stars
                    stars.each(function() {
                        if($(this).data('val') <= rating) {
                            $(this).addClass('active');
                        } else {
                            $(this).removeClass('active');
                        }
                    });
                    
                    // Update rating
                    ratingSpan.textContent = data.average_rating;
                }
            },
            error: function() {
                ratingSpan.textContent = 'Error';
            }
        });
    }

    // Toggle Like
    function toggleLike(propertyId, button) {
        const icon = $(button).find('i');
        const countSpan = document.getElementById(`likes-${propertyId}`);
        
        $.ajax({
            url: 'toggle_like.php',
            method: 'POST',
            data: {
                property_id: propertyId
            },
            success: function(response) {
                const data = JSON.parse(response);
                if(data.success) {
                    if(data.liked) {
                        icon.removeClass('fa-regular').addClass('fa-solid');
                        $(button).addClass('liked');
                    } else {
                        icon.removeClass('fa-solid').addClass('fa-regular');
                        $(button).removeClass('liked');
                    }
                    countSpan.textContent = data.total_likes;
                }
            }
        });
    }

    // Post Comment
    function postComment(propertyId) {
        const input = document.getElementById(`comment-input-${propertyId}`);
        const commentText = input.value.trim();
        
        if(!commentText) return;
        
        // Disable input and button
        input.disabled = true;
        const button = input.nextElementSibling;
        button.disabled = true;
        button.innerHTML = '<span class="loading-spinner"></span>';
        
        $.ajax({
            url: 'post_comment.php',
            method: 'POST',
            data: {
                property_id: propertyId,
                comment: commentText
            },
            success: function(response) {
                const data = JSON.parse(response);
                if(data.success) {
                    // Add comment to list
                    const commentList = document.getElementById(`comment-list-${propertyId}`);
                    const newComment = document.createElement('div');
                    newComment.className = 'comment-item';
                    newComment.innerHTML = `
                        <div class="comment-avatar">
                            <i class="fa-solid fa-user"></i>
                        </div>
                        <div class="comment-content">
                            <div class="comment-header">
                                <strong>${data.user_name}</strong>
                                <span class="comment-date">Just now</span>
                            </div>
                            <p>${escapeHtml(commentText)}</p>
                        </div>
                    `;
                    commentList.insertBefore(newComment, commentList.firstChild);
                    
                    // Clear input
                    input.value = '';
                }
            },
            complete: function() {
                // Re-enable input and button
                input.disabled = false;
                button.disabled = false;
                button.innerHTML = 'Post';
            }
        });
    }

    // Focus comment input
    function focusComment(propertyId) {
        const comments = document.getElementById(`comments-${propertyId}`);
        const input = document.getElementById(`comment-input-${propertyId}`);
        
        // Scroll to comments
        comments.scrollIntoView({ behavior: 'smooth', block: 'center' });
        
        // Focus input after a slight delay
        setTimeout(() => input.focus(), 500);
    }

    // Escape HTML for security
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Lightbox Functions
    function openLightbox(propertyId, index) {
        // Get images for this property
        const imagesStr = document.getElementById(`images-${propertyId}`).textContent;
        currentPropertyImages = imagesStr.split(',').map(s => s.trim());
        currentImageIndex = index;
        
        // Update lightbox
        document.getElementById('lightboxMainImage').src = currentPropertyImages[currentImageIndex];
        updateLightboxCounter();
        updateLightboxThumbnails(propertyId);
        
        // Show lightbox
        document.getElementById('galleryLightbox').style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }

    function closeLightbox() {
        document.getElementById('galleryLightbox').style.display = 'none';
        document.body.style.overflow = 'auto';
    }

    function changeLightboxImage(direction) {
        currentImageIndex = (currentImageIndex + direction + currentPropertyImages.length) % currentPropertyImages.length;
        document.getElementById('lightboxMainImage').src = currentPropertyImages[currentImageIndex];
        updateLightboxCounter();
        updateActiveThumbnail();
    }

    function updateLightboxCounter() {
        document.getElementById('lightboxCounter').textContent = 
            `${currentImageIndex + 1} / ${currentPropertyImages.length}`;
    }

    function updateLightboxThumbnails(propertyId) {
        const thumbContainer = document.getElementById('lightboxThumbnails');
        thumbContainer.innerHTML = '';
        
        currentPropertyImages.forEach((img, i) => {
            const thumb = document.createElement('div');
            thumb.className = `lightbox-thumb ${i === currentImageIndex ? 'active' : ''}`;
            thumb.innerHTML = `<img src="${img}" alt="Thumbnail" onclick="jumpToImage(${i})">`;
            thumbContainer.appendChild(thumb);
        });
    }

    function updateActiveThumbnail() {
        const thumbs = document.querySelectorAll('.lightbox-thumb');
        thumbs.forEach((thumb, i) => {
            if(i === currentImageIndex) {
                thumb.classList.add('active');
            } else {
                thumb.classList.remove('active');
            }
        });
    }

    function jumpToImage(index) {
        currentImageIndex = index;
        document.getElementById('lightboxMainImage').src = currentPropertyImages[currentImageIndex];
        updateLightboxCounter();
        updateActiveThumbnail();
    }

    // Close lightbox with Escape key
    document.addEventListener('keydown', function(e) {
        if(e.key === 'Escape' && document.getElementById('galleryLightbox').style.display === 'flex') {
            closeLightbox();
        }
        
        if(e.key === 'ArrowLeft' && document.getElementById('galleryLightbox').style.display === 'flex') {
            changeLightboxImage(-1);
        }
        
        if(e.key === 'ArrowRight' && document.getElementById('galleryLightbox').style.display === 'flex') {
            changeLightboxImage(1);
        }
    });

    // Modal Functions
    $('.open-modal-btn').on('click', function() {
        const d = $(this).data();
        $('#mTitle').text(d.title);
        $('#mPrice').text(d.price);
        $('#mLoc').html('<i class="fa-solid fa-location-dot"></i> ' + d.loc);
        $('#mStatus').text(d.status);
        $('#mFloor').text(d.floor);
        $('#mLot').text(d.lot);
        $('#mDesc').text(d.desc);
        
        imgList = d.imgs.split(',').map(s => s.trim());
        totalSlides = imgList.length;
        currentSlide = 0;
        
        let imgHtml = '';
        imgList.forEach((src, i) => {
            imgHtml += `<img src="${src}" class="carousel-img ${i===0?'active':''}" style="display:${i===0?'block':'none'}" onclick="openLightboxFromModal(${i})">`;
        });
        
        if(totalSlides > 1) {
            imgHtml += `<div class="carousel-nav">
                <button class="nav-btn" onclick="moveSlide(-1)">❮</button>
                <button class="nav-btn" onclick="moveSlide(1)">❯</button>
            </div>`;
        }
        
        $('#carouselWrapper').html(imgHtml);
        $('#propModal').css('display', 'flex');
        $('body').css('overflow', 'hidden');
    });

    function openLightboxFromModal(index) {
        currentPropertyImages = imgList;
        currentImageIndex = index;
        
        document.getElementById('lightboxMainImage').src = currentPropertyImages[currentImageIndex];
        updateLightboxCounter();
        updateLightboxThumbnails(null);
        
        $('#propModal').hide();
        $('#galleryLightbox').css('display', 'flex');
    }

    window.moveSlide = function(n) {
        currentSlide = (currentSlide + n + totalSlides) % totalSlides;
        $('.carousel-img').hide().removeClass('active').eq(currentSlide).show().addClass('active');
    };

    $('.close-modal, #propModal').on('click', function(e) {
        if (e.target !== this && !$(e.target).hasClass('close-modal')) return;
        $('#propModal').hide();
        $('body').css('overflow', 'auto');
    });
</script>

<!-- Create separate PHP files for AJAX handlers -->
<?php
// Create rate_property.php
file_put_contents('rate_property.php', '<?php
session_start();
$conn = new mysqli("localhost", "u501100418_alphapremierco", "ApG2025!", "u501100418_apg_database");
if ($conn->connect_error) {
    die(json_encode(["success" => false, "error" => "Connection failed"]));
}

$property_id = intval($_POST["property_id"]);
$rating = intval($_POST["rating"]);
$user_ip = $_SERVER["REMOTE_ADDR"];

if ($rating < 1 || $rating > 5) {
    die(json_encode(["success" => false]));
}

// Insert or update rating
$conn->query("INSERT INTO property_ratings (property_id, user_ip, rating) 
              VALUES ($property_id, \'$user_ip\', $rating)
              ON DUPLICATE KEY UPDATE rating = $rating");

// Get new average
$result = $conn->query("SELECT AVG(rating) as avg_rating FROM property_ratings WHERE property_id = $property_id");
$avg = round($result->fetch_assoc()["avg_rating"] ?? 0, 1);

echo json_encode(["success" => true, "average_rating" => $avg]);
?>');

// Create toggle_like.php
file_put_contents('toggle_like.php', '<?php
session_start();
$conn = new mysqli("localhost", "u501100418_alphapremierco", "ApG2025!", "u501100418_apg_database");
if ($conn->connect_error) {
    die(json_encode(["success" => false, "error" => "Connection failed"]));
}

$property_id = intval($_POST["property_id"]);
$user_ip = $_SERVER["REMOTE_ADDR"];

// Check if already liked
$check = $conn->query("SELECT id FROM property_reactions WHERE property_id = $property_id AND user_ip = \'$user_ip\' AND reaction_type = \'like\'");

if ($check->num_rows > 0) {
    // Unlike
    $conn->query("DELETE FROM property_reactions WHERE property_id = $property_id AND user_ip = \'$user_ip\' AND reaction_type = \'like\'");
    $liked = false;
} else {
    // Like
    $conn->query("INSERT INTO property_reactions (property_id, user_ip, reaction_type) VALUES ($property_id, \'$user_ip\', \'like\')");
    $liked = true;
}

// Get total likes
$result = $conn->query("SELECT COUNT(*) as count FROM property_reactions WHERE property_id = $property_id AND reaction_type = \'like\'");
$total = $result->fetch_assoc()["count"];

echo json_encode(["success" => true, "liked" => $liked, "total_likes" => $total]);
?>');

// Create post_comment.php
file_put_contents('post_comment.php', '<?php
session_start();
$conn = new mysqli("localhost", "u501100418_alphapremierco", "ApG2025!", "u501100418_apg_database");
if ($conn->connect_error) {
    die(json_encode(["success" => false, "error" => "Connection failed"]));
}

$property_id = intval($_POST["property_id"]);
$comment = $conn->real_escape_string($_POST["comment"]);
$user_name = "Guest User"; // You can implement user system later

$conn->query("INSERT INTO property_comments (property_id, user_name, comment_text) 
              VALUES ($property_id, \'$user_name\', \'$comment\')");

echo json_encode(["success" => true, "user_name" => $user_name]);
?>');
?>

<footer>
    <div class="footer-main-content">
        <div class="footer-left-section">
            <div class="footer-logo">
                <img src="assets/images/viber1.png" alt="Alpha Premier Group Logo">
            </div>
            <a href="pages/contactform.html" class="inquire-btn">Inquire Now!</a>
        </div>
        <div class="footer-right-section">
            <h2>Alpha Premier</h2>
            <ul class="footer-nav-links">
                <li><a href="index.html">Home</a></li>
                <li><a href="property.php">Properties</a></li>
                <li><a href="virtual_office.php">Virtual Office</a></li>
                <li><a href="careers.html">Careers</a></li>
                <li><a href="blogs.html">Blogs</a></li>
            </ul>
        </div>
    </div>
    <div class="footer-bottom-bar">
        <p>© 2025 Alpha Premier Group. All rights reserved.</p>
        <ul class="social-icons-list">
            <li><a href="#" target="_blank"><i class="fab fa-facebook-f"></i></a></li>
            <li><a href="#" target="_blank"><i class="fab fa-instagram"></i></a></li>
            <li><a href="#" target="_blank"><i class="fab fa-tiktok"></i></a></li>
        </ul>
    </div>
</footer>
</body>
</html>