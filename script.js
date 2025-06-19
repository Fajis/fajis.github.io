document.getElementById('contact-form').addEventListener('submit', function (e) {
  e.preventDefault();
  document.getElementById('response-message').textContent = "Message sent! (Not really — this is a static site.)";
});