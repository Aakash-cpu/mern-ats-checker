import mongoose from "mongoose";
const AnalysisSchema=new mongoose.Schema({
  resumeText:{type:String,required:true},
  jobDescription:{type:String,required:true},
  score:{type:Number,required:true},
  missingKeywords:{type:[String],default:[]},
  suggestions:{type:String,default:""},
  reportFile:{type:String,default:""}
},{timestamps:true});
export default mongoose.model("Analysis",AnalysisSchema);
