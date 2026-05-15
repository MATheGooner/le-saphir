// Navbar scroll effect
window.addEventListener('scroll', function() {
    const navbar = document.getElementById('navbar');
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

const contactForm = document.getElementById('contact-form');

window.addEventListener('load', () => {
    if (!contactForm) return;

    emailjs.init('Yxv5_LR-1O_wKw4MP');

    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const data = new FormData(contactForm);

        const payload = Object.fromEntries(data.entries());
        console.log("Sending payload:", payload); // DEBUG

        // STRICT VALIDATION (fixes your 400 error)
        if (
            !payload.from_name ||
            !payload.from_email ||
            !payload.phone ||
            !payload.guests ||
            !payload.date ||
            !payload.time
        ) {
            alert('Please fill in all required fields');
            return;
        }

        try {
            await emailjs.sendForm(
                'service_hbjsvi7',
                'template_fuuqiwe',
                contactForm
            );

            alert('Reservation sent successfully');
            contactForm.reset();

        } catch (error) {
            console.error('EmailJS Error:', error);
            alert('Failed to send reservation');
        }
    });
});