import express from "express";
import bodyParser from "body-parser";
//import { dirname } from "path";
//import { fileURLToPath } from "url";

const app = express();
const port = 3000;
const arrayBlog=[];
const arrayDate=[];
//const choice="view";
//const __dirname = dirname(fileURLToPath(import.meta.url));

app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));

function addPostDate() {
    let date = new Date();
    let h = date.getHours();
    let m = date.getMinutes();
    let fulldate = "" + date.toLocaleDateString() + " " + h + ":" + m; 
    return fulldate;
}

app.get("/", (req, res) => {
    //if (choice == "view" | choice == "create")
    //else    
    res.render("index.ejs", {arrBlog: arrayBlog, arrDate: arrayDate});
});

app.post("/", (req, res) => {
    let choice = req.body["choice"]
    if (choice == "create"){
        let texts = req.body["singlepost"];
        if (texts.length > 0)
        {
            arrayBlog.push (req.body["singlepost"]);
            arrayDate.push(addPostDate());    
        }
    }
    else if (choice == "delete"){
        let id = req.body["id"];
        arrayBlog.splice(id, 1);
        arrayDate.splice(id, 1);
    }
    else if (choice == "edit"){
        let id = req.body["id"];
        let i = parseInt(id);
        arrayBlog[i] = req.body["singlepost"];

        arrayDate[i] = addPostDate();
    }
    res.render("index.ejs", {arrBlog: arrayBlog, arrDate: arrayDate });
});



app.post("/delete", (req, res) => {
    let id = req.body["del"];
    res.render("delete.ejs", {index : id });
});

app.post("/edit", (req, res) => {
    let id = req.body["edit_id"];
    let i = parseInt(id);

    let texts = req.body["edit_post"];
    const arr = texts.split(",");

    //untuk yg pertama
    if (i==0){
        let t1 = arr[0];
        arr[0] = t1.trim();            
    }

    let p = arr[i];
    res.render("edit.ejs", {edit_post: p, index : id });
});

  app.get("/about", (req, res) => {
    res.render("about.ejs");
  });


app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
  
