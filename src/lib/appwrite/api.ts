import { ID, Query } from "appwrite";

import { INewPost, INewUser, IUpdatePost } from "@/types";
import { account, appwriteConfig, avatars, databases, storage } from "./config";

export async function createUserAccount(user: INewUser) {
    try{
        const newAccount = await account.create(
            ID.unique(),
            user.email,
            user.password,
            user.name
        )

        if(!newAccount) throw new Error;

        const avatarUrl = avatars.getInitials(user.name);

        const newUser = await saveUserToDB({
            accountId : newAccount.$id,
            email : newAccount.email,
            name : newAccount.name,
            username : user.username,  // userName -> username
            imageUrl : avatarUrl
        })

        return newUser;
    }
    catch(err){
        console.log(err);
        return err;
    }
}

export async function saveUserToDB(user : {
    accountId : string,
    email : string,
    name : string,
    imageUrl : URL,
    username?  : string,    //userName -> username
}) {
    try{
        const newUser = await databases.createDocument(
            appwriteConfig.databaseId,
            appwriteConfig.userCollectionId,
            ID.unique(),
            user
        )
        return newUser;
    }
    catch(error){
        console.log(error);
    }
}

export async function signInAccount(user : {email : string, password : string}){
    try{
        const session = await account.createEmailSession(user.email, user.password);
        return session;
    }
    catch(error){
        console.log(error);
    }
}

export async function getCurrentUser(){
    try {
        const currentAccount = await account.get();

        if(!currentAccount) throw Error;

        const currentUser = await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.userCollectionId,
            [Query.equal('accountId',currentAccount.$id)]
        )
        if(!currentUser) throw Error;
        return currentUser.documents[0];
    } catch (error) {
        console.log(error);
    }
}

export async function signOutAccount(){
    try {
        const session = await account.deleteSession('current');
        return session;
    } 
    catch (error) {
        console.log(error);
    }
}

export async function createPost(post: INewPost){
    try {
        //Upload image to appwrite storage
        const uploadedFile = await uploadFile(post.file[0]);
        if(!uploadedFile) throw Error;

        // Get file url
        const fileUrl = getFilePreview(uploadedFile.$id);
        if(!fileUrl) {
            deleteFile(uploadedFile.$id);
            throw Error;
        }

        // Convert tags into array
        const tags = post.tags?.replace(/ /g,'').split(',')|| [];
        
        // Save post to database
        const newPost = await databases.createDocument(
            appwriteConfig.databaseId,
            appwriteConfig.postCollectionId
            ,ID.unique(),
            {
                creator: post.userId,
                caption : post.caption,
                imageUrl : fileUrl,
                imageId : uploadedFile.$id,
                location : post.location,
                tags : tags
            }
        )
        if(!post){
            await deleteFile(uploadedFile.$id);
            throw Error;
        }
        return newPost;

    } catch (error) {
        console.log(error);
    }
}

export async function uploadFile(file: File){
    try {
        const uploadedFile = await storage.createFile(
            appwriteConfig.storageId,
            ID.unique(),
            file
        );
        return uploadedFile;
    } catch (error) {
        console.log(error);
    }
}

export function getFilePreview(fileId : string){
    try {
        const fileUrl = storage.getFilePreview(
            appwriteConfig.storageId,
            fileId,
            2000,
            2000,
            "top",
            100
        )
        return fileUrl;
    } catch (error) {
        console.log(error);
    }
}

export async function deleteFile(fileId : string){
    try {
        await storage.deleteFile(appwriteConfig.storageId, fileId);
        return {status : 'ok'};
    } catch (error) {
        console.log(error);
    }
}

export async function getRecentPosts(){
    const posts = await databases.listDocuments(appwriteConfig.databaseId,
        appwriteConfig.postCollectionId,
        [Query.orderDesc('$createdAt'), Query.limit(20)]
    )
    if(!posts) throw Error;

    return posts
}

export async function likePost(postId: string,likesArray:string[]){
    try {
        const updatedPost = await databases.updateDocument(
            appwriteConfig.databaseId,
            appwriteConfig.postCollectionId,
            postId,
            {
                likes : likesArray
            }
        )
        if(!updatedPost) throw Error;
        return updatedPost;
    } catch (error) {
        console.log(error);
    }
}

export async function savePost(postId: string,userId: string){
    try {
        const updatedPost = await databases.createDocument(
            appwriteConfig.databaseId,
            appwriteConfig.savesCollectionId,
            ID.unique(),
            {
                user : userId,
                post: postId
            }
        )
        if(!updatedPost) throw Error;
        return updatedPost;
    } catch (error) {
        console.log(error);
    }
}

export async function deleteSavedPost(savedRecordId: string){
    try {
        const statusCode   = await databases.deleteDocument(
            appwriteConfig.databaseId,
            appwriteConfig.savesCollectionId,
            savedRecordId,
        )
        if(!statusCode) throw Error;
        return {status: 'ok'};
    } catch (error) {
        console.log(error);
    }
}

export async function getPostById(postId:string){
    try {
        const post = await databases.getDocument(
            appwriteConfig.databaseId,
            appwriteConfig.postCollectionId,
            postId
        )
        if(!post) throw Error;
        return post;
    } catch (error) {
        console.log(error);
    }
}

export async function updatePost(post: IUpdatePost){
    const hasFileToUpdate = post.file.length > 0;
    try {
        let image = {
            imageUrl : post.imageUrl,
            imageId : post.imageId,
        }
        if(hasFileToUpdate){
            const uploadedFile = await uploadFile(post.file[0]);
            if(!uploadedFile) throw Error;

            const fileUrl = getFilePreview(uploadedFile.$id);
            if(!fileUrl) {
                deleteFile(uploadedFile.$id);
                throw Error;
            }
            image = { ...image ,imageUrl:fileUrl, imageId:uploadedFile.$id };
        }
        console.log(post);

        // Convert tags into array
        const tags = post.tags?.replace(/ /g,'').split(',')|| [];
        
        // Save post to database
        const updatedPost = await databases.updateDocument(
            appwriteConfig.databaseId,
            appwriteConfig.postCollectionId,
            post.postId,
            {
                caption : post.caption,
                imageUrl : image.imageUrl,
                imageId : image.imageId,
                location : post.location,
                tags : tags
            }
        )
        if(!updatedPost) {
            await deleteFile(post.imageId);
            throw Error;
        }
        return updatedPost;

    } catch (error) {
        console.log(error);
    }
}

export async function deletePost(postId:string,imageId:string){
    if(!postId || !imageId) throw Error;
    try {
        await databases.deleteDocument(
            appwriteConfig.databaseId,
            appwriteConfig.postCollectionId,
            postId
        )
        await storage.deleteFile(
            appwriteConfig.storageId,
            imageId
        )
        return {status: 'ok'};
    } catch (error) {
        console.log(error);
    }
}

export async function getInfinitePosts({pageParam}:{pageParam:number}){
    const queries:any[] = [Query.orderDesc('$updatedAt'),Query.limit(10)]

    if(pageParam){
        queries.push(Query.cursorAfter(pageParam.toString()))
    }

    try {
        const posts = await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.postCollectionId,
            queries
        )
        if(!posts) throw Error;

        return posts
    } catch (error) {
        console.log(error);
    }
}

export async function searchPosts(searchTerm : string){
    try {
        const posts = await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.postCollectionId,
            [Query.search('caption',searchTerm)]
        )
        if(!posts) throw Error;
        return posts
    } catch (error) {
        console.log(error);
    }
}

export async function getInfiniteUsers({pageParam}: {pageParam:any}){
    const queries=[Query.limit(20)];
    if(pageParam){
        queries.push(Query.cursorAfter(pageParam))
    }
    try {
        const users = await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.postCollectionId,
            queries
        );
        if(!users) throw new Error;
        return users;
    } catch (error) {
        console.log(error);
        throw error;
    }
}

export async function getSavedPosts(){
    try {
        const currentAccount = await account.get();
        if(!currentAccount) throw Error;
        const currentUser = await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.userCollectionId,
            [Query.equal('accountId',currentAccount.$id)]
        )
        if(!currentUser) throw Error;
        const user = currentUser.documents[0];
        const savedPosts = await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.savesCollectionId,
            [Query.equal('user',user?.$id)]
        )
        if(!savedPosts) throw Error;
        return savedPosts.documents;
    } catch (error) {
        console.log(error);
    }
}