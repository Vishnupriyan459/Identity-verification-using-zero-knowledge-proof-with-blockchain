import PanVerification from '../models/PanProof.js';
export const checkPan=async (req, res) => {
    try{
        
        const userId=req.user.id
        let getdata=await PanVerification.findOne({userId})
        if(getdata.result=="true"){
            return res.json({messaging:true,data:getdata.data})
        }else{
            return req.json({messaging:false})
        }
        return "close"
    }
    catch(error){
        res.status(500).json({ error: 'Failed to get pan proof of user' });
    }
    
}