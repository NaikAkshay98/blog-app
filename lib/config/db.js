import mongoose from "mongoose";

export const ConnectDB = async () =>{
    await mongoose.connect('mongodb+srv://anaik9:etB4UdhEVxmcjcKp@cluster0.oizik.mongodb.net/blog-app');
    console.log("DB Connected");
}