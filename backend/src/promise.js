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