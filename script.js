document.addEventListener('DOMContentLoaded', () => {

    // -------------------------------
    // 1. DOM elementen selecteren
    // -------------------------------
    const header = document.querySelector('header');
    
    // Selecteer de menuknop
    const menuToggle = document.querySelector('[aria-controls="main-navigation"]'); 
    
    // Selecteer de navigatie container
    const mainNavigation = document.querySelector('nav[role="navigation"]');
    
    // Selecteer de UL van de hoofdnavigatie
    const menuUl = mainNavigation ? mainNavigation.querySelector('ul') : null;

    // Selecteer de 'Shop' link
    const shopDropdownLink = document.querySelector('nav[role="navigation"] a[aria-haspopup="true"]');
    const shopDropdownSubmenu = shopDropdownLink ? shopDropdownLink.nextElementSibling : null;

    const allNavLinks = mainNavigation ? mainNavigation.querySelectorAll('a') : [];

    // CAROUSEL SELECTOREN (Sectie 5)
    const carouselSection = document.querySelector('main section[aria-label="Shop per Collectie"]');
    const carouselList = carouselSection ? carouselSection.querySelector('ul') : null;
    const prevButton = carouselSection ? carouselSection.querySelector('button[data-direction="prev"]') : null;
    const nextButton = carouselSection ? carouselSection.querySelector('button[data-direction="next"]') : null;

    // -------------------------------
    // SELECTOREN VOOR STYLING
    // -------------------------------
    const logoContainer = document.querySelector('header h1 a');
    const logoWit = logoContainer ? logoContainer.querySelector('img:nth-child(1)') : null;
    const logoZwart = logoContainer ? logoContainer.querySelector('img:nth-child(2)') : null;
    
    // Selecteer de SVG direct in de Cart <a>
    const cartIcon = document.querySelector('header section a[aria-label="Winkelwagen"] svg');
    
    // Selector voor de Valuta Tekst
    const currencyText = document.querySelector('header section p');
    
    // Selecteer alle <a> elementen in de header
    const headerLinks = document.querySelectorAll('header a'); 
    
    // Hulpfuncties voor kleuren
    const primaryText = 'black'; 
    const secondaryText = 'white';
    const drempel = 100; // Scroll drempel in pixels


    // -------------------------------
    // 2. Mobiele menu toggle (Surfaceplane: Custom Properties JS)
    // -------------------------------
    
    const toggleMobileMenu = (newState) => {
        if (!menuToggle || !header) return;
        const isCurrentlyExpanded = menuToggle.getAttribute('aria-expanded') === 'true';
        const finalState = newState !== undefined ? newState : !isCurrentlyExpanded;

        // Toggle de 'menu-open' klasse voor CSS (transform: translateX(0))
        header.classList.toggle('menu-open', finalState);

        // Update ARIA status voor het hamburger icoon
        menuToggle.setAttribute('aria-expanded', finalState);
        
        if (window.innerWidth < 768) {
            document.body.style.overflow = finalState ? 'hidden' : '';
            
            // Forceer alle header links naar ZWART als het menu OPENT
            if (finalState) {
                headerLinks.forEach(link => {
                    link.style.color = primaryText;
                });
                
                // Zorg ervoor dat de header bij openen wit is
                header.style.backgroundColor = secondaryText; 
                
            } else {
                // Herstel de kleur bij sluiten
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
        
        // Functie om de nauwkeurige itembreedte (+ gap) op te halen
        const getItemScrollDistance = () => {
            const firstItem = carouselList.firstElementChild;
            if (!firstItem) return 0;
            
            const itemWidth = firstItem.offsetWidth;
            const style = window.getComputedStyle(carouselList);
            // Haal de gap op en converteer naar een nummer
            const gap = parseFloat(style.gap) || 0; 
            
            // Afronden naar boven is cruciaal voor nauwkeurigheid!
            return Math.ceil(itemWidth + gap);
        };

        // Functie om de status van de knoppen bij te werken (disabled/enabled)
        const updateCarousel = () => {
            const currentScroll = carouselList.scrollLeft;
            // scrollWidth is de totale breedte, offsetWidth is de zichtbare breedte
            const maxScroll = carouselList.scrollWidth - carouselList.offsetWidth; 
            
            // Tolerantie van 5 pixels voor afrondingsfouten (lost 'soms wel/niet' op)
            const tolerance = 5; 

            // Als er geen scrollen mogelijk is, deactiveer beide knoppen
            if (maxScroll <= tolerance) { 
                prevButton.disabled = true;
                nextButton.disabled = true;
                return;
            }

            // Deactiveer 'terug' knop BIJNA aan het begin
            prevButton.disabled = currentScroll <= tolerance; 
            
            // Deactiveer 'volgende' knop BIJNA aan het eind 
            nextButton.disabled = currentScroll >= maxScroll - tolerance; 
        };

        // Scroll functie voor directe sprongen ZONDER ANIMATIE
        const scrollCarousel = (direction) => {
            const scrollDistance = getItemScrollDistance();
            
            if (scrollDistance > 0) {
                if (direction === 'next') {
                    // Instant sprong naar rechts (gebruikt GEEN behavior: 'smooth')
                    carouselList.scrollLeft += scrollDistance;
                } else {
                    // Instant sprong naar links
                    carouselList.scrollLeft -= scrollDistance;
                }
                
                // Update knoppen direct na de sprong
                updateCarousel();
            }
        };

        // Navigeer naar het vorige item (TERUG)
        prevButton.addEventListener('click', (event) => {
            event.preventDefault(); // Zorgt dat de klik niet door de UL wordt geabsorbeerd
            if (!prevButton.disabled) {
                scrollCarousel('prev');
            }
        });

        // Navigeer naar het volgende item (DOOR)
        nextButton.addEventListener('click', (event) => {
            event.preventDefault(); // Zorgt dat de klik niet door de UL wordt geabsorbeerd
            if (!nextButton.disabled) {
                scrollCarousel('next');
            }
        });

        // Update listeners
        carouselList.addEventListener('scroll', updateCarousel);
        window.addEventListener('resize', updateCarousel);
        window.addEventListener('load', updateCarousel);
        
        // Roep direct aan om de initiële staat in te stellen
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

        // Start het effect voor de eerste afbeelding bij laden
        images[0].style.opacity = 1; 

        setInterval(showNextImage, randomDelay);
        
    });
});

// ------------------------------------------
// 8. SCROLL-EIND GELUID: (Surfaceplane: Geluidseffect bij scroll omhoog)
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
    
    if (distanceToBottom <= SCROLL_THRESHOLD && !isSoundPlayed) {
        
        isSoundPlayed = true; 
        
        scrollEndSound.play().catch(error => {
            console.warn("Scroll-End Audio afspelen mislukt, browser beperking:", error.name);
        });
        
    } 
    
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
// 9. SCROLL NAAR BOVEN BIJ ESCAPE-TOETS (Surfaceplane: Interactie met het toetsenbord++ (shortcuts, escape…) 
// ------------------------------------------

document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
        
        event.preventDefault(); 
        
        window.scrollTo({
            top: 0,              
            behavior: 'smooth'   
        });
        
        const header = document.querySelector('header');
        if (header) {
            header.setAttribute('tabindex', '-1'); 
            header.focus();                        
            header.removeAttribute('tabindex');    
        }
    }
});

// ----------------------------------------------------
// LETTERGROOTTE INSTELLEN (Surface plane: lettergrootte toggle)
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