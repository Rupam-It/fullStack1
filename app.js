//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const { default: mongoose, Schema } = require("mongoose");



const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin-rupam:test-123@cluster0.h5ltxaq.mongodb.net/todolist?retryWrites=true&w=majority", { useNewUrlParser: true,
useUnifiedTopology: true,
});

const itemSchema={
  name: String
}
const Item= mongoose.model("Item",itemSchema);

const item1= new Item({
  name:"This is to do list web app"
});
const item2= new Item({
  name:"this is item 2"
});
const item3= new Item({
  name:"this is item 3"
});
const defaultitems = [item1]
// const defaultitems=[item1, item2, item3];


const listSchema= {
  name: String,
  items: [itemSchema]
}

const List= mongoose.model("List",listSchema);

app.get("/", function(req, res) {

  Item.find({})
  .then((foundItems) => {
        if(foundItems.length===0){
      Item.insertMany(defaultitems) 
      .then((result) => {
        // Handle success
        console.log('Default items inserted successfully:', result);
      })
      .catch((error) => {
        // Handle error
        console.error('Error inserting default items:', error);
      })
      res.redirect("/");
   }
   else{
    res.render("list", {listTitle: "today", newListItems: foundItems});
   }
   
  })
  .catch((error) => {
    console.error('Error while finding items:', error);
  });


  

});

app.get("/:customListName",function(req,res){
  const customListName= req.params.customListName

  // List.findOne({name:customListName}, function(err,foundlist){
  //   if(!err){
  //       if(!foundlist){
  //         console.log("doesn't exist");
  //       }else{
  //         console.log("exist");
  //       }
  //   }
  // });
  List.findOne({ name: customListName })
  .then((foundList) => {
    if (!foundList) {
      const list= new List({
        name:customListName,
        items: defaultitems
      });
      list.save();
      res.redirect("/"+customListName);
    } else {
      res.render("list", {listTitle: foundList.name, newListItems: foundList.items});
    }
  })
  .catch((err) => {
    console.error("Error finding list:", err);
  });



});


app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName= req.body.list;
  
  const item = new Item({
    name: itemName
  });
  if (listName==="today")
  {
    item.save();
    res.redirect("/");
  }
  else{
    List.findOne({name:listName})
    .then((foundList)=>{
      foundList.items.push(item);
      foundList.save();
      res.redirect("/"+listName);
    })
  }

});

app.post("/delete",function(req,res){
  const ckeckId = req.body.checkbox;
  const listName= req.body.listName;

  if (listName==="today"){
    Item.findByIdAndRemove(ckeckId)
    .then((removedItem) => {
      if (removedItem) {
        console.log("Successfully deleted checked item.");
      } else {
        console.log("Item not found or already deleted.");
      }
    })
    .catch((err) => {
      console.error("Error deleting item:", err);
    });
    res.redirect("/");
  } else{
    // List.findOneAndUpdate({name:listName},{$pull:{items: {_id: ckeckId}}},function(err,foundList){
    //   if(!err){
    //     res.redirect("/"+listName);
      // }
    // })
    List.findOneAndUpdate(
      { name: listName },
      { $pull: { items: { _id: ckeckId  } } }
    )
      .then((foundList) => {
        if (foundList) {
          res.redirect("/" + listName);
        }
      })
      .catch((err) => {
        console.error("Error deleting item:", err);
        res.status(500).send("An error occurred.");
      });

  }


})





app.get("/about", function(req, res){
  res.render("about");
});


const PORT= process.env.PORT || 3000;

app.listen(PORT, function() {
  console.log("Server started on port 3000");
});
