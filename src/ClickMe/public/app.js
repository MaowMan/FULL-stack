var varObj= {};

function init(){
    varObj.clickcount=0;
    varObj.clickcps=0;
    varObj.t0=new Date();
    update()
}

function clicky(){
    if (varObj.clickcount===0){
        varObj.t0=new Date()
    }
    varObj.clickcount+=1;
    let tn=new Date();
    varObj.clickcps=(varObj.clickcount/(tn.getTime()-varObj.t0.getTime()))*1000;
    update();
}

function update(){
    $("#count").text(String(varObj.clickcount));
    $("#cps").text(String(varObj.clickcps));
}

function test(){
    alert("testing");
}