// ==========================================
// 1. ANIMASI SCROLL (INTERSECTION OBSERVER)
// ==========================================
const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
        if (entry.isIntersecting) {
            entry.target.classList.add('show');
        } else {
            entry.target.classList.remove('show');
        }
    });
});

const hiddenElements = document.querySelectorAll('.hidden');
hiddenElements.forEach((el) => observer.observe(el));


// ==========================================
// 2. KOD POPUP GAMBAR (MODAL)
// ==========================================

// Fungsi buka modal
function openModal(imageSrc) {
    var modal = document.getElementById("imageModal");
    var modalImg = document.getElementById("img01");
    modal.style.display = "block";
    modalImg.src = imageSrc;
}

// Fungsi tutup modal
function closeModal() {
    var modal = document.getElementById("imageModal");
    modal.style.display = "none";
}

// Tutup modal jika user tekan kawasan luar gambar
window.onclick = function(event) {
    var modal = document.getElementById("imageModal");
    if (event.target == modal) {
        modal.style.display = "none";
    }
}


// ==========================================
// 3. KOD HAMBURGER MENU (MOBILE NAVIGATION)
// ==========================================

function toggleMenu() {
    const nav = document.querySelector('.navigation');
    const hamburgerIcon = document.querySelector('.hamburger i');
    
    // 1. Toggle class 'active' pada navigasi (Buka/Tutup)
    nav.classList.toggle('active');

    // 2. Tukar ikon dari 'Garis' (fa-bars) ke 'X' (fa-times)
    if (nav.classList.contains('active')) {
        hamburgerIcon.classList.remove('fa-bars');
        hamburgerIcon.classList.add('fa-times');
    } else {
        hamburgerIcon.classList.remove('fa-times');
        hamburgerIcon.classList.add('fa-bars');
    }
}

// Tambahan: Tutup menu secara automatik bila user klik mana-mana link
// (Supaya menu tak menghalang pandangan selepas user pilih halaman)
document.addEventListener("DOMContentLoaded", () => {
    const navLinks = document.querySelectorAll('.navigation a');
    
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            const nav = document.querySelector('.navigation');
            const hamburgerIcon = document.querySelector('.hamburger i');
            
            // Tutup menu
            if (nav.classList.contains('active')) {
                nav.classList.remove('active');
                
                // Reset ikon kembali ke 'Bars'
                if (hamburgerIcon) {
                    hamburgerIcon.classList.remove('fa-times');
                    hamburgerIcon.classList.add('fa-bars');
                }
            }
        });
    });
});