// ==========================================
// 1. FUNGSI HAMBURGER MENU (MOBILE NAVIGATION)
// ==========================================

function toggleMenu() {
    const nav = document.querySelector('.navigation');
    const hamburgerIcon = document.querySelector('.hamburger i');
    
    // 1. Toggle class 'active' pada navigasi (Buka/Tutup)
    nav.classList.toggle('active');

    // 2. Tukar ikon dari 'Garis' (fa-bars) ke 'X' (fa-times)
    // Pastikan hamburgerIcon wujud sebelum tukar class
   if (hamburgerIcon) {
    if (nav.classList.contains('active')) {
        hamburgerIcon.classList.remove('fa-bars');
        hamburgerIcon.classList.add('fa-xmark');
    } else {
        hamburgerIcon.classList.remove('fa-xmark');
        hamburgerIcon.classList.add('fa-bars');
    }
}
}

// ==========================================
// 2. FUNGSI DROPDOWN (Mobile)
// ==========================================
function toggleDropdown(e) {
    // Hanya jalan di mobile (bila skrin <= 768px)
    if (window.innerWidth <= 768) {
        e.preventDefault(); // Elak link reload page
        const dropdownContent = document.querySelector('.dropdown-content');
        
        // Toggle display block/none
        if (dropdownContent.style.display === 'block') {
            dropdownContent.style.display = 'none';
        } else {
            dropdownContent.style.display = 'block';
        }
    }
}

// ==========================================
// 3. TUTUP MENU BILA KLIK LINK
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
    const navLinks = document.querySelectorAll('.navigation a');
    
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            const nav = document.querySelector('.navigation');
            const hamburgerIcon = document.querySelector('.hamburger i');
            
            // Jika menu tengah buka, tutup dia
            if (nav.classList.contains('active')) {
                nav.classList.remove('active');
                
                // Reset ikon
                if (hamburgerIcon) {
                    hamburgerIcon.classList.remove('fa-times');
                    hamburgerIcon.classList.add('fa-bars');
                }
            }
        });
    });
});
