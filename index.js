require('dotenv').config();
const express =  require("express");
const ejs = require("ejs");
// const date = require(__dirname + "/date.js");
const mongoose = require ("mongoose");
const _ = require("lodash");
const app = express();

// var items = [];
// var workItems = [];

app.use(express.json());

app.use(express.static("public"));

app.use(express.urlencoded({ extended: true }));

app.set('view engine', 'ejs');

// mongoose.connect("mongodb://127.0.0.1:27017/todolistDB");
mongoose.connect(process.env.MONGO_URI);
// let day = date();

const todolistSchema = new mongoose.Schema({
    name: String
});

const TODOLIST = mongoose.model("todolist", todolistSchema);

const Welcome = new TODOLIST({
    name: "Welcome to your ToDoList"
});

const Hit = new TODOLIST({
    name: "Hit the + button to add a new item"
});

const deleteitem = new TODOLIST({
    name: "<-- Hit this to delete an item."
});

const defaultItems = [Welcome, Hit, deleteitem];

const listSchema = new mongoose.Schema({
    name: String,
    items: [todolistSchema]
});

const List =  mongoose.model("List", listSchema);

app.get("/", function(req,res){

    TODOLIST.find()
    .then(
        function(foundItems){
            if(foundItems.length === 0){
                TODOLIST.insertMany(defaultItems)
                    .then(function(){
                        console.log("Updated");
                        })
                    .catch(function(err){
                        console.log(err);
                        });
                res.redirect("/");
            }

            else{
                res.render("list", {listTitle: "Today" , listItem : foundItems});
            }
        })
    .catch({
        function(err){
            console.log(err);
        }
    });
    
});

app.post("/", function(req,res){
    
    // if(req.body.list == "Work"){
    //     workItems.push(item);
    //     res.redirect("/work");
    // }
    // else{
    // items.push(item);
    // res.redirect("/");
    // }
    //let day = date();
    const newItem = req.body.ToDoItem;
    const listName = req.body.list;

    const item = new TODOLIST({
        name: newItem
    }); 
    if(listName == "Today")
    {
        item.save();
    res.redirect("/");
    }
    else{
        List.findOne({name: listName})
        .then(function(foundList){
            foundList.items.push(item);
            foundList.save();
            res.redirect("/" + listName);
        })
        .catch(()=>{});
    }
    

});

app.post("/delete", function(req,res){
const checkedItemId = req.body.checkbox;
const listName = req.body.listName;
if(listName == "Today"){

    TODOLIST.deleteOne({_id : checkedItemId })
.then(function(){
    setTimeout(()=>{
    console.log("Deleted");
    res.redirect("/");
    },150);
})
.catch(function(err){
    console.log(err);
});
}
else{
    List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemId}}})
    .then(() => {
        setTimeout(()=>{
        res.redirect("/" + listName);
        },100);
    })
    .catch((err) => {
        console.log(err);
    })
}
});


app.get("/:customList", function(req,res){
  const customListName = _.capitalize(req.params.customList);

  List.findOne({name : customListName})
  .then(function(foundList){
 if(!foundList){
    const list = new List({
        name: customListName,
        items : defaultItems
      });
      list.save();
      console.log("Saved");
      res.redirect("/" + customListName);
    }
   else{
        res.render("list", {listTitle: foundList.name, listItem: foundList.items } );
    }
  })
  .catch(function(err){
   {}
  });
 
});

app.get("/about", function(req,res){
    res.render("about.ejs");
});

app.listen(process.env.PORT || 3000);
