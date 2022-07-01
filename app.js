//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));


mongoose.connect("mongodb+srv://surajit-bhowmik:Surajit2002@cluster0.7tahdnd.mongodb.net/todolistDB",{useNewUrlParser:true});
const itemShema = {
  name:String
};

const Item = mongoose.model("Item",itemShema);

const item1 = new Item({
  name:"Welcome to to do list"
});
const item2 = new Item({
  name:"Hit the + to add item to list"
});

const item3 = new Item({
  name:"Tick on the box to delete item"
});



const defaultArray = [item1,item2,item3];

const listShema ={
  name:String,
  items:[itemShema]
};

const List = mongoose.model("List",listShema);

app.get("/",function(req,res){


  Item.find({},function(err,foundItems){
    if(foundItems.length===0){
      
     Item.insertMany(defaultArray,function(err){
  if(err)
  {
    console.log("Error");
  }
  else{
    console.log("Item has been added successfully");
  }
  res.redirect("/");
})
   }
    else{
      res.render("list", {listTitle: "Today", newListItems: foundItems});
    }
    
  });
});




app.post("/", function(req, res){

  const Newitem = req.body.newItem;
  const listName = req.body.list;
  
  const item = new Item({
    name:Newitem
  });

  if(listName=="Today")
  {
  item.save();
  res.redirect("/");
 }
 else{
  List.findOne({name:listName},function(err,foundlist){
   
   if(err){
    console.log("Error");
   }
   else{
    foundlist.items.push(item);
    foundlist.save();
    res.redirect("/"+ listName);
   }
 });
 }  
});


app.post("/delete",function(req,res){
  const delitem = req.body.checkbox;
  const delname = req.body.list;
if(delname=="Today"){
  Item.findByIdAndRemove(delitem,function(err){
    if(err)
    {
      console.log("Error");
    }
    else{
      console.log("Deleted successfully");
    }
  });
  res.redirect("/");

}
else{
  List.findOneAndUpdate({name:delname},{$pull: {items:{_id:delitem}}},function(err){
    if(!err){
      res.redirect("/"+ delname);
    }
  })
}
 
});





app.get("/:paraName",function(req,res){
  const paraName =_.capitalize(req.params.paraName);


  List.findOne({name:paraName},function(err,foundList){
 if(!err){
  if(!foundList){
   // console.log("Does not exist");

    const list = new List({
      name:paraName,
      items:defaultArray
    });

    list.save();
   // redirect("/:paraName");
  }
  else{
   // console.log("Exists");
    res.render("list", {listTitle: foundList.name, newListItems: foundList.items});
  }
 }

  }); 
});



app.get("/about", function(req, res){
  res.render("about");
});


let port = process.env.PORT;
if (port == null || port == "") {
  port = 8000;
};




app.listen(port, function() {
  console.log("Server started successfully");
});
