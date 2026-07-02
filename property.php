<?php
// 1. Database Connection
$conn = new mysqli("localhost", "u501100418_alphapremierco", "ApG2025!", "u501100418_apg_database");
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}
// 2. Fetch all properties
$sql = "SELECT * FROM offerings_cards ORDER BY created_at DESC";
$result = $conn->query($sql);
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
    <link rel="icon" type="image/x-icon" href="assets/images/main/logo/logo-transparent.png" />
    <title>Properties | Alpha Premier</title>
    <link rel="stylesheet" href="https://unpkg.com/aos@2.3.1/dist/aos.css" />
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600;700&display=swap" />
    <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&display=swap" rel="stylesheet" />
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" />
    <style>
        :root { --primary: #c5a059; --accent: #c5a059; --light: #ffffff; --dark: #000000; --card-bg: #0a0a0a; }
        body { margin: 0; padding: 0; font-family: "Poppins", sans-serif; background-color: var(--dark); color: #e0e0e0; overflow-x: hidden; position: relative; }
        
   

        header { position: fixed; top: 0; left: 0; width: 100%; display: flex; justify-content: space-between; align-items: center; padding: 10px 4%; z-index: 1000; background: rgba(0, 0, 0, 0.95); backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px); border-bottom: 1px solid rgba(197, 160, 89, 0.3); box-sizing: border-box; }
        .logo img.header-logo { height: 45px; width: auto; object-fit: contain; }
        .mobile-menu-icon { display: none; color: var(--accent); font-size: 1.8rem; cursor: pointer; }
        nav ul { display: flex; gap: 25px; list-style: none; margin: 0; padding: 0; }
        nav ul li a { color: white; text-decoration: none; font-weight: 500; font-size: 0.9rem; transition: 0.3s; }
        nav ul li a:hover { color: var(--accent); }
        nav ul li a.active { color: var(--accent) !important; border-bottom: 2px solid var(--accent); padding-bottom: 5px; }
        .property-hero { height: 50vh; display: flex; flex-direction: column; justify-content: center; align-items: center; background: linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.8)), url('assets/images/wow123.png') center/cover fixed; text-align: center; padding: 100px 5% 20px 5%; }
        .property-hero h1 { font-family: 'Orbitron', sans-serif; color: var(--accent); font-size: clamp(1.5rem, 6vw, 3rem); letter-spacing: 3px; text-transform: uppercase; margin-bottom: 20px; }
        .hero-search-container { position: relative; width: 100%; max-width: 600px; }
        .hero-search-container input { width: 100%; padding: 12px 20px 12px 45px; border-radius: 50px; background: rgba(20, 20, 20, 0.8); border: 1px solid rgba(197, 160, 89, 0.5); color: #fff; outline: none; font-size: 0.9rem; transition: 0.3s; box-sizing: border-box; }
        .hero-search-container i { position: absolute; left: 18px; top: 50%; transform: translateY(-50%); color: var(--accent); }
        .filter-container { position: sticky; top: 65px; z-index: 998; background: rgba(10, 10, 10, 0.95); backdrop-filter: blur(5px); padding: 15px 10px; display: flex; justify-content: center; gap: 8px; flex-wrap: nowrap; overflow-x: auto; border-bottom: 1px solid #1a1a1a; scrollbar-width: none; }
        .filter-container::-webkit-scrollbar { display: none; }
        .filter-btn { background: rgba(255,255,255,0.05); border: 1px solid #333; color: #bbb; padding: 8px 15px; border-radius: 4px; cursor: pointer; font-family: 'Orbitron'; font-size: 0.65rem; letter-spacing: 1px; transition: 0.3s; white-space: nowrap; flex-shrink: 0; }
        .filter-btn.active, .filter-btn:hover { background: var(--accent); color: #000; border-color: var(--accent); }
        .property-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 20px; padding: 40px 5%; background: #000; }
        .property-card { background: var(--card-bg); border-radius: 12px; overflow: hidden; border: 1px solid rgba(197, 160, 89, 0.1); display: flex; flex-direction: column; transition: box-shadow 0.3s ease, border-color 0.3s ease; perspective: 1000px; transform-style: preserve-3d; }
        .property-card:hover { border-color: rgba(197, 160, 89, 0.5); box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5); }
        .img-box { height: 200px; position: relative; overflow: hidden; transition: transform 0.1s ease-out; transform-style: preserve-3d;      will-change: transform; }
        .img-box img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.3s ease; transform: scale(1.02); }
        .property-card:hover .img-box img { transform: scale(1.1); }
        .status-badge { position: absolute; top: 12px; left: 12px; background: var(--accent); color: #000; padding: 4px 10px; font-size: 0.65rem; font-weight: 800; text-transform: uppercase; border-radius: 4px; z-index: 2; transform: translateZ(30px); }
        .card-body { padding: 20px; flex-grow: 1; display: flex; flex-direction: column; z-index: 1; }
        .price-text { color: var(--accent); font-weight: 700; font-size: 1.1rem; font-family: 'Orbitron', sans-serif; }
        .title-text { font-family: 'Orbitron'; font-size: 0.95rem; margin: 10px 0; min-height: 40px; color: #fff; line-height: 1.4; }
        .loc-text { font-size: 0.85rem; color: #bbb; margin-bottom: 15px; }
        .specs { display: flex; justify-content: space-between; margin-top: auto; font-size: 0.75rem; border-top: 1px solid #222; padding-top: 15px; color: #888; }
        .view-btn { display: block; width: 100%; text-align: center; background: transparent; color: var(--accent); padding: 10px; margin-top: 15px; border-radius: 6px; font-weight: bold; border: 1px solid var(--accent); cursor: pointer; font-size: 0.85rem; transition: 0.3s; text-decoration: none; font-family: 'Orbitron'; }
        .view-btn:hover { background: var(--accent); color: #000; }
        .modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.95); display: none; z-index: 2000; justify-content: center; align-items: center; padding: 20px; box-sizing: border-box; }
        .modal-content { background: #0a0a0a; width: 100%; max-width: 1000px; max-height: 90vh; border: 1px solid var(--accent); border-radius: 12px; position: relative; display: grid; grid-template-columns: 1.2fr 0.8fr; overflow: hidden; }
        .close-modal { position: absolute; top: 15px; right: 20px; color: white; font-size: 2rem; cursor: pointer; z-index: 101; line-height: 1; text-shadow: 0 0 10px #000; }
        .modal-carousel { width: 100%; height: 100%; min-height: 450px; position: relative; background: #000; display: flex; align-items: center; justify-content: center; overflow: hidden; }
        .carousel-img { width: 100%; height: 100%; object-fit: contain; display: none; cursor: zoom-in; background: #000; }
        .carousel-img.active { display: block; }
        .carousel-nav { position: absolute; top: 50%; width: 100%; display: flex; justify-content: space-between; transform: translateY(-50%); padding: 0 15px; box-sizing: border-box; pointer-events: none; }
        .nav-btn { background: rgba(197, 160, 89, 0.7); border: none; color: white; width: 40px; height: 40px; border-radius: 50%; cursor: pointer; font-size: 1.2rem; pointer-events: auto; transition: 0.3s; }
        .nav-btn:hover { background: var(--accent); color: #000; }
        .modal-info { padding: 30px; overflow-y: auto; overflow-x: hidden; display: flex; flex-direction: column; background: #0a0a0a; border-left: 1px solid #222; box-sizing: border-box; }
        .modal-info h2 { font-family: 'Orbitron'; color: var(--accent); margin-bottom: 5px; font-size: 1.4rem; }
        .modal-desc { margin: 20px 0; font-size: 0.95rem; line-height: 1.6; color: #ccc; white-space: pre-wrap; word-wrap: break-word; }
        .inquire-now-btn { display: block; width: 100%; background: var(--accent); color: #000; text-align: center; padding: 14px; font-weight: 800; font-family: 'Orbitron'; text-decoration: none; border-radius: 5px; margin-top: auto; transition: 0.3s; font-size: 1rem; box-sizing: border-box; }
        .lightbox-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: #000; display: none; z-index: 3000; justify-content: center; align-items: center; }
        .lightbox-content { width: 100%; height: 100%; display: flex; justify-content: center; align-items: center; position: relative; }
        .lightbox-img { max-width: 95%; max-height: 90%; object-fit: contain; }
        .close-lightbox { position: absolute; top: 20px; right: 20px; color: white; font-size: 2.5rem; cursor: pointer; z-index: 3001; }
        .lb-nav { position: absolute; bottom: 30px; width: 100%; display: flex; justify-content: center; gap: 40px; z-index: 3001; }
        .lb-btn { background: rgba(197, 160, 89, 0.8); color: black; border: none; padding: 10px 20px; font-size: 1.5rem; cursor: pointer; border-radius: 5px; }
        @media (max-width: 768px) {
            .mobile-menu-icon { display: block; }
            nav { position: absolute; top: 65px; left: 0; width: 100%; background: rgba(10, 10, 10, 0.98); height: 0; overflow: hidden; transition: 0.4s ease-in-out; border-bottom: 0px solid var(--accent); }
            nav.open { height: 250px; border-bottom: 2px solid var(--accent); }
            nav ul { flex-direction: column; align-items: center; padding: 20px 0; gap: 20px; }
            nav ul li a { font-size: 1.1rem; }
            .property-hero { height: 40vh; padding-top: 100px; }
            .property-grid { grid-template-columns: 1fr; padding: 30px 5%; }
            .modal-content { grid-template-columns: 1fr; width: 95%; max-height: 90vh; overflow-y: auto; }
            .modal-carousel { min-height: 250px; height: 250px; }
            .filter-container { justify-content: flex-start; }
            .modal-info { border-left: none; border-top: 1px solid #222; }
            .img-box { transform: none !important; transition: none !important; }
            .status-badge { transform: none !important; }
        }
        #no-results { display: none; grid-column: 1/-1; text-align: center; padding: 100px 0; color: #444; }
        ::-webkit-scrollbar { width: 10px; }
        ::-webkit-scrollbar-track { background: var(--dark); }
        ::-webkit-scrollbar-thumb { background: var(--accent); border-radius: 10px; border: 2px solid var(--dark); }
        ::-webkit-scrollbar-thumb:hover { background: #d4af37; }
        * { scrollbar-width: thin; scrollbar-color: var(--accent) var(--dark); }
        .modal-info::-webkit-scrollbar { width: 6px; }
        .modal-info::-webkit-scrollbar-thumb { background: var(--accent); border-radius: 10px; }
    </style>
</head>
<body>


<header>
    <div class="logo">
        <a href="index.html"><img src="assets/images/viber1.png" alt="Logo" class="header-logo" /></a>
    </div>
    <div class="mobile-menu-icon" id="menuToggle"><i class="fa-solid fa-bars"></i></div>
    <nav id="mainNav">
        <ul class="footer-nav-links">
                <li><a href="index.html">Home</a></li>
                <li><a href="property.php">Properties</a></li>
                <li><a href="virtual_office.php">Virtual Office</a></li>
                <li><a href="careers.html">Careers</a></li>
                <li><a href="blogs.html">Blogs</a></li> 
            </ul>
    </nav>
</header>
<section class="property-hero">
    <h1 data-aos="fade-down">The Alpha Premier Collections</h1>
    <div class="hero-search-container" data-aos="zoom-in" data-aos-delay="200">
        <i class="fa-solid fa-magnifying-glass"></i>
        <input type="text" id="propertySearch" placeholder="Search name or location...">
    </div>
</section>
<div class="filter-container">
    <button class="filter-btn active" data-filter="all">All</button>
    <button class="filter-btn" data-filter="warehouse">Warehouse</button>
    <button class="filter-btn" data-filter="commercial_spaces">Commercial</button>
    <button class="filter-btn" data-filter="office_spaces">Office</button>
    <button class="filter-btn" data-filter="condominium">Condo</button>
    <button class="filter-btn" data-filter="house">House</button>
    <button class="filter-btn" data-filter="virtual_office">Virtual</button>
</div>
<main class="property-grid" id="property-list">
    <?php
    if ($result->num_rows > 0) {
        while($row = $result->fetch_assoc()) {
            $db_type = strtolower(trim($row['property_type'] ?? ''));
            $category_slug = preg_replace('/[\s-]+/', '_', $db_type);
            $price_display = ($row['price'] > 0) ? $row['price_unit'] . " " . number_format($row['price'], 2) : "Contact for Price";
            $images_raw = $row['images'];
            $images_array = explode(',', $images_raw);
            $first_img = !empty($images_array[0]) ? trim($images_array[0]) : 'assets/images/placeholder.jpg';
    ?>
        <div class="property-card js-3d-card" data-aos="fade-up" 
             data-category="<?php echo $category_slug; ?>" 
             data-title="<?php echo strtolower($row['title']); ?>" 
             data-location="<?php echo strtolower($row['location']); ?>">
            <div class="img-box">
                <span class="status-badge"><?php echo $row['status']; ?></span>
                <img src="<?php echo $first_img; ?>" alt="Property" loading="lazy">
            </div>
            <div class="card-body">
                <span class="price-text"><?php echo $price_display; ?></span>
                <h3 class="title-text"><?php echo $row['title']; ?></h3>
                <p class="loc-text"><i class="fa-solid fa-location-dot" style="color:var(--accent); margin-right:5px;"></i> <?php echo $row['location']; ?></p>
                <div class="specs">
                    <span><i class="fa-solid fa-ruler-combined"></i> <?php echo $row['floor_area']; ?> sqm</span>
                    <span><i class="fa-solid fa-maximize"></i> <?php echo $row['lot_area']; ?> sqm</span>
                </div>
                <button type="button" class="view-btn open-modal-btn" 
                    data-title="<?php echo htmlspecialchars($row['title']); ?>"
                    data-price="<?php echo $price_display; ?>"
                    data-loc="<?php echo htmlspecialchars($row['location']); ?>"
                    data-status="<?php echo $row['status']; ?>"
                    data-floor="<?php echo $row['floor_area']; ?>"
                    data-lot="<?php echo $row['lot_area']; ?>"
                    data-desc="<?php echo htmlspecialchars($row['description']); ?>"
                    data-imgs="<?php echo $images_raw; ?>">VIEW DETAILS</button>
            </div>
        </div>
    <?php } } ?>
    <div id="no-results">
        <i class="fa-solid fa-building-circle-exclamation" style="font-size: 3rem; opacity: 0.2; margin-bottom: 15px;"></i>
        <p style="font-family: 'Orbitron'; letter-spacing: 1px;">No properties found.</p>
    </div>
</main>
<div class="modal-overlay" id="propModal">
    <div class="modal-content">
        <span class="close-modal">&times;</span>
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
<div class="lightbox-overlay" id="lightbox">
    <div class="lightbox-content">
        <span class="close-lightbox">&times;</span>
        <img src="" class="lightbox-img" id="lbImg">
        <div class="lb-nav">
            <button class="lb-btn" onclick="moveLightbox(-1)">❮</button>
            <button class="lb-btn" onclick="moveLightbox(1)">❯</button>
        </div>
    </div>
</div>

<script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
<script src="https://unpkg.com/aos@2.3.1/dist/aos.js"></script>


<script>
    $(document).ready(function() {
        AOS.init({ duration: 800, once: true });
        $('#menuToggle').on('click', function() {
            $('#mainNav').toggleClass('open');
            const icon = $(this).find('i');
            icon.hasClass('fa-bars') ? icon.removeClass('fa-bars').addClass('fa-xmark') : icon.removeClass('fa-xmark').addClass('fa-bars');
        });
        function filterItems() {
            const search = $('#propertySearch').val().toLowerCase();
            const filter = $('.filter-btn.active').attr('data-filter');
            let count = 0;
            $('.property-card').each(function() {
                const match = ($(this).attr('data-title').includes(search) || $(this).attr('data-location').includes(search)) && (filter === 'all' || $(this).attr('data-category') === filter);
                match ? ($(this).show(), count++) : $(this).hide();
            });
            count === 0 ? $('#no-results').show() : $('#no-results').hide();
            AOS.refresh();
        }
        $('.filter-btn').click(function() { $('.filter-btn').removeClass('active'); $(this).addClass('active'); filterItems(); });
        $('#propertySearch').on('keyup', filterItems);
        let currentSlide = 0, totalSlides = 0, imgList = [];
        window.moveSlide = function(n) {
            currentSlide = (currentSlide + n + totalSlides) % totalSlides;
            $('.carousel-img').hide().removeClass('active').eq(currentSlide).show().addClass('active');
        };
        $('.open-modal-btn').on('click', function() {
            const d = $(this).data();
            $('#mTitle').text(d.title); $('#mPrice').text(d.price); $('#mLoc').html('<i class="fa-solid fa-location-dot"></i> ' + d.loc);
            $('#mStatus').text(d.status); $('#mFloor').text(d.floor); $('#mLot').text(d.lot); $('#mDesc').text(d.desc);
            imgList = d.imgs.split(',').map(s => s.trim());
            totalSlides = imgList.length; currentSlide = 0;
            let imgHtml = '';
            imgList.forEach((src, i) => { imgHtml += `<img src="${src}" class="carousel-img ${i===0?'active':''}" style="display:${i===0?'block':'none'}">`; });
            if(totalSlides > 1) imgHtml += `<div class="carousel-nav"><button class="nav-btn" onclick="moveSlide(-1)">❮</button><button class="nav-btn" onclick="moveSlide(1)">❯</button></div>`;
            $('#carouselWrapper').html(imgHtml);
            $('#propModal').css('display', 'flex');
            $('body').css('overflow', 'hidden');
        });
        let lbIndex = 0;
        $(document).on('click', '.carousel-img', function() {
            lbIndex = currentSlide;
            $('#lbImg').attr('src', imgList[lbIndex]);
            $('#lightbox').css('display', 'flex');
        });
        window.moveLightbox = function(n) {
            lbIndex = (lbIndex + n + imgList.length) % imgList.length;
            $('#lbImg').attr('src', imgList[lbIndex]);
        };
        $('.close-lightbox, #lightbox').on('click', function(e) {
            if (e.target !== this && !$(e.target).hasClass('close-lightbox')) return;
            $('#lightbox').hide();
        });
        $('.close-modal, #propModal').on('click', function(e) {
            if (e.target !== this && !$(e.target).hasClass('close-modal')) return;
            $('#propModal').hide();
            $('body').css('overflow', 'auto');
        });
        const cards = document.querySelectorAll('.js-3d-card');
        if (window.innerWidth > 768) {
            cards.forEach(card => {
                const imgBox = card.querySelector('.img-box');
                card.addEventListener('mousemove', (e) => {
                    const cardRect = card.getBoundingClientRect();
                    const cardWidth = cardRect.width;
                    const cardHeight = cardRect.height;
                    const mouseX = e.clientX - cardRect.left - cardWidth / 2;
                    const mouseY = e.clientY - cardRect.top - cardHeight / 2;
                    const rotateX = (-mouseY / (cardHeight / 2)) * 10; 
                    const rotateY = (mouseX / (cardWidth / 2)) * 10;
                    imgBox.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(10px)`;
                });
                card.addEventListener('mouseleave', () => {
                    imgBox.style.transform = 'rotateX(0deg) rotateY(0deg) translateZ(0deg)';
                });
            });
        }
    });
</script>
<style>
    /* Footer Styling base sa Image_0.png */
    footer {
        padding: 60px 8% 30px;
        background: linear-gradient(rgba(0, 0, 0, 0.9), rgba(0, 0, 0, 0.95)), 
                    url('assets/images/golden.png'); /* Panatilihin ang background image */
        background-size: cover;
        background-position: center;
        background-attachment: fixed;
        border-top: 1px solid rgba(197, 160, 89, 0.2);
        color: #fff;
        font-family: 'Poppins', sans-serif; /* Panatilihin ang font family */
        position: relative;
    }

    /* Main Content Container (Logo at Nav) */
    .footer-main-content {
        display: flex;
        justify-content: space-between; /* Pinaghihiwalay ang Logo at Nav sa magkabilang dulo */
        align-items: flex-start;
        flex-wrap: wrap;
        gap: 40px;
        margin-bottom: 50px; /* Spacing bago ang bottom line */
    }

    /* Kaliwang Side: Logo at Button */
    .footer-left-section {
        flex: 1;
        min-width: 250px;
    }

    .footer-logo img {
        height: 50px; /* Sukat ng logo */
        width: auto;
        margin-bottom: 25px; /* Spacing sa ilalim ng logo */
    }

    .inquire-btn {
        display: inline-block;
        padding: 12px 28px;
        background-color: var(--accent); /* Panatilihin ang gold color */
        color: #000; /* Itim na text */
        text-decoration: none;
        font-family: 'Orbitron', sans-serif;
        font-weight: 700;
        border-radius: 4px; /* Bahagyang kurbado */
        transition: 0.3s ease;
        text-transform: uppercase;
        font-size: 0.85rem;
        letter-spacing: 1px;
    }

    .inquire-btn:hover {
        background-color: #fff; /* Puti kapag na-hover */
        transform: translateY(-2px); /* Bahagyang aangat */
    }

    /* Kanang Side: Navigation Links */
    .footer-right-section {
        flex: 1;
        min-width: 200px;
        text-align: right; /* I-align ang lahat sa kanan */
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
        margin: 0;
    }

    .footer-nav-links li {
        margin-bottom: 12px;
    }

    .footer-nav-links li a {
        color: #bbb; /* Medyo gray na text */
        text-decoration: none;
        transition: 0.3s ease;
        font-size: 0.9rem;
    }

    .footer-nav-links li a:hover {
        color: var(--accent); /* Magiging gold kapag na-hover */
    }

    /* Bottom Section: Copyright at Social Icons */
    .footer-bottom-bar {
        border-top: 1px solid rgba(255, 255, 255, 0.08); /* Manipis na linyang naghihiwalay */
        padding-top: 30px;
        display: flex;
        justify-content: space-between; /* Copyright sa kaliwa, Icons sa kanan */
        align-items: center;
        flex-wrap: wrap;
        gap: 20px;
    }

    .footer-bottom-bar p {
        font-size: 0.8rem;
        color: #777; /* Mas madilim na gray para sa copyright */
        margin: 0;
    }

    .social-icons-list {
        display: flex;
        gap: 15px; /* Spacing sa pagitan ng mga icons */
        list-style: none;
        padding: 0;
        margin: 0;
    }

    .social-icons-list a {
        color: #fff; /* Puting icons */
        font-size: 1.1rem;
        transition: 0.3s ease;
        width: 35px; /* Sukat ng bilog */
        height: 35px;
        border: 1px solid rgba(255,255,255,0.2); /* Manipis na bilog */
        border-radius: 50%; /* Gawing bilog */
        display: flex;
        justify-content: center;
        align-items: center;
    }

    .social-icons-list a:hover {
        color: var(--accent);
        border-color: var(--accent); /* Magiging gold ang bilog at icon kapag na-hover */
        transform: scale(1.1); /* Bahagyang lalaki */
    }

    /* Responsive Mobile View */
    @media (max-width: 768px) {
        footer {
            padding: 40px 5% 20px;
        }

        .footer-main-content {
            flex-direction: column;
            text-align: center; /* I-center ang lahat sa mobile */
            gap: 30px;
        }

        .footer-right-section {
            text-align: center; /* I-center ang nav links sa mobile */
        }

        .footer-bottom-bar {
            flex-direction: column; /* Pagpatung-patungin ang copyright at icons */
            text-align: center;
            gap: 15px;
        }
    }
</style>

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
                <li><a href="#hero">Home</a></li>
                <li><a href="property.php">Properties</a></li>
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