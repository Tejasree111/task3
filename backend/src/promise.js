const fetch =require('node-fetch');
function myCallback(){
    console.log("callback function executed");
  }
setTimeout(myCallback, 10000);

cart=["item1","item2","item3"];
const promise=createOrder(cart);
promise.then(function(orderId){
    console.log(orderId);
}).catch(function(error)
{console.log(error);
});

function createOrder(cart){
    return new Promise((resolve,reject)=>{
        if(cart.length>0){
            resolve("Order created successfully");
        }else{
            reject("Cart is empty");
        }
 });
}

const obj = { name: "Ashish", age: 25 };
for (let key in obj) {
    console.log(key, ":", obj[key]);
}

class Car {
    constructor(make, model, year) {
        this.make = make;
        this.model = model;
        this.year = year;
    }

    getCarInfo() {
        return `${this.year} ${this.make} ${this.model}`;
    }
}

let myCar = new Car('Honda', 'Civil', 2022);
console.log(myCar.getCarInfo());




let a= ["html","css","js"];
console.log(a[0]);
console.log(a.toString().toUpperCase().split(" "))





console.log("variable hoisting",varA);
var varA=120;

//console.log("let hoisting",varB);
let varB=120;

let obj1={name : "Teju"}
let obj2={age : 20}
let obj3={...obj1,...obj2}
console.log(obj3)

console.log("using obj.assign method", Object.assign({},obj1,obj2))





const GITHUB_API="http://api.github.com/users/akshaymarch7"
const user=fetch(GITHUB_API);
console.log("userrrr",user);
user.then(function(data){
    console.log("dataaaa",data);
})




//the problem with this was the program will wait at the line 92 for the promise to resolve but in the real terms it will not wait for the promise to resolve what ever the lines after the promise js engine will execute quickly and then after the promise is resolved then the resolved or rejected statements are printed or returned

const p = new Promise((resolve,reject)=>{
    setTimeout(()=>{
        resolve("promise returned successfully")
    },10000);
})

function getData(){
    p.then((res)=>{ console.log(res);})//waits
    console.log("javascript")//it won't wait for the promise to get resolved or rejected

}
getData();


//async and await

async function handlePromise(){
    console.log("before await it will execute immediately")
    //here the js engine will suspend(handlePromise() function is suspended and it will not block the main thread ) till the promise get resolved
    //here the js engine will prints the logs or executes which are above the await function, once it reaches the await function then the function is removed from the call stack and waits for the promise to get resolved after 5 sec the handlePromise function again comes into the call stack and then executes(where it actually left) and then it will checks wheather the p2 is resolved or not (p2=10sec) once it is resolved then repeats the same steps
    const val=await p;
    console.log("async and await");
    console.log(val);
    //if you have 2 or more awaits 
    //case 1 if p1=10s,p2=5s then all the things are executed after 10sec
    //case 2 if p1=5s,p2=10s then after 5 secs the first promise is printed and after 5sec(p1=10sec) another promise is printed!!
}
handlePromise();
//fetch() it is a promise and it gives you a "response obj" and it has a body which is a readable stream 
// if you want to readable stream to json (response.json)
//fetch()=>response.json()=> result(json value)      ---(it is again a promise)
//example inside handlePromise()
//async handlePromise(){
// const data=await fetch("Apiurl");
// const jsonValue=await data.json();
// console.log(jsonValue);}



const mul=(a,b)=>{
    return new Promise((resolve)=>{
        resolve(a*b);
    })
}
const sq=(x)=>{
    return new Promise((resolve)=>{
        resolve(x*x);
    })
}

mul(2,3)
.then(result=>sq(result))
.then(result=>console.log("square of the product is :",result))
.catch(err=>console.log(err));