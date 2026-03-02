fetch('http://localhost:5000/api/leads')
  .then(res => res.json())
  .then(data => {
    console.log("Leads GET works:", data.success);
    return fetch('http://localhost:5000/api/history');
  })
  .then(res => res.json())
  .then(data => {
    console.log("History GET works:", data.success);
    return fetch('http://localhost:5000/api/search/generate', {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: "software engineers in lagos" })
    });
  })
  .then(res => res.json())
  .then(data => {
    console.log("Search POST works:", data.success);
    if(data.success){
      console.log("Variant labels:", data.variants.map(v => v.label));
    } else {
      console.error(data.error);
    }
  })
  .catch(err => console.error(err));
