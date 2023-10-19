// Toggle the mobile menu on small screens (dropdown)
function toggleMobileMenu() {
  const ids = ['mobile-menu', 'mobile-icon-menu-unselected', 'mobile-icon-menu-selected'];
  ids.forEach((id) => {
    const element = document.getElementById(id);
    if (element) {
      if (element.classList.contains('hidden')) {
        element.classList.remove('hidden');
      } else {
        element.classList.add('hidden');
      }
    }
  });
}

document.getElementById("toggleMobileMenu").addEventListener("click", function() {
  toggleMobileMenu();
});
