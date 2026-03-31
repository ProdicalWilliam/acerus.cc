function handleLogin(event) {
  event.preventDefault();

  const key = document.getElementById("licenseKey").value;

  if (!key) {
    alert("Please enter a license key");
    return;
  }

  // Example behavior
  console.log("Key entered:", key);

  // Redirect (example)
  window.location.href = "../dashboard.html";
}function handleLogin(event) {
  event.preventDefault();

  const key = document.getElementById("licenseKey").value;

  if (!key) {
    alert("Please enter a license key");
    return;
  }

  // Example behavior
  console.log("Key entered:", key);

  // Redirect (example)
  window.location.href = "../dashboard.html";
}
