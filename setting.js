document.addEventListener('DOMContentLoaded', () => {

    // Function để tải nội dung HTML từ file và chèn vào một element
    async function loadContent(file, targetElementId) {
        try {
            const response = await fetch(file);
            if (!response.ok) {
                throw new Error(`Failed to load ${file}: ${response.statusText}`);
            }
            const content = await response.text();
            const targetElement = document.getElementById(targetElementId);
            if (targetElement) {
                targetElement.innerHTML = content;
            } else {
                console.error(`Target element with id "${targetElementId}" not found.`);
            }
        } catch (error) {
            console.error(error);
        }
    }

    // Tải tất cả các file nội dung vào đúng vị trí
    loadContent('./content/intro.html', 'combat-intro-section');
    loadContent('./content/accordion1.html', 'accordion-content-1');
    loadContent('./content/accordion2.html', 'accordion-content-2');
    loadContent('./content/accordion3.html', 'accordion-content-3');
    loadContent('./content/accordion4.html', 'accordion-content-4');
    loadContent('./content/accordion5.html', 'accordion-content-5');
    loadContent('./content/accordion6.html', 'accordion-content-6');
    loadContent('./content/accordion7.html', 'accordion-content-7');
	loadContent('./content/role-guide.html', 'accordion-content-8');
	loadContent('./content/build-profile-guide.html', 'accordion-content-9');
    loadContent('./content/main-mechanics.html', 'accordion-content-10');
	loadContent('./content/deadline.html', 'accordion-content-deadline')
	

    // Xử lý chức năng đóng mở của các accordion
    const mainAccordions = document.querySelectorAll('.main-accordion');
    const nestedAccordions = document.querySelectorAll('.accordion');

    // Chức năng cho accordion chính
    mainAccordions.forEach(accordion => {
        const header = accordion.querySelector('.accordion-header');
        if (header) {
            header.addEventListener('click', () => {
                accordion.classList.toggle('active');
            });
        }
    });

    // Chức năng cho các accordion con
    nestedAccordions.forEach(accordion => {
        const header = accordion.querySelector('.accordion-header');
        if (header) {
            header.addEventListener('click', () => {
                accordion.classList.toggle('active');
            });
        }
    });

    // Xử lý nút "Trở về trang chủ"
    const backToHomeBtn = document.getElementById('backToHomeBtn');
    if (backToHomeBtn) {
        backToHomeBtn.addEventListener('click', () => {
            window.location.href = 'home.html';
        });
    }
});