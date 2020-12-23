import express from "express";
import bodyParser from "body-parser";
import ejs from "ejs";
import path from "path";
import Nexmo from "nexmo";
import socketio from "socket.io";

const nexmo = new Nexmo(
  {
    apiKey: "YOURAPIKEY",
    apiSecret: "YOURAPISECRET",
  },
  { debug: true }
);

const app = express();

// Template engine setup
app.set("view engine", "html");
app.engine("html", ejs.renderFile);

// Public folder setup
app.use(express.static(path.resolve(__dirname, "public")));

// Body parser middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.get("/", (req, res) => {
  res.render("index");
});

app.post("/", (req, res) => {
  const number = req.body.number;
  const text = req.body.text;

  nexmo.message.sendSms(
    "YOURVIRTUALNUMBER",
    number,
    text,
    { type: "unicode" },
    (err, responseData) => {
      if (err) {
        console.log(err);
      } else {
        console.dir(responseData);
        // Get data from response
        const data = {
            id: responseData.messages[0]["message-id"],
            number: responseData.messages[0]["to"]
        }
        // Emit to the client
        io.emit("smsStatus", data)
      }
    }
  );
});

const port = process.env.PORT || 3333;

const server = app.listen(port, () => {
    console.log("Server started on port 3333")
});

// Connect to socket.io
const io = socketio(server)
io.on("connection", (socket) => {
    console.log("Connected to socket.io")
    io.on("disconnect", () => {
        console.log("Disconnected")
    })
})
