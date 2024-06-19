import express from "express";
import bodyParser from "body-parser";
import mysql from "mysql2/promise";
import axios from "axios";
import env from "dotenv";


const app = express();
const port = 3000;
env.config();

const apikeydata = process.env.WEATHER_API_KEY;

app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));

const connection = await mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "root",
  database: "Blogdatabase",
});


function addPostDate(t) {
  let date = new Date();
  let h = date.getHours();
  let m = date.getMinutes();
  let hh = "" + h;
  let mm = "" + m;
  if (h < 10) 
      hh = "0"+ h;
  if (m   <   10)
      mm = "0"+ m;
  let fulldate = t + date.toLocaleDateString() + " " + hh + ":" + mm; 
  return fulldate;
}

app.get("/about", (req, res) => {
  res.render("about.ejs");
});


app.get("/", async (req, res) => {
  
  let totalpage = 0;
  try {
    const [results, fields] = await connection.query("SELECT Count(*) as total FROM Blogpost");
    let total = results[0].total;
    if (total%10 != 0)
      {totalpage = Math.floor(total/10) + 1;}
    else
      totalpage = Math.floor(total/10);
  } catch (err) {
    console.log(err);
  }

  let page = parseInt(req.query.page) || 1;
  let offset = (page * 10)-10;
  let query = `SELECT * FROM Blogpost order by ID desc limit 10 offset ${offset} ;`  
  let output = [];
  try {
    const [results, fields] = await connection.query(query);
    //console.log("res"+results[1].TextPost);
    output = results;
  } catch (err) {
    console.log(err);
  }

  let randomayah = Math.floor(Math.random() * (6236)) + 1;
  let apiurl1 = "http://api.alquran.cloud/v1/ayah/" + randomayah + "/en.asad";
  const response1 = await axios.get(apiurl1);
  const result1 = response1.data;

  let apiurl2 = "http://ip-api.com/json/";
  const response2 = await axios.get(apiurl2);
  const result2 = response2.data;

  const todaydate = new Date().toLocaleDateString();

  let lat = result2.lat;
  let lon = result2.lon;

  let apiurl3 = "https://api.weatherbit.io/v2.0/current?key="+apikeydata+"&lat="+lat+"&lon="+lon;
  const response3 = await axios.get(apiurl3);
  const result3 = response3.data;

  let rapi3 = {};
  rapi3["temp"]= result3.data[0].temp;
  rapi3["description"] = result3.data[0].weather.description;
  rapi3 ["icon"] = result3.data[0].weather.icon;

  res.render("index.ejs", { 
    items: output , currentpage: page, totalpage: totalpage, rapi1 : result1, rapi2 : result2, today:todaydate, rapi3:rapi3});
});


app.post("/delete", async (req, res) => {
  let id = req.body["del_id"];
  let query ="Delete from Blogpost where ID ='" + id+"'" 

  try {
      await connection.query(
        query
      );
    } catch (err) {
      console.log(err);      
    }
  res.render("delete.ejs");
});

app.post("/", async (req, res) => {
  let choice = req.body["choice"]
  if (choice == "create"){
      let texts = req.body["singlepost"];
      if (texts.length > 0)
      {
          try {
              let cdate = addPostDate("Posted at: ");
              let query = `Insert into Blogpost (TextPost, PostDate) values ("${texts}", "${cdate}");`; 
              await connection.query(query);
               
            } catch (err) {
              console.log(err);
            }
      }
  }

  else if (choice == "edit"){
      let id = req.body["id"];
      let etext= req.body["singlepost"];
      let edate = addPostDate("Edited at: ");

      try {
          let query = `Update Blogpost set TextPost = "${etext}", PostDate = "${edate}" where ID = ${id} ;` ;          
          await connection.query(query);
           
        } catch (err) {
          console.log(err);
        }
   }

   res.redirect("/");
  });

app.post("/edit", async (req, res) => {
    let id = req.body["edit_id"];
    let p = "";
    try {
        let query = "Select TextPost from Blogpost where id = '"+id+"';"            
        
        const [results, fields] = await connection.query(query);
        p = results[0].TextPost;   
        
      } catch (err) {
        console.log(err);
      }

    res.render("edit.ejs", {edit_post: p, index : id });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
