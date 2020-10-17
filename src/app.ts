import { config } from "dotenv";
import express from "express";
import { connect, connection } from "mongoose";
import users from "./routes/user.route";
import tracks from "./routes/track.route";
import playlists from "./routes/playlist.route";
import albums from "./routes/album.route";

config();

const app = express();
const PORT = process.env.PORT || 5000;
const mongoURI: string = process.env.MONGO_URI as string;

// Middleware
app.use(express.json());

// async () => {
//   try {
connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
});
connection.once("open", () => console.log("Connected to db"));
connection.on("error", () => server.close());

app.get("/", (req, res) => {
  res.send({ date: Date.now() });
});

app.use(express.static("src/files"));
app.use(`/users`, users);
app.use(`/tracks`, tracks);
app.use(`/playlists`, playlists);
app.use(`/albums`, albums);

var server = app.listen(PORT, () => {
  console.log(`Server running on port: ${PORT}`);
});
//   } catch (error) {
//     console.log("Error", error);
//   }
// };
