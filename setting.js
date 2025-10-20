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
                // LƯU Ý: Đã XÓA logic JS để xử lý các accordion con (như patch-notes) 
                // vì chúng ta chuyển sang dùng thẻ <details> (tự xử lý).
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
	loadContent('./content/deadline.html', 'accordion-content-deadline');
    
    // Tải nội dung Update Patch
    loadContent('./content/patch-notes.html', 'accordion-content-patch');
	

    // Xử lý chức năng đóng mở của các accordion chính (.main-accordion)
    document.querySelectorAll('.main-accordion').forEach(accordion => {
        const header = accordion.querySelector('.accordion-header');
        if (header) {
            header.addEventListener('click', () => {
                accordion.classList.toggle('active');
            });
        }
    });

    // Xử lý chức năng đóng mở cho các accordion con (.accordion) có sẵn trong setting.html
    // Chúng ta VẪN cần giữ logic này để xử lý các accordion con KHÔNG được tải động (từ 01 đến 09).
    document.querySelectorAll('.accordion').forEach(accordion => {
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