import express from "express";
import bodyParser from "body-parser";
import session from "express-session";
import { fileURLToPath } from 'url';
import path from 'path';
import ejs from "ejs";
import env from "dotenv";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app =express();

env.config();

let posts= [];
let postIndex ; 
let comingRoute = "";

app.engine('ejs', ejs.renderFile);  // Register the EJS engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static("public")); 
app.use(bodyParser.urlencoded({extended: true}));

//delete route
app.get("/home", (req, res)=> {
    for (let j = parseInt(req.query["post-index"], 10); j < posts.length; j++) {
        if (j === posts.length-1) {
            posts.pop();
        }
        else{
            posts[j] = posts[j+1];
        }
    }
    if (posts.length === 0) {
        posts=undefined;
    }
    res.redirect("/");
    if (posts === undefined) {
        posts=[];
    }
});

app.get("/edit", (req, res)=>{
    postIndex = parseInt(req.query["post-index"], 10);
    res.render("post.ejs", {postT: posts[postIndex].title, postC: posts[postIndex].content});
});

app.post("/", (req, res)=>{
    if (comingRoute === "/create") {
        const date = `${new Date().getHours()}:${new Date().getMinutes()},   ${new Date().getDate()}/${new Date().getMonth()+1}/${new Date().getFullYear()}`;
        posts.push({title: req.body["title"], content: req.body["content"], date: date, edited: undefined});
        comingRoute ="";
    }
    else {
        //edit route
        if (postIndex !== undefined) {
            // if really edited
            if (posts[postIndex].title !== req.body["title"] || posts[postIndex].content !== req.body["content"]) {
                posts[postIndex].title = req.body["title"];
                posts[postIndex].content = req.body["content"];//Update title and content
                posts[postIndex].edited = "Edited";
            }
        } else {
            // Handle the error case where the index is invalid
            console.error("Invalid post index");
        }
    }
    res.render("index.ejs", {post: posts});
});

app.get("/create", (req, res)=> {
    comingRoute = "/create";
    res.render("post.ejs");
});

app.get("/", (req, res)=> {
    if (posts.length === 0) {
        posts = undefined;
    }// if clicked on Bloggy home
    res.render("index.ejs", {post: posts}); 
    if (posts === undefined) {
        posts=[];
    }
});
app.get('/favicon.ico', (req, res) => res.status(204).end());// ignore favicon in vercel
app.get('/favicon.png', (req, res) => res.status(204).end());
//temporarily to verify file serving
app.get('/debug-css', (req, res) => {
    const cssPath = path.join(__dirname, 'public', 'index.css');
    res.sendFile(cssPath);
});
app.listen("3000", ()=> {
    console.log("Server is running on port 3000");
});