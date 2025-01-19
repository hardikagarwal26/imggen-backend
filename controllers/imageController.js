import userModel from "../models/userModel.js"
import FormData from "form-data"
import axios from "axios"

export const generateImage = async (req,res) => {
    try {
        const {userId , prompt} = req.body

        const user = await userModel.findById(userId)
        if(!user || !prompt){
            return res.json({success:false, message:"Missing Details"})
        }
        if(user.credits === 0 || userModel.credits < 0){
            return res.json({success:false, message:"Insufficient credits", credits:user.credits})
        }
        const formData = new FormData()
        formData.append('prompt',prompt)
        const {data} = await axios.post('https://clipdrop-api.co/text-to-image/v1', formData, {
            headers: {
                'x-api-key': process.env.CLIPDROP_API
            },
            responseType: 'arraybuffer'
        })
        const base64image = Buffer.from(data, 'binary').toString('base64')
        const resultImage = `data:image/png;base64,${base64image}`

        await userModel.findByIdAndUpdate(userId,{credits:user.credits -= 1})
        res.json({success:true,message:"Image Generated Successfully", resultImage, credits:user.credits})
    } catch (error) {
        console.log(error.message)
        res.json({success:false, message:error.message})
    }
}