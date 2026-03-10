let token;
const email = `test_${Date.now()}@example.com`;
const password = 'testpassword123';

console.log("Registering user:", email);
fetch('http://localhost:5000/api/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ name: 'Test User', email, password })
})
  .then(res => res.json())
  .then(data => {
    if (!data.success) throw new Error("Registration failed: " + data.error);
    console.log("Registration successful");
    return fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
  })
  .then(res => res.json())
  .then(data => {
    if (!data.success) throw new Error("Login failed: " + data.error);
    token = data.token;
    console.log("Login successful");
    return fetch('http://localhost:5000/api/search/generate', {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({ query: "software engineers in lagos" })
    });
  })
  .then(res => res.json())
  .then(data => {
    console.log("Search POST response:", JSON.stringify(data, null, 2));
    if(data.success){
      console.log("SUCCESS! Gemini 2.0 Flash is working.");
    } else {
      console.error("Search Error:", data.error);
    }
  })
  .catch(err => console.error("Test Script Error:", err.message));
