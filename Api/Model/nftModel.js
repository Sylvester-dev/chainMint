const mongoose = require('mongoose');

const nftSchema = new mongoose.Schema({
    title:{
        type:String,
        trim: true,
    },
    description: {
        type:String,
        trim: true,
    },
    category: String,
    email: String,
    address: String,
    createdAt: {
        type: Date,
        default: Date.now(),
    },
    image: String,
})

const Nft = mongoose.model('Nft', nftSchema);

module.exports = Nft;