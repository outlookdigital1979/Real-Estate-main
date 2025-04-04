import prisma from "../lib/prisma.js";
import bcrypt from "bcrypt";

export const getUsers = async (req, res) => {
  const getUsers = await prisma.user.findMany();
  console.log(getUsers);
  res.status(200).json({ getUsers });
  try {
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "faild to get Usres!" });
  }
};

export const getUser = async (req, res) => {
  const id = req.params.id;
  try {
    const user = await prisma.user.findUnique({
      where: { id: id },
    });
    res.status(200).json(user);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "faild to get Usre!" });
  }
};

export const updateUser = async (req, res) => {
  const id = req.params.id;
  const tokenUserId = req.userId;
  const { password, avatar, ...inputs } = req.body;

  if (id !== tokenUserId) {
    return res.status(403).json({ error: "Not Authorized!" });
  }
  let updatedPassword = null;
  try {
    if (password) {
      updatedPassword = await bcrypt.hash(password, 10);
    }
    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        ...inputs,
        ...(updatedPassword && { password: updatedPassword }),
        ...(avatar && { avatar }),
      },
    });
    const { password: userPassword, ...rest } = updatedUser;
    // res.status(200).json({message:"User Details Updated!"})
    // res.status(200).json(rest);
    res.status(200).json({
      user: rest,
      message: "User Details Updated Successfully!",
    });
    
    // res.status(200).json({ user: rest, message: "User Updated" });

  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Failed to update users!" });
  }
};
// paaas singal response for tost message

export const deleteUser = async (req, res) => {
  const id = req.params.id;
  const tokenUserId = req.userId;

  if (id !== tokenUserId) {
    return res.status(403).json({ message: "Not Authorized!" });
  }
  try {
     // Archive or delete user's saved posts
     await prisma.savePost.deleteMany({
      where: { id: id },
    });

     //todo --  Archive or transfer ownership of listings handle this archive listings idf user deleted your account 
    // await prisma.listing.updateMany({
    //   where: { userId: parseInt(userId) },
    //   data: { userId: null }, // Set userId to null for orphaning
    // });

    // Delete user
    await prisma.user.delete({
      where: { id: id },
    });

    res.clearCookie("token")
    res.status(200).json({ message: "Account Deleted!" })

    
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "faild to delete Account!" });
  }
};


export const savePost = async (req, res) => {
  const postId = req.body.postId;
  const tokenUserId = req.userId;
  console.log(tokenUserId)
  console.log(postId)


  if (!postId) {
    return res.status(400).json({ message: "Post ID is required." });
  }

  try {
   const savedPost = await prisma.savePost.findUnique({
    where:{
      userId_postId:{
        userId:tokenUserId,
        postId,
      }
    }
   }) ;

   if(savedPost){
      const response = await prisma.savePost.delete({
        where:{
          id:savedPost.id,
        }
      });
      res.status(200).json({message:"Post Unsaved Successfully!"})
   }
   else{
      await prisma.savePost.create({
        data:{
          userId:tokenUserId,
          postId,
        }
      });
      res.status(200).json({message:"Post Saved Successfully!"})
   }

  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Faild to Save Post!" });
  }
};

export const ProfilePosts = async (req,res) =>{
  const tokenUserId = req.userId
  // console.log(tokenUserId,"not found")
  try {
    const userPosts = await prisma.post.findMany({
      where:{
        userId:tokenUserId,
      }
    });

    const saved = await prisma.savePost.findMany({
      // savePost
      where:{
        userId:tokenUserId,
      },
      include:{
        post:true
      }
    });
    const savedPost = saved.map(item=>item.post);
    res.status(200).json({userPosts,savedPost});
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Faild to Get ProfilePosts!" });

  }
}


