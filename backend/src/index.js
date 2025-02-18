//var a=1;
//console.log(a);


function name(params) {
    // 200 lines
    const f = fn()
    
}

const getData=async()=>{
    let y= await "Hello World!"
    console.log(y)
}

console.log(1)
//console.log(getData());
getData()



async function fetchData() {
    try {
      let response = await fetch('https://fake-json-api.mock.beeceptor.com/users');
      let data = await response.json();
      console.log(data);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  }
  
fetchData();