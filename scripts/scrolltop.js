
const navLinks = document.querySelectorAll("nav a[href^='#']");
const sections = document.querySelectorAll("main section");

navLinks.forEach(link => {
  link.addEventListener("click", function(e) {
    e.preventDefault();

    const targetId = this.getAttribute("href");
    const target = document.querySelector(targetId);

    sections.forEach(section => {
      section.classList.remove("active");
      section.classList.add("blur");
    });

    target.classList.remove("blur");
    target.classList.add("active");

    target.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });
  });
});
document.addEventListener("click", function(e) {

  if (!e.target.closest("nav")) {

    sections.forEach(section => {
      section.classList.remove("blur");
      section.classList.remove("active");
    });

  }

});
window.addEventListener("scroll", () => {
  if (window.scrollY > 300) {
    topBtn.style.display = "block";
  } else {
    topBtn.style.display = "none";
  }
});

topBtn.addEventListener("click", () => {
  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
});
