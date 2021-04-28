var dog, sadDogImg, dogHappyImg;
var database;
var foodS, foodStock;

var feedPet, addFood;
var fedTime, lastFed;
var foodObj;

var bedRoomImg, gardenImg, washRoomImg;

var readState, currentTime;

var gameState = "hungry";

function preload()
{
	sadDogImg = loadImage("Dog.png");
  dogHappyImg = loadImage("happyDog.png");
  bedRoomImg = loadImage("bedroom.png");
  gardenImg = loadImage("Garden.png");
  washRoomImg = loadImage("washRoom.png");
}

function setup() {
	createCanvas(1000,500);

  database = firebase.database();

  foodObj = new Food();

  readState = database.ref('gameState');
  readState.on("value", function(data){
    gameState = data.val();
  })

  dog = createSprite(800,215,20,20); 
  dog.addImage(sadDogImg);
  dog.scale = 0.1;

  feedPet = createButton("Feed the Dog");
  feedPet.position(360,50);
  feedPet.mousePressed(feedDog);

  addFood = createButton("Add Food");
  addFood.position(465,50);
  addFood.mousePressed(addFoods);

  foodStock = database.ref('Food');
  foodStock.on("value", readStock);
}


function draw() { 

  background(46, 139, 87);

  currentTime = hour();

  if(currentTime === (lastFed + 1)){
    update("playing");
    foodObj.garden();
  } else if (currentTime === (lastFed + 2)){
    update("sleeping");
    foodObj.bedroom();
  } else if(currentTime > (lastFed + 2) && currentTime <= (lastFed+4)){
    update("bathing");
    foodObj.washroom();
  } else {
    update("hungry");
    foodObj.display();
    //dog.display();
  }
  
  fedTime = database.ref('FeedTime');
  fedTime.on("value", function(data){
    lastFed = data.val();
  })

  fill("black");
  textSize(25);
  if(lastFed >= 12){
    text("Last Fed: " + Math.round(lastFed/12) + "PM", 350,30);
  } else if(lastFed === 0){
    text("Last Fed: 12 AM",350,30);
  } else {
    text("Last Fed: " + lastFed + "AM",350,30);
  }

  foodObj.display();

  if(gameState !== "hungry"){
    feedPet.hide();
    addFood.hide();
    dog.remove();
  } else {
    feedPet.show();
    addFood.show();
    dog.addImage(sadDogImg);
  }

  drawSprites();
  
  text("Food: " + foodS,20,50);

}

function readStock(data){
  foodS = data.val();
  foodObj.updateFoodStock(foodS);
}


function addFoods(){
  foodS++;
  database.ref('/').update({
    Food : foodS
  })
}

function feedDog(){
  dog.addImage(dogHappyImg);

  if(foodS >= 1){foodObj.updateFoodStock(foodObj.getFoodStock() - 1);}
  if(foodS < 1){
    dog.addImage(dogHappyImg);
  }
  database.ref('/').update({
    Food : foodObj.getFoodStock(),
    FeedTime: hour()
  })
}

function update(state){
  database.ref('/').update({
    gameState : state
  })
}



