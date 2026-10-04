const testLogin = async () => {
  const res = await fetch("http://localhost:3000/api/auth/callback/credentials", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ email: "admin@example.com", password: "password123" }),
  });
  console.log("Status:", res.status);
  const data = await res.text();
  console.log("Response starts with:", data.slice(0, 100));
};
testLogin();
