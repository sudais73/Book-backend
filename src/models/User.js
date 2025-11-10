import mongoose from 'mongoose'

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,

    },
    image: {
        type: String,
        default: ''
    }

}, { timestamps: true })

const User = mongoose.models.user || mongoose.model('user', userSchema)
export default User
