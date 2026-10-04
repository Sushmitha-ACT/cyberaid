const testRegister = async () => {
  const res = await fetch("http://localhost:3000/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: "Admin", email: "admin@example.com", password: "password123" }),
  });
  console.log("Status:", res.status);
  const data = await res.json();
  console.log("Response:", data);
};
testRegister();
