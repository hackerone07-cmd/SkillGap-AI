import mongoose from "mongoose";

const blackListTokenSchema  = new mongoose.Schema({
    token:{
        type: String,
        required: [true, " token is required to be added in the blacklist"],
        unique: true
    }
},{timestamps:  true}
)

const  tokenBlacklistModel = mongoose.model("blacklistTokens",blackListTokenSchema);

export default tokenBlacklistModel;