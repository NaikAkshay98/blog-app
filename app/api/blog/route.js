import { ConnectDB } from "@/lib/config/db";
import BlogModel from "@/lib/models/BlogModel";
const { NextResponse } = require("next/server");
import { writeFile, mkdir } from 'fs/promises';
const fs = require('fs');

// Ensure database connection is established
ConnectDB();

// API Endpoint to get all blogs
export async function GET(request) {
  try {
    const blogId = request.nextUrl.searchParams.get("id");
    if (blogId) {
      const blog = await BlogModel.findById(blogId);
      if (!blog) return NextResponse.json({ success: false, msg: "Blog not found" });
      return NextResponse.json(blog);
    } else {
      const blogs = await BlogModel.find({});
      return NextResponse.json({ blogs });
    }
  } catch (error) {
    console.error("Error fetching blogs:", error);
    return NextResponse.json({ success: false, msg: "Failed to fetch blogs" });
  }
}

// API Endpoint for uploading blogs
export async function POST(request) {
  try {
    const formData = await request.formData();
    const timestamp = Date.now();

    const image = formData.get("image");
    if (!image) throw new Error("Image file is missing");

    const imageByteData = await image.arrayBuffer();
    const buffer = Buffer.from(imageByteData);
    const path = `./public/${timestamp}_${image.name}`;

    // Ensure the public directory exists and write the image file
    await mkdir('./public', { recursive: true });
    await writeFile(path, buffer);

    const imgUrl = `/${timestamp}_${image.name}`;
    const blogData = {
      title: formData.get("title"),
      description: formData.get("description"),
      category: formData.get("category"),
      author: formData.get("author"),
      image: imgUrl,
      authorImg: formData.get("authorImg"),
    };

    await BlogModel.create(blogData);
    console.log("Blog Saved");

    return NextResponse.json({ success: true, msg: "Blog Added" });
  } catch (error) {
    console.error("Error adding blog:", error);
    return NextResponse.json({ success: false, msg: "Failed to add blog", error: error.message });
  }
}

// API Endpoint to delete a blog
export async function DELETE(request) {
  try {
    const id = request.nextUrl.searchParams.get("id");
    if (!id) return NextResponse.json({ success: false, msg: "Blog ID is required" });

    const blog = await BlogModel.findById(id);
    if (!blog) return NextResponse.json({ success: false, msg: "Blog not found" });

    // Delete the image associated with the blog
    fs.unlink(`./public${blog.image}`, (err) => {
      if (err) console.error("Error deleting image:", err);
    });

    await BlogModel.findByIdAndDelete(id);
    return NextResponse.json({ success: true, msg: "Blog Deleted" });
  } catch (error) {
    console.error("Error deleting blog:", error);
    return NextResponse.json({ success: false, msg: "Failed to delete blog", error: error.message });
  }
}
