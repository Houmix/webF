// Importing the background modules
import { CurveGradientBg } from '../jsm/CurveGradientBg.module.js';
import { AestheticFluidBg } from '../jsm/AestheticFluidBg.module.js';
import { WavyWavesBg } from '../jsm/WavyWavesBg.module.js';			

// Check if user is admin and apply admin mode
function checkAdminMode() {
    const isAdmin = localStorage.getItem('isAdmin') === 'true';
    if (isAdmin) {
        document.body.classList.add('admin-mode');
        // Initialize admin background
        try {
            const adminBg = new AestheticFluidBg({
                dom: "box",
                colors: ["#212832","#3F4659","#131a25","#3c4772","#212832","#3F4659"],
                loop: true
            });
            console.log("Admin background initialized!");
        } catch (error) {
            console.error('Error loading admin background:', error);
            document.body.style.background = 'linear-gradient(135deg, #212832 0%, #3F4659 50%, #131a25 100%)';
        }
    } else {
        document.body.classList.remove('admin-mode');
        // Initialize normal background
        try {
            const colorbg = new CurveGradientBg({
                dom: "box",
                colors: ["#d486fe", "#a77cfe", "#7cd7fe", "#86abf3", "#a0ddee", "#e2f5db"],
                loop: true
            });
            console.log("Normal background initialized!");
        } catch (error) {
            console.error('Error loading normal background:', error);
            document.body.style.background = 'linear-gradient(135deg, #d486fe 0%, #7cd7fe 50%, #e2f5db 100%)';
        }
    }
}

// Initialize gradient background
try {
    const colorbg = new WavyWavesBg({
        dom: "box",  // This should match an element ID in your HTML
        colors: ["#5d62f9","#8dadf7","#2e4fa3","#132385","#0C0D62","#000129"],
        loop: true
    });
    
    console.log("Gradient initialized!");

    // Add a fallback in case the gradient doesn't initialize
    if (!colorbg) {
        document.body.style.background = 'linear-gradient(135deg, #d486fe 0%, #7cd7fe 50%, #e2f5db 100%)';
    }
} catch (error) {
    console.error('Error loading gradient:', error);
    // Fallback gradient if module fails to load
    document.body.style.background = 'linear-gradient(135deg, #d486fe 0%, #7cd7fe 50%, #e2f5db 100%)';
}

// Account dropdown toggle
const accountButton = document.querySelector('.account-button');
const dropdown = document.querySelector('.account-dropdown');

if (accountButton && dropdown) {
    accountButton.addEventListener('click', function(e) {
        e.stopPropagation();
        dropdown.classList.toggle('show');
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', function(e) {
        if (!dropdown.contains(e.target) && !accountButton.contains(e.target)) {
            dropdown.classList.remove('show');
        }
    });
}

document.addEventListener('DOMContentLoaded', () => {
    // Check admin mode on page load
    // checkAdminMode();

    const menuToggles = document.querySelectorAll('.menu-toggle');
    const closeMenu = document.querySelector('.close-menu');
    const fullPageMenu = document.querySelector('.full-page-menu');
    const menuItemWithSubmenu = document.querySelector('.menu-item-with-submenu');

    // Toggle menu for both desktop and mobile
    menuToggles.forEach(toggle => {
        toggle.addEventListener('click', () => {
            fullPageMenu.classList.add('active');
            document.body.style.overflow = 'hidden'; // Prevent scrolling when menu is open
        });
    });

    // Close menu
    closeMenu.addEventListener('click', () => {
        fullPageMenu.classList.remove('active');
        document.body.style.overflow = ''; // Restore scrolling
    });

    // Close menu when clicking outside
    fullPageMenu.addEventListener('click', (e) => {
        if (e.target === fullPageMenu) {
            fullPageMenu.classList.remove('active');
            document.body.style.overflow = '';
        }
    });

    // Handle submenu toggle
    if (menuItemWithSubmenu) {
        const menuLink = menuItemWithSubmenu.querySelector('.menu-link');
        menuLink.addEventListener('click', (e) => {
            e.preventDefault();
            menuItemWithSubmenu.classList.toggle('active');
        });
    }

    // Handle menu links
    const menuLinks = document.querySelectorAll('.menu-link:not(.menu-item-with-submenu .menu-link)');
    menuLinks.forEach(link => {
        link.addEventListener('click', () => {
            fullPageMenu.classList.remove('active');
            document.body.style.overflow = '';
        });
    });

    // Handle submenu links
    const submenuLinks = document.querySelectorAll('.submenu-link');
    submenuLinks.forEach(link => {
        link.addEventListener('click', () => {
            fullPageMenu.classList.remove('active');
            document.body.style.overflow = '';
        });
    });
}); 