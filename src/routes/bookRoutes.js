import express from 'express'
import cloudinary from '../config/cloudinary.js';
import multer from "multer";
import Book from '../models/Book.js';
import { protect } from '../middleware/Auth.middleware.js';
const router = express.Router()
const upload = multer({ storage: multer.memoryStorage() });

// router.post("/", protect, async (req, res) => {
//     try {
//         const { title, caption, image, rating } = req.body;
//         if (!image) {
//             return res.status(400).json({ success: false, msg: "Please provide image" })
//         }

//         if (!title || !caption || !rating || !image) {
//             return res.status(400).json({ success: false, msg: "All fields are required" })
//         }
//         // upload image to cloudinary//
//         const response = await cloudinary.uploader.upload(image)
//         const imageUrl = response.secure_url;
//         // save to db//

//         const newBook = new Book({
//             title,
//             caption,
//             rating,
//             image: imageUrl,
//             user: req.user._id
//         })
//         await newBook.save()

//         return res.status(201).json({
//             success: true,
//             newBook
//         })

//     } catch (error) {
//         return res.status(500).json({ success: false, msg: error.message })
//     }
// })

// Get all books//
router.post("/", protect, upload.single("image"), async (req, res) => {
  try {
    const { title, caption, rating } = req.body;

    if (!req.file) {
      return res.status(400).json({ success: false, msg: "Please provide image" });
    }

    const response = await cloudinary.uploader.upload_stream(
      { folder: "books" },
      (error, result) => {
        if (error) return res.status(500).json({ success: false, msg: error.message });

        const newBook = new Book({
          title,
          caption,
          rating,
          image: result.secure_url,
          user: req.user._id,
        });

        newBook.save().then(() => {
          res.status(201).json({ success: true, newBook });
        });
      }
    );

    // push file buffer to cloudinary upload_stream
    response.end(req.file.buffer);

  } catch (error) {
    return res.status(500).json({ success: false, msg: error.message });
  }
});





router.get("/", async (req, res) => {
    try {
        const books = await Book.find().populate("user", "name email");

        return res.status(200).json({
            success: true,
            count: books.length,
            books
        });

    } catch (error) {
        return res.status(500).json({ success: false, msg: error.message });
    }
});

// Get books of the current logged-in user
router.get("/my-books", protect, async (req, res) => {
    try {
        const userId = req.user._id;

        const myBooks = await Book.find({ user: userId });

        return res.status(200).json({
            success: true,
            count: myBooks.length,
            books: myBooks
        });

    } catch (error) {
        return res.status(500).json({ success: false, msg: error.message });
    }
});

// ✅ Get books of any specific user
router.get("/user/:userId", async (req, res) => {
    try {
        const { userId } = req.params;

        const books = await Book.find({ user: userId });

        return res.status(200).json({
            success: true,
            count: books.length,
            books
        });

    } catch (error) {
        return res.status(500).json({ success: false, msg: error.message });
    }
});

router.delete("/:id", protect, async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ success: false, msg: "Book not found" });

    if (book.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, msg: "Not authorized to delete this book" });
    }

    if (book.cloudinaryPublicId) { await cloudinary.uploader.destroy(book.cloudinaryPublicId); }

    await book.remove();
    return res.status(200).json({ success: true, msg: "Book deleted" });
  } catch (error) {
    return res.status(500).json({ success: false, msg: error.message });
  }
})



export default router