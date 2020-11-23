		// jshint esversion:6

		const express = require("express");
		const bodyParser = require("body-parser");
		const mongoose = require("mongoose");
		const _ = require("lodash");


		const app = express();

		app.set("view engine", "ejs");

		app.use(bodyParser.urlencoded({extended: true}));
		app.use(express.static("public"));

		//Connect with mongoDB
		mongoose.connect("process.env.MONGO_PASS", { useNewUrlParser: true,useUnifiedTopology: true});

		const itemSchema = {
			name: String
		};

		//model name = Item
		const Item = mongoose.model("Item", itemSchema); //note that the collection "Item" has to be singular as it becomes plural in the DB

		const item1 = new Item({
			name: "WELCOME 😃✍🏽 to your ToDoList."
		});

		const item2 = new Item({
			name: "Hit the ➕ button to add a new item."
		});

		const item3 = new Item({
			name: "Check ▫️ to delete an item."
		});

		const defaultItems = [item1, item2, item3];



		//To get custom list created so as to make customListName function properly. Hence this schema
		const listSchema = {
		  name: String,
		  items: [itemSchema]   //<--- Note the array of schema to be created as inputs for customListName
		};

		//model name for custom list
		const List = mongoose.model("List", listSchema);




		//To insert defaultItems so as to make the app functional
		app.get("/", function(req, res) {
			//To Read from DB
			Item.find({}, function(err, foundItems) {
				if (foundItems.length === 0) {
					//To insert many items at a go into the defaultItems [] in DB
					Item.insertMany(defaultItems, function(err) {
						if (err) {
							console.log(err);
						} else {
							console.log("Successful!!!");
						}
					});
					res.redirect("/");
				} else {
					res.render("list", { listTitle: "Today",newListItems: foundItems}); //list is shortened from list.ejs
				}
			});
		});


		//In order to create custom/dynamic pages instead of a static pages
		app.get("/:customListName", function(req, res) {
		  const customListName = _.capitalize(req.params.customListName);

		  List.findOne({name: customListName}, function(err, foundList){
		    if(!err){
		      if(!foundList){
		        //Create a new list
		        const list = new List({
		          name: customListName,
		          items: defaultItems
		        });
		        list.save();

		        res.redirect("/" + customListName);
		      } else {
		        //Show existing list
		        res.render("list", {listTitle: foundList.name, newListItems: foundList.items});
		      }
		    }
		  });

		});

		//A way to create a static page
		// app.get("/work", function(req, res) {
		// 	res.render("list", { listTitle: "Work List", newListItems: workItems });
		// });




		//Creating New item
		app.post("/", function(req, res) {
			const itemName = req.body.newItem; //newItem is from input in list.ejs i.e name="newItem"
		  const listName = req.body.list;   //list is from input in list.ejs i.e name="list"

		  const item = new Item({
		    name: itemName
		  });

		  if(listName === "Today"){
		    item.save();
		    res.redirect("/");
		  }else {
		    List.findOne({name: listName}, function(err, foundList) {
		      foundList.items.push(item);
		      foundList.save();

		      res.redirect("/" + listName);
		    });
		  }


			// if (req.body.list === "Work") {
			// 	//The logic req.body.list === "Work" is refered to what the server sees i.e list(from name="list" in list.ejs)
			// 	workItems.push(item); //using the dynamic value(also in form input in list.ejs). The server reads {newItem: 'New Item added', list: 'Work'}
			// 	res.redirect("/work"); //This if stmt is directed to the server which can be seen when console logged i.e console.log(req.body);
			// } else {
			// 	items.push(item);
			// 	res.redirect("/");
			// }
		});



		//To delete an input
		app.post("/delete", function(req, res){
		  const checkedItemId = req.body.checkbox;
		  const listName = req.body.listName;  //from hidden input in list.ejs

		  if(listName === "Today"){
		    Item.findByIdAndRemove(checkedItemId, {useFindAndModify: false}, function(err){
		      if(!err){
		        console.log("Successfully deleted item");
		        res.redirect("/");
		      }

		    });
		  } else { //using $pull syntax from mongoDB.com-->Documentation
		      List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemId}}}, function(err, foundList){
		          if(!err){
		            res.redirect("/" + listName);
		          }
		      })
		  }

		});






		//These two (/work and /about) are currently not working as customListName created has done more
		app.post("/work", function(req, res) {
			let item = req.body.newItem;
			workItems.push(item);
			res.redirect("/work");
		});

		app.get("/about", function(req, res) {
			res.render("about");
		});



		//SERVER
		let port = process.env.PORT;
		if (port == null || port == ""){
			port = 3000;
		}
		app.listen(port, function() {
			console.log("Server has successfully started.");
		});



		//NOTICE: var is changed to let so as to have more chances to access the variable both globally or locally










		// const express = require("express");
		// const bodyParser = require("body-parser");

		// const app = express();

		// app.set('view engine', 'ejs');

		// app.get("/", function (req, res) {
		//     let today = new Date();
		//     let currentDay = today.getDay();
		//     let day = "";

		//     if (currentDay === 6 || currentDay === 0){
		//         day = "weekend";
		//         //res.sendFile(__dirname + "/weekend.html");
		//     } else{
		//         day = "weekday";
		//         //res.sendFile(__dirname + "/weekday.html");
		//     }

		//     res.render("list", {
		//         kindOfDay: day
		//     });

		// });

		// app.listen(3000, function () {
		//     console.log("Server is running on Port 3000");
		// });

		// const express = require("express");
		// const bodyParser = require("body-parser");

		// const app = express();

		// app.set('view engine', 'ejs');

		// app.get("/", function(req, res){
		//     let today = new Date();
		//     let currentDay = today.getDay();
		//     let day = "";

		//     switch(currentDay){
		//         case 0:
		//             day = "Sunday";
		//             break;
		//         case 1:
		//             day = "Monday";
		//             break;
		//         case 2:
		//             day = "Tuesday";
		//             break;
		//         case 3:
		//             day = "Wednesday";
		//             break;
		//         case 4:
		//             day = "Thursday";
		//             break;
		//         case 5:
		//             day = "Friday";
		//             break;
		//         case 6:
		//             day = "Saturday";
		//             break;
		//         default:
		//             console.log("Error: current day is equal to: " + currentDay);
		//     }

		//     res.render("list", {kindOfDay: day});

		// });

		// app.listen(3000, function(){
		//     console.log("Server is running on Port 3000");
		// });
