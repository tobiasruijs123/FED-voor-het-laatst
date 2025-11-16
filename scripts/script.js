document.addEventListener('DOMContentLoaded', () => {

    // -------------------------------
    // 1. DOM elementen selecteren
    // -------------------------------
    const header = document.querySelector('header');
    const menuToggle = document.querySelector('[aria-controls="main-navigation"]'); 
    const mainNavigation = document.querySelector('nav[role="navigation"]');
    const menuUl = mainNavigation ? mainNavigation.querySelector('ul') : null;

    const shopDropdownLink = document.querySelector('nav[role="navigation"] a[aria-haspopup="true"]');
    const shopDropdownSubmenu = shopDropdownLink ? shopDropdownLink.nextElementSibling : null;
    const allNavLinks = mainNavigation ? mainNavigation.querySelectorAll('a') : [];

    // CAROUSEL SELECTOREN
    const carouselSection = document.querySelector('main section[aria-label="Shop per Collectie"]');
    const carouselList = carouselSection ? carouselSection.querySelector('ul') : null;
    const prevButton = carouselSection ? carouselSection.querySelector('button[data-direction="prev"]') : null;
    const nextButton = carouselSection ? carouselSection.querySelector('button[data-direction="next"]') : null;

    // SELECTOREN VOOR STYLING
    const logoContainer = document.querySelector('header h1 a');
    const logoWit = logoContainer ? logoContainer.querySelector('img:nth-child(1)') : null;
    const logoZwart = logoContainer ? logoContainer.querySelector('img:nth-child(2)') : null;
    const currencyText = document.querySelector('header section p');
    const headerLinks = document.querySelectorAll('header a'); 
    
    // Kleur constanten
    const primaryText = 'black'; 
    const secondaryText = 'white';
    const drempel = 100;


    // -------------------------------
    // 2. Mobiele menu toggle
    // -------------------------------
    
    const toggleMobileMenu = (newState) => {
        if (!menuToggle || !header) return;
        const isCurrentlyExpanded = menuToggle.getAttribute('aria-expanded') === 'true';
        const finalState = newState !== undefined ? newState : !isCurrentlyExpanded;

        header.classList.toggle('menu-open', finalState);
        menuToggle.setAttribute('aria-expanded', finalState);
        
        if (window.innerWidth < 768) {
            document.body.style.overflow = finalState ? 'hidden' : '';
            
            if (finalState) {
                headerLinks.forEach(link => {
                    link.style.color = primaryText;
                });
                header.style.backgroundColor = secondaryText; 
                
            } else {
                updateHeaderStyle(); 
            }
        }

        if (menuUl) {
            menuUl.style.transform = finalState ? 'translateX(0)' : 'translateX(-100%)';
        }
    };

    if (menuToggle) {
        menuToggle.addEventListener('click', () => toggleMobileMenu());
    }

    // Sluit menu na klik op link
    if (allNavLinks.length) {
        allNavLinks.forEach(link => {
            if (!link.getAttribute('aria-haspopup')) {
                link.addEventListener('click', () => {
                    if (menuToggle && menuToggle.getAttribute('aria-expanded') === 'true' && window.innerWidth < 768) {
                        setTimeout(() => toggleMobileMenu(false), 100);
                    }
                });
            }
        });
    }


    // -------------------------------
    // 3. Mobiele dropdown (Shop)
    // -------------------------------
    if (shopDropdownLink && shopDropdownSubmenu) {
        
        shopDropdownLink.addEventListener('click', (event) => {
            if (window.innerWidth < 768) {
                event.preventDefault();

                const isOpen = shopDropdownLink.getAttribute('aria-expanded') === 'true';
                const newState = !isOpen;

                shopDropdownLink.setAttribute('aria-expanded', newState);
                
                if (newState) {
                    shopDropdownSubmenu.style.maxHeight = shopDropdownSubmenu.scrollHeight + 'px';
                } else {
                    shopDropdownSubmenu.style.maxHeight = '0';
                }
            }
        });
    }

    // -------------------------------
    // 4. Scroll-hide header
    // -------------------------------
    if (header) {
        let lastScroll = 0;

        window.addEventListener('scroll', () => {
            const currentScroll = window.pageYOffset;
            const headerHeight = header.offsetHeight; 
            
            if (menuToggle && menuToggle.getAttribute('aria-expanded') === 'true') {
                 lastScroll = currentScroll;
                 return; 
            }

            if (currentScroll > lastScroll && currentScroll > headerHeight) {
                header.style.transform = `translateY(-${headerHeight}px)`; 

            } else {
                header.style.transform = 'translateY(0)';
            }

            lastScroll = currentScroll <= 0 ? 0 : currentScroll;
        });
    }

    // ------------------------------------------
    // 5. Carousel functionaliteit (INSTANT JUMP)
    // ------------------------------------------
    if (carouselList && prevButton && nextButton) {
        
        // Berekent de afstand die gescrold moet worden
        const getItemScrollDistance = () => {
            const firstItem = carouselList.firstElementChild;
            if (!firstItem) return 0;
            
            const itemWidth = firstItem.offsetWidth;
            const style = window.getComputedStyle(carouselList);
            const gap = parseFloat(style.gap) || 0; 
            
            return Math.ceil(itemWidth + gap);
        };

        // Bepaalt of de knoppen uitgeschakeld moeten worden
        const updateCarousel = () => {
            const currentScroll = carouselList.scrollLeft;
            const maxScroll = carouselList.scrollWidth - carouselList.offsetWidth; 
            const tolerance = 5; 

            if (maxScroll <= tolerance) { 
                prevButton.disabled = true;
                nextButton.disabled = true;
                return;
            }

            prevButton.disabled = currentScroll <= tolerance; 
            nextButton.disabled = currentScroll >= maxScroll - tolerance; 
        };

        // Voert de daadwerkelijke scroll actie uit
        const scrollCarousel = (direction) => {
            const scrollDistance = getItemScrollDistance();
            
            if (scrollDistance > 0) {
                if (direction === 'next') {
                    carouselList.scrollLeft += scrollDistance;
                } else {
                    carouselList.scrollLeft -= scrollDistance;
                }
                
                updateCarousel();
            }
        };

        // Event listeners voor de knoppen
        prevButton.addEventListener('click', (event) => {
            event.preventDefault(); 
            if (!prevButton.disabled) {
                scrollCarousel('prev');
            }
        });

        nextButton.addEventListener('click', (event) => {
            event.preventDefault(); 
            if (!nextButton.disabled) {
                scrollCarousel('next');
            }
        });

        // Update de status bij scrollen, resizen en laden
        carouselList.addEventListener('scroll', updateCarousel);
        window.addEventListener('resize', updateCarousel);
        window.addEventListener('load', updateCarousel);
        
        updateCarousel();
    }

    // ------------------------------------------
    // 6. Dynamische Navigatiebalk Stijl
    // ------------------------------------------
    const updateHeaderStyle = () => {
        const scrollPosition = window.scrollY;

        if (menuToggle && menuToggle.getAttribute('aria-expanded') === 'true' && window.innerWidth < 768) {
             return; 
        }

        if (scrollPosition > drempel) {
            header.style.backgroundColor = secondaryText; 
           
            if (logoWit) logoWit.style.display = 'none';
            if (logoZwart) logoZwart.style.display = 'block';

            if (menuToggle) menuToggle.style.color = primaryText;
            
            headerLinks.forEach(link => {
                 link.style.color = primaryText;
            });
            
            if (currencyText) currencyText.style.color = primaryText;

        } else {
            header.style.backgroundColor = 'transparent';
            header.style.borderBottom = 'none'; 
            
            if (logoWit) logoWit.style.display = 'block';
            if (logoZwart) logoZwart.style.display = 'none';
            
            headerLinks.forEach(link => {
                link.style.color = secondaryText;
            });
            
            if (currencyText) currencyText.style.color = secondaryText;
        }
    };

    window.addEventListener('scroll', updateHeaderStyle);
    updateHeaderStyle();
    
    
    // ------------------------------------------
    // 7. Community Tegels Rotatie 
    // ------------------------------------------
    
    const rotatingTiles = document.querySelectorAll('section[aria-label="Join The TØTE Community"] ul li:nth-of-type(-n+5) a');

    rotatingTiles.forEach(tileLink => {
        const images = tileLink.querySelectorAll('img');
        
        if (images.length === 0) return; 
        
        let currentIndex = 0;

        const showNextImage = () => {
             images[currentIndex].style.opacity = 0;
            
            currentIndex = (currentIndex + 1) % images.length;
            
             images[currentIndex].style.opacity = 1;
        };

        const randomDelay = Math.random() * 2000 + 2000;

        images[0].style.opacity = 1; 

        setInterval(showNextImage, randomDelay);
        
    });
});

// ------------------------------------------
// 8. SCROLL-EIND GELUID: (Geluidseffect bij scroll omhoog)
// ------------------------------------------

const SCROLL_THRESHOLD = 10; 
const scrollEndSound = new Audio('assets/audio/going-up-102826.mp3'); 
scrollEndSound.volume = 0.6; 

let isSoundPlayed = false; 

const checkScrollEnd = () => {
    
    const totalHeight = document.documentElement.scrollHeight;
    const visibleHeight = window.innerHeight;
    const currentScroll = window.scrollY;
    const distanceToBottom = totalHeight - visibleHeight - currentScroll;
    
    // Speelt het geluid als we de bodem raken en het nog niet is afgespeeld
    if (distanceToBottom <= SCROLL_THRESHOLD && !isSoundPlayed) {
        
        isSoundPlayed = true; 
        
        scrollEndSound.play().catch(error => {
            console.warn("Scroll-End Audio afspelen mislukt, browser beperking:", error.name);
        });
        
    } 
    
    // Reset het geluid als we de bodem verlaten
    if (distanceToBottom > SCROLL_THRESHOLD && isSoundPlayed) {
        
        setTimeout(() => {
            isSoundPlayed = false;
        }, 50); 
    }
};

let isThrottled = false;
window.addEventListener('scroll', () => {
    if (!isThrottled) {
        checkScrollEnd();
        isThrottled = true;
        setTimeout(() => {
            isThrottled = false;
        }, 100); 
    }
});

// ------------------------------------------
// 9. SCROLL NAAR BOVEN BIJ ESCAPE-TOETS
// ------------------------------------------

document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
        
        event.preventDefault(); 
        
        // Scrollt naar de top van de pagina
        window.scrollTo({
            top: 0,              
            behavior: 'smooth'   
        });
        
        // Zet de focus op de header voor toegankelijkheid
        const header = document.querySelector('header');
        if (header) {
            header.setAttribute('tabindex', '-1'); 
            header.focus();                        
            header.removeAttribute('tabindex');    
        }
    }
});

// ----------------------------------------------------
// LETTERGROOTTE INSTELLEN
// ----------------------------------------------------

// Selecteer de knop met het unieke attribuut 'data-action="toggle-font-size"'
const toggler = document.querySelector('[data-action="toggle-font-size"]'); 

if (toggler) {
    const root = document.documentElement; // De <html> tag
    let isLarge = false;

    toggler.addEventListener('click', () => {
        if (!isLarge) {
            // Vergroot de basis font size
            root.style.setProperty('--font-size-base', '1.15em'); 
            toggler.textContent = 'Reduce Text size';
        } else {
            // Ga terug naar de standaard (wat in je CSS staat)
            root.style.setProperty('--font-size-base', '1em'); 
            toggler.textContent = 'Enlarge Text size';
        }
        isLarge = !isLarge;
    });
} else {
    console.warn("Knop voor lettergrootte met data-action='toggle-font-size' is niet gevonden.");
}