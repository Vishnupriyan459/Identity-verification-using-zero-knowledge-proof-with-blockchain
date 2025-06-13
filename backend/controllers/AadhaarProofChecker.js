import AadhaarVerification from '../models/AadhaarProof.js';
export const checkAadhaar=async (req, res) => {
    try{
        
        const userId=req.user.id
        let getdata=await AadhaarVerification.findOne({userId})
        if(getdata){
            // return res.status(400).json({messaging:getdata})
            if(getdata.result=="true"){
                return res.json({messaging:true,data:getdata.data})
            }else{
                return req.json({messaging:false})
            }
        }
        return "close"
    }
    catch(error){
        res.status(500).json({ error: 'Failed to get pan proof of user' });
    }
}